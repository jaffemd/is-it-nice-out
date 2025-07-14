import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';

interface LocationSuggestion {
  id: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

interface LocationInputProps {
  onLocationSelect: (location: LocationSuggestion) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCallCount, setDisplayCallCount] = useState(0); // For UI display only
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  const debounceTimeoutRef = useRef<number | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);
  const apiCallCountRef = useRef(0); // Stable ref for actual count
  
  const DEBOUNCE_DELAY = 750; // Generous debounce delay
  const MIN_QUERY_LENGTH = 3; // Minimum characters to start searching
  const MAX_API_CALLS = 3; // Maximum API calls per session
  
  // Debounced search effect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current);
    }
    
    if (query.length >= MIN_QUERY_LENGTH && !isRateLimited) {
      debounceTimeoutRef.current = window.setTimeout(async () => {
        // Check API call limit using ref
        if (apiCallCountRef.current >= MAX_API_CALLS) {
          setIsRateLimited(true);
          setError('Too many search requests. Please refresh the page to continue.');
          return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        try {
          setIsLoading(true);
          setError(null);
          
          const apiKey = import.meta.env.VITE_RADAR_API_KEY;
          if (!apiKey || apiKey === 'your_radar_api_key_here') {
            throw new Error('Radar API key not configured. Please add your API key to the .env file.');
          }
          
          // Increment API call counter using ref
          apiCallCountRef.current += 1;
          setDisplayCallCount(apiCallCountRef.current);
          
          const response = await fetch(
            `https://api.radar.io/v1/search/autocomplete?query=${encodeURIComponent(query)}&country=US&limit=5`,
            {
              headers: {
                'Authorization': apiKey,
              },
              signal: abortControllerRef.current.signal,
            }
          );
          
          if (!response.ok) {
            throw new Error(`Radar API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          if (data.addresses && Array.isArray(data.addresses)) {
            const formattedSuggestions: LocationSuggestion[] = data.addresses.map((address: any) => ({
              id: address.geometry?.coordinates ? 
                `${address.geometry.coordinates[1]},${address.geometry.coordinates[0]}` : 
                Math.random().toString(),
              formattedAddress: address.formattedAddress || address.addressLabel || 'Unknown Address',
              latitude: address.geometry?.coordinates?.[1] || 0,
              longitude: address.geometry?.coordinates?.[0] || 0,
              city: address.city,
              state: address.state,
            }));
            
            setSuggestions(formattedSuggestions);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            // Request was cancelled, ignore
            return;
          }
          
          console.error('Location search error:', error);
          setError(error instanceof Error ? error.message : 'Failed to search locations');
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, DEBOUNCE_DELAY);
    } else {
      setSuggestions([]);
    }
    
    return () => {
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, isRateLimited]);
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setError(null);
  };
  
  const handleLocationSelect = (location: LocationSuggestion) => {
    setQuery('');
    setSuggestions([]);
    onLocationSelect(location);
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  return (
    <Box sx={{
      maxWidth: '600px',
      mx: 'auto',
      p: 4,
      textAlign: 'center'
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontWeight: 400,
          color: '#4a5568',
          mb: 3
        }}
      >
        Enter Your Location
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          color: '#64748b',
          mb: 4
        }}
      >
        Search for your city to view historical weather ratings
      </Typography>
      
      <Box sx={{ position: 'relative', mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter city, state (e.g., Chicago, IL)"
          value={query}
          onChange={handleInputChange}
          disabled={isRateLimited}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            }
          }}
          InputProps={{
            endAdornment: isLoading && (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ),
          }}
        />
        
        {suggestions.length > 0 && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              maxHeight: '300px',
              overflow: 'auto',
              mt: 1,
              borderRadius: '12px',
            }}
          >
            <List disablePadding>
              {suggestions.map((suggestion) => (
                <ListItem key={suggestion.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleLocationSelect(suggestion)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      }
                    }}
                  >
                    <ListItemText
                      primary={suggestion.formattedAddress}
                      secondary={suggestion.city && suggestion.state ? 
                        `${suggestion.city}, ${suggestion.state}` : 
                        undefined
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, borderRadius: '12px' }}
          action={
            isRateLimited && (
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Refresh Page
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}
      
      {query.length > 0 && query.length < MIN_QUERY_LENGTH && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#64748b',
            display: 'block',
            mt: 1
          }}
        >
          Type at least {MIN_QUERY_LENGTH} characters to search
        </Typography>
      )}
      
      {!isRateLimited && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#64748b',
            display: 'block',
            mt: 2
          }}
        >
          Searches remaining: {MAX_API_CALLS - displayCallCount}
        </Typography>
      )}
    </Box>
  );
};

export default LocationInput;