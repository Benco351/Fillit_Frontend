import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  ThemeProvider,
  CssBaseline,
  Snackbar,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import Navbar from '../../components/layout/userNavbar';
import Footer from '../../components/layout/Footer';
import { MainTheme } from '../../assets/themes/themes';
import { swapPageTheme } from '../../assets/themes/themes';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../../utils/apis/departmentApis';
import { CreateDepartmentDTO, UpdateDepartmentDTO } from '../../utils/apis/types';

const frameBoxSx = {
  border: '2px solid rgba(0, 194, 140, 0.2)',
  borderRadius: '12px',
  padding: { xs: 2, sm: 3 },
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  margin: '24px 0',
  transform: 'translateZ(0)',
  willChange: 'transform',
};

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateDepartmentDTO>({ name: '', address: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<UpdateDepartmentDTO>({ name: '', address: '' });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<any>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDepartments();
      setDepartments(res.data || res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createDepartment(createForm);
      setCreateForm({ name: '', address: '' });
      setSuccess('Department created successfully!');
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Failed to create department');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (dept: any) => {
    setEditingId(dept.id);
    setEditForm({ name: dept.name, address: dept.address || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', address: '' });
  };

  const handleUpdate = async (id: number) => {
    setActionLoading(id);
    setError(null);
    try {
      await updateDepartment(id, editForm);
      setEditingId(null);
      setEditForm({ name: '', address: '' });
      setSuccess('Department updated successfully!');
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Failed to update department');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(id);
    setError(null);
    try {
      await deleteDepartment(id);
      setSuccess('Department deleted successfully!');
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete department');
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };

  const openDeleteDialog = (dept: any) => {
    setDepartmentToDelete(dept);
    setDeleteDialogOpen(true);
  };
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDepartmentToDelete(null);
  };

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{ backgroundColor: swapPageTheme.adminBg, minHeight: '100vh', py: 4, px: 2 }}>
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 }, width: '100%', maxWidth: '100%' }}>
          <Navbar />
          <Box sx={{ my: 3 }}>
            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
              Departments (Admin Only)
            </Typography>
            <Box sx={{ ...frameBoxSx, backgroundColor: swapPageTheme.mainBg }}>
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 4, background: 'transparent', boxShadow: 'none' }}>
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    placeholder="Department Name"
                    value={createForm.name}
                    required
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    sx={{ minWidth: 220, background: 'white', borderRadius: 1 }}
                    size="small"
                    variant="outlined"
                    InputProps={{ style: { color: '#222' } }}
                    InputLabelProps={{ shrink: false }}
                  />
                  <TextField
                    placeholder="Address (optional)"
                    value={createForm.address || ''}
                    onChange={e => setCreateForm(f => ({ ...f, address: e.target.value }))}
                    sx={{ minWidth: 220, background: 'white', borderRadius: 1 }}
                    size="small"
                    variant="outlined"
                    InputProps={{ style: { color: '#222' } }}
                    InputLabelProps={{ shrink: false }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={creating}
                    sx={{ minWidth: 120, height: 40 }}
                  >
                    {creating ? <CircularProgress size={22} color="inherit" /> : 'Create'}
                  </Button>
                </form>
              </Paper>
              <Paper elevation={0} sx={{ p: 0, background: 'transparent', boxShadow: 'none' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <TableContainer sx={{ borderRadius: 2, background: 'rgba(255,255,255,0.01)', boxShadow: 'none', border: '1px solid rgba(0,194,140,0.10)' }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow sx={{ background: 'rgba(0,194,140,0.07)' }}>
                          <TableCell sx={{ p: 2, fontWeight: 700, color: 'primary.main', background: 'rgba(0,194,140,0.07)', borderBottom: '1.5px solid rgba(0,194,140,0.15)' }}>ID</TableCell>
                          <TableCell sx={{ p: 2, fontWeight: 700, color: 'primary.main', background: 'rgba(0,194,140,0.07)', borderBottom: '1.5px solid rgba(0,194,140,0.15)' }}>Name</TableCell>
                          <TableCell sx={{ p: 2, fontWeight: 700, color: 'primary.main', background: 'rgba(0,194,140,0.07)', borderBottom: '1.5px solid rgba(0,194,140,0.15)' }}>Address</TableCell>
                          <TableCell sx={{ p: 2, fontWeight: 700, color: 'primary.main', background: 'rgba(0,194,140,0.07)', borderBottom: '1.5px solid rgba(0,194,140,0.15)' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {departments.map((dept: any, idx: number) => (
                          <TableRow
                            key={dept.id}
                            hover
                            sx={{ borderBottom: idx === departments.length - 1 ? 'none' : '1px solid rgba(0,194,140,0.07)' }}
                          >
                            <TableCell sx={{ p: 2, color: 'white', fontWeight: 500, borderBottom: idx === departments.length - 1 ? 'none' : undefined }}>{dept.id}</TableCell>
                            <TableCell sx={{ p: 2, color: 'white', borderBottom: idx === departments.length - 1 ? 'none' : undefined }}>
                              {editingId === dept.id ? (
                                dept.name
                              ) : (
                                dept.name
                              )}
                            </TableCell>
                            <TableCell sx={{ p: 2, color: 'white', borderBottom: idx === departments.length - 1 ? 'none' : undefined }}>
                              {editingId === dept.id ? (
                                <TextField
                                  placeholder="Address (optional)"
                                  value={editForm.address || ''}
                                  onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                                  size="small"
                                  variant="outlined"
                                  sx={{ minWidth: 120, background: 'white', borderRadius: 1, p: 0, m: 0, verticalAlign: 'middle' }}
                                  InputProps={{ style: { color: '#222', padding: 0, margin: 0, verticalAlign: 'middle' } }}
                                  InputLabelProps={{ shrink: false }}
                                />
                              ) : (
                                dept.address || '-'
                              )}
                            </TableCell>
                            <TableCell sx={{ p: 2, borderBottom: idx === departments.length - 1 ? 'none' : undefined }}>
                              {editingId === dept.id ? (
                                <>
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleUpdate(dept.id)}
                                    disabled={actionLoading === dept.id}
                                    sx={{ mr: 1 }}
                                  >
                                    {actionLoading === dept.id ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                  </IconButton>
                                  <IconButton onClick={cancelEdit} disabled={actionLoading === dept.id} color="inherit">
                                    <CloseIcon />
                                  </IconButton>
                                </>
                              ) : (
                                <>
                                  <IconButton onClick={() => startEdit(dept)} color="primary" sx={{ mr: 1 }}>
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={() => openDeleteDialog(dept)}
                                    disabled={actionLoading === dept.id}
                                    color="error"
                                  >
                                    {actionLoading === dept.id ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                                  </IconButton>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {departments.length === 0 && !loading && (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ textAlign: 'center', p: 4, color: 'white' }}>
                              No departments found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          </Box>
        </Container>
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
          autoHideDuration={4000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      </Box>
      <Footer />
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the department
            <b> {departmentToDelete?.name}</b>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, alignItems: 'stretch', px: 3, pb: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(departmentToDelete.id)}
            disabled={actionLoading === departmentToDelete?.id}
            sx={{ mb: 1 }}
          >
            {actionLoading === departmentToDelete?.id ? <CircularProgress size={22} color="inherit" /> : 'Yes, delete'}
          </Button>
          <Button variant="outlined" onClick={closeDeleteDialog} disabled={actionLoading === departmentToDelete?.id}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default Departments; 