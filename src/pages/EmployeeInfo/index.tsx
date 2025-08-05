import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Avatar, Chip, Divider,
  CircularProgress, CssBaseline, ThemeProvider, Card, CardContent,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { ArrowBack, Email, Phone, Person, Business } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { MainTheme, swapPageTheme } from '../../assets/themes/themes';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/userNavbar';
import { ROUTES } from '../../routes/config/routes';
import { getEmployees, updateEmployeeById } from '../../utils/apis/employeeShiftApis';
import { Employee } from '../../components/CalendarFeatures/calendarStates';

interface EmployeeInfoData {
  employee: Employee | null;
  loading: boolean;
  error: string | null;
}

const EmployeeInfo: React.FC = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfoData>({
    employee: null,
    loading: true,
    error: null
  });
  const [adminToggleLoading, setAdminToggleLoading] = useState(false);
  const [adminToggleError, setAdminToggleError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      if (!employeeId) {
        setEmployeeInfo(prev => ({ ...prev, error: 'No employee ID provided', loading: false }));
        return;
      }

      try {
        setEmployeeInfo(prev => ({ ...prev, loading: true, error: null }));

        // Fetch employee details
        const employeesResponse = await getEmployees();
        let employees: any[] = [];
        if (Array.isArray(employeesResponse)) {
          employees = employeesResponse;
        } else if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
          employees = employeesResponse.data;
        }

        const employee = employees.find((emp: any) => emp.employee_id === parseInt(employeeId));

        if (!employee) {
          throw new Error('Employee not found');
        }

        setEmployeeInfo({
          employee: {
            id: employee.employee_id,
            name: employee.employee_name,
            email: employee.employee_email,
            admin: employee.employee_admin,
            phone: employee.employee_phone || employee.phone
          },
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching employee info:', error);
        setEmployeeInfo(prev => ({
          ...prev,
          error: 'Failed to load employee information',
          loading: false
        }));
      }
    };

    fetchEmployeeInfo();
  }, [employeeId]);

  const handleBack = () => {
    // Check if we have a previous page in the navigation state
    const previousPage = window.history.state?.usr?.fromPage;
    
    if (previousPage) {
      // Navigate back to the previous page
      navigate(previousPage);
    } else {
      // Fallback to appropriate dashboard if no previous page
      const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';
      const targetRoute = isAdmin ? ROUTES.ADMIN : ROUTES.DASHBOARD;
      navigate(targetRoute);
    }
  };

  const handleAdminToggle = () => {
    setConfirmDialogOpen(true);
  };

  const confirmAdminToggle = async () => {
    if (!employeeInfo.employee) return;
    
    setConfirmDialogOpen(false);
    setAdminToggleLoading(true);
    setAdminToggleError(null);
    
    try {
      const newAdminStatus = !employeeInfo.employee.admin;
      await updateEmployeeById(employeeInfo.employee.id, { admin: newAdminStatus });
      
      // Update the local state
      setEmployeeInfo(prev => ({
        ...prev,
        employee: prev.employee ? { ...prev.employee, admin: newAdminStatus } : null
      }));
    } catch (error: any) {
      setAdminToggleError(error.message || 'Failed to update admin status');
    } finally {
      setAdminToggleLoading(false);
    }
  };

  // Prevent scroll jumping on component mount
  useEffect(() => {
    // Ensure the page starts at the top when entering employee info
    window.scrollTo(0, 0);
  }, []);

  // Determine background color based on user type
  const getBackgroundColor = () => {
    const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';
    return isAdmin ? swapPageTheme.adminBg : '#093039';
  };

  // Check if current user is admin and can modify this employee
  const canModifyAdminStatus = () => {
    const currentUserIsAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdmin') === 'true';
    const currentUserId = sessionStorage.getItem('customEmployeeId');
    
    // Only admins can modify admin status
    if (!currentUserIsAdmin) return false;
    
    // Cannot modify your own admin status
    if (currentUserId && employeeInfo.employee && currentUserId === employeeInfo.employee.id.toString()) {
      return false;
    }
    
    return true;
  };

  if (employeeInfo.loading) {
    return (
      <ThemeProvider theme={MainTheme}>
        <CssBaseline />
        <Box sx={{ backgroundColor: getBackgroundColor(), minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#00c28c' }} />
        </Box>
      </ThemeProvider>
    );
  }

  if (employeeInfo.error || !employeeInfo.employee) {
    return (
      <ThemeProvider theme={MainTheme}>
        <CssBaseline />
        <Box sx={{ backgroundColor: getBackgroundColor(), minHeight: '100vh', py: 4, px: 2 }}>
          <Container maxWidth="md">
            <Navbar />
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>
                {employeeInfo.error || 'Employee not found'}
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

  const { employee } = employeeInfo;

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
              Back
            </Button>

            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
              Employee Information
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
              Employee ID: {employee.id}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Main Employee Details */}
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Avatar
                    sx={{
                      bgcolor: '#00c28c',
                      width: 80,
                      height: 80,
                      fontSize: '2rem',
                      fontWeight: 600,
                      mr: 3,
                    }}
                  >
                    {employee.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#00c28c', fontWeight: 600, mb: 1 }}>
                      {employee.name}
                    </Typography>
                    {employee.admin && (
                      <Chip
                        label="Administrator"
                        sx={{
                          backgroundColor: '#ff9800',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Email Information */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ color: '#00c28c', mr: 2, fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                          Email Address
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {employee.email || 'Not provided'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Phone Information */}
                  {employee.phone && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Phone sx={{ color: '#00c28c', mr: 2, fontSize: 28 }} />
                        <Box>
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Phone Number
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {employee.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                                     {/* Role Information */}
                   <Box>
                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                       <Person sx={{ color: '#00c28c', mr: 2, fontSize: 28 }} />
                       <Box sx={{ flex: 1 }}>
                         <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                           Role
                         </Typography>
                         <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                           {employee.admin ? 'Administrator' : 'Employee'}
                         </Typography>
                       </Box>
                       {canModifyAdminStatus() && (
                         <Button
                           variant="outlined"
                           onClick={handleAdminToggle}
                           disabled={adminToggleLoading}
                           sx={{
                             border: '1px solid #00c28c',
                             color: '#00c28c',
                             '&:hover': {
                               border: '1px solid #00c28c',
                               backgroundColor: 'rgba(0, 194, 140, 0.1)',
                             },
                             '&:disabled': {
                               border: '1px solid rgba(0, 194, 140, 0.3)',
                               color: 'rgba(0, 194, 140, 0.3)',
                             }
                           }}
                         >
                           {adminToggleLoading ? (
                             <CircularProgress size={16} sx={{ color: '#00c28c' }} />
                           ) : (
                             employee.admin ? 'Remove Admin' : 'Make Admin'
                           )}
                         </Button>
                       )}
                     </Box>
                     {adminToggleError && (
                       <Typography variant="body2" sx={{ color: '#f44336', mt: 1 }}>
                         {adminToggleError}
                       </Typography>
                     )}
                   </Box>

                  {/* Employee ID Information */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Business sx={{ color: '#00c28c', mr: 2, fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                          Employee ID
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {employee.id}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Additional Information Card */}
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
                  Quick Info
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Card
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                        Status
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                        Active
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                        Contact Available
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                        {employee.email ? 'Email' : 'No contact info'}
                        {employee.phone && employee.email ? ' & Phone' : ''}
                        {employee.phone && !employee.email ? 'Phone' : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Paper>
            </Box>
                     </Box>
         </Container>
       </Box>
       
       {/* Admin Toggle Confirmation Dialog */}
       <Dialog
         open={confirmDialogOpen}
         onClose={() => setConfirmDialogOpen(false)}
         maxWidth="sm"
         fullWidth
       >
         <DialogTitle sx={{ color: '#00c28c', fontWeight: 600 }}>
           Confirm Admin Status Change
         </DialogTitle>
         <DialogContent>
           <Typography variant="body1" sx={{ mt: 1 }}>
             Are you sure you want to {employeeInfo.employee?.admin ? 'remove' : 'grant'} administrator privileges for{' '}
             <strong>{employeeInfo.employee?.name}</strong>?
           </Typography>
           <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
             {employeeInfo.employee?.admin 
               ? 'This will remove their ability to access admin features and manage other employees.'
               : 'This will grant them access to admin features and the ability to manage other employees.'
             }
           </Typography>
         </DialogContent>
         <DialogActions sx={{ p: 2 }}>
           <Button 
             onClick={() => setConfirmDialogOpen(false)}
             sx={{ color: 'text.secondary' }}
           >
             Cancel
           </Button>
           <Button 
             onClick={confirmAdminToggle}
             variant="contained"
             sx={{
               backgroundColor: employeeInfo.employee?.admin ? '#f44336' : '#00c28c',
               '&:hover': {
                 backgroundColor: employeeInfo.employee?.admin ? '#d32f2f' : '#00a070',
               }
             }}
           >
             {employeeInfo.employee?.admin ? 'Remove Admin' : 'Make Admin'}
           </Button>
         </DialogActions>
       </Dialog>
       
       <Footer />
     </ThemeProvider>
   );
 };

export default EmployeeInfo;