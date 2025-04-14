import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const validateName = (name: string): boolean => {
    const isValid = name.trim().length > 0;
    if (!isValid) {
      setNameError('Name is required');
    } else {
      setNameError('');
    }
    return isValid;
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = re.test(email);
    if (!isValid) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
    return isValid;
  };

  const validatePassword = (password: string): boolean => {
    const isValid = password.length >= 8;
    if (!isValid) {
      setPasswordError('Password must be at least 8 characters long');
    } else {
      setPasswordError('');
    }
    return isValid;
  };

  const validateConfirmPassword = (confirmPassword: string): boolean => {
    const isValid = confirmPassword === password;
    if (!isValid) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all inputs
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      console.log('Submitted Info:', { name, email, password, confirmPassword }); // Log user info
      setIsLoading(true);
      
      try {
        // Here you would typically make an API call to register the user
        // For example:
        // const response = await authService.register(name, email, password);
        
        // Simulating API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If registration is successful, redirect to login or dashboard
        navigate('/login');
      } catch (error) {
        console.error('Registration failed:', error);
        // Handle registration error (display message, etc.)
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Inline styles
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px',
    },
    formContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      width: '100%',
      maxWidth: '500px',
    },
    title: {
      margin: '0',
      fontSize: '28px',
      fontWeight: 700,
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      margin: '0',
      color: '#6b7280',
      marginBottom: '32px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '8px',
    },
    label: {
      fontWeight: 500,
      color: '#374151',
    },
    input: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      transition: 'border-color 0.2s',
    },
    inputError: {
      padding: '12px 16px',
      border: '1px solid #ef4444',
      borderRadius: '6px',
      fontSize: '16px',
    },
    errorMessage: {
      color: '#ef4444',
      fontSize: '14px',
      margin: '4px 0 0',
    },
    button: {
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '12px',
      fontSize: '16px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '16px',
    },
    buttonDisabled: {
      backgroundColor: '#93c5fd',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '12px',
      fontSize: '16px',
      fontWeight: 500,
      cursor: 'not-allowed',
      marginTop: '16px',
    },
    loginPrompt: {
      textAlign: 'center' as 'center',
      marginTop: '32px',
      color: '#4b5563',
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: 500,
    },
    termsText: {
      fontSize: '14px',
      color: '#6b7280',
      textAlign: 'center' as 'center',
      marginTop: '24px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Fill in your details to get started</p>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => validateName(name)}
              placeholder="Enter your full name"
              style={nameError ? styles.inputError : styles.input}
            />
            {nameError && <p style={styles.errorMessage}>{nameError}</p>}
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateEmail(email)}
              placeholder="Enter your email"
              style={emailError ? styles.inputError : styles.input}
            />
            {emailError && <p style={styles.errorMessage}>{emailError}</p>}
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validatePassword(password)}
              placeholder="Create a password"
              style={passwordError ? styles.inputError : styles.input}
            />
            {passwordError && <p style={styles.errorMessage}>{passwordError}</p>}
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => validateConfirmPassword(confirmPassword)}
              placeholder="Confirm your password"
              style={confirmPasswordError ? styles.inputError : styles.input}
            />
            {confirmPasswordError && <p style={styles.errorMessage}>{confirmPasswordError}</p>}
          </div>
          
          <button 
            type="submit" 
            style={isLoading ? styles.buttonDisabled : styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
          
          <p style={styles.termsText}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
        
        <p style={styles.loginPrompt}>
          Already have an account? <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};


export default LoginPage;

//name, email, password, confirmPassword, admin yes or no
// LINE 68!!!!!!
// instead of console log create http request to backend
// and send the data to the backend
// and then redirect to login page
// and then redirect to login page
// and then redirect to login page
// and then redirect to login page      