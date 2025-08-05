import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Avatar, Chip, Divider,
  CircularProgress, CssBaseline, ThemeProvider, Card, CardContent,
  IconButton, Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import { ArrowBack, LocationOn, Schedule, People, Business } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { MainTheme, swapPageTheme } from '../../assets/themes/themes';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/userNavbar';
import { ROUTES } from '../../routes/config/routes';
import { getAvailableShiftById } from '../../utils/apis/availableShiftApis';
import { getAssignedShifts } from '../../utils/apis/assignedShiftApis';
import { getEmployees } from '../../utils/apis/employeeShiftApis';
import { getDepartments } from '../../utils/apis/departmentApis';
import { AvailableShift, Employee } from '../../components/CalendarFeatures/ShiftUtils';

interface ShiftInfoData {
  shift: AvailableShift | null;
  assignedEmployees: Employee[];
  department: { id: number; name: string; address?: string } | null;
  loading: boolean;
  error: string | null;
}

interface EmployeeWithDetails extends Employee {
  phone?: string;
  admin?: boolean;
}

const ShiftInfo: React.FC = () => {
  const navigate = useNavigate();
  const { shiftId } = useParams<{ shiftId: string }>();
  const [shiftInfo, setShiftInfo] = useState<ShiftInfoData>({
    shift: null,
    assignedEmployees: [],
    department: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchShiftInfo = async () => {
      if (!shiftId) {
        setShiftInfo(prev => ({ ...prev, error: 'No shift ID provided', loading: false }));
        return;
      }

      try {
        setShiftInfo(prev => ({ ...prev, loading: true, error: null }));

        // Fetch shift details
        const shiftResponse = await getAvailableShiftById(parseInt(shiftId));
        const shift = shiftResponse?.data || shiftResponse;

        if (!shift) {
          throw new Error('Shift not found');
        }

        // Fetch assigned shifts for this shift
        const assignedResponse = await getAssignedShifts();
        const assignedShifts = assignedResponse?.data || [];
        const relevantAssignments = assignedShifts.filter(
          (assignment: any) => assignment.assigned_shift_id === parseInt(shiftId)
        );

        // Fetch employee details for assigned users
        const employeesResponse = await getEmployees();
        let employees: any[] = [];
        if (Array.isArray(employeesResponse)) {
          employees = employeesResponse;
        } else if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
          employees = employeesResponse.data;
        }

        const assignedEmployees: EmployeeWithDetails[] = relevantAssignments.map((assignment: any) => {
          const employee = employees.find((emp: any) => emp.employee_id === assignment.assigned_employee_id);
          return {
            id: employee?.employee_id || employee?.id,
            name: employee?.employee_name || employee?.name,
            email: employee?.employee_email || employee?.email,
            phone: employee?.employee_phone || employee?.phone,
            admin: employee?.employee_admin || employee?.admin
          };
        }).filter(Boolean);

        // Fetch department details
        const departmentsResponse = await getDepartments();
        const departments = departmentsResponse?.data || [];
        const department = departments.find((dept: any) => dept.id === shift.department_id) || null;

        setShiftInfo({
          shift: {
            id: shift.shift_id || shift.id,
            date: shift.shift_date || shift.date,
            start: shift.shift_time_start || shift.start,
            end: shift.shift_time_end || shift.end,
            shift_slots_amount: parseInt(shift.shift_slots_amount, 10) || 1,
            shift_slots_taken: parseInt(shift.shift_slots_taken, 10) || 0,
            department_id: shift.department_id
          },
          assignedEmployees,
          department,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching shift info:', error);
        setShiftInfo(prev => ({
          ...prev,
          error: 'Failed to load shift information',
          loading: false
        }));
      }
    };

    fetchShiftInfo();
  }, [shiftId]);

  const handleBack = () => {
    // Check if user is admin and navigate to appropriate dashboard
    const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';
    const targetRoute = isAdmin ? ROUTES.ADMIN : ROUTES.DASHBOARD;
    
    // Navigate to the appropriate dashboard with a smooth transition
    navigate(targetRoute, { 
      replace: false,
      state: { fromShiftInfo: true }
    });
  };

  const handleEmployeeClick = (employeeId: number) => {
    navigate(`${ROUTES.EMPLOYEE_INFO.replace(':employeeId', employeeId.toString())}`, {
      state: { fromPage: window.location.pathname }
    });
  };

  // Prevent scroll jumping on component mount
  useEffect(() => {
    // Ensure the page starts at the top when entering shift info
    window.scrollTo(0, 0);
  }, []);

  // Determine background color based on user type
  const getBackgroundColor = () => {
    const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';
    return isAdmin ? swapPageTheme.adminBg : '#093039';
  };

  if (shiftInfo.loading) {
    return (
      <ThemeProvider theme={MainTheme}>
        <CssBaseline />
        <Box sx={{ backgroundColor: getBackgroundColor(), minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#00c28c' }} />
        </Box>
      </ThemeProvider>
    );
  }

  if (shiftInfo.error || !shiftInfo.shift) {
    return (
      <ThemeProvider theme={MainTheme}>
        <CssBaseline />
        <Box sx={{ backgroundColor: getBackgroundColor(), minHeight: '100vh', py: 4, px: 2 }}>
          <Container maxWidth="md">
            <Navbar />
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>
                {shiftInfo.error || 'Shift not found'}
              </Typography>
              <Button
                variant="contained"
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{
                  background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
                  border: '1px solid rgba(0, 194, 140, 0.3)',
                  color: '#00c28c',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.15), rgba(0, 194, 140, 0.25))',
                  }
                }}
              >
                Go Back
              </Button>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  const { shift, assignedEmployees, department } = shiftInfo;
  const isShiftFull = (shift.shift_slots_taken || 0) >= (shift.shift_slots_amount || 1);
  const availableSlots = (shift.shift_slots_amount || 1) - (shift.shift_slots_taken || 0);

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{ 
        backgroundColor: getBackgroundColor(), 
        minHeight: '100vh', 
        py: 4, 
        px: 2,
        scrollBehavior: 'smooth',
        overflowAnchor: 'none'
      }}>
        <Container maxWidth={false} sx={{ 
          px: { xs: 1, sm: 2, md: 3 }, 
          width: '100%', 
          maxWidth: '100%',
          scrollBehavior: 'smooth'
        }}>
          <Navbar />

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{
                background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
                border: '1px solid rgba(0, 194, 140, 0.3)',
                color: '#00c28c',
                mb: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.15), rgba(0, 194, 140, 0.25))',
                }
              }}
            >
              Back to Dashboard
            </Button>

            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
              Shift Information
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
              {format(new Date(shift.date), 'EEEE, MMMM d, yyyy')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Main Shift Details */}
            <Box sx={{ flex: { md: 2 } }}>
              <Paper
                sx={{
                  p: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="h4" sx={{ color: '#00c28c', mb: 3, fontWeight: 600 }}>
                  {shift.start?.substring(0, 5)} - {shift.end?.substring(0, 5)}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Time and Department Row */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                    {/* Time Information */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Schedule sx={{ color: '#00c28c', mr: 2, fontSize: 28 }} />
                        <Box>
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Duration
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {shift.start?.substring(0, 5)} - {shift.end?.substring(0, 5)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Department Information */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Business sx={{ color: '#00c28c', mr: 2, fontSize: 28 }} />
                        <Box>
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Department
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {department?.name || 'Not assigned'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Location Information */}
                  {department?.address && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <LocationOn sx={{ color: '#00c28c', mr: 2, fontSize: 28, mt: 0.5 }} />
                        <Box>
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Location
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {department.address}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Slots Information */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <People sx={{ color: '#00c28c', mr: 2, fontSize: 28 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                          Staffing
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={`${shift.shift_slots_taken || 0}/${shift.shift_slots_amount || 1} slots filled`}
                            sx={{
                              backgroundColor: isShiftFull ? '#4caf50' : '#ff9800',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                          {!isShiftFull && (
                            <Chip
                              label={`${availableSlots} slot${availableSlots !== 1 ? 's' : ''} available`}
                              sx={{
                                backgroundColor: '#2196f3',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Assigned Employees */}
            <Box sx={{ flex: { md: 1 } }}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  height: 'fit-content',
                }}
              >
                <Typography variant="h5" sx={{ color: '#00c28c', mb: 3, fontWeight: 600 }}>
                  Assigned Staff
                </Typography>

                {assignedEmployees.length === 0 ? (
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', py: 2 }}>
                    No staff assigned yet
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {assignedEmployees.map((employee, index) => (
                      <Card
                        key={employee.id}
                        onClick={() => handleEmployeeClick(employee.id)}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: '#00c28c',
                                width: 40,
                                height: 40,
                                fontSize: '1rem',
                                fontWeight: 600,
                              }}
                            >
                              {employee.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
                                {employee.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                                Click to view details
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default ShiftInfo; 