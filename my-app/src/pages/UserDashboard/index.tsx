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
import { getAvailableShifts, getAvailableShiftById, updateAvailableShiftById } from '../../utils/apis/availableShiftApis';
import { createRequestedShift, getRequestedShifts } from '../../utils/apis/requestedShiftsApis';
import { AvailableShift, RequestedShift, AssignedShift } from '../../components/CalendarFeatures/ShiftUtils';
import { Employee, employees } from '../../components/CalendarFeatures/calendarStates';
import { useUserDashboard } from '../../hooks/useUserDashboard';
import ShiftFilters from '../../components/ShiftManagment/ShiftFilters';
import RequestShiftDialog from '../../components/ShiftManagment';
import WeekPicker from '../../components/CalendarFeatures/WeekPicker';

// Import new components
import ShiftDetails from '../../components/UserDashboard/ShiftDetails';
import WeeklySchedule from '../../components/UserDashboard/WeeklySchedule';
import EditShiftDialog from '../../components/UserDashboard/EditShiftDialog';
import ShiftManagement from '../../components/UserDashboard/ShiftManagement';

const UserDashboard: React.FC = () => {
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(employees[0]);

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

  // Fetch shifts for the current week
  const fetchShiftsForWeek = async () => {
    setLoading(true);
    try {
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');

      const response = await getAvailableShifts({
        shift_start_date: new Date(startDate),
        shift_end_date: new Date(endDate),
      });

      if (response?.data && Array.isArray(response.data)) {
        const mappedShifts = response.data.map((shift: any) => ({
          id: shift.shift_id || shift.id,
          date: shift.shift_date || shift.date,
          start: shift.shift_time_start || shift.start,
          end: shift.shift_time_end || shift.end,
        }));

        setAvailableShifts(mappedShifts);
      } else {
        setAvailableShifts([]);
      }
    } catch (err) {
      setError('Failed to fetch shifts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftsForWeek();
  }, [currentWeekStart]);

  useEffect(() => {
    const fetchRequestedShifts = async () => {
      setLoading(true);
      try {
        const params = { request_employee_id: currentEmployee.id };
        const response = await getRequestedShifts(params);

        if (response?.data && Array.isArray(response.data)) {
          const mappedRequestedShifts = response.data.map((shift: any) => ({
            id: shift.request_id || shift.id,
            employeeId: shift.employee_id,
            availableShiftId: shift.shift_slot_id,
            notes: shift.notes || '',
            status: shift.status || 'pending',
          }));

          setRequestedShifts(mappedRequestedShifts);
        }
      } catch (err) {
        setError('Failed to fetch requested shifts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestedShifts();
  }, [currentEmployee.id]);

  const handleRequestShift = async () => {
    if (!selectedShift) return;

    setLoading(true);
    try {
      const payload = {
        employeeId: currentEmployee.id,
        shiftSlotId: selectedShift.id,
        notes: newRequest.notes || '',
      };

      const newRequestResponse = await createRequestedShift(payload);
      const responseData = newRequestResponse.data;

      setRequestedShifts((prev) => [
        ...prev,
        {
          id: responseData.request_id || responseData.id,
          employeeId: currentEmployee.id,
          availableShiftId: selectedShift.id,
          notes: newRequest.notes,
          status: 'pending',
        },
      ]);

      setSuccess('Shift requested successfully');
      setIsRequestShiftDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request shift. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditShift = async () => {
    if (!editShift) return;

    setLoading(true);
    try {
      const updatedShiftResponse = await updateAvailableShiftById(editShift.id, {
        date: new Date(editShift.date),
        start: editShift.start,
        end: editShift.end,
      });

      setAvailableShifts((prev) =>
        prev.map((shift) =>
          shift.id === editShift.id
            ? { ...shift, date: editShift.date, start: editShift.start, end: editShift.end }
            : shift
        )
      );

      setSuccess('Shift updated successfully');
      setIsEditShiftDialogOpen(false);
    } catch (err) {
      setError('Failed to update shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestShiftFromEditDialog = async () => {
    if (!editShift) return;

    setLoading(true);
    try {
      const payload = {
        employeeId: currentEmployee.id,
        shiftSlotId: editShift.id,
        notes: '',
      };

      const newRequestResponse = await createRequestedShift(payload);

      setRequestedShifts((prev) => [
        ...prev,
        {
          id: newRequestResponse.data.id,
          employeeId: currentEmployee.id,
          availableShiftId: editShift.id,
          notes: '',
          status: 'pending',
        },
      ]);

      setSuccess('Shift requested successfully');
      setIsEditShiftDialogOpen(false);
    } catch (err) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to request shift. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequestDialog = (shift: AvailableShift) => {
    setSelectedShift(shift);
    setIsRequestShiftDialogOpen(true);
  };

  const handleOpenEditDialogFromCalendar = (shift: AvailableShift) => {
    setEditShift(shift);
    setIsEditShiftDialogOpen(true);
  };

  const handleGetShiftById = async () => {
    if (!shiftIdToFetch) {
      setError('Please enter a valid shift ID.');
      return;
    }

    setLoading(true);
    try {
      const response = await getAvailableShiftById(Number(shiftIdToFetch));
      
      let shiftData;
      if (response.data && response.data.data) {
        shiftData = response.data.data;
      } else if (response.data) {
        shiftData = response.data;
      } else {
        setError('No shift data found in the response.');
        setFetchedShift(null);
        setLoading(false);
        return;
      }
      
      const transformedShift: AvailableShift = {
        id: shiftData.shift_id || shiftData.id || Number(shiftIdToFetch),
        date: shiftData.date || shiftData.shift_date || '',
        start: shiftData.start || shiftData.shift_start || '',
        end: shiftData.end || shiftData.shift_end || ''
      };
      
      setFetchedShift(transformedShift);
      setSuccess(`Shift with ID ${shiftIdToFetch} fetched successfully.`);
    } catch (err) {
      setError('Failed to fetch shift. Please try again.');
      setFetchedShift(null);
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
              Shift Management System
            </Typography>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <ShiftFilters filter={filter} setFilter={setFilter} />
            </Box>

            <ShiftManagement
              shiftIdToFetch={shiftIdToFetch}
              setShiftIdToFetch={setShiftIdToFetch}
              loading={loading}
              onFetchShift={handleGetShiftById}
              currentEmployee={currentEmployee}
              employees={employees}
              onEmployeeChange={setCurrentEmployee}
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
              handleOpenEditDialogFromCalendar={handleOpenEditDialogFromCalendar}
            />
          </Box>

          <EditShiftDialog
            isOpen={isEditShiftDialogOpen}
            onClose={() => setIsEditShiftDialogOpen(false)}
            editShift={editShift}
            setEditShift={setEditShift}
            loading={loading}
            onSave={handleEditShift}
            onRequest={handleRequestShiftFromEditDialog}
          />

          <RequestShiftDialog />

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

export default UserDashboard;