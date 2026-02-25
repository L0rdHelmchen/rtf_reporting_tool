// RTF Reporting Tool - Sidebar Navigation
import React from 'react';
import {
  Box,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Chip,
  Typography,
  Paper
} from '@mui/material';
import {
  Dashboard,
  Description,
  Assessment,
  Business,
  People,
  Settings,
  ExpandLess,
  ExpandMore,
  Assignment,
  CloudDownload,
  Folder,
  FolderSpecial,
  TrendingUp,
  AccountBalance,
  Security
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { useAppSelector } from '../../store';
import { selectUser } from '../../store/slices/authSlice';
import { FORM_CATEGORY_NAMES_DE } from '@rtf-tool/shared';

interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavigationItem[];
  roles?: string[];
  badge?: string | number;
  comingSoon?: boolean;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const user = useAppSelector(selectUser);

  const [expandedItems, setExpandedItems] = React.useState<string[]>(['forms']);

  const handleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const hasRole = (requiredRoles?: string[]) => {
    if (!requiredRoles || !user) return true;
    return requiredRoles.includes(user.role);
  };

  // Navigation structure
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />
    },
    {
      id: 'forms',
      label: 'RTF Formulare',
      icon: <Description />,
      children: [
        {
          id: 'forms-overview',
          label: 'Übersicht',
          path: '/forms',
          icon: <Folder />
        },
        {
          id: 'forms-grp',
          label: FORM_CATEGORY_NAMES_DE.GRP,
          path: '/forms?category=GRP',
          icon: <Business />,
          badge: 8
        },
        {
          id: 'forms-rsk',
          label: FORM_CATEGORY_NAMES_DE.RSK,
          path: '/forms?category=RSK',
          icon: <Security />,
          badge: 12
        },
        {
          id: 'forms-rdp',
          label: FORM_CATEGORY_NAMES_DE.RDP,
          path: '/forms?category=RDP',
          icon: <AccountBalance />,
          badge: 4
        },
        {
          id: 'forms-ilaap',
          label: FORM_CATEGORY_NAMES_DE.ILAAP,
          path: '/forms?category=ILAAP',
          icon: <TrendingUp />,
          badge: '50+'
        },
        {
          id: 'forms-kpl',
          label: FORM_CATEGORY_NAMES_DE.KPL,
          path: '/forms?category=KPL',
          icon: <Assessment />,
          badge: 8
        },
        {
          id: 'forms-other',
          label: 'Sonstige',
          path: '/forms?category=OTHER',
          icon: <FolderSpecial />,
          badge: 6
        }
      ]
    },
    {
      id: 'xbrl',
      label: 'XBRL Export',
      path: '/xbrl',
      icon: <CloudDownload />
    },
    {
      id: 'institution',
      label: 'Institution',
      path: '/institution',
      icon: <Business />
    },
    {
      id: 'users',
      label: 'Benutzerverwaltung',
      path: '/users',
      icon: <People />,
      roles: ['admin', 'compliance_officer']
    },
    {
      id: 'settings',
      label: 'Einstellungen',
      path: '/settings',
      icon: <Settings />
    }
  ];

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    if (!hasRole(item.roles)) {
      return null;
    }

    const isItemActive = item.path ? isActive(item.path) : false;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            component={item.path && !hasChildren ? RouterLink : 'div'}
            to={item.path}
            selected={isItemActive && !hasChildren}
            onClick={hasChildren ? () => handleExpand(item.id) : undefined}
            sx={{
              pl: 2 + level * 2,
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                }
              }
            }}
            disabled={item.comingSoon}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isItemActive && !hasChildren ? 'inherit' : 'action.active'
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: level > 0 ? '0.875rem' : '1rem',
                fontWeight: isItemActive && !hasChildren ? 600 : 400
              }}
            />

            {/* Badge */}
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText'
                }}
              />
            )}

            {/* Coming Soon Badge */}
            {item.comingSoon && (
              <Chip
                label="Bald"
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}

            {/* Expand Icon */}
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {/* Children */}
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      {/* Toolbar Spacer */}
      <Toolbar />

      {/* Institution Info */}
      <Paper
        elevation={0}
        sx={{
          mx: 2,
          mt: 2,
          mb: 1,
          p: 2,
          backgroundColor: 'background.default',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          RTF Version
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
          2023-12
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Deutsche Bundesbank
        </Typography>
      </Paper>

      {/* Navigation */}
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <List>
          {navigationItems.map(item => renderNavigationItem(item))}
        </List>
      </Box>

      {/* Footer Info */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary" display="block" align="center">
          RTF Meldungs-Tool v1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" align="center">
          Deutsche Bundesbank Compliance
        </Typography>
      </Box>
    </>
  );
};

export default Sidebar;