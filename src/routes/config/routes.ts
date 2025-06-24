export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/user-dashboard',
  ADMIN: '/admin-dashboard',
  SWAP: '/swap'
} as const;

export type AppRoutes = typeof ROUTES;