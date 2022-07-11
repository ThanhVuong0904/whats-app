import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import EmailValidator from 'email-validator';
import styled from 'styled-components';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ChatIcon from '@mui/icons-material/Chat';
import MoreVerticalIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { addDoc, collection, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Conversation } from '../types';
import ConversationSelect from './ConversationSelect';

const StyledContainer = styled.div`
    height: 100vh;
    min-width: 300px;
    max-width: 350px;
    overflow-y: auto;
    border-right: 1px solid whitesmoke;
    /* Hide scrollbar for Chrome, Safari and Opera */
    ::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
`;

const StyledHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    height: 80px;
    border-bottom: 1px solid whitesmoke;
    background-color: white;
    position: sticky;
    top: 0;
    z-index: 100;
`;

const StyleadSearch = styled.div`
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 2px;
`;

const StyledUserAvatar = styled(Avatar)`
    cursor: pointer;
    :hover {
        opacity: 0.8;
    }
`;

const StyledSearchInput = styled.input`
    outline: none;
    border: none;
    flex: 1;
`;

const StyledSideBarButton = styled(Button)`
    width: 100%;
    border-top: 1px solid whitesmoke;
    border-bottom: 1px solid whitesmoke;
    font-weight: 600;
`;

const SideBar = () => {
    const [loggedInUser, _loading, _error] = useAuthState(auth);

    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');

    const handleToggleDialog = (isOpen: boolean) => {
        setIsOpenDialog(isOpen);
        if (!isOpen) setRecipientEmail('');
    };

    // check if conversation already exists between the current logged in user and recipient
    const queryGetConversationsForCurrentUser = query(
        collection(db, 'conversations'),
        where('users', 'array-contains', loggedInUser?.email),
    );
    const [conversationsSnapshot, __loading, __error] = useCollection(queryGetConversationsForCurrentUser);

    const isConversationAlreadyExists = (recipientEmail: string) =>
        conversationsSnapshot?.docs.find((conversation) =>
            (conversation.data() as Conversation).users.includes(recipientEmail),
        );

    const isInvitingSelf = recipientEmail === loggedInUser?.email;

    const createConversation = async () => {
        if (!recipientEmail) return;

        if (
            EmailValidator.validate(recipientEmail) &&
            !isInvitingSelf &&
            !isConversationAlreadyExists(recipientEmail)
        ) {
            // Add conversation user to db "conversations" collection

            await addDoc(collection(db, 'conversations'), {
                users: [loggedInUser?.email, recipientEmail],
            });
        }

        handleToggleDialog(false);
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.log('Error', error);
        }
    };
    return (
        <StyledContainer>
            <StyledHeader>
                <Tooltip title={loggedInUser?.email as string} placement="right">
                    <StyledUserAvatar src={loggedInUser?.photoURL as string} />
                </Tooltip>

                <div>
                    <IconButton>
                        <ChatIcon />
                    </IconButton>
                    <IconButton>
                        <MoreVerticalIcon />
                    </IconButton>
                    <IconButton onClick={logout}>
                        <LogoutIcon />
                    </IconButton>
                </div>
            </StyledHeader>
            <StyleadSearch>
                <SearchIcon />
                <StyledSearchInput placeholder="Search" />
            </StyleadSearch>

            <StyledSideBarButton onClick={() => handleToggleDialog(true)}>Start a new conversation</StyledSideBarButton>

            {/* List conversations */}
            {conversationsSnapshot?.docs.map((conversation) => (
                <ConversationSelect
                    key={conversation.id}
                    id={conversation.id}
                    conversationUsers={(conversation.data() as Conversation).users}
                />
            ))}

            <Dialog open={isOpenDialog} onClose={() => handleToggleDialog(false)}>
                <DialogTitle>New Conversation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a Google email address for the user you wish to chat with
                    </DialogContentText>
                    <TextField
                        autoFocus
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button style={{ fontWeight: 600 }} onClick={() => handleToggleDialog(false)}>
                        Cancel
                    </Button>
                    <Button style={{ fontWeight: 600 }} onClick={createConversation} disabled={!recipientEmail}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledContainer>
    );
};

export default SideBar;
