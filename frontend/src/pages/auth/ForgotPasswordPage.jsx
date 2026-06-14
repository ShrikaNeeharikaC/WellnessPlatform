import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, SelfImprovement } from '@mui/material';
import { SelfImprovement as Logo } from '@mui/icons-material';
import { useForm } from 'react-hook-form';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = () => setSubmitted(true);

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #312E81 0%, #4F46E5 50%, #7C3AED 100%)',
      p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
            <Logo sx={{ color: 'primary.main', fontSize: 36 }} />
            <Typography variant="h5" fontWeight={700} color="primary.main">WellnessHub</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>Reset password</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Enter your email and we'll send you a reset link.
          </Typography>

          {submitted ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              If an account with that email exists, a reset link has been sent. Check your inbox.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Email address" type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
                error={!!errors.email} helperText={errors.email?.message} />
              <Button type="submit" variant="contained" size="large" sx={{ py: 1.5 }}>
                Send Reset Link
              </Button>
            </Box>
          )}

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            Remembered it?{' '}
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
