import axios from 'axios';

export const instance = axios.create({
  baseURL: '/', // Ensure this matches your backend's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

