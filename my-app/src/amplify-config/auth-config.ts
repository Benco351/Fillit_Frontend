// src/amplify-config.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_REGION,
      userPoolId: process.env.REACT_APP_USER_POOL_ID!,
      userPoolClientId: process.env.REACT_APP_CLIENT_ID!,
      authenticationFlowType: 'USER_PASSWORD_AUTH',
    }
  },
  API: {
    endpoints: [
      {
        name: 'FillitAPI',
        endpoint: process.env.REACT_APP_API_URL,
        
      }
    ]
  }
}as any);
