import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, Divider,
  CircularProgress, Grid, IconButton, Avatar, Tooltip,
} from '@mui/material';
import {
  Send, CalendarMonth, Cancel, SmartToy, Person, EventAvailable,
} from '@mui/icons-material';
import appointmentService from '../../services/appointmentService';
import dayjs from 'dayjs';

const WELCOME = 'Hi! I can help you schedule appointments with your coach. Try saying:\n"Book an appointment tomorrow at 2pm"\n"Show me my coach\'s free slots next week"';

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 1.5 }}>
      {!isUser && (
        <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', mr: 1, mt: 0.5 }}>
          <SmartToy sx={{ fontSize: 16 }} />
        </Avatar>
      )}
      <Box sx={{
        maxWidth: '75%',
        bgcolor:  isUser ? 'primary.main' : 'grey.100',
        color:    isUser ? '#fff' : 'text.primary',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        px: 2, py: 1.5,
      }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {msg.content}
        </Typography>
      </Box>
      {isUser && (
        <Avatar sx={{ width: 30, height: 30, bgcolor: 'grey.400', ml: 1, mt: 0.5 }}>
          <Person sx={{ fontSize: 16 }} />
        </Avatar>
      )}
    </Box>
  );
}

function AppointmentCard({ appt, onCancel }) {
  const dt       = dayjs(appt.scheduled_at);
  const isPast   = dt.isBefore(dayjs());
  const status   = appt.status;
  const color    = status === 'confirmed' ? 'success' : status === 'cancelled' ? 'error' : 'default';

  return (
    <Box sx={{
      border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2,
      bgcolor: isPast ? 'grey.50' : 'background.paper',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>{appt.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <CalendarMonth fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              {dt.format('ddd, MMM D, YYYY [at] h:mm A')} UTC
            </Typography>
          </Box>
          {appt.coach_name && (
            <Typography variant="caption" color="text.secondary">
              with Coach {appt.coach_name}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
          <Chip label={status} size="small" color={color} />
          {status === 'confirmed' && !isPast && (
            <Tooltip title="Cancel appointment">
              <IconButton size="small" color="error" onClick={() => onCancel(appt.id)}>
                <Cancel fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function AppointmentsPage() {
  const [messages,   setMessages]   = useState([{ role: 'assistant', content: WELCOME }]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [appts,      setAppts]      = useState([]);
  const [apptLoad,   setApptLoad]   = useState(true);
  const [slots,      setSlots]      = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    appointmentService.getMyAppointments()
      .then(setAppts)
      .catch(() => {})
      .finally(() => setApptLoad(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    setSlots([]);
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setLoading(true);

    try {
      const res = await appointmentService.sendChatMessage(trimmed);

      setMessages((prev) => [...prev, { role: 'assistant', content: res.message }]);

      if (res.action === 'booked' && res.appointment) {
        const a = res.appointment;
        setAppts((prev) => [{
          id:               a.id,
          scheduled_at:     a.scheduled_at,
          duration_minutes: a.duration_minutes,
          status:           a.status,
          title:            a.title,
          coach_name:       a.coach_name,
        }, ...prev]);
      }

      if (res.action === 'slots_shown' && res.available_slots?.length) {
        setSlots(res.available_slots);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I ran into an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const pickSlot = (slot) => {
    setSlots([]);
    sendMessage(`Book the slot at ${slot.datetime_iso}`);
  };

  const handleCancel = async (id) => {
    try {
      const updated = await appointmentService.cancelAppointment(id);
      setAppts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch {
      alert('Failed to cancel appointment.');
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Appointments</Typography>

      <Grid container spacing={3}>

        {/* ── Chat Panel ─────────────────────────────────────────────── */}
        <Grid item xs={12} md={7}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: 620 }}>
            {/* Header */}
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>Scheduling Assistant</Typography>
              <Chip label="AI" size="small" color="primary" sx={{ ml: 'auto' }} />
            </Box>

            {/* Messages */}
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}

              {/* Available slot chips */}
              {slots.length > 0 && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Choose a slot:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {slots.map((s) => (
                      <Chip
                        key={s.datetime_iso}
                        label={s.label}
                        onClick={() => pickSlot(s)}
                        color="primary"
                        variant="outlined"
                        clickable
                        icon={<EventAvailable />}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">Checking availability…</Typography>
                </Box>
              )}
              <div ref={bottomRef} />
            </CardContent>

            <Divider />

            {/* Input */}
            <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                size="small"
                multiline
                maxRows={3}
                placeholder='e.g. "Book an appointment tomorrow at 2pm"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                disabled={loading}
              />
              <Button
                variant="contained"
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                sx={{ minWidth: 48, height: 40 }}
              >
                <Send fontSize="small" />
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* ── Upcoming Appointments ───────────────────────────────────── */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalendarMonth color="primary" />
                <Typography variant="h6" fontWeight={700}>Upcoming</Typography>
              </Box>

              {apptLoad ? (
                <CircularProgress size={24} />
              ) : appts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarMonth sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    No upcoming appointments.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Use the chat to schedule one with your coach!
                  </Typography>
                </Box>
              ) : (
                appts.map((a) => (
                  <AppointmentCard key={a.id} appt={a} onCancel={handleCancel} />
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}
