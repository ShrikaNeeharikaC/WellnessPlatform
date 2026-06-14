import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, List, ListItem, ListItemText, ListItemIcon,
  Button, Chip, Divider, CircularProgress, Alert, IconButton, Tabs, Tab,
} from '@mui/material';
import { Notifications, CheckCircle, NewReleases, Message, Info, DoneAll } from '@mui/icons-material';
import notificationService from '../../services/notificationService';
import useNotifications from '../../hooks/useNotifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const TYPE_META = {
  pending_action: { icon: <Notifications color="warning" />, color: '#F59E0B', label: 'Pending Action' },
  new_update:     { icon: <NewReleases  color="info"    />, color: '#3B82F6', label: 'New Update'     },
  coach_message:  { icon: <Message      color="primary" />, color: '#4F46E5', label: 'Coach Message'  },
  system:         { icon: <Info         color="inherit" />, color: '#64748B', label: 'System'         },
};

const TABS = ['all', 'pending_action', 'new_update', 'coach_message'];

export default function NotificationsPage() {
  const { refreshSummary }  = useNotifications();
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState(0);

  const load = async () => {
    setLoading(true);
    try { setNotifs(await notificationService.getAll(0, 100)); }
    catch { setError('Failed to load notifications.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (ids) => {
    await notificationService.markRead(ids);
    setNotifs((prev) => prev.map((n) => ids.includes(n.id) ? { ...n, read_status: true } : n));
    refreshSummary();
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, read_status: true })));
    refreshSummary();
  };

  const filter = TABS[tab];
  const displayed = filter === 'all' ? notifs : notifs.filter((n) => n.type === filter);
  const unread    = notifs.filter((n) => !n.read_status);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Notifications</Typography>
          <Typography color="text.secondary">{unread.length} unread</Typography>
        </Box>
        {unread.length > 0 && (
          <Button startIcon={<DoneAll />} onClick={markAllRead} variant="outlined" size="small">
            Mark all read
          </Button>
        )}
      </Box>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab label="All" />
          <Tab label="Pending Actions" />
          <Tab label="Updates" />
          <Tab label="Coach Messages" />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}
          {error   && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

          {!loading && displayed.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography color="text.secondary">You're all caught up!</Typography>
            </Box>
          )}

          <List disablePadding>
            {displayed.map((n, idx) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              return (
                <React.Fragment key={n.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2, px: 3,
                      bgcolor: n.read_status ? 'transparent' : '#EEF2FF',
                      cursor: n.read_status ? 'default' : 'pointer',
                    }}
                    onClick={() => !n.read_status && markRead([n.id])}
                    secondaryAction={
                      !n.read_status && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1.5 }} />
                      )
                    }
                  >
                    <ListItemIcon sx={{ mt: 0.5 }}>{meta.icon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={n.read_status ? 400 : 700} variant="body1">{n.title}</Typography>
                          <Chip label={meta.label} size="small"
                            sx={{ bgcolor: `${meta.color}15`, color: meta.color, fontSize: 10 }} />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{n.message}</Typography>
                          <Typography variant="caption" color="text.disabled">{dayjs(n.created_at).fromNow()}</Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {idx < displayed.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
