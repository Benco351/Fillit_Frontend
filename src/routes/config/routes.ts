export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/user-dashboard',
  ADMIN: '/admin-dashboard',
  SWAP: '/swap',
  DEPARTMENTS: '/admin-dashboard/departments',
  SHIFT_INFO: '/shift-info/:shiftId',
  EMPLOYEE_INFO: '/employee-info/:employeeId'
} as const;

export type AppRoutes = typeof ROUTES;