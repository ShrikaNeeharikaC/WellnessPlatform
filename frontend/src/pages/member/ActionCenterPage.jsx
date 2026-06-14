import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Chip, Button, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Checkbox, CircularProgress,
  Alert, Tooltip, Divider, Grid,
} from '@mui/material';
import { FitnessCenter, Restaurant, SelfImprovement, CheckCircle, Circle } from '@mui/icons-material';
import actionService from '../../services/actionService';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

const TABS      = ['all', 'nutrition', 'fitness', 'wellness'];
const CAT_META  = {
  nutrition: { icon: <Restaurant />,    color: '#10B981', bg: '#ECFDF5' },
  fitness:   { icon: <FitnessCenter />, color: '#4F46E5', bg: '#EEF2FF' },
  wellness:  { icon: <SelfImprovement />, color: '#7C3AED', bg: '#F5F3FF' },
};
const STATUS_COLORS = { completed: 'success', pending: 'default', skipped: 'warning', deferred: 'info' };

export default function ActionCenterPage() {
  const [tab,      setTab]     = useState(0);
  const [actions,  setActions] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState({});
  const [error,    setError]   = useState('');

  const today = dayjs();
  const week  = today.isoWeek();
  const year  = today.year();

  const loadActions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actionService.getActions({ week, year });
      setActions(data);
    } catch {
      setError('Failed to load actions.');
    } finally {
      setLoading(false);
    }
  }, [week, year]);

  useEffect(() => { loadActions(); }, [loadActions]);

  const toggleComplete = async (action) => {
    const newStatus = action.status === 'completed' ? 'pending' : 'completed';
    setSaving((s) => ({ ...s, [action.id]: true }));
    try {
      const updated = await actionService.updateAction(action.id, { status: newStatus });
      setActions((prev) => prev.map((a) => (a.id === action.id ? updated : a)));
    } catch {
      setError('Failed to update action.');
    } finally {
      setSaving((s) => ({ ...s, [action.id]: false }));
    }
  };

  const category     = TABS[tab];
  const filtered     = category === 'all' ? actions : actions.filter((a) => a.category === category);
  const completed    = actions.filter((a) => a.status === 'completed').length;
  const pct          = actions.length > 0 ? Math.round((completed / actions.length) * 100) : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Weekly Action Center</Typography>
          <Typography color="text.secondary">Week {week} · {today.format('D MMM YYYY')}</Typography>
        </Box>
        <Chip label={`${completed}/${actions.length} done · ${pct}%`}
          color={pct === 100 ? 'success' : 'primary'} icon={<CheckCircle />} />
      </Box>

      {/* Category cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {['nutrition','fitness','wellness'].map((cat) => {
          const catA   = actions.filter((a) => a.category === cat);
          const catD   = catA.filter((a) => a.status === 'completed').length;
          const meta   = CAT_META[cat];
          return (
            <Grid item xs={12} sm={4} key={cat}>
              <Card sx={{ cursor: 'pointer', border: category === cat ? `2px solid ${meta.color}` : '2px solid transparent' }}
                onClick={() => setTab(TABS.indexOf(cat))}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: meta.bg }}>
                  <Box sx={{ color: meta.color }}>{meta.icon}</Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{cat}</Typography>
                    <Typography variant="body2" color="text.secondary">{catD}/{catA.length} completed</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          {TABS.map((t) => <Tab key={t} label={t === 'all' ? 'All Tasks' : t.charAt(0).toUpperCase() + t.slice(1)} sx={{ textTransform: 'capitalize' }} />)}
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}
          {error   && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

          {!loading && filtered.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                {category === 'all' ? 'No tasks this week yet' : `No ${category} tasks this week`}
              </Typography>
            </Box>
          )}

          {!loading && (
            <List disablePadding>
              {filtered.map((action, idx) => {
                const meta      = CAT_META[action.category];
                const isDone    = action.status === 'completed';
                const overdue   = dayjs(action.due_date).isBefore(today, 'day') && !isDone;
                return (
                  <React.Fragment key={action.id}>
                    <ListItem sx={{
                      py: 2, px: 3,
                      bgcolor: isDone ? '#F0FDF4' : 'transparent',
                      opacity: isDone ? 0.7 : 1,
                    }}>
                      <ListItemIcon sx={{ minWidth: 44 }}>
                        {saving[action.id]
                          ? <CircularProgress size={24} />
                          : <Checkbox checked={isDone} onChange={() => toggleComplete(action)}
                              icon={<Circle sx={{ color: meta.color }} />}
                              checkedIcon={<CheckCircle sx={{ color: 'success.main' }} />} />
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography fontWeight={600} sx={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'text.secondary' : 'text.primary' }}>
                            {action.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            {action.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {action.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip label={action.category} size="small"
                                sx={{ bgcolor: `${meta.color}15`, color: meta.color, textTransform: 'capitalize', fontSize: 11 }} />
                              <Chip label={`Due ${dayjs(action.due_date).format('D MMM')}`} size="small"
                                color={overdue ? 'error' : 'default'} variant={overdue ? 'filled' : 'outlined'} />
                              <Chip label={action.status} size="small" color={STATUS_COLORS[action.status]} variant="outlined" />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {idx < filtered.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
