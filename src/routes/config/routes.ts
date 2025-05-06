export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/user-dashboard',
  ADMIN: '/admin-dashboard'
} as const;

export type AppRoutes = typeof ROUTES;