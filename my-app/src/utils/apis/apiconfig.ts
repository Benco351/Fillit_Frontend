import axios from 'axios';

export const instance = axios.create({
  baseURL: 'http://localhost:8000/api', // Ensure this matches your backend's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

