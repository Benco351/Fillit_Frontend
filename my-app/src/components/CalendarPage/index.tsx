import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  AppBar, 
  Toolbar, 
  Button, 
  FormControlLabel, 
  Checkbox, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Paper,
  Grid,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CalendarMonth, 
  Assignment, 
  Person, 
  AccessTime, 
  CheckCircle, 
  Cancel, 
  Warning, 
  Add, 
  ChevronLeft, 
  ChevronRight 
} from '@mui/icons-material';

// Types for our shift data
interface AvailableShift {
  id: number;
  date: string;
  start: string;
  end: string;
}

interface RequestedShift {
  id: number;
  employeeId: number;
  availableShiftId: number;
  notes: string;
  status: 'pending' | 'approved' | 'denied';
}

interface AssignedShift {
  id: number;
  employeeId: number;
  availableShiftId: number;
}

interface Employee {
  id: number;
  name: string;
}

interface CalendarShift {
  id: number;
  type: 'available' | 'requested' | 'assigned';
  date: string;
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  duration: number;
  status?: 'pending' | 'approved' | 'denied';
  employeeId?: number;
  notes?: string;
}

// Styled components
const ShiftItem = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '95%',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  cursor: 'pointer',
  boxShadow: theme.shadows[1],
  transition: 'all 0.2s',
  '&:hover': {
    opacity: 0.9,
    boxShadow: theme.shadows[3],
  },
  minHeight: '24px',
}));

const HourMarker = styled(Box)(({ theme }) => ({
  height: '64px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'relative',
}));

const TimeLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '-12px',
  left: '4px',
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
}));

