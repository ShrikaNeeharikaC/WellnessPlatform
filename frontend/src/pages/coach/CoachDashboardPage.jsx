import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Avatar, Grid, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, TextField, InputAdornment,
} from '@mui/material';
import { Group, Search, ArrowForward } from '@mui/icons-material';
import adminService from '../../services/adminService';

export default function CoachDashboardPage() {
  const navigate  = useNavigate();
  const [members, setMembers] = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    adminService.getCoachMembers()
      .then(setMembers).catch(() => setError('Failed to load members.')).finally(() => setLoading(false));
  }, []);

  const filtered = members.filter((m) =>
    `${m.first_name} ${m.last_name} ${m.username} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Group color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>My Members</Typography>
          <Typography color="text.secondary">{members.length} assigned members</Typography>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Members', value: members.length, color: '#4F46E5' },
          { label: 'Active',        value: members.filter((m) => m.status === 'active').length,   color: '#10B981' },
          { label: 'Inactive',      value: members.filter((m) => m.status !== 'active').length,   color: '#F59E0B' },
        ].map(({ label, value, color }) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
                <Typography color="text.secondary">{label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <TextField
            placeholder="Search members…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            size="small" sx={{ mb: 2, width: 280 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />

          {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}
          {error   && <Alert severity="error">{error}</Alert>}

          {!loading && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Member</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Joined</strong></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 13 }}>
                            {m.first_name?.[0]}{m.last_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600} variant="body2">{m.first_name} {m.last_name}</Typography>
                            <Typography variant="caption" color="text.secondary">@{m.username}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2">{m.email}</Typography></TableCell>
                      <TableCell>
                        <Chip label={m.status} size="small"
                          color={m.status === 'active' ? 'success' : m.status === 'suspended' ? 'error' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(m.created_at).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Button size="small" endIcon={<ArrowForward />}
                          onClick={() => navigate(`/coach/members/${m.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
