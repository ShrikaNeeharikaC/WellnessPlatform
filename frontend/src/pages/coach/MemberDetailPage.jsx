import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Avatar, Grid, Button, Chip, TextField,
  List, ListItem, ListItemText, Divider, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { ArrowBack, CheckCircle, Star } from '@mui/icons-material';
import adminService from '../../services/adminService';

export default function MemberDetailPage() {
  const { memberId } = useParams();
  const navigate     = useNavigate();

  const [member,   setMember]   = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const [reviewOpen,    setReviewOpen]    = useState(false);
  const [activeCheckin, setActiveCheckin] = useState(null);
  const [coachNotes,    setCoachNotes]    = useState('');
  const [reviewing,     setReviewing]     = useState(false);
  const [reviewError,   setReviewError]   = useState('');

  useEffect(() => {
    Promise.all([
      adminService.getMember(memberId),
      adminService.getMemberCheckins(memberId),
    ])
      .then(([m, c]) => { setMember(m); setCheckins(c); })
      .catch(() => setError('Failed to load member data.'))
      .finally(() => setLoading(false));
  }, [memberId]);

  const openReview = (checkin) => {
    setActiveCheckin(checkin);
    setCoachNotes(checkin.coach_notes || '');
    setReviewError('');
    setReviewOpen(true);
  };

  const submitReview = async () => {
    if (!coachNotes.trim()) { setReviewError('Please add notes before submitting.'); return; }
    setReviewing(true);
    try {
      const updated = await adminService.reviewCheckin(activeCheckin.id, { coach_notes: coachNotes });
      setCheckins((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setReviewOpen(false);
    } catch (e) {
      setReviewError(e.response?.data?.detail || 'Review failed.');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;
  if (error)   return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/coach/dashboard')} sx={{ mb: 2 }}>
        Back to Members
      </Button>

      <Grid container spacing={3}>
        {/* Member card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 26, fontWeight: 700, mx: 'auto', mb: 2 }}>
                {member?.first_name?.[0]}{member?.last_name?.[0]}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{member?.first_name} {member?.last_name}</Typography>
              <Typography color="text.secondary" variant="body2">@{member?.username}</Typography>
              <Typography color="text.secondary" variant="body2">{member?.email}</Typography>
              <Chip label={member?.status} size="small"
                color={member?.status === 'active' ? 'success' : 'default'} sx={{ mt: 1.5 }} />
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Stats</Typography>
              {[
                { label: 'Total Check-Ins',   value: checkins.length },
                { label: 'Reviewed',          value: checkins.filter((c) => c.coach_notes).length },
                { label: 'Avg Completion',    value: checkins.length
                    ? Math.round(checkins.reduce((s, c) => s + c.completion_percentage, 0) / checkins.length) + '%'
                    : '—' },
                { label: 'Avg Mood',          value: checkins.length
                    ? (checkins.reduce((s, c) => s + (c.mood_score || 0), 0) / checkins.length).toFixed(1) + '/10'
                    : '—' },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Check-ins list */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Check-In History</Typography>

              {checkins.length === 0 && (
                <Typography color="text.secondary">No check-ins yet.</Typography>
              )}

              <List disablePadding>
                {checkins.map((c, idx) => (
                  <React.Fragment key={c.id}>
                    <ListItem disablePadding sx={{ py: 2 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography fontWeight={600}>Week {c.week_number}, {c.year}</Typography>
                            <Chip label={`${c.completion_percentage}%`} size="small"
                              color={c.completion_percentage >= 80 ? 'success' : c.completion_percentage >= 50 ? 'warning' : 'error'} />
                            {c.mood_score && (
                              <Chip label={`Mood ${c.mood_score}/10`} size="small" icon={<Star sx={{ fontSize: 14 }} />} variant="outlined" />
                            )}
                            {c.coach_notes
                              ? <Chip label="Reviewed" size="small" color="success" icon={<CheckCircle sx={{ fontSize: 14 }} />} />
                              : <Chip label="Pending review" size="small" color="warning" />
                            }
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {c.comments && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Member: "{c.comments}"
                              </Typography>
                            )}
                            {c.coach_notes && (
                              <Typography variant="body2" color="primary.main">
                                Coach: "{c.coach_notes}"
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Button size="small" variant={c.coach_notes ? 'outlined' : 'contained'}
                        onClick={() => openReview(c)} sx={{ ml: 2, flexShrink: 0 }}>
                        {c.coach_notes ? 'Edit Review' : 'Review'}
                      </Button>
                    </ListItem>
                    {idx < checkins.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Review dialog */}
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Review Check-In — Week {activeCheckin?.week_number}, {activeCheckin?.year}
        </DialogTitle>
        <DialogContent>
          {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}

          <Box sx={{ mb: 2 }}>
            <Chip label={`Completion: ${activeCheckin?.completion_percentage}%`} sx={{ mr: 1 }} />
            {activeCheckin?.mood_score && <Chip label={`Mood: ${activeCheckin.mood_score}/10`} />}
          </Box>
          {activeCheckin?.comments && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Member comment: "{activeCheckin.comments}"
            </Typography>
          )}
          <TextField
            label="Your feedback / coaching notes"
            multiline rows={5} fullWidth
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            placeholder="Share your observations, encouragement, and suggestions for next week…"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)} disabled={reviewing}>Cancel</Button>
          <Button onClick={submitReview} variant="contained" disabled={reviewing}>
            {reviewing ? <CircularProgress size={20} color="inherit" /> : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
