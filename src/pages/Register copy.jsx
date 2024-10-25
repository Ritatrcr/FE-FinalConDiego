import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Title from '../components/Title';
import Text from '../components/Text';
import { Link, useNavigate } from 'react-router-dom';
import colors from '../components/colors';
import axios from 'axios';
import Loader from '../components/Loader';
import ProfilePhoto from '../components/ProfilePhoto';
import AddButton from '../components/AddButton';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Register = () => {
  const [steps, setSteps] = useState(1); // Variable para controlar los pasos
  const [name, setName] = useState('');
  const [surName, setSurName] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [surNameError, setSurNameError] = useState('');
  const [universityIdError, setUniversityIdError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // Estado para habilitar/deshabilitar el botón
  const [selectedImage, setSelectedImage] = useState(null); // Para la foto de perfil
  const [imagePreviewUrl, setImagePreviewUrl] = useState("src/assets/PofilePhoto.png"); // Para la vista previa de la foto
  const [selectedRole, setSelectedRole] = useState("Conductor"); // Estado para manejar la selección del rol
  const navigate = useNavigate();

  // Función para validar los campos
  const validateFields = () => {
    let isValid = true;

    // Validar nombre (solo letras)
    const nameRegex = /^[a-zA-Z]+$/;
    if (!name) {
      setNameError('El nombre es requerido.');
      isValid = false;
    } else if (!nameRegex.test(name)) {
      setNameError('El nombre debe contener solo letras.');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validar apellidos (solo letras)
    if (!surName) {
      setSurNameError('Los apellidos son requeridos.');
      isValid = false;
    } else if (!nameRegex.test(surName)) {
      setSurNameError('Los apellidos deben contener solo letras.');
      isValid = false;
    } else {
      setSurNameError('');
    }

    // Validar ID de la Universidad (exactamente 10 números)
    const universityIdRegex = /^[0-9]{10}$/;
    if (!universityId) {
      setUniversityIdError('El ID de la Universidad es requerido.');
      isValid = false;
    } else if (!universityIdRegex.test(universityId)) {
      setUniversityIdError('El ID de la Universidad debe contener exactamente 10 números.');
      isValid = false;
    } else {
      setUniversityIdError('');
    }

    // Validar email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setEmailError('El correo electrónico es requerido.');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Por favor, ingresa un correo electrónico válido.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validar teléfono
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneNumber) {
      setPhoneNumberError('El número de teléfono es requerido.');
      isValid = false;
    } else if (!phoneRegex.test(phoneNumber)) {
      setPhoneNumberError('El número de teléfono no es válido.');
      isValid = false;
    } else {
      setPhoneNumberError('');
    }

    // Validar contraseña
    if (!password) {
      setPasswordError('La contraseña es requerida.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  // Validar si todos los campos están llenos para habilitar el botón
  useEffect(() => {
    if (
      name &&
      surName &&
      universityId &&
      email &&
      phoneNumber &&
      password
    ) {
      setIsButtonDisabled(false); // Habilitar el botón si todos los campos están completos
    } else {
      setIsButtonDisabled(true); // Deshabilitar el botón si falta algún campo
    }
  }, [name, surName, universityId, email, phoneNumber, password]);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }
    setSteps(2); // Cambia al paso 2
  };

  // Hace la solicitud de registro en el step 2 y avanza al step 3
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('surName', surName);
      formData.append('universityID', universityId);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);
      formData.append('password', password);
      if (selectedImage) {
        formData.append('photo', selectedImage);
      }

      const response = await axios.post('https://proyecto-final-be-ritinhalamaspro.vercel.app/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        console.log('Usuario registrado correctamente');
        setSteps(3); // Cambiar al paso 3 después del registro exitoso
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Hubo un error al registrar el usuario. Intenta nuevamente.';
      
      // Si el error es que el ID de la universidad ya existe, mostramos el modal
      if (error.response?.data?.message === 'El ID ya existe') {
        handleModalError('Error al registrar', 'El ID de la universidad ya existe. Intenta con otro o inicia sesión.');
      } else {
        alert(errorMessage); // Otro tipo de error
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreviewUrl(imageUrl);
      setSelectedImage(file);
    }
  };

  // Asegúrate de liberar la URL creada cuando se cambie la imagen o el componente se desmonte
  useEffect(() => {
    return () => {
      if (imagePreviewUrl !== "src/assets/PofilePhoto.png") {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleRoleSelection = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (selectedRole === "Conductor") {
      navigate("/registrar-carro");
    } else {
      navigate("/pagina-principal");
    }
  };

  const profileContainerStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column', 
    justifyContent: 'center',
    alignItems: 'center',    
    width: '100%',
    marginBottom: '20px',
  };

  const addButtonContainerStyle = {
    position: 'absolute',  
    top: '210px',          
    left: '60%',           
    transform: 'translateX(-50%)',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.633)', 
          zIndex: 999, 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Loader />
        </div>
      )}
      <Card>
        {steps === 1 && (
         <>
         <Title>Regístrate</Title>
         <form onSubmit={handleSubmit}>
           <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '7px' }}>
             <div>
               <InputField 
                 type="text" 
                 placeholder="Nombre" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)} 
               />
               {nameError && <small style={{ color: colors.third }}>{nameError}</small>}
             </div>
             <div>
               <InputField 
                 type="text" 
                 placeholder="Apellidos" 
                 value={surName} 
                 onChange={(e) => setSurName(e.target.value)} 
               />
               {surNameError && <small style={{ color: colors.third}}>{surNameError}</small>}
             </div>
           </div>

           <div>
             <InputField 
               type="text" 
               placeholder="ID de la Universidad" 
               value={universityId} 
               onChange={(e) => setUniversityId(e.target.value)} 
             />
             {universityIdError && <small style={{ color: colors.third }}>{universityIdError}</small>}
           </div>

           <div>
             <InputField 
               type="email" 
               placeholder="Correo Electrónico" 
               value={email} 
               onChange={(e) => setEmail(e.target.value)} 
             />
             {emailError && <small style={{ color: colors.third }}>{emailError}</small>}
           </div>

           <div>
             <InputField 
               type="tel" 
               placeholder="Teléfono" 
               value={phoneNumber} 
               onChange={(e) => setPhoneNumber(e.target.value)} 
             />
             {phoneNumberError && <small style={{ color: colors.third }}>{phoneNumberError}</small>}
           </div>

           <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
             <InputField 
               type={showPassword ? 'text' : 'password'} 
               placeholder="Contraseña" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
             />
             <button
               type="button"
               onClick={() => setShowPassword(!showPassword)}
               style={{
                 background: 'transparent',
                 border: 'none',
                 cursor: 'pointer',
                 position: 'absolute',
                 right: '10px',
                 top: '50%',
                 transform: 'translateY(-50%)',
                 zIndex: 1,
               }}
             >
               <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} size="lg" />
             </button>
           </div>
           {passwordError && <small style={{ color: colors.third }}>{passwordError}</small>}

           <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button type="submit" label="Registrarse" primary disabled={isButtonDisabled} onClick={handleNextStep} />
          </div>

         </form>

         <Text>
           ¿Ya tienes una cuenta?  
           <Link to="/iniciar-sesion" style={{ color: colors.third, textDecoration: 'none' }}> Inicia sesión</Link>
         </Text>
       </>
        )}

        {steps === 2 && ( // Paso 2: Agregar foto de perfil y registrar
          <>
            <Title>Agrega tu foto</Title>
            <form onSubmit={handleSubmit}>
              <div style={profileContainerStyle}>
                <ProfilePhoto
                  imageUrl={imagePreviewUrl}
                  size="170px"
                />

                <div style={addButtonContainerStyle}>
                  <label htmlFor="imageUpload" style={{ cursor: 'pointer' }}>
                    <AddButton />
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button type="submit" label="¡Listo!" primary />
              </div>
            </form>
          </>
        )}

        {steps === 3 && ( // Paso 3: Selección de rol
          <>
            <Title>Selecciona tu rol</Title>
            <StyledWrapper>
              <div className="radio-buttons-container">
                <div className="radio-button">
                  <input
                    name="radio-group"
                    id="radio2"
                    className="radio-button__input"
                    type="radio"
                    value="Usuario"
                    onChange={handleRoleSelection}
                  />
                  <label htmlFor="radio2" className="radio-button__label">
                    <span className="radio-button__custom" />
                    Usuario
                  </label>
                </div>

                <div className="radio-button">
                  <input
                    name="radio-group"
                    id="radio1"
                    className="radio-button__input"
                    type="radio"
                    value="Conductor"
                    onChange={handleRoleSelection}
                    defaultChecked
                  />
                  <label htmlFor="radio1" className="radio-button__label">
                    <span className="radio-button__custom" />
                    Conductor
                  </label>
                </div>
              </div>
            </StyledWrapper>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Button type="submit" label="Siguiente" primary onClick={handleRoleSubmit} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

// Estilos para los radio buttons
const StyledWrapper = styled.div`
  .radio-buttons-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }

  .radio-button {
    display: inline-block;
    position: relative;
    cursor: pointer;
  }

  .radio-button__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .radio-button__label {
    display: inline-block;
    padding-left: 30px;
    margin-bottom: 10px;
    position: relative;
    font-size: 16px;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
  }

  .radio-button__custom {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid ${colors.details};
    transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
  }

  .radio-button__input:checked + .radio-button__label .radio-button__custom {
    transform: translateY(-50%) scale(0.9);
    border: 5px solid ${colors.third};
    color: ${colors.details};
  }

  .radio-button__input:checked + .radio-button__label {
    color: ${colors.third};
    font-size: 25px;
  }

  .radio-button__label:hover .radio-button__custom {
    transform: translateY(-50%) scale(1.2);
    border-color: ${colors.primary};
    box-shadow: 0 0 10px #D130FE80;
  }
`;

export default Register;