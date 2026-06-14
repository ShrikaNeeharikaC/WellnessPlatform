import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Avatar, Grid,
  Divider, Chip, Alert, CircularProgress, MenuItem,
} from '@mui/material';
import { Person, Lock, EmojiEvents } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const TIMEZONES = ['UTC', 'Europe/London', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Singapore', 'America/New_York', 'America/Los_Angeles'];

export default function ProfilePage() {
  const { user } = useAuth();
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: {
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    phone:      user?.phone      || '',
    gender:     user?.gender     || '',
    timezone:   user?.timezone   || 'UTC',
  }});

  const onSubmit = async (data) => {
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.put('/auth/me', data);
      setSuccess('Profile updated successfully.');
    } catch (e) {
      setError(e.response?.data?.detail || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>My Profile</Typography>

      <Grid container spacing={3}>
        {/* Profile card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 28, fontWeight: 700, mx: 'auto', mb: 2 }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{user?.first_name} {user?.last_name}</Typography>
              <Typography color="text.secondary">@{user?.username}</Typography>
              <Typography color="text.secondary" variant="body2">{user?.email}</Typography>
              <Chip
                label={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                color="primary" size="small" sx={{ mt: 1.5 }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Edit form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Person color="primary" />
                <Typography variant="h6" fontWeight={700}>Personal Details</Typography>
              </Box>

              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="First Name" {...register('first_name')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Last Name"  {...register('last_name')} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Phone" {...register('phone')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Gender" select {...register('gender')}>
                      {['male','female','non_binary','prefer_not_to_say'].map((g) => (
                        <MenuItem key={g} value={g} sx={{ textTransform: 'capitalize' }}>{g.replace(/_/g,' ')}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Timezone" select {...register('timezone')}>
                      {TIMEZONES.map((tz) => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>

                <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={loading}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Lock color="primary" />
                <Typography variant="h6" fontWeight={700}>Account</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Username: <strong>{user?.username}</strong> &nbsp;·&nbsp;
                Email: <strong>{user?.email}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since: <strong>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</strong>
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmojiEvents color="warning" />
                <Typography variant="h6" fontWeight={700}>GDPR — Your Data</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You have the right to view and delete your personal data at any time.
                Contact <strong>privacy@wellnesshub.com</strong> to request a data export or deletion (processed within 30 days).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
