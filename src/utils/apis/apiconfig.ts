// src/utils/apis/apiconfig.ts
// -----------------------------------------------------------------------------
// Central place to create Axios clients with Cognito ID-token injection.
// -----------------------------------------------------------------------------
import axios, { InternalAxiosRequestConfig } from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';

/* helper – fetch token once per request --------------------------------------------------- */
async function attachIdToken(config: InternalAxiosRequestConfig) {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    if (idToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${idToken}`;
    }

    /* special case: Lambda expects the token inside the JSON body ------------------------ */
    if (
      config.baseURL === process.env.REACT_APP_OPEN_AI_URL &&
      config.method?.toLowerCase() === 'post' &&
      typeof config.data === 'object' &&
      idToken
    ) {
      config.data = { ...config.data, jwt_token: idToken };
    }
  } catch (err) {
    console.error('Error fetching auth session:', err);
  }
  return config;
}

/* ─────────────────────────────────────────────────────────────────────────────
   1 │ Primary back-end (relative URL, same domain / API Gateway / EB)
   ──────────────────────────────────────────────────────────────────────────── */
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/', // relative URL for same domain
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(attachIdToken, Promise.reject);

/* ─────────────────────────────────────────────────────────────────────────────
   2 │ OpenAI Lambda wrapper
   ──────────────────────────────────────────────────────────────────────────── */
export const aiLambda = axios.create({
  baseURL: process.env.REACT_APP_OPEN_AI_URL,
  headers: { 'Content-Type': 'application/json' },
});

aiLambda.interceptors.request.use(attachIdToken, Promise.reject);