// The main component
export default function ShiftManagementSystem() {
  // State variables
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [availableShifts, setAvailableShifts] = useState<AvailableShift[]>([]);
  const [requestedShifts, setRequestedShifts] = useState<RequestedShift[]>([]);
  const [assignedShifts, setAssignedShifts] = useState<AssignedShift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Robert Johnson" }
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentShift, setCurrentShift] = useState<AvailableShift | null>(null);
  const [showAvailable, setShowAvailable] = useState<boolean>(true);
  const [showRequested, setShowRequested] = useState<boolean>(true);
  const [showAssigned, setShowAssigned] = useState<boolean>(true);

  // For form inputs
  const [shiftDate, setShiftDate] = useState<string>('');
  const [shiftStart, setShiftStart] = useState<string>('');
  const [shiftEnd, setShiftEnd] = useState<string>('');
  const [shiftNotes, setShiftNotes] = useState<string>('');

  // Hour markers for the calendar
  const hourMarkers = Array.from({ length: 13 }, (_, i) => i + 8); // 8AM to 8PM

  // Fetch shifts data based on the current week
  useEffect(() => {
    fetchWeekShifts();
  }, [currentWeek, selectedEmployee]);

  // Helper functions for date manipulation
  const getWeekDates = () => {
    const dates = [];
    const day = currentWeek.getDay();
    const diff = currentWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    
    const monday = new Date(currentWeek);
    monday.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (timeStr: string): string => {
    return timeStr.substring(0, 5);
  };

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Mock API calls (replace with actual API calls)
  const fetchWeekShifts = () => {
    const weekDates = getWeekDates();
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);
    
    // Mock data for demonstration
    setAvailableShifts([
      { id: 1, date: '2025-04-14', start: '09:00:00', end: '13:00:00' },
      { id: 2, date: '2025-04-14', start: '14:00:00', end: '18:00:00' },
      { id: 3, date: '2025-04-15', start: '10:00:00', end: '14:00:00' },
      { id: 4, date: '2025-04-16', start: '12:00:00', end: '16:00:00' },
      { id: 5, date: '2025-04-17', start: '08:00:00', end: '12:00:00' },
      { id: 6, date: '2025-04-17', start: '13:00:00', end: '17:00:00' },
      { id: 7, date: '2025-04-18', start: '09:00:00', end: '13:00:00' },
      { id: 8, date: '2025-04-19', start: '10:00:00', end: '14:00:00' },
      { id: 9, date: '2025-04-20', start: '11:00:00', end: '15:00:00' },
    ]);
    
    setRequestedShifts([
      { id: 1, employeeId: 1, availableShiftId: 1, notes: 'I can work this shift', status: 'pending' },
      { id: 2, employeeId: 2, availableShiftId: 2, notes: 'Available for this shift', status: 'approved' },
      { id: 3, employeeId: 1, availableShiftId: 3, notes: 'Requesting this shift', status: 'pending' },
      { id: 4, employeeId: 1, availableShiftId: 7, notes: 'I would like this shift', status: 'denied' },
    ]);
    
    setAssignedShifts([
      { id: 1, employeeId: 1, availableShiftId: 4 },
      { id: 2, employeeId: 2, availableShiftId: 2 },
      { id: 3, employeeId: 3, availableShiftId: 5 },
      { id: 4, employeeId: 1, availableShiftId: 6 },
    ]);
  };

  const handlePreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const openCreateShiftModal = (date?: string) => {
    setModalMode('create');
    // Default to today's date if no date provided
    setShiftDate(date || formatDate(new Date()));
    setShiftStart('09:00');
    setShiftEnd('13:00');
    setShiftNotes('');
    setCurrentShift(null);
    setIsModalOpen(true);
  };

  const openEditShiftModal = (shift: CalendarShift) => {
    setModalMode('edit');
    setShiftDate(shift.date);
    setShiftStart(formatTime(shift.start));
    setShiftEnd(formatTime(shift.end));
    setShiftNotes(shift.notes || '');
    setCurrentShift({ id: shift.id, date: shift.date, start: shift.start, end: shift.end });
    setIsModalOpen(true);
  };

  const handleSaveShift = () => {
    // Implement API call based on modalMode
    if (modalMode === 'create') {
      // Mock create shift API call
      console.log('Creating shift:', {
        date: shiftDate,
        start: `${shiftStart}:00`,
        end: `${shiftEnd}:00`
      });
    } else {
      // Mock update shift API call
      console.log('Updating shift:', {
        id: currentShift?.id,
        date: shiftDate,
        start: `${shiftStart}:00`,
        end: `${shiftEnd}:00`
      });
    }
    
    setIsModalOpen(false);
    fetchWeekShifts(); // Refresh data
  };

  const requestShift = (shiftId: number) => {
    // Mock API call to request a shift
    console.log('Requesting shift:', {
      employeeId: selectedEmployee,
      availableShiftId: shiftId,
      notes: 'I would like to work this shift',
      status: 'pending'
    });
    
    fetchWeekShifts(); // Refresh data
  };

  const approveShiftRequest = (requestId: number) => {
    // Mock API call to approve a shift request
    console.log('Approving shift request:', requestId);
    
    fetchWeekShifts(); // Refresh data
  };

  const denyShiftRequest = (requestId: number) => {
    // Mock API call to deny a shift request
    console.log('Denying shift request:', requestId);
    
    fetchWeekShifts(); // Refresh data
  };

  const assignShift = (requestId: number, employeeId: number, shiftId: number) => {
    // Mock API call to assign a shift
    console.log('Assigning shift:', {
      employeeId: employeeId,
      availableShiftId: shiftId
    });
    
    fetchWeekShifts(); // Refresh data
  };

  const deleteShift = (shiftId: number) => {
    // Mock API call to delete a shift
    console.log('Deleting shift:', shiftId);
    
    fetchWeekShifts(); // Refresh data
  };

  // Process shifts for calendar display
  const processShiftsForCalendar = () => {
    const calendarShifts: { [key: string]: CalendarShift[] } = {};
    const weekDates = getWeekDates();
    
    weekDates.forEach(date => {
      const dateStr = formatDate(date);
      calendarShifts[dateStr] = [];
      
      // Process available shifts
      if (showAvailable) {
        availableShifts
          .filter(shift => shift.date === dateStr)
          .forEach(shift => {
            const startMinutes = timeToMinutes(shift.start);
            const endMinutes = timeToMinutes(shift.end);
            
            // Skip shifts that are already assigned or requested by the current employee
            const isAssigned = assignedShifts.some(a => a.availableShiftId === shift.id);
            const isRequested = requestedShifts.some(r => 
              r.availableShiftId === shift.id && r.employeeId === selectedEmployee
            );
            
            if (!isAssigned && !isRequested) {
              calendarShifts[dateStr].push({
                id: shift.id,
                type: 'available',
                date: shift.date,
                start: shift.start,
                end: shift.end,
                startMinutes,
                endMinutes,
                duration: endMinutes - startMinutes
              });
            }
          });
      }
      
      // Process requested shifts for the current employee
      if (showRequested) {
        requestedShifts
          .filter(req => req.employeeId === selectedEmployee)
          .forEach(req => {
            const shift = availableShifts.find(s => s.id === req.availableShiftId);
            if (shift && shift.date === dateStr) {
              const startMinutes = timeToMinutes(shift.start);
              const endMinutes = timeToMinutes(shift.end);
              
              calendarShifts[dateStr].push({
                id: shift.id,
                type: 'requested',
                date: shift.date,
                start: shift.start,
                end: shift.end,
                startMinutes,
                endMinutes,
                duration: endMinutes - startMinutes,
                status: req.status,
                notes: req.notes,
                employeeId: req.employeeId
              });
            }
          });
      }
      
      // Process assigned shifts for the current employee
      if (showAssigned) {
        assignedShifts
          .filter(ass => ass.employeeId === selectedEmployee)
          .forEach(ass => {
            const shift = availableShifts.find(s => s.id === ass.availableShiftId);
            if (shift && shift.date === dateStr) {
              const startMinutes = timeToMinutes(shift.start);
              const endMinutes = timeToMinutes(shift.end);
              
              calendarShifts[dateStr].push({
                id: shift.id,
                type: 'assigned',
                date: shift.date,
                start: shift.start,
                end: shift.end,
                startMinutes,
                endMinutes,
                duration: endMinutes - startMinutes,
                employeeId: ass.employeeId
              });
            }
          });
      }
    });
    
    return calendarShifts;
  };
  
  const getShiftPosition = (shift: CalendarShift) => {
    // Calculate position based on 8AM (480 minutes) as start of day
    // Calendar goes from 8AM to 8PM (720 minutes total)
    const dayStart = 8 * 60; // 8AM in minutes
    const dayEnd = 20 * 60; // 8PM in minutes
    const dayRange = dayEnd - dayStart;
    
    const top = ((shift.startMinutes - dayStart) / dayRange) * 100;
    const height = (shift.duration / dayRange) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  };

  const getShiftColor = (shift: CalendarShift) => {
    switch (shift.type) {
      case 'available':
        return { bgcolor: 'primary.light', borderColor: 'primary.main', color: 'primary.dark' };
      case 'requested':
        if (shift.status === 'pending') {
          return { bgcolor: 'warning.light', borderColor: 'warning.main', color: 'warning.dark' };
        } else if (shift.status === 'approved') {
          return { bgcolor: 'success.light', borderColor: 'success.main', color: 'success.dark' };
        } else {
          return { bgcolor: 'error.light', borderColor: 'error.main', color: 'error.dark' };
        }
      case 'assigned':
        return { bgcolor: 'success.light', borderColor: 'success.main', color: 'success.dark' };
      default:
        return { bgcolor: 'grey.100', borderColor: 'grey.300', color: 'grey.800' };
    }
  };

  const getShiftStatusIcon = (shift: CalendarShift) => {
    if (shift.type === 'requested') {
      switch (shift.status) {
        case 'pending':
          return <Warning fontSize="small" sx={{ mr: 0.5 }} />;
        case 'approved':
          return <CheckCircle fontSize="small" sx={{ mr: 0.5 }} />;
        case 'denied':
          return <Cancel fontSize="small" sx={{ mr: 0.5 }} />;
      }
    } else if (shift.type === 'assigned') {
      return <CheckCircle fontSize="small" sx={{ mr: 0.5 }} />;
    }
    return null;
  };

  const getShiftTypeText = (shift: CalendarShift) => {
    switch (shift.type) {
      case 'available':
        return 'Available';
      case 'requested':
        return `Requested (${shift.status})`;
      case 'assigned':
        return 'Assigned';
      default:
        return '';
    }
  };

  const handleShiftClick = (shift: CalendarShift) => {
    if (shift.type === 'available') {
      requestShift(shift.id);
    } else {
      openEditShiftModal(shift);
    }
  };

  const calendarShifts = processShiftsForCalendar();
  const weekDates = getWeekDates();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              <Assignment sx={{ mr: 1 }} />
              Shift Management System
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 2 }}>
                <FormControlLabel
                  control={<Checkbox checked={showAvailable} onChange={() => setShowAvailable(!showAvailable)} />}
                  label="Available"
                />
                <FormControlLabel
                  control={<Checkbox checked={showRequested} onChange={() => setShowRequested(!showRequested)} />}
                  label="Requested"
                />
                <FormControlLabel
                  control={<Checkbox checked={showAssigned} onChange={() => setShowAssigned(!showAssigned)} />}
                  label="Assigned"
                />
              </Box>
              
              <FormControl size="small" variant="outlined" sx={{ minWidth: 150, bgcolor: 'primary.dark', borderRadius: 1 }}>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                  displayEmpty
                  sx={{ color: 'white' }}
                  startAdornment={<Person sx={{ mr: 1, color: 'white' }} />}
                >
                  {employees.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, p: 3, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ChevronLeft />}
            onClick={handlePreviousWeek}
          >
            Previous Week
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <CalendarMonth sx={{ mr: 1 }} />
              Week of {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </Typography>
            
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<Add />}
              onClick={() => openCreateShiftModal()}
            >
              Add Shift
            </Button>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            endIcon={<ChevronRight />}
            onClick={handleNextWeek}
          >
            Next Week
          </Button>
        </Box>

        {/* Calendar Grid */}
        <Paper sx={{ overflow: 'hidden' }}>
          <Grid container>
            {/* Time column header */}
            <Grid item xs={1} sx={{ borderRight: 1, borderColor: 'divider' }}>
              <Box sx={{ p: 1 }}></Box>
            </Grid>
            
            {/* Day headers */}
            {weekDates.map((date, index) => {
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = date.getDate();
              
              return (
                <Grid key={index} item={true} xs={true} sx={{ borderRight: index < 6 ? 1 : 0, borderColor: 'divider' }}>
                  <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="subtitle2" fontWeight="bold">{dayName}</Typography>
                    <Typography variant="body2">{dayNumber}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
          
          {/* Calendar body */}
          <Grid container>
            {/* Time markers */}
            <Grid item xs={1} sx={{ borderRight: 1, borderColor: 'divider' }}>
              {hourMarkers.map((hour, idx) => (
                <HourMarker key={idx}>
                  <TimeLabel variant="caption">
                    {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'am' : 'pm'}
                  </TimeLabel>
                </HourMarker>
              ))}
            </Grid>
            
            {/* Day columns */}
            {weekDates.map((date, colIndex) => {
              const dateString = formatDate(date);
              const shiftsForDay = calendarShifts[dateString] || [];
              
              return (
                <Grid key={colIndex} item xs sx={{ position: 'relative', borderRight: colIndex < 6 ? 1 : 0, borderColor: 'divider' }}>
                  {/* Hour markers */}
                  {hourMarkers.map((hour, idx) => (
                    <HourMarker key={idx} />
                  ))}
                  
                  {/* Shifts */}
                  {shiftsForDay.map((shift, shiftIndex) => {
                    const position = getShiftPosition(shift);
                    const colorStyle = getShiftColor(shift);
                    const statusIcon = getShiftStatusIcon(shift);
                    const typeText = getShiftTypeText(shift);
                    
                    return (
                      <ShiftItem
                        key={shiftIndex}
                        sx={{
                          ...colorStyle,
                          top: position.top,
                          height: position.height,
                          border: 1, 
                          borderColor: colorStyle.borderColor
                        }}
                        onClick={() => handleShiftClick(shift)}
                      >
                        <Typography variant="caption" fontWeight="medium">
                          {formatTime(shift.start)} - {formatTime(shift.end)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          {statusIcon}
                          <Typography variant="caption">{typeText}</Typography>
                        </Box>
                        {shift.notes && (
                          <Typography variant="caption" noWrap sx={{ mt: 0.5, display: 'block' }}>
                            {shift.notes}
                          </Typography>
                        )}
                      </ShiftItem>
                    );
                  })}
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Box>

      {/* Modal for creating/editing shifts */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modalMode === 'create' ? 'Create New Shift' : 'Edit Shift'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1, pb: 2 }}>
            <TextField
              label="Date"
              type="date"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Start Time"
              type="time"
              value={shiftStart}
              onChange={(e) => setShiftStart(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="End Time"
              type="time"
              value={shiftEnd}
              onChange={(e) => setShiftEnd(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            
            {modalMode === 'create' && (
              <TextField
                label="Notes (Optional)"
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveShift} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
