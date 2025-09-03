// src/utils/apis/apiconfig.ts
// -----------------------------------------------------------------------------
// Central place to create Axios clients with Cognito ID-token injection.
// -----------------------------------------------------------------------------
import axios, { InternalAxiosRequestConfig } from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';

/* helper – fetch token once per request --------------------------------------------------- */
function getOrganizationIdFromSession(): number | undefined {
  try {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('organizationId') : null;
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function shouldAttachOrganizationId(url?: string): boolean {
  if (!url) return false;
  const path = url.startsWith('http') ? new URL(url).pathname : url;
  // Never attach for this auth endpoint (does not accept organization_id)
  if (path.startsWith('/auth/add-to-group')) return false;
  // Exclude organization creation/listing
  if (path.startsWith('/api/organizations')) return false;
  // Attach for other API routes under /api/
  if (path.startsWith('/api/')) return true;
  // Default: do not attach
  return false;
}

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

  // Attach organization_id to requests unless already provided
  try {
    const method = (config.method || 'get').toLowerCase();
    const shouldAttach = shouldAttachOrganizationId(config.url || '');
    if (shouldAttach) {
      const orgId = getOrganizationIdFromSession();
      if (orgId !== undefined) {
        if (method === 'get') {
          config.params = { organization_id: orgId, ...(config.params || {}) };
        } else if (method === 'delete') {
          // Support both body and query; prefer query params
          config.params = { organization_id: orgId, ...(config.params || {}) };
        } else if (method === 'post' || method === 'put' || method === 'patch') {
          if (typeof config.data === 'object' && config.data !== null) {
            config.data = { organization_id: orgId, ...config.data };
          } else {
            config.data = { organization_id: orgId };
          }
        }
      }
    }
  } catch (e) {
    // best-effort; do not block request
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
