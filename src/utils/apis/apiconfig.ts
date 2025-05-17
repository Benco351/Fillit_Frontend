import axios from 'axios';

export const instance = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`, // Ensure this matches your backend's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

