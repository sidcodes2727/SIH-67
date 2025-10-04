import client from './client';

export async function sendChat(messages, rowId) {
  const res = await client.post('/chat', { messages, rowId });
  return res.data;
}
