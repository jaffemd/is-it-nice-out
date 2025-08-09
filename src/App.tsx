import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import CalendarGrid from './components/Calendar/CalendarGrid';
import LocationInput from './components/LocationInput';
import { urlParams } from './utils/urlParams';
import { locationResolver } from './services/locationResolver';

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
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingFromUrl, setLoadingFromUrl] = useState(false);

  useEffect(() => {
    const initializeLocation = async () => {
      // Only check URL parameters - no localStorage fallback
      const urlLocation = urlParams.getLocationParams();
      if (urlLocation) {
        setLoadingFromUrl(true);
        try {
          const searchQuery = urlParams.buildSearchQuery(urlLocation);
          const resolvedLocation = await locationResolver.resolveLocation(searchQuery);
          if (resolvedLocation) {
            setSelectedLocation(resolvedLocation);
            urlParams.updatePageTitle(resolvedLocation.city);
          } else {
            // If URL resolution fails, show location input
            setSelectedLocation(null);
            urlParams.updatePageTitle();
          }
        } catch (error) {
          console.warn('Failed to resolve location from URL:', error);
          // If URL resolution fails, show location input
          setSelectedLocation(null);
          urlParams.updatePageTitle();
        }
        setLoadingFromUrl(false);
      } else {
        // No URL parameters, show location input
        setSelectedLocation(null);
        urlParams.updatePageTitle();
      }
      setIsInitializing(false);
    };

    initializeLocation();
  }, []);

  const handleLocationSelect = (location: SelectedLocation) => {
    // Update URL if city and state are available
    if (location.city && location.state) {
      urlParams.setLocationParams(location.city, location.state);
      urlParams.updatePageTitle(location.city);
    } else {
      // If no city/state, clear URL params and rely on component state only
      urlParams.clearLocationParams();
      urlParams.updatePageTitle();
    }
    
    setSelectedLocation(location);
  };

  const handleStartOver = () => {
    urlParams.clearLocationParams();
    urlParams.updatePageTitle(); // Reset to default title
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
                isInitializing || loadingFromUrl ? (
                  // Show a brief loading state to prevent UI flash
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '200px' 
                  }} />
                ) : selectedLocation ? (
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
