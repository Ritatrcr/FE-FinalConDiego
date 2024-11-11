// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faHome, faMap, faUser } from '@fortawesome/free-solid-svg-icons';
import { AiOutlineUser, AiOutlineCar } from 'react-icons/ai';
import styled, { keyframes } from 'styled-components';
import colors from '../../assets/Colors';
import { useDriver } from '../../context/DriverContext';
import FeedbackModal from '../common/FeedbackModal';
import logo from '../../assets/logo.png';
import { StyledWrapper } from '../common/CommonStyles';

const fadeInOut = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const StyledMenu = styled(Menu)`
    display: flex;
    flex-direction: column;
    align-items: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
    gap: 20px;
    margin-top: 0px; 
    padding-left: ${({ isOpen }) => (isOpen ? '10px' : '0')};
    width: 100%;

    /* Cambia la dirección en dispositivos móviles */
    @media (max-width: 768px) {
        flex-direction: row;
        justify-content: space-around;
        padding-left: 0;
    }
`;

const HeaderWrapper = styled.header`
    display: flex;
    flex-direction: column;
    align-items: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
    gap: 20px;
    padding: 10px;
    background-color: ${colors.background};
    position: relative;
    width: ${({ isOpen }) => (isOpen ? '250px' : '60px')};
    transition: width 0.3s ease;
    box-shadow: ${({ isOpen }) => (isOpen ? '5px 0 15px rgba(0, 0, 0, 0.3)' : 'none')}; 
    
    @media (max-width: 768px) {
        width: 100%;
        position: fixed;
        bottom: 0;
        flex-direction: row;
        justify-content: space-around;
        padding: 10px 0;
        box-shadow: 0px -5px 15px rgba(0, 0, 0, 0.3);
        height: 60px;
        align-items: center;
    }
`;

const ToggleButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: ${colors.white};
    font-size: 24px;
    cursor: pointer;

    @media (max-width: 768px) {
        display: none;
    }
`;

const CenterContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    margin-top: 30px;
    margin-bottom: 30px;

    @media (max-width: 768px) {
        display: none;
    }
`;

const Logo = styled.img`
    width: ${({ isOpen }) => (isOpen ? '120px' : '0')};
    height: auto;
    transition: width 0.3s ease, opacity 0.3s ease;
    opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
    animation: ${fadeInOut} 0.3s ease;

    @media (max-width: 768px) {
        display: none;
    }
`;

const Icon = styled(FontAwesomeIcon)`
    color: ${({ isDriver, active }) => 
        isDriver && active ? colors.primary : !isDriver && active ? colors.third : colors.details};
    font-size: 24px;
    background: none;

    &:hover {
        color: ${colors.primaryHover};
    }
`;

const MenuText = styled.span`
    color: ${colors.white};
    display: ${({ isOpen }) => (isOpen ? 'inline' : 'none')};
    background: none;

    &:hover {
        color: ${colors.primaryHover};
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;
    const [isLogged, setIsLogged] = useState(false);
    const [showRegisterCarModal, setShowRegisterCarModal] = useState(false);
    const [showToggleModeModal, setShowToggleModeModal] = useState(false);
    const [headerOpen, setHeaderOpen] = useState(true);
    const { isDriver, toggleDriverMode } = useDriver();
    const [hasCarRegistered, setHasCarRegistered] = useState(false);

    const verifyCarRegistration = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('https://proyecto-final-be-ritinhalamaspro.vercel.app/cars/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (data && Object.keys(data).length > 0) {
                setHasCarRegistered(true);
                return true;
            } else {
                setShowRegisterCarModal(true);
                setHasCarRegistered(false);
                return false;
            }
        } catch (error) {
            console.error('Error al verificar el registro del carro:', error);
            return false;
        }
    };

    const handleToggleDriverMode = async () => {
        if (!isDriver) {
            const hasCar = await verifyCarRegistration();
            if (!hasCar) return;
        }
        toggleDriverMode();
    };

    const confirmToggleDriverMode = () => {
        setShowToggleModeModal(true);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLogged(!!token);
        if (!token) {
            navigate('/');
        }
    }, []);

    useEffect(() => {
        verifyCarRegistration();
    }, []);

    useEffect(() => {
        if (isDriver) {
            if (path === '/reserved-trips') navigate('/created-trips');
        } else {
            if (path === '/created-trips') navigate('/reserved-trips');
        }
    }, [isDriver, path, navigate]);

    return (
        <>
            {isLogged && (
                <HeaderWrapper isOpen={headerOpen}>
                    <ToggleButton 
                        isOpen={headerOpen} 
                        onClick={() => setHeaderOpen(!headerOpen)}
                    >
                        <FontAwesomeIcon icon={headerOpen ? faChevronLeft : faChevronRight} />
                    </ToggleButton>
                    
                    <CenterContainer>
                        <Logo src={logo} alt="Logo" isOpen={headerOpen} />
                        
                        {headerOpen && hasCarRegistered && (
                            <StyledWrapper>
                                <label className="switch" aria-label="Toggle Passenger/Driver">
                                    <input 
                                        type="checkbox" 
                                        checked={isDriver} 
                                        onChange={confirmToggleDriverMode} 
                                    />
                                    <span>
                                        <AiOutlineUser />
                                    </span>
                                    <span>
                                        <AiOutlineCar />
                                    </span>
                                </label>
                            </StyledWrapper>
                        )}
                    </CenterContainer>

                    <StyledMenu iconShape="square" isOpen={headerOpen}>
                        <MenuItem
                            component={<Link to="/home" />}
                            icon={
                                <Icon 
                                    icon={faHome} 
                                    isDriver={isDriver} 
                                    active={path === '/home'} 
                                />
                            }
                        >
                            <MenuText isOpen={headerOpen}>Inicio</MenuText>
                        </MenuItem>
                        <MenuItem
                            component={<Link to={isDriver ? "/created-trips" : "/reserved-trips"} />}
                            icon={
                                <Icon 
                                    icon={faMap} 
                                    isDriver={isDriver} 
                                    active={path === (isDriver ? '/created-trips' : '/reserved-trips')}
                                />
                            }
                        >
                            <MenuText isOpen={headerOpen}>{isDriver ? 'Viajes Creados' : 'Viajes Reservados'}</MenuText>
                        </MenuItem>
                        
                        <MenuItem
                            component={<Link to="/pagina-principal" />}
                            icon={
                                <Icon 
                                    icon={faUser} 
                                    isDriver={isDriver} 
                                    active={path === '/pagina-principal'} 
                                />
                            }
                        >
                            <MenuText isOpen={headerOpen}>Perfil</MenuText>
                        </MenuItem>
                    </StyledMenu>

                    {showRegisterCarModal && (
                        <FeedbackModal
                            type="question"
                            message="No tienes un carro registrado."
                            details="Para cambiar a modo conductor, primero debes registrar un carro."
                            onClose={() => setShowRegisterCarModal(false)}
                            onConfirm={() => {
                                setShowRegisterCarModal(false);
                                navigate('/registrar-carro');
                            }}
                        />
                    )}

                    {showToggleModeModal && (
                        <FeedbackModal
                            type="question"
                            message={`¿Estás seguro de cambiar a modo ${isDriver ? 'Pasajero' : 'Conductor'}?`}
                            details={`Este cambio afectará la forma en que usas la aplicación.`}
                            onClose={() => setShowToggleModeModal(false)}
                            onConfirm={() => {
                                setShowToggleModeModal(false);
                                handleToggleDriverMode();
                            }}
                        />
                    )}
                </HeaderWrapper>
            )}
        </>
    );
}

export default Header;
