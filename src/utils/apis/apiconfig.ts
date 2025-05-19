import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';

export const instance = axios.create({
  baseURL: '/', // Ensure this matches your backend's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (accessToken && config.headers) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('Access Token attached:', accessToken);
      }
    } catch (error) {  
      console.error('Error fetching auth session', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
