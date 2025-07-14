import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import CalendarGrid from './components/Calendar/CalendarGrid';
import LocationInput from './components/LocationInput';

// Create Material-UI theme with mobile-first approach
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    warning: {
      main: '#FFD700', // Yellow for "okay" weather instead of orange
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: 'min(600px, 100vw) !important', // Default max width for single column
          paddingLeft: '16px',
          paddingRight: '16px',
          margin: '0 auto', // Center the app
          '@media (min-width: 800px)': {
            maxWidth: 'min(1200px, 100vw) !important', // Two column layout width
          }
        },
      },
    },
  },
});

interface SelectedLocation {
  id: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);

  const handleLocationSelect = (location: SelectedLocation) => {
    setSelectedLocation(location);
  };

  const handleStartOver = () => {
    setSelectedLocation(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          padding: '20px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          <Container maxWidth="sm">
            <Routes>
              <Route path="/" element={
                selectedLocation ? (
                  <CalendarGrid 
                    onStartOver={handleStartOver}
                    locationName={selectedLocation.formattedAddress}
                    coordinates={{ 
                      latitude: selectedLocation.latitude, 
                      longitude: selectedLocation.longitude 
                    }}
                  />
                ) : (
                  <LocationInput onLocationSelect={handleLocationSelect} />
                )
              } />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
