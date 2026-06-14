import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  Grid, InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, SelfImprovement } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate  = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await authRegister(data);
      navigate('/plan-selection');
    } catch (e) {
      const detail = e.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0]?.msg : detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #312E81 0%, #4F46E5 50%, #7C3AED 100%)',
      p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
            <SelfImprovement sx={{ color: 'primary.main', fontSize: 36 }} />
            <Typography variant="h5" fontWeight={700} color="primary.main">WellnessHub</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>Create your account</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Start your personalised wellness journey today</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="First Name" {...register('first_name', { required: 'Required' })}
                  error={!!errors.first_name} helperText={errors.first_name?.message} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Last Name" {...register('last_name', { required: 'Required' })}
                  error={!!errors.last_name} helperText={errors.last_name?.message} />
              </Grid>
            </Grid>

            <TextField label="Username"
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'At least 3 characters' },
                pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers and underscores only' },
              })}
              error={!!errors.username} helperText={errors.username?.message} />

            <TextField label="Email" type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
              error={!!errors.email} helperText={errors.email?.message} />

            <TextField label="Password" type={showPwd ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
                validate: {
                  upper: (v) => /[A-Z]/.test(v) || 'Must contain an uppercase letter',
                  digit: (v) => /\d/.test(v)    || 'Must contain a number',
                },
              })}
              error={!!errors.password} helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(!showPwd)} edge="end">
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField label="Confirm Password" type="password"
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
              error={!!errors.confirm_password} helperText={errors.confirm_password?.message} />

            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 1, py: 1.5 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            Already have an account?{' '}
            <Typography component={Link} to="/login" variant="body2"
              sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Typography>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
