export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ORG_REGISTER: '/organization/register',
  DASHBOARD: '/user-dashboard',
  ADMIN: '/admin-dashboard',
  SWAP: '/swap',
  DEPARTMENTS: '/admin-dashboard/departments',
  SHIFT_INFO: '/shift-info/:shiftId',
  EMPLOYEE_INFO: '/employee-info/:employeeId',
  ANNOUNCEMENTS: '/announcements',
  USER_ANNOUNCEMENTS: '/user-announcements',
} as const;

export type AppRoutes = typeof ROUTES;