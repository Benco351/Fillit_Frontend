import axios from 'axios';
import {z} from 'zod';  

const instance = axios.create({
    baseURL: 'http://localhost:8000/api', // replace with your backend base URL
    headers: {
      'Content-Type': 'application/json',
    },
  });

 
export const getUsers = () => axios.get('/users');
export const getUserById = (id: string) => axios.get('/users/${id}');
export const createUser = (data: object) => axios.post('/users', data);  


export const createAvailableShift = async (date: Date, start: string, end: string) => {
    try {
      const requestBody = { date, start, end };
      const response = await instance.post('/available-shifts', requestBody);
      
      if (!response.data.data) {
        throw new Error('No data returned from the server');}

      return response.data; // Return the response data //body
    } catch (error) {
      console.error('Error creating available shift:', error);
      throw error; // Re-throw the error for further handling
    }
  };

  

  //delete, no requestbody, //${id}
  



export {};