import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { useUserDashboard } from '../../hooks/useUserDashboard';
import { useState } from "react";
import { Employee, employees } from "../CalendarFeatures/calendarStates";

const RequestShiftDialog = () => {
      // Current user 
    const [currentEmployee, setCurrentEmployee] = useState<Employee>(employees[0]);
  
    //These guys are in useUserDashboard
    const {currentWeekStart, setCurrentWeekStart, availableShifts, setAvailableShifts, requestedShifts, loading, setLoading,
      error, success, filter, setFilter, refreshAvailableShifts, refreshRequestedShifts, setSuccess, 
      setError, setRequestedShifts, assignedShifts, setAssignedShifts, newShift, setNewShift,
      isAddShiftDialogOpen, setIsAddShiftDialogOpen, isRequestShiftDialogOpen, setIsRequestShiftDialogOpen,
      isEditShiftDialogOpen, setIsEditShiftDialogOpen, selectedShift, setSelectedShift, newRequest, setNewRequest, editShift, setEditShift, shiftIdToFetch, setShiftIdToFetch,
      fetchedShift, setFetchedShift, weekDays, loadingAvailable, loadingRequested, setLoadingAvailable, setLoadingRequested, goToNextWeek,
      goToPreviousWeek
    } = useUserDashboard(currentEmployee);

    const handleRequestShift = async () => {
        if (!selectedShift) return;    }
 

    return (
        <>
          {/* Request Shift Dialog */}
          <Dialog open={isRequestShiftDialogOpen} onClose={() => setIsRequestShiftDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Request Shift</DialogTitle>
            <DialogContent>
              {selectedShift && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">
                    Date: {selectedShift.date}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Time: {selectedShift.start.substring(0, 5)} - {selectedShift.end.substring(0, 5)}
                  </Typography>
                  <TextField
                    label="Notes"
                    multiline
                    rows={4}
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest((prev) => ({ ...prev, notes: e.target.value }))}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsRequestShiftDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleRequestShift} // Trigger the API call
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Request Shift"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
    );
};

export default RequestShiftDialog;