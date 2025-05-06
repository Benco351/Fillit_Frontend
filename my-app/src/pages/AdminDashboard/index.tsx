import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Snackbar,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import { format, addDays } from 'date-fns';
import { MainTheme } from '../../assets/themes/themes';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/userNavbar';
import { useNavigate } from 'react-router-dom';
import { getAvailableShifts, getAvailableShiftById, updateAvailableShiftById, deleteAvailableShiftById, createAvailableShift } from '../../utils/apis/availableShiftApis';
import { createRequestedShift, getRequestedShifts, updateRequestedShiftById, deleteRequestedShiftById } from '../../utils/apis/requestedShiftsApis';
import { AvailableShift, RequestedShift, AssignedShift } from '../../components/CalendarFeatures/ShiftUtils';
import { Employee, employees } from '../../components/CalendarFeatures/calendarStates';
import { useUserDashboard } from '../../hooks/useUserDashboard';
import ShiftFilters from '../../components/ShiftManagment/ShiftFilters';
import WeekPicker from '../../components/CalendarFeatures/WeekPicker';

// Import existing components
import ShiftDetails from '../../components/UserDashboard/ShiftDetails';
import WeeklySchedule from '../../components/UserDashboard/WeeklySchedule';
import EditShiftDialog from '../../components/UserDashboard/EditShiftDialog';

// Import new admin components
import AdminShiftManagement from '../../components/AdminDashboard/AdminShiftManagement';
import AdminShiftRequests from '../../components/AdminDashboard/AdminShiftRequests';

