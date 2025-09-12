import type { ApiRoutes } from '@server/app';
import { hc } from 'hono/client';

const client = hc<ApiRoutes>('/');

export const api = client.api.v1;
export const baseUrl = window.location.origin;
export const baseApiUrl = `${baseUrl}/api/v1`;
