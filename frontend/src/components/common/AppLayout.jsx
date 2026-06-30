import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Badge, Divider, Tooltip,
  useMediaQuery, useTheme, Menu, MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, FitnessCenter, Notifications, CheckCircle,
  Person, Logout, AdminPanelSettings, Group, FolderSpecial, Close,
  SelfImprovement, CalendarMonth,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';

const DRAWER_WIDTH = 240;

function NavItem({ to, icon, label, onClick }) {
  const location = useLocation();
  const active   = location.pathname.startsWith(to);
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={Link} to={to}
        onClick={onClick}
        sx={{
          borderRadius: 2, mx: 1,
          bgcolor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          color: '#fff',
        }}
      >
        <ListItemIcon sx={{ color: active ? '#fff' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
          {icon}
        </ListItemIcon>
        <ListItemText primary={label} primaryTypographyProps={{ fontWeight: active ? 600 : 400, fontSize: 14 }} />
      </ListItemButton>
    </ListItem>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { summary, refreshSummary } = useNotifications();
  const navigate  = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => { refreshSummary(); }, [refreshSummary]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const memberNav = [
    { to: '/dashboard',     icon: <Dashboard />,      label: 'Dashboard' },
    { to: '/actions',       icon: <FitnessCenter />,  label: 'Weekly Actions' },
    { to: '/checkin',       icon: <CheckCircle />,    label: 'Check-In' },
    { to: '/appointments',  icon: <CalendarMonth />,  label: 'Appointments' },
    { to: '/notifications', icon: <Notifications />,  label: 'Notifications' },
    { to: '/profile',       icon: <Person />,         label: 'Profile' },
  ];
  const coachNav  = [{ to: '/coach', icon: <Group />, label: 'My Members' }];
  const adminNav  = [
    { to: '/admin',        icon: <AdminPanelSettings />, label: 'Admin Dashboard' },
    { to: '/admin/plans',  icon: <FolderSpecial />,      label: 'Manage Plans' },
    { to: '/admin/users',  icon: <Group />,              label: 'Manage Users' },
  ];

  const navItems = user?.role === 'admin' ? adminNav
    : user?.role === 'coach' ? [...memberNav, ...coachNav]
    : memberNav;

  const sidebar = (
    <Box sx={{
      width: DRAWER_WIDTH, height: '100%', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #312E81 0%, #4F46E5 100%)',
    }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SelfImprovement sx={{ color: '#fff', fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>WellnessHub</Typography>
        {isMobile && (
          <IconButton sx={{ ml: 'auto', color: '#fff' }} onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mb: 1 }} />
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={isMobile ? () => setOpen(false) : undefined} />
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </Avatar>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, noWrap: true }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>
            {user?.role}
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer open={open} onClose={() => setOpen(false)} ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: DRAWER_WIDTH, border: 'none' } }}>
          {sidebar}
        </Drawer>
      ) : (
        <Drawer variant="permanent" open
          PaperProps={{ sx: { width: DRAWER_WIDTH, border: 'none', boxShadow: '4px 0 20px rgba(0,0,0,0.08)' } }}>
          {sidebar}
        </Drawer>
      )}

      {/* Main */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', ml: isMobile ? 0 : `${DRAWER_WIDTH}px` }}>
        <AppBar position="sticky" elevation={0}
          sx={{ bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" onClick={() => setOpen(true)} sx={{ mr: 1, color: 'text.primary' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, flexGrow: 1 }}>
              {/* Page title provided by children */}
            </Typography>
            <IconButton onClick={() => navigate('/notifications')} sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={summary?.total_unread || 0} color="error" max={99}>
                <Notifications />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
