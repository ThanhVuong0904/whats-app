import React, { KeyboardEventHandler, MouseEventHandler, useRef, useState } from 'react';
import styled from 'styled-components';
import { useRecipient } from '../hooks/useRecipient';
import { Conversation, IMessage } from '../types';
import {
    convertFirestoreTimestampToString,
    generateQueryGetMessages,
    transformMessage,
} from '../utils/generateQueryGetMessages';
import RecipientAvatar from './RecipientAvatar';
import { AttachFile, MoreVert, InsertEmoticon, Send, Mic } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import { useCollection } from 'react-firebase-hooks/firestore';
import Message from './Message';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const StyledRecipientHeader = styled.div`
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    padding: 11px;
    height: 80px;
    border-bottom: 1px solid whitesmoke;
    background-color: white;
    z-index: 100;
`;

const StyledHeaderInfo = styled.div`
    flex-grow: 1;

    > h3 {
        margin-top: 0;
        margin-bottom: 3px;
    }

    > span {
        font-size: 14px;
        color: gray;
    }
`;

const StyledH3 = styled.h3`
    word-break: break-all;
`;

const StyledHeaderIcons = styled.div`
    display: flex;
`;

const StyledMessageContainer = styled.div`
    padding: 30px;
    background-color: #e5edd8;
    min-height: 90vh;
`;

const StyledInputContainer = styled.form`
    display: flex;
    align-items: center;
    padding: 10px;
    position: sticky;
    bottom: 0;
    background-color: white;
    z-index: 100;
`;

const StyledInput = styled.input`
    flex-grow: 1;
    border: none;
    outline: none;
    border-radius: 10px;
    background-color: whitesmoke;
    padding: 15px;
    margin-left: 15px;
    margin-right: 15px;
`;

const EndOfMessageAutoScroll = styled.div`
    margin-bottom: 30px;
`;
const ConversationScreen = ({ conversation, messages }: { conversation: Conversation; messages: IMessage[] }) => {
    const conversationUser = conversation.users;
    const [loggedInUser, _loading, _error] = useAuthState(auth);

    const [newMessage, setNewMessage] = useState('');
    const endOfMessageAutoScrollRef = useRef<HTMLDivElement>(null);

    const { recipient, recipientEmail } = useRecipient(conversationUser);

    const router = useRouter();
    const conversationId = router.query.id; //localhost:3000/conversation/:id

    const queryGetMessages = generateQueryGetMessages(conversationId as string);

    const [messagesSnapshot, messagesLoading, __error] = useCollection(queryGetMessages);

    const showMessages = () => {
        // if
        if (messagesLoading) {
            return messages.map((message) => <Message key={message.id} message={message} />);
        }
        if (messagesSnapshot) {
            return messagesSnapshot.docs.map((message, index) => (
                <Message key={message.id} message={transformMessage(message)} />
            ));
        }
        return null;
    };

    const addMessageToDbAndUpdateLastSeen = async () => {
        //update last seen users collection
        await setDoc(
            doc(db, 'users', loggedInUser?.email as string),
            {
                lastSeen: serverTimestamp(),
            },
            { merge: true }, //just update what is change
        );

        //add new message to 'messages' collection
        await addDoc(collection(db, 'messages'), {
            conversation_id: conversationId,
            sent_at: serverTimestamp(),
            text: newMessage,
            user: loggedInUser?.email,
        });

        //reset input field
        setNewMessage('');

        //scroll to bottom
        srollToBottom();
    };
    const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (!newMessage) return;
            addMessageToDbAndUpdateLastSeen();
        }
    };
    const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (!newMessage) return;
        addMessageToDbAndUpdateLastSeen();
    };

    const srollToBottom = () => {
        endOfMessageAutoScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <>
            <StyledRecipientHeader>
                <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail} />
                <StyledHeaderInfo>
                    <StyledH3>{recipientEmail}</StyledH3>
                    {recipient && <span>Last active: {convertFirestoreTimestampToString(recipient.lastSeen)}</span>}
                </StyledHeaderInfo>
                <StyledHeaderIcons>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </StyledHeaderIcons>
            </StyledRecipientHeader>
            {/* Show mess */}
            <StyledMessageContainer>
                {showMessages()}
                {/* for auto scroll */}
                <EndOfMessageAutoScroll ref={endOfMessageAutoScrollRef} />
            </StyledMessageContainer>
            {/* Enter mess */}
            <StyledInputContainer>
                <InsertEmoticon />
                <StyledInput
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => sendMessageOnEnter(e)}
                />
                <IconButton onClick={(e) => sendMessageOnClick(e)} disabled={!newMessage}>
                    <Send />
                </IconButton>
                <IconButton>
                    <Mic />
                </IconButton>
            </StyledInputContainer>
        </>
    );
};

export default ConversationScreen;