const AdminDashboard: React.FC = () => {
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(employees[0]);
  const navigate = useNavigate();

  const {
    currentWeekStart,
    setCurrentWeekStart,
    availableShifts,
    setAvailableShifts,
    requestedShifts,
    loading,
    setLoading,
    error,
    success,
    filter,
    setFilter,
    refreshAvailableShifts,
    refreshRequestedShifts,
    setSuccess,
    setError,
    setRequestedShifts,
    assignedShifts,
    setAssignedShifts,
    newShift,
    setNewShift,
    isAddShiftDialogOpen,
    setIsAddShiftDialogOpen,
    isRequestShiftDialogOpen,
    setIsRequestShiftDialogOpen,
    isEditShiftDialogOpen,
    setIsEditShiftDialogOpen,
    selectedShift,
    setSelectedShift,
    newRequest,
    setNewRequest,
    editShift,
    setEditShift,
    shiftIdToFetch,
    setShiftIdToFetch,
    fetchedShift,
    setFetchedShift,
    weekDays,
    loadingAvailable,
    loadingRequested,
    setLoadingAvailable,
    setLoadingRequested,
    goToNextWeek,
    goToPreviousWeek,
  } = useUserDashboard(currentEmployee);

  // Fetch all shifts on component mount
  useEffect(() => {
    const fetchAllShifts = async () => {
      setLoading(true);
      try {
        const [availableShiftsResponse, requestedShiftsResponse] = await Promise.all([
          getAvailableShifts(),
          getRequestedShifts()
        ]);

        if (availableShiftsResponse?.data) {
          setAvailableShifts(availableShiftsResponse.data.map((shift: any) => ({
            id: shift.shift_id || shift.id,
            date: shift.shift_date || shift.date,
            start: shift.shift_time_start || shift.start,
            end: shift.shift_time_end || shift.end,
          })));
        }

        if (requestedShiftsResponse?.data) {
          setRequestedShifts(requestedShiftsResponse.data.map((shift: any) => ({
            id: shift.request_id || shift.id,
            employeeId: shift.employee_id,
            availableShiftId: shift.shift_slot_id,
            notes: shift.notes || '',
            status: shift.status || 'pending',
          })));
        }
      } catch (err) {
        setError('Failed to fetch shifts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllShifts();
  }, []);

  const handleAddShift = async () => {
    setLoading(true);
    try {
      const response = await createAvailableShift({
        date: new Date(newShift.date),
        start: newShift.start,
        end: newShift.end,
      });
      if (response?.data) {
        setAvailableShifts(prev => [...prev, response.data]);
        setSuccess('Shift added successfully');
        setIsAddShiftDialogOpen(false);
      }
    } catch (err) {
      setError('Failed to add shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    setLoading(true);
    try {
      await deleteAvailableShiftById(shiftId);
      setAvailableShifts(prev => prev.filter(shift => shift.id !== shiftId));
      setSuccess('Shift deleted successfully');
    } catch (err) {
      setError('Failed to delete shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditShift = async () => {
    if (!editShift) return;
    setLoading(true);
    try {
      const response = await updateAvailableShiftById(editShift.id, {
        date: new Date(editShift.date),
        start: editShift.start,
        end: editShift.end,
      });
      if (response?.data) {
        setAvailableShifts(prev =>
          prev.map(shift =>
            shift.id === editShift.id ? { ...shift, ...editShift } : shift
          )
        );
        setSuccess('Shift updated successfully');
        setIsEditShiftDialogOpen(false);
      }
    } catch (err) {
      setError('Failed to update shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptShift = async (requestedShiftId: number) => {
    setLoading(true);
    try {
      await updateRequestedShiftById(requestedShiftId, { status: 'approved' });
      setRequestedShifts(prev =>
        prev.map(shift =>
          shift.id === requestedShiftId ? { ...shift, status: 'approved' } : shift
        )
      );
      setSuccess('Shift request approved');
    } catch (err) {
      setError('Failed to approve shift request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequestedShift = async (requestedShiftId: number) => {
    setLoading(true);
    try {
      await deleteRequestedShiftById(requestedShiftId);
      setRequestedShifts(prev => prev.filter(shift => shift.id !== requestedShiftId));
      setSuccess('Shift request rejected');
    } catch (err) {
      setError('Failed to reject shift request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getShiftStatus = (availableShiftId: number): string => {
    const isAssigned = assignedShifts.some(s => s.availableShiftId === availableShiftId);
    if (isAssigned) return 'assigned';
    
    const requestedShift = requestedShifts.find(s => s.availableShiftId === availableShiftId);
    if (requestedShift) return requestedShift.status;
    
    return 'available';
  };

  const getAssignedEmployeeName = (availableShiftId: number): string => {
    const assignedShift = assignedShifts.find(s => s.availableShiftId === availableShiftId);
    if (!assignedShift) return '';
    
    const employee = employees.find(e => e.id === assignedShift.employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  const getFilteredShifts = () => {
    switch (filter) {
      case 'requested':
        return availableShifts.filter(shift =>
          requestedShifts.some(req => req.availableShiftId === shift.id)
        );
      case 'accepted':
        return availableShifts.filter(shift =>
          assignedShifts.some(assign => assign.availableShiftId === shift.id)
        );
      default:
        return availableShifts;
    }
  };

  const filteredShifts = getFilteredShifts();

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{ backgroundColor: '#232a31', minHeight: '100vh', py: 4, px: 2 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
          <Navbar />

          <Box sx={{ my: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                color: '#00c28c',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                fontFamily: 'Roboto, sans-serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Admin Dashboard
            </Typography>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <ShiftFilters filter={filter} setFilter={setFilter} />
            </Box>

            <AdminShiftManagement
              loading={loading}
              onAddShift={handleAddShift}
              onDeleteShift={handleDeleteShift}
              onAcceptShift={handleAcceptShift}
              onDeleteRequestedShift={handleDeleteRequestedShift}
              selectedShift={selectedShift}
            />

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="outlined" onClick={goToPreviousWeek}>
                Previous Week
              </Button>
              <WeekPicker 
                currentWeekStart={currentWeekStart}
                onWeekChange={setCurrentWeekStart}
              />
              <Button variant="outlined" onClick={goToNextWeek}>
                Next Week
              </Button>
            </Box>

            <ShiftDetails
              fetchedShift={fetchedShift}
              error={error}
              success={success}
            />

            <WeeklySchedule
              weekDays={weekDays}
              filteredShifts={filteredShifts}
              getShiftStatus={getShiftStatus}
              getAssignedEmployeeName={getAssignedEmployeeName}
              handleOpenEditDialogFromCalendar={(shift) => {
                setEditShift(shift);
                setIsEditShiftDialogOpen(true);
              }}
            />

            <AdminShiftRequests
              requestedShifts={requestedShifts}
              employees={employees}
              loading={loading}
              onAcceptShift={handleAcceptShift}
              onDeleteRequestedShift={handleDeleteRequestedShift}
            />
          </Box>

          <EditShiftDialog
            isOpen={isEditShiftDialogOpen}
            onClose={() => setIsEditShiftDialogOpen(false)}
            editShift={editShift}
            setEditShift={setEditShift}
            loading={loading}
            onSave={handleEditShift}
            onRequest={() => {}}
          />

          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Snackbar>
          
          <Snackbar
            open={!!success}
            autoHideDuration={6000}
            onClose={() => setSuccess(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default AdminDashboard;