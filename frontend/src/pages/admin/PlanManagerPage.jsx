import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, Grid, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Add, Edit, Delete, FitnessCenter } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import planService from '../../services/planService';

const PLAN_TYPES     = ['basic', 'standard', 'premium'];
const PLAN_DURATIONS = ['1_week', '1_month'];

export default function PlanManagerPage() {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [formError,   setFormError]   = useState('');

  const [deleteId,    setDeleteId]    = useState(null);
  const [deleting,    setDeleting]    = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = () => {
    setLoading(true);
    planService.getPlans()
      .then(setPlans).catch(() => setError('Failed to load plans.')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setEditingPlan(null);
    reset({ name: '', plan_type: 'basic', duration: '1_month', price: '', description: '', benefits: '' });
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    reset({
      name: plan.name, plan_type: plan.plan_type, duration: plan.duration,
      price: plan.price, description: plan.description || '',
      benefits: Array.isArray(plan.benefits) ? plan.benefits.join('\n') : '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true); setFormError('');
    try {
      const payload = { ...data, price: parseFloat(data.price), benefits: data.benefits.split('\n').map((b) => b.trim()).filter(Boolean) };
      if (editingPlan) {
        const updated = await planService.updatePlan(editingPlan.id, payload);
        setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await planService.createPlan(payload);
        setPlans((prev) => [...prev, created]);
      }
      setSuccess(editingPlan ? 'Plan updated.' : 'Plan created.');
      setDialogOpen(false);
    } catch (e) {
      setFormError(e.response?.data?.detail || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await planService.deletePlan(deleteId);
      setPlans((prev) => prev.filter((p) => p.id !== deleteId));
      setSuccess('Plan deleted.');
    } catch (e) {
      setError(e.response?.data?.detail || 'Delete failed.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FitnessCenter color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>Plan Manager</Typography>
            <Typography color="text.secondary">{plans.length} plans</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>New Plan</Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading && <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>}

      {!loading && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Duration</strong></TableCell>
                  <TableCell><strong>Price</strong></TableCell>
                  <TableCell><strong>Benefits</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{plan.name}</Typography>
                      {plan.description && <Typography variant="caption" color="text.secondary">{plan.description.slice(0, 60)}…</Typography>}
                    </TableCell>
                    <TableCell>
                      <Chip label={plan.plan_type} size="small"
                        color={plan.plan_type === 'premium' ? 'warning' : plan.plan_type === 'standard' ? 'primary' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <Chip label={plan.duration.replace('_', ' ')} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>${parseFloat(plan.price).toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {Array.isArray(plan.benefits) ? `${plan.benefits.length} items` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(plan)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(plan.id)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box component="form" id="plan-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <TextField label="Plan Name *" fullWidth {...register('name', { required: 'Name is required' })}
                  error={!!errors.name} helperText={errors.name?.message} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Type *" select fullWidth {...register('plan_type', { required: true })}>
                  {PLAN_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Duration *" select fullWidth {...register('duration', { required: true })}>
                  {PLAN_DURATIONS.map((d) => <MenuItem key={d} value={d}>{d.replace('_', ' ')}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Price ($) *" type="number" fullWidth
                  {...register('price', { required: 'Price is required', min: { value: 0, message: 'Must be ≥ 0' } })}
                  error={!!errors.price} helperText={errors.price?.message}
                  inputProps={{ step: '0.01', min: '0' }} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" fullWidth multiline rows={2} {...register('description')} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Benefits (one per line)" fullWidth multiline rows={4}
                  {...register('benefits')}
                  placeholder="Weekly coaching calls&#10;Personalized meal plan&#10;Progress tracking" />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="plan-form" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editingPlan ? 'Save Changes' : 'Create Plan')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Plan?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone. Active subscriptions linked to this plan may be affected.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
