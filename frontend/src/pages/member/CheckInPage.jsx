import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Slider, Alert,
  CircularProgress, Chip, List, ListItem, ListItemText, Divider, Grid,
} from '@mui/material';
import { CheckCircle, History } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import checkinService from '../../services/checkinService';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

const MOOD_LABELS = ['', 'Very Low', 'Low', 'Below Average', 'Fair', 'Okay', 'Good', 'Very Good', 'Great', 'Excellent', 'Amazing!'];

export default function CheckInPage() {
  const [completion, setCompletion] = useState(50);
  const [mood,       setMood]       = useState(7);
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState('');
  const [histLoading, setHistLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();

  const today = dayjs();
  const week  = today.isoWeek();
  const year  = today.year();

  useEffect(() => {
    checkinService.getHistory().then(setHistory).catch(() => {}).finally(() => setHistLoading(false));
  }, []);

  const alreadySubmitted = history.some((c) => c.week_number === week && c.year === year);

  const onSubmit = async ({ comments }) => {
    setError('');
    setLoading(true);
    try {
      const res = await checkinService.submit({ week_number: week, year, completion_percentage: completion, mood_score: mood, comments });
      setHistory((prev) => [res, ...prev]);
      setSubmitted(true);
      reset();
    } catch (e) {
      setError(e.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Weekly Check-In</Typography>

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Week {week}, {year}</Typography>
                <Chip label={today.format('D MMM')} size="small" color="primary" />
              </Box>

              {(submitted || alreadySubmitted) ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} color="success.main">Check-in submitted!</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {alreadySubmitted && !submitted ? 'You already submitted for this week.' : 'Your coach has been notified.'}
                  </Typography>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Task Completion — {completion}%
                  </Typography>
                  <Slider value={completion} onChange={(_, v) => setCompletion(v)}
                    min={0} max={100} step={5} valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                    marks={[{value:0,label:'0%'},{value:50,label:'50%'},{value:100,label:'100%'}]} />

                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Mood Score — {mood}/10 ({MOOD_LABELS[mood]})
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <Box key={n} onClick={() => setMood(n)}
                        sx={{
                          width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: n <= mood ? 'primary.main' : 'grey.200',
                          color: n <= mood ? '#fff' : 'text.secondary',
                          fontWeight: 600, fontSize: 13, transition: 'all 0.15s',
                          '&:hover': { bgcolor: 'primary.light', color: '#fff' },
                        }}>
                        {n}
                      </Box>
                    ))}
                  </Box>

                  <TextField label="Comments (optional)" multiline rows={4}
                    placeholder="How did this week go? Any challenges or wins to share?"
                    {...register('comments')} sx={{ mb: 3 }} />

                  <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Submit Check-In'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* History */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <History color="primary" />
                <Typography variant="h6" fontWeight={700}>Past Check-Ins</Typography>
              </Box>
              {histLoading ? <CircularProgress size={24} /> : null}
              {!histLoading && history.length === 0 && (
                <Typography color="text.secondary" variant="body2">No check-ins yet.</Typography>
              )}
              <List dense disablePadding>
                {history.slice(0, 8).map((c, idx) => (
                  <React.Fragment key={c.id}>
                    <ListItem disablePadding sx={{ py: 1.5 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={600}>Week {c.week_number}, {c.year}</Typography>
                            <Chip label={`${c.completion_percentage}%`} size="small"
                              color={c.completion_percentage >= 80 ? 'success' : c.completion_percentage >= 50 ? 'warning' : 'error'} />
                            {c.mood_score && <Chip label={`Mood ${c.mood_score}/10`} size="small" variant="outlined" />}
                          </Box>
                        }
                        secondary={c.coach_notes
                          ? <Typography variant="caption" color="primary.main">Coach: "{c.coach_notes.slice(0,80)}…"</Typography>
                          : <Typography variant="caption" color="text.disabled">Awaiting coach review</Typography>}
                      />
                    </ListItem>
                    {idx < history.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
