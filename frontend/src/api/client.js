import axios from 'axios';

const client = axios.create({ baseURL: '/api' });

client.interceptors.response.use(
  (r) => r,
  (e) => Promise.reject(e)
);

export default client;
