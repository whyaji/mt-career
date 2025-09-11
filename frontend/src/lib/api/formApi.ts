import type { ApplicantDataPostType } from '@/types/applicantData.type';

import { api } from './api';

const formApi = api.form;

export const submitForm = async (data: ApplicantDataPostType) => {
  const response = await formApi.$post({
    json: data,
  });
  return response;
};
