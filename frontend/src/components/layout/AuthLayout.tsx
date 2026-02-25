// RTF Reporting Tool - Authentication Layout
import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: { xs: 2, md: 4 }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {/* Left Side - Branding (Hidden on mobile) */}
          {!isMobile && (
            <Grid item md={6}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 300,
                    fontSize: { md: '2.5rem', lg: '3rem' }
                  }}
                >
                  RTF Meldungs-Tool
                </Typography>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 400,
                    opacity: 0.9,
                    mb: 4
                  }}
                >
                  Risikotragfähigkeits-Meldungen
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.1rem',
                    opacity: 0.8,
                    lineHeight: 1.6,
                    mb: 4
                  }}
                >
                  Professionelles Tool für die Erstellung und Verwaltung von
                  RTF-Meldungen gemäß den Anforderungen der Deutschen Bundesbank.
                </Typography>

                {/* Features List */}
                <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                  {[
                    '25+ RTF-Formulare verfügbar',
                    'XBRL-konforme Datenexporte',
                    'Automatische Validierung',
                    'Deutsche Bundesbank Compliance'
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        opacity: 0.9
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          backgroundColor: theme.palette.secondary.main,
                          borderRadius: '50%',
                          mr: 2,
                          flexShrink: 0
                        }}
                      />
                      <Typography variant="body2">
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          )}

          {/* Right Side - Auth Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                maxWidth: 440,
                mx: 'auto',
                backgroundColor: 'background.paper'
              }}
            >
              {/* Mobile Title */}
              {isMobile && (
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 500,
                      color: 'primary.main'
                    }}
                  >
                    RTF Meldungs-Tool
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Deutsche Bundesbank Compliance
                  </Typography>
                </Box>
              )}

              {children}

              {/* Footer */}
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  align="center"
                  gutterBottom
                >
                  RTF Meldungs-Tool v1.0.0
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  align="center"
                >
                  © 2024 Deutsche Bundesbank RTF Compliance
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Background Pattern (Optional) */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </Box>
  );
};

export default AuthLayout;