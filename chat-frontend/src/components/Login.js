// Login.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null); // Ref for both email and username inputs

  useEffect(() => {
    setSuccessMessage('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRegistering]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await register(username, email, password);
        setSuccessMessage('Registration successful! Please log in.');
      } else {
        await login(email, password);
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error logging in or registering:', error);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {isRegistering && (
        <>
          <input
            type="text"
            className="input-field"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            ref={inputRef} // Assign ref for username input
            required
          />
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </>
      )}
      {!isRegistering && (
        <input
          type="email"
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          ref={inputRef} // Assign ref for email input
          required
        />
      )}
      <input
        type="password"
        className="input-field"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="submit-button">
        {isRegistering ? 'Register' : 'Login'}
      </button>
      <p className="toggle-text">
        {isRegistering
          ? "Already have an account? "
          : "Don't have an account? "}
        <button type="button" className="toggle-button" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Login here' : 'Register here'}
        </button>
      </p>
      {successMessage && <p className="success-message">{successMessage}</p>}
    </form>
  );
};

export default Login;
