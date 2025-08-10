import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import CalendarGrid from './components/Calendar/CalendarGrid';
import LocationInput from './components/LocationInput';
import { urlParams } from './utils/urlParams';
import { locationResolver } from './services/locationResolver';
import { WeatherThemeProvider, useWeatherTheme } from './contexts/ThemeContext';

// Weather rating colors hook
const useWeatherColors = (isDarkMode: boolean) => ({
  good: isDarkMode ? '#4ade80' : '#22c55e',    // Lighter green for dark mode
  okay: isDarkMode ? '#facc15' : '#eab308',    // Lighter yellow for dark mode
  bad: isDarkMode ? '#f87171' : '#ef4444',     // Lighter red for dark mode
  neutral: isDarkMode ? '#94a3b8' : '#64748b', // Lighter gray for dark mode
  orange: isDarkMode ? '#fb923c' : '#f97316',  // Orange for 30-50% range
});

// Theme creation hook
const useAppTheme = () => {
  const { isDarkMode } = useWeatherTheme();
  const weatherColors = useWeatherColors(isDarkMode);

  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      warning: {
        main: isDarkMode ? '#facc15' : '#FFD700',
      },
      background: {
        default: isDarkMode ? '#0f172a' : '#f8fafc',
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
            maxWidth: 'min(600px, 100vw) !important',
            paddingLeft: '16px',
            paddingRight: '16px',
            margin: '0 auto',
            '@media (min-width: 800px)': {
              maxWidth: 'min(1200px, 100vw) !important',
            }
          },
        },
      },
    },
    // Custom properties for weather colors
    customColors: weatherColors,
  });
};

interface SelectedLocation {
  id: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

// Main app component with theme integration
const AppContent = () => {
  const theme = useAppTheme();
  const { isDarkMode } = useWeatherTheme();
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

  const backgroundGradient = isDarkMode 
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          minHeight: '100vh',
          width: '100vw',
          background: backgroundGradient,
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
};

// App wrapper with theme provider
function App() {
  return (
    <WeatherThemeProvider>
      <AppContent />
    </WeatherThemeProvider>
  );
}

export default App;
