export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/user-dashboard',
  ADMIN: '/admin-dashboard',
  NOTIFICATIONS: '/notifications'
} as const;

export type AppRoutes = typeof ROUTES;