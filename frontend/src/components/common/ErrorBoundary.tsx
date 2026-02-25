// RTF Reporting Tool - Error Boundary Component
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  ExpandMore,
  BugReport
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state to show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send error to logging service
    // logErrorToService(error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private handleReportBug = () => {
    // TODO: Implement bug reporting
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    console.log('Bug report data:', errorDetails);
    // For now, just copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    alert('Fehlerdaten wurden in die Zwischenablage kopiert');
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.default',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center'
            }}
          >
            {/* Error Icon */}
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2
              }}
            />

            {/* Error Title */}
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ color: 'error.main', fontWeight: 500 }}
            >
              Anwendungsfehler
            </Typography>

            {/* Error Description */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut
              oder wenden Sie sich an den Support, wenn das Problem weiterhin besteht.
            </Typography>

            {/* Error Message */}
            {this.state.error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Fehlermeldung:
                </Typography>
                <Typography variant="body2" component="code" sx={{ fontFamily: 'monospace' }}>
                  {this.state.error.message}
                </Typography>
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                size="large"
              >
                Seite neu laden
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleGoBack}
                size="large"
              >
                Zurück
              </Button>
            </Box>

            {/* Technical Details (Expandable) */}
            {(this.state.error || this.state.errorInfo) && (
              <Accordion sx={{ textAlign: 'left' }}>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="error-details"
                  id="error-details-header"
                >
                  <Typography variant="subtitle2">
                    Technische Details anzeigen
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {this.state.error && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Fehler-Stack:
                      </Typography>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          backgroundColor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {this.state.error.stack}
                      </Typography>
                    </Box>
                  )}

                  {this.state.errorInfo && this.state.errorInfo.componentStack && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Komponenten-Stack:
                      </Typography>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          backgroundColor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {this.state.errorInfo.componentStack}
                      </Typography>
                    </Box>
                  )}

                  {/* Report Bug Button */}
                  <Button
                    variant="outlined"
                    startIcon={<BugReport />}
                    onClick={this.handleReportBug}
                    size="small"
                    sx={{ mt: 2 }}
                  >
                    Fehlerbericht erstellen
                  </Button>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Support Information */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Bei anhaltenden Problemen wenden Sie sich an:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                IT-Support oder Systemadministrator
              </Typography>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;