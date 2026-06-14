import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, IconButton, InputAdornment,
} from '@mui/material';
import { Search, Edit, ManageAccounts } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import adminService from '../../services/adminService';

const ROLES    = ['member', 'coach', 'admin'];
const STATUSES = ['active', 'inactive', 'suspended'];

export default function UserManagerPage() {
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const [editUser,   setEditUser]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState('');

  const { register, handleSubmit, reset } = useForm();

  const load = () => {
    setLoading(true);
    adminService.getUsers()
      .then(setUsers).catch(() => setError('Failed to load users.')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openEdit = (u) => {
    setEditUser(u);
    reset({ role: u.role, status: u.status, first_name: u.first_name, last_name: u.last_name });
    setFormError('');
  };

  const onSubmit = async (data) => {
    setSaving(true); setFormError('');
    try {
      const updated = await adminService.updateUser(editUser.id, data);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setSuccess(`User @${updated.username} updated.`);
      setEditUser(null);
    } catch (e) {
      setFormError(e.response?.data?.detail || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ManageAccounts color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>User Manager</Typography>
          <Typography color="text.secondary">{users.length} registered users</Typography>
        </Box>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <CardContent>
          <TextField
            placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)}
            size="small" sx={{ mb: 2, width: 300 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />

          {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}

          {!loading && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Joined</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: u.role === 'admin' ? '#EF4444' : u.role === 'coach' ? '#F59E0B' : 'primary.main', fontSize: 12 }}>
                            {u.first_name?.[0]}{u.last_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{u.first_name} {u.last_name}</Typography>
                            <Typography variant="caption" color="text.secondary">@{u.username}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2">{u.email}</Typography></TableCell>
                      <TableCell>
                        <Chip label={u.role} size="small"
                          color={u.role === 'admin' ? 'error' : u.role === 'coach' ? 'warning' : 'primary'}
                          variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={u.status} size="small"
                          color={u.status === 'active' ? 'success' : u.status === 'suspended' ? 'error' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(u.created_at).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(u)}><Edit fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User — @{editUser?.username}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box component="form" id="user-form" onSubmit={handleSubmit(onSubmit)}>
            <TextField label="First Name" fullWidth sx={{ mt: 2, mb: 2 }} {...register('first_name')} />
            <TextField label="Last Name"  fullWidth sx={{ mb: 2 }}         {...register('last_name')}  />
            <TextField label="Role" select fullWidth sx={{ mb: 2 }} {...register('role')}>
              {ROLES.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>)}
            </TextField>
            <TextField label="Status" select fullWidth {...register('status')}>
              {STATUSES.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="user-form" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
