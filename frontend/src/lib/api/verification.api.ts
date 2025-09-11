import { api } from './api';

const verificationApi = api.verification;

export const getVerificationPath = async (location: string, batch: string) => {
  const response = await verificationApi.path[':batchLocation'][':batchNumber'].$get({
    param: {
      batchLocation: location,
      batchNumber: batch,
    },
  });
  return response;
};
