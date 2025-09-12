import { api } from './api';

const batchApi = api.batch;

export const getActiveBatches = async () => {
  const response = await batchApi.active.$get();
  return response.json();
};
