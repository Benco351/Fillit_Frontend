// src/amplify-config.ts
import { Amplify } from 'aws-amplify';
import '@aws-amplify/auth'; // ensure the auth plugin is registered

/**
 * Safely retrieves an environment variable by key.
 * Throws an error if the variable is missing or empty.
 */
function getEnv(key: string): string {
  const value = process.env[key];
  if (value == null || value === '') {
    throw new Error(`Missing or empty required environment variable: ${key}`);
  }
  return value;
}

Amplify.configure({
  Auth: {
    Cognito: {
      region:               getEnv('REACT_APP_REGION'),
      userPoolId:           getEnv('REACT_APP_USER_POOL_ID'),
      userPoolClientId:     getEnv('REACT_APP_CLIENT_ID'),
      authenticationFlowType: 'USER_PASSWORD_AUTH',
    },
  }
}as any);
