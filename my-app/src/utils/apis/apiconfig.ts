import axios from 'axios';

export const instance = axios.create({
    baseURL: 'http://localhost:8000/api', // replace with your backend base URL
    headers: {
      'Content-Type': 'application/json',
    },
  });

 