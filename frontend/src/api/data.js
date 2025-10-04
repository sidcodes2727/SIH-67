import client from './client.js';

export async function createRecord(payload) {
  const { data } = await client.post('/data', payload);
  return data;
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await client.post('/data/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}

export async function getAll() {
  const { data } = await client.get('/data');
  return data;
}

export async function getById(id) {
  const { data } = await client.get(`/data/${id}`);
  return data;
}

export async function getHMPIForId(id) {
  const { data } = await client.get(`/hmpi/${id}`);
  return data;
}
