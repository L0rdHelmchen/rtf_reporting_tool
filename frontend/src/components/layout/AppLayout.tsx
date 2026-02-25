// RTF Reporting Tool - Main Application Layout
import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Settings,
  ExitToApp,
  Home,
  ChevronRight
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectUser,
  selectInstitution,
  logout
} from '../../store/slices/authSlice';
import {
  selectSidebarOpen,
  selectSidebarWidth,
  selectNotifications,
  selectIsMobile,
  toggleSidebar,
  setSidebarOpen,
  removeNotification
} from '../../store/slices/uiSlice';

import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const institution = useAppSelector(selectInstitution);
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const sidebarWidth = useAppSelector(selectSidebarWidth);
  const notifications = useAppSelector(selectNotifications);
  const isMobile = useAppSelector(selectIsMobile);

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  // Auto-close sidebar on mobile when location changes
  React.useEffect(() => {
    if (isMobile && sidebarOpen) {
      dispatch(setSidebarOpen(false));
    }
  }, [location, isMobile, sidebarOpen, dispatch]);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await dispatch(logout());
    navigate('/login');
  };

  const handleSettingsClick = () => {
    handleUserMenuClose();
    navigate('/settings');
  };

  const generateBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <Home sx={{ mr: 0.5, fontSize: 'inherit' }} />
      }
    ];

    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;

      // Skip dashboard since it's already added
      if (part === 'dashboard') return;

      let label = part.charAt(0).toUpperCase() + part.slice(1);

      // Custom labels for known routes
      const routeLabels: Record<string, string> = {
        'forms': 'Formulare',
        'xbrl': 'XBRL',
        'institution': 'Institution',
        'users': 'Benutzer',
        'settings': 'Einstellungen'
      };

      if (routeLabels[part]) {
        label = routeLabels[part];
      }

      breadcrumbs.push({
        label,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen && !isMobile && {
            marginLeft: sidebarWidth,
            width: `calc(100% - ${sidebarWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          {/* Menu Button */}
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => dispatch(toggleSidebar())}
            sx={{ mr: 2 }}
            aria-label="Navigation öffnen/schließen"
          >
            <MenuIcon />
          </IconButton>

          {/* Title */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div">
              RTF Meldungs-Tool
            </Typography>
            {institution && (
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                {institution.name} ({institution.bik})
              </Typography>
            )}
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              onClick={handleUserMenuOpen}
              color="inherit"
              aria-label="Benutzermenu"
            >
              {user ? (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </Avatar>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        sx={{ mt: 1 }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.role === 'admin' && 'Administrator'}
              {user.role === 'compliance_officer' && 'Compliance-Beauftragter'}
              {user.role === 'risk_manager' && 'Risikomanager'}
              {user.role === 'data_entry' && 'Dateneingabe'}
              {user.role === 'reviewer' && 'Prüfer'}
              {user.role === 'viewer' && 'Betrachter'}
            </Typography>
          </Box>
        )}
        <Divider />
        <MenuItem onClick={handleSettingsClick}>
          <Settings sx={{ mr: 2 }} />
          Einstellungen
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 2 }} />
          Abmelden
        </MenuItem>
      </Menu>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={sidebarOpen}
        onClose={() => dispatch(setSidebarOpen(false))}
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
          },
        }}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        <Sidebar />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: isMobile ? 0 : (sidebarOpen ? 0 : `-${sidebarWidth}px`),
        }}
      >
        {/* Toolbar Spacer */}
        <Toolbar />

        {/* Breadcrumbs */}
        <Box sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}>
          <Breadcrumbs
            separator={<ChevronRight fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              if (isLast) {
                return (
                  <Typography key={crumb.path} color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    {crumb.icon}
                    {crumb.label}
                  </Typography>
                );
              }

              return (
                <Link
                  key={crumb.path}
                  component={RouterLink}
                  to={crumb.path}
                  underline="hover"
                  color="inherit"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  {crumb.icon}
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {/* Page Content */}
        <Box sx={{ p: 3, minHeight: 'calc(100vh - 128px)' }}>
          {children}
        </Box>
      </Box>

      {/* Global Notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration || 6000}
          onClose={() => dispatch(removeNotification(notification.id))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => dispatch(removeNotification(notification.id))}
            severity={notification.type}
            variant="filled"
            action={
              notification.action ? (
                <IconButton
                  size="small"
                  aria-label={notification.action.label}
                  color="inherit"
                  onClick={notification.action.handler}
                >
                  {notification.action.label}
                </IconButton>
              ) : undefined
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default AppLayout;