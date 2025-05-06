import React from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { Employee } from '../../components/CalendarFeatures/calendarStates';

interface ShiftManagementProps {
  shiftIdToFetch: number | '';
  setShiftIdToFetch: (id: number | '') => void;
  loading: boolean;
  onFetchShift: () => void;
  currentEmployee: Employee;
  employees: Employee[];
  onEmployeeChange: (employee: Employee) => void;
}

const ShiftManagement: React.FC<ShiftManagementProps> = ({
  shiftIdToFetch,
  setShiftIdToFetch,
  loading,
  onFetchShift,
  currentEmployee,
  employees,
  onEmployeeChange,
}) => {
  return (
    <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
        Get Available Shift by ID
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <TextField
          label="Shift ID"
          type="number"
          value={shiftIdToFetch}
          onChange={(e) => setShiftIdToFetch(Number(e.target.value) || '')}
          sx={{ width: 200, backgroundColor: 'white' }}
        />
        <Button
          variant="contained"
          onClick={onFetchShift}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Fetch Shift'}
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          select
          label="Current Employee"
          value={currentEmployee.id}
          onChange={(e) => {
            const empId = Number(e.target.value);
            const employee = employees.find(emp => emp.id === empId);
            if (employee) onEmployeeChange(employee);
          }}
          sx={{ width: 200, color: 'white', '& .MuiInputBase-input': { color: 'white' } }}
        >
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </TextField>
      </Box>
    </Box>
  );
};

export default ShiftManagement; 