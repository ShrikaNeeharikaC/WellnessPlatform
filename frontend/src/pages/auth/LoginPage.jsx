import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Checkbox,
  FormControlLabel, Alert, InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, SelfImprovement } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [showPwd, setShowPwd]   = useState(false);
  const [error,   setError]     = useState('');
  const [loading, setLoading]   = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ username, password }) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'admin')       navigate('/admin');
      else if (user.role === 'coach')  navigate('/coach');
      else                             navigate('/dashboard');
    } catch (e) {
      setError(e.response?.data?.detail || 'Login failed. Please try again.');
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
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
            <SelfImprovement sx={{ color: 'primary.main', fontSize: 36 }} />
            <Typography variant="h5" fontWeight={700} color="primary.main">WellnessHub</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>Welcome back</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Sign in to continue your wellness journey</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              {...register('username', { required: 'Username is required' })}
              error={!!errors.username}
              helperText={errors.username?.message}
              autoComplete="username"
              autoFocus
            />
            <TextField
              label="Password"
              type={showPwd ? 'text' : 'password'}
              {...register('password', { required: 'Password is required' })}
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel control={<Checkbox size="small" />} label="Remember me" />
              <Typography variant="body2" component={Link} to="/forgot-password"
                sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Typography>
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={loading}
              sx={{ mt: 1, py: 1.5 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            Don't have an account?{' '}
            <Typography component={Link} to="/register" variant="body2"
              sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Typography>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
