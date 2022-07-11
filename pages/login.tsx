import { Button } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import styled from 'styled-components';
import WhatsAppLogo from '../assets/whatsapplogo.png';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';

const StyledContainer = styled.div`
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: whitesmoke;
`;

const StyledLoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
`;

const StyledImageWrapper = styled.div`
    margin-bottom: 50px;
`;

const login = () => {
    const [signInWithGoogle, _user, _loading, _error] = useSignInWithGoogle(auth);

    const signIn = () => {
        signInWithGoogle();
    };
    return (
        <StyledContainer>
            <Head>
                <title>Login Page</title>
            </Head>

            <StyledLoginContainer>
                <StyledImageWrapper>
                    <Image src={WhatsAppLogo} width={200} height={200} />
                </StyledImageWrapper>
                <Button variant="outlined" onClick={signIn}>
                    Sign in with Google
                </Button>
            </StyledLoginContainer>
        </StyledContainer>
    );
};

export default login;
