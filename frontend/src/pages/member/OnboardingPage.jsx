import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Stepper, Step, StepLabel,
  TextField, MenuItem, FormControlLabel, Checkbox, Chip, Alert,
  CircularProgress, Grid, LinearProgress,
} from '@mui/material';
import { SelfImprovement } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import onboardingService from '../../services/onboardingService';
import useAuth from '../../hooks/useAuth';

const STEPS = ['Basic Info', 'Physical Stats', 'Your Goals', 'Lifestyle', 'Health Screen'];

const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];
const GOALS          = ['weight_loss', 'muscle_gain', 'endurance', 'stress_relief', 'general_wellness'];
const DIETARY_PREFS  = ['vegan', 'vegetarian', 'keto', 'halal', 'gluten_free', 'none'];
const EQUIPMENT      = ['home', 'gym', 'outdoor', 'none'];

function MultiSelect({ label, options, value = [], onChange }) {
  const toggle = (opt) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map((opt) => (
          <Chip key={opt} label={opt.replace(/_/g, ' ')} onClick={() => toggle(opt)}
            color={value.includes(opt) ? 'primary' : 'default'}
            variant={value.includes(opt) ? 'filled' : 'outlined'}
            sx={{ textTransform: 'capitalize', cursor: 'pointer' }} />
        ))}
      </Box>
    </Box>
  );
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [gdpr,    setGdpr]    = useState(false);
  const [dietary, setDietary] = useState([]);
  const [equip,   setEquip]   = useState([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    onboardingService.get().then((o) => { if (o.current_step > 1) setStep(o.current_step - 1); }).catch(() => {});
  }, []);

  const saveStep = async (data) => {
    setError('');
    setLoading(true);
    try {
      const stepNum = step + 1;
      let payload   = { ...data };

      if (stepNum === 4) { payload.dietary_prefs = dietary; payload.equipment = equip; }

      await onboardingService.updateStep(stepNum, payload, stepNum === 5 ? gdpr : undefined);

      if (step < 4) {
        setStep((s) => s + 1);
        reset();
      } else {
        await onboardingService.complete();
        navigate('/dashboard');
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / 5) * 100;

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: '#F1F5F9',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      p: { xs: 2, md: 4 },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <SelfImprovement sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h5" fontWeight={700} color="primary.main">WellnessHub</Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 600, borderRadius: 4 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: '14px 14px 0 0' }} />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="caption" color="text.secondary">Step {step + 1} of 5</Typography>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{STEPS[step]}</Typography>

          <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(saveStep)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* STEP 1 — Basic Info */}
            {step === 0 && (
              <>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Hi {user?.first_name}! Let's personalise your experience.
                </Typography>
                <TextField label="Date of Birth" type="date" InputLabelProps={{ shrink: true }}
                  {...register('dob')} />
                <TextField label="Gender" select {...register('gender')}>
                  {['male','female','non_binary','prefer_not_to_say'].map((g) => (
                    <MenuItem key={g} value={g} sx={{ textTransform: 'capitalize' }}>{g.replace(/_/g,' ')}</MenuItem>
                  ))}
                </TextField>
                <TextField label="Timezone" {...register('timezone')} defaultValue="Europe/London" />
              </>
            )}

            {/* STEP 2 — Physical Stats */}
            {step === 1 && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Height (cm)" type="number" {...register('height_cm')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Weight (kg)" type="number" {...register('weight_kg')} />
                  </Grid>
                </Grid>
                <TextField label="Fitness Level" select {...register('fitness_level')}>
                  {FITNESS_LEVELS.map((f) => (
                    <MenuItem key={f} value={f} sx={{ textTransform: 'capitalize' }}>{f}</MenuItem>
                  ))}
                </TextField>
              </>
            )}

            {/* STEP 3 — Goals */}
            {step === 2 && (
              <>
                <TextField label="Primary Goal" select {...register('primary_goal', { required: 'Please select a goal' })}
                  error={!!errors.primary_goal} helperText={errors.primary_goal?.message}>
                  {GOALS.map((g) => (
                    <MenuItem key={g} value={g} sx={{ textTransform: 'capitalize' }}>{g.replace(/_/g,' ')}</MenuItem>
                  ))}
                </TextField>
                <TextField label="Target Timeline (weeks)" type="number"
                  {...register('target_timeline_weeks', { min: 1, max: 52 })}
                  helperText="How many weeks would you like to reach your goal?" />
              </>
            )}

            {/* STEP 4 — Lifestyle */}
            {step === 3 && (
              <>
                <MultiSelect label="Dietary Preferences" options={DIETARY_PREFS} value={dietary} onChange={setDietary} />
                <MultiSelect label="Equipment Access" options={EQUIPMENT} value={equip} onChange={setEquip} />
                <TextField label="Days per Week (training)" type="number" {...register('days_per_week')} />
                <TextField label="Session Duration (minutes)" select {...register('session_duration_min')}>
                  {[20, 30, 45, 60].map((d) => <MenuItem key={d} value={d}>{d} min</MenuItem>)}
                </TextField>
              </>
            )}

            {/* STEP 5 — Health Screen (optional, GDPR-gated) */}
            {step === 4 && (
              <>
                <Alert severity="info">
                  This step is optional. Health information helps us personalise your plan safely.
                </Alert>
                <FormControlLabel
                  control={<Checkbox checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} />}
                  label="I consent to my health data being stored and used to personalise my wellness plan (GDPR Art. 9)"
                />
                {gdpr && (
                  <>
                    <TextField label="Injuries (comma-separated)" {...register('injuries')}
                      helperText="e.g. knee, lower back" />
                    <TextField label="Medical Conditions (comma-separated)" {...register('medical_conditions')} />
                    <FormControlLabel
                      control={<Checkbox {...register('doctor_clearance')} />}
                      label="I have doctor clearance to start this programme"
                    />
                  </>
                )}
              </>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              {step > 0 && (
                <Button variant="outlined" onClick={() => setStep((s) => s - 1)} disabled={loading} sx={{ flex: 1 }}>
                  Back
                </Button>
              )}
              <Button type="submit" variant="contained" disabled={loading} sx={{ flex: 2 }}>
                {loading ? <CircularProgress size={22} color="inherit" /> : step === 4 ? 'Complete' : 'Next'}
              </Button>
            </Box>

            {step < 3 && (
              <Button variant="text" color="inherit" onClick={() => navigate('/dashboard')}
                sx={{ color: 'text.secondary' }}>
                Skip for now
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
