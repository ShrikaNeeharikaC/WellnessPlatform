import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar,
} from '@mui/material';
import { People, Group, FitnessCenter, Assessment } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import adminService from '../../services/adminService';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    adminService.getSummary()
      .then(setSummary).catch(() => setError('Failed to load dashboard data.')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;
  if (error)   return <Alert severity="error">{error}</Alert>;

  const statCards = [
    { label: 'Total Users',    value: summary?.total_users    ?? '—', icon: <People />,     color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Active Members', value: summary?.active_members ?? '—', icon: <Group />,      color: '#10B981', bg: '#ECFDF5' },
    { label: 'Active Plans',   value: summary?.active_plans   ?? '—', icon: <FitnessCenter />, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'This Week Check-Ins', value: summary?.weekly_checkins ?? '—', icon: <Assessment />, color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  const roleData  = summary?.users_by_role  || [];
  const planData  = summary?.plans_by_type  || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Admin Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map(({ label, value, icon, color, bg }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, bgcolor: bg, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                  {icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Users by role */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: 300 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Users by Role</Typography>
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={roleData} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={80} label={({ role, percent }) => `${role} ${(percent * 100).toFixed(0)}%`}>
                      {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" sx={{ pt: 4 }}>No data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Plans by type */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: 300 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Active Plans by Type</Typography>
              {planData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={planData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plan_type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Subscriptions" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" sx={{ pt: 4 }}>No data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent users */}
      {summary?.recent_users?.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recently Joined</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Joined</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.recent_users.slice(0, 10).map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: 11 }}>
                            {u.first_name?.[0]}{u.last_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{u.first_name} {u.last_name}</Typography>
                            <Typography variant="caption" color="text.secondary">@{u.username}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={u.role} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell>
                        <Chip label={u.status} size="small"
                          color={u.status === 'active' ? 'success' : u.status === 'suspended' ? 'error' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(u.created_at).toLocaleDateString()}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
