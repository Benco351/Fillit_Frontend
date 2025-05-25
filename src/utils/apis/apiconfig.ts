import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';

export const instance = axios.create({
  baseURL: 'http://localhost:8000', // Updated to match your backend's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const session = await fetchAuthSession();
      // Use the ID token instead of the access token
      const idToken = session.tokens?.idToken?.toString();

      if (idToken && config.headers) {
        config.headers['Authorization'] = `Bearer ${idToken}`;
        console.log('ID Token attached:', idToken);
      }
    } catch (error) {  
      console.error('Error fetching auth session', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
