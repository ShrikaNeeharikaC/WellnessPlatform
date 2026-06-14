import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  List, ListItem, ListItemText, ListItemIcon, LinearProgress, CircularProgress,
  IconButton, Divider,
} from '@mui/material';
import {
  FitnessCenter, Restaurant, SelfImprovement, CheckCircleOutline,
  ArrowForward, NotificationsNone, CalendarToday, EmojiEvents,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import planService from '../../services/planService';
import actionService from '../../services/actionService';
import notificationService from '../../services/notificationService';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

const CATEGORY_META = {
  nutrition: { icon: <Restaurant fontSize="small" />, color: '#10B981' },
  fitness:   { icon: <FitnessCenter fontSize="small" />, color: '#4F46E5' },
  wellness:  { icon: <SelfImprovement fontSize="small" />, color: '#7C3AED' },
};

function StatCard({ title, value, subtitle, color, icon }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: `${color}20`, color, width: 48, height: 48 }}>{icon}</Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
          <Typography variant="body2" fontWeight={600}>{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [plan,    setPlan]    = useState(null);
  const [actions, setActions] = useState([]);
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  const today      = dayjs();
  const weekNumber = today.isoWeek();
  const year       = today.year();

  useEffect(() => {
    Promise.all([
      planService.getActivePlan().catch(() => null),
      actionService.getActions({ week: weekNumber, year }).catch(() => []),
      notificationService.getAll(0, 5).catch(() => []),
    ]).then(([p, a, n]) => { setPlan(p); setActions(a); setNotifs(n); }).finally(() => setLoading(false));
  }, [weekNumber, year]);

  const completed    = actions.filter((a) => a.status === 'completed').length;
  const total        = actions.length;
  const progress     = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pending      = actions.filter((a) => a.status === 'pending').slice(0, 3);
  const unreadCount  = notifs.filter((n) => !n.read_status).length;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      {/* Welcome */}
      <Box sx={{
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        borderRadius: 4, p: 3, mb: 3, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Good {getGreeting()}, {user?.first_name}! 👋</Typography>
          <Typography sx={{ opacity: 0.85, mt: 0.5 }}>
            Week {weekNumber} · {today.format('dddd, D MMMM YYYY')}
          </Typography>
        </Box>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 20, fontWeight: 700 }}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </Avatar>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Current Plan" value={plan ? plan.plan.plan_name.split('—')[0].trim() : 'None'}
            subtitle={plan ? `Ends ${dayjs(plan.end_date).format('D MMM')}` : 'Select a plan'}
            color="#4F46E5" icon={<EmojiEvents />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tasks This Week" value={`${completed}/${total}`}
            subtitle={`${progress}% complete`} color="#10B981" icon={<CheckCircleOutline />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Notifications" value={unreadCount} subtitle="unread"
            color="#F59E0B" icon={<NotificationsNone />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Week" value={weekNumber} subtitle={`${year}`}
            color="#7C3AED" icon={<CalendarToday />} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Weekly progress */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Weekly Progress</Typography>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/actions')}>
                  View all
                </Button>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Tasks completed</Typography>
                  <Typography variant="body2" fontWeight={600}>{progress}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              {/* Category breakdown */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {['nutrition','fitness','wellness'].map((cat) => {
                  const catActions  = actions.filter((a) => a.category === cat);
                  const catDone     = catActions.filter((a) => a.status === 'completed').length;
                  const catPct      = catActions.length > 0 ? Math.round((catDone / catActions.length) * 100) : 0;
                  const meta        = CATEGORY_META[cat];
                  return (
                    <Grid item xs={4} key={cat}>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: `${meta.color}10`, borderRadius: 2 }}>
                        <Box sx={{ color: meta.color, mb: 0.5 }}>{meta.icon}</Box>
                        <Typography variant="h6" fontWeight={700} color={meta.color}>{catPct}%</Typography>
                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{cat}</Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Upcoming Tasks</Typography>
              {pending.length === 0 ? (
                <Typography color="text.secondary" variant="body2">All tasks completed this week! 🎉</Typography>
              ) : (
                <List dense disablePadding>
                  {pending.map((a) => {
                    const meta = CATEGORY_META[a.category];
                    return (
                      <ListItem key={a.id} disablePadding sx={{ mb: 1, p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                        <ListItemIcon sx={{ minWidth: 36, color: meta.color }}>{meta.icon}</ListItemIcon>
                        <ListItemText
                          primary={a.title}
                          secondary={`Due ${dayjs(a.due_date).format('D MMM')}`}
                          primaryTypographyProps={{ fontWeight: 500, fontSize: 14 }}
                        />
                        <Chip label={a.category} size="small" sx={{ bgcolor: `${meta.color}15`, color: meta.color, textTransform: 'capitalize' }} />
                      </ListItem>
                    );
                  })}
                </List>
              )}

              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/actions')}>
                Go to Action Center
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Notifications</Typography>
                <Button size="small" onClick={() => navigate('/notifications')}>See all</Button>
              </Box>
              {notifs.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No notifications</Typography>
              ) : (
                <List dense disablePadding>
                  {notifs.slice(0,4).map((n, idx) => (
                    <React.Fragment key={n.id}>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={n.read_status ? 400 : 600}>{n.title}</Typography>}
                          secondary={n.message.slice(0,60) + (n.message.length > 60 ? '…' : '')}
                          secondaryTypographyProps={{ fontSize: 12 }}
                        />
                        {!n.read_status && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', ml: 1, flexShrink: 0 }} />}
                      </ListItem>
                      {idx < 3 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}

              <Divider sx={{ my: 2 }} />
              <Button variant="outlined" fullWidth onClick={() => navigate('/checkin')}>
                Submit Weekly Check-In
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
