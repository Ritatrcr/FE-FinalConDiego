import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from '@react-google-maps/api';
import Loader from '../common/Loader';
import colors from '../../assets/Colors';
import { Container, Text, Title } from '../common/CommonStyles';
import Button from '../common/Button';
import FeedbackModal from '../common/FeedbackModal';


const TripDetailsContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 20px;
    justify-content: center;
    width: 90%;
`;

const TripDetails = styled.div`
    flex: 1;
    background-color: ${colors.primaryHover};
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    margin-bottom: 20px;
    max-width: 500px;
`;

const StopsList = styled.ul`
    list-style-type: none;
    padding: 0;
`;

const StopItem = styled.li`
    margin-bottom: 10px;
`;

const MapContainer = styled.div`
    flex: 1;
    height: 400px;
    border-radius: 10px;
    overflow: hidden;
`;

const TripsInProgress = () => {
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [directions, setDirections] = useState(null);
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_API_KEY,
    });

    const [feedbackModal, setFeedbackModal] = useState({
        isOpen: false,
        type: '',
        message: '',
        details: '',
        onConfirm: null,
        onClose: null,
    });
    

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://proyecto-final-be-ritinhalamaspro.vercel.app/trips/my-trips', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Error al obtener los viajes');

                const data = await response.json();
                const inProgressTrip = data.myTrips.find((t) => t.state === 1);
                if (inProgressTrip) {
                    setTrip(inProgressTrip);
                    calculateRoute(inProgressTrip.startPoint, inProgressTrip.endPoint, inProgressTrip.acceptedRequests);
                }
            } catch (error) {
                console.error('Error al obtener el viaje en progreso:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    const calculateRoute = async (start, end, acceptedRequests = []) => {
        try {
            const directionsService = new window.google.maps.DirectionsService();
            const waypoints = acceptedRequests.map((request) => ({
                location: request.location,
                stopover: true,
            }));

            const result = await directionsService.route({
                origin: start,
                destination: end,
                waypoints,
                optimizeWaypoints: true,
                travelMode: window.google.maps.TravelMode.DRIVING,
            });

            setDirections(result);
        } catch (error) {
            console.error('Error al calcular la ruta:', error);
        }
    };

    const handleFinalizeTrip = () => {
        setFeedbackModal({
            isOpen: true,
            type: 'question',
            message: '¿Deseas finalizar este viaje?',
            details: 'Esto marcará el viaje como finalizado.',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('https://proyecto-final-be-ritinhalamaspro.vercel.app/trips/update-state', {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            tripId: trip.tripId,
                            newState: 2, // Estado "finalizado"
                        }),
                    });
    
                    if (!response.ok) throw new Error('Error al finalizar el viaje.');
    
                } catch (error) {
                    console.error('Error al finalizar el viaje:', error);
                    alert('Hubo un problema al finalizar el viaje. Intenta de nuevo.');
                } finally {
                    setFeedbackModal({ isOpen: false });
                }
            },
            onClose: () => setFeedbackModal({ isOpen: false }),
        });
    };
    

    if (loading) {
        return (
            <Container>
                <Loader />
            </Container>
        );
    }

    if (!trip) {
        return (
            <Container>
                <Title>No hay viajes en progreso</Title>
            </Container>
        );
    }

    return (
        <Container>
            <Title>
                    Viajes en <span style={{ color: colors.third }}>Progreso</span>
                </Title>
            <TripDetailsContainer>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>      
            <MapContainer>
            {isLoaded && directions ? (
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    zoom={10}
                    center={trip.startPoint}
                >
                    <DirectionsRenderer directions={directions} />
                </GoogleMap>
            ) : (
                <Loader />
            )}
        </MapContainer>
        
            <Button label="Finalizar Viaje" primary onClick={handleFinalizeTrip} />
        </div>


                <TripDetails>
                    <Title>Detalles del Viaje</Title>
                    <Text>
                        <strong>Sector:</strong> {trip.sector}
                    </Text>
                    <Text>
                        <strong>Hora de Salida:</strong> {trip.departureTime}
                    </Text>
                    <Text>
                        <strong>Precio por Persona:</strong> ${trip.price}
                    </Text>
                    <Text>
                        <strong>Cupos Disponibles:</strong> {trip.availability}
                    </Text>
                    <Title>Paradas y Reservas</Title>
                    {trip.acceptedRequests?.length > 0 ? (
                        <StopsList>
                            {trip.acceptedRequests.map((reservation, index) => (
                                <StopItem key={index}>
                                    <Text>Parada: {reservation.location || 'No especificada'}</Text> 
                                </StopItem>
                            ))}
                        </StopsList>
                    ) : (
                        <Text>No hay reservas en este viaje.</Text>
                    )}
                </TripDetails>
            </TripDetailsContainer>
            {feedbackModal.isOpen && (
    <FeedbackModal
        type={feedbackModal.type}
        message={feedbackModal.message}
        details={feedbackModal.details}
        onConfirm={feedbackModal.onConfirm}
        onClose={feedbackModal.onClose}
    />
)}
        </Container>
    );
};

export default TripsInProgress;
