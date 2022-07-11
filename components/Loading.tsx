import styled from 'styled-components';
import Image from 'next/image';
import WhatsAppLogo from '../assets/whatsapplogo.png';
import { CircularProgress } from '@mui/material';

const StyledContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
`;

const StyledImageWrapper = styled.div`
    margin-bottom: 50px;
`;

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;
const Loading = () => {
    return (
        <StyledContainer>
            <StyledWrapper>
                <StyledImageWrapper>
                    <Image src={WhatsAppLogo} width={200} height={200} />
                </StyledImageWrapper>
                <CircularProgress />
            </StyledWrapper>
        </StyledContainer>
    );
};

export default Loading;
