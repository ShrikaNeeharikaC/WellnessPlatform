import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Chip, Grid, ToggleButton,
  ToggleButtonGroup, List, ListItem, ListItemIcon, ListItemText, CircularProgress,
  Alert, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { CheckCircle, SelfImprovement } from '@mui/icons-material';
import planService from '../../services/planService';

const TYPE_LABELS = {
  digital_wellness: { label: 'Digital Wellness', color: '#4F46E5', desc: 'Self-guided, flexible wellness programme' },
  coach_care:       { label: 'Coach Care',       color: '#7C3AED', desc: 'Personalised guidance from a dedicated coach' },
  medical_care:     { label: 'Medical Care',     color: '#059669', desc: 'Clinically supported wellness with healthcare oversight' },
};

export default function PlanSelectionPage() {
  const navigate  = useNavigate();
  const [plans,    setPlans]    = useState([]);
  const [duration, setDuration] = useState('1_month');
  const [loading,  setLoading]  = useState(true);
  const [selecting, setSelecting] = useState(null);
  const [error,    setError]    = useState('');
  const [termsOpen, setTermsOpen] = useState(null);

  useEffect(() => {
    planService.getPlans().then(setPlans).catch(() => setError('Failed to load plans.')).finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter((p) => p.duration === duration);

  const handleSelect = async (plan) => {
    setSelecting(plan.id);
    setError('');
    try {
      await planService.assignPlan(plan.id);
      navigate('/onboarding');
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not assign plan. Please try again.');
    } finally {
      setSelecting(null);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F1F5F9 0%, #EDE9FE 100%)',
      p: { xs: 2, md: 4 },
    }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <SelfImprovement sx={{ color: 'primary.main', fontSize: 36 }} />
          <Typography variant="h5" fontWeight={700} color="primary.main">WellnessHub</Typography>
        </Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>Choose your plan</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
          Select the plan that matches your goals. You can upgrade at any time.
        </Typography>

        {/* Duration toggle */}
        <ToggleButtonGroup value={duration} exclusive onChange={(_, v) => v && setDuration(v)} sx={{ mt: 3 }}>
          <ToggleButton value="1_week"  sx={{ px: 3, fontWeight: 600 }}>1 Week</ToggleButton>
          <ToggleButton value="1_month" sx={{ px: 3, fontWeight: 600 }}>1 Month  <Chip label="Best value" size="small" color="secondary" sx={{ ml: 1 }} /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error  && <Alert severity="error"   sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>{error}</Alert>}
      {loading && <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>}

      {!loading && (
        <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 1000, mx: 'auto' }}>
          {filtered.map((plan) => {
            const meta = TYPE_LABELS[plan.plan_type] || {};
            return (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card sx={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  border: `2px solid ${meta.color}20`,
                  '&:hover': { border: `2px solid ${meta.color}`, transform: 'translateY(-4px)', transition: 'all 0.2s' },
                }}>
                  <Box sx={{ bgcolor: meta.color, py: 2, px: 3, borderRadius: '14px 14px 0 0' }}>
                    <Typography variant="h6" fontWeight={700} color="white">{meta.label}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>{meta.desc}</Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" fontWeight={700} color={meta.color}>
                        £{Number(plan.price).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        per {duration === '1_week' ? 'week' : 'month'}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>

                    <List dense disablePadding>
                      {(plan.benefits || []).map((b, i) => (
                        <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <CheckCircle sx={{ color: meta.color, fontSize: 18 }} />
                          </ListItemIcon>
                          <ListItemText primary={b} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>

                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button variant="text" size="small" onClick={() => setTermsOpen(plan)}
                      sx={{ mb: 1, color: 'text.secondary', display: 'block' }}>
                      View Terms & Conditions
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={selecting === plan.id}
                      onClick={() => handleSelect(plan)}
                      sx={{ bgcolor: meta.color, '&:hover': { bgcolor: meta.color, filter: 'brightness(0.9)' } }}
                    >
                      {selecting === plan.id ? <CircularProgress size={22} color="inherit" /> : 'Select Plan'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Terms dialog */}
      <Dialog open={!!termsOpen} onClose={() => setTermsOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Terms & Conditions — {termsOpen?.plan_name}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {termsOpen?.terms_conditions}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTermsOpen(null)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
