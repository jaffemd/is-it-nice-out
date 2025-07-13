import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getCalendarData } from '../../services/api';
import MonthView from './MonthView';

const CalendarGrid: React.FC = () => {
  const { 
    data: calendarData = {}, 
    isLoading: loading, 
    error,
    isError 
  } = useQuery({
    queryKey: ['weatherData', 'chicago'],
    queryFn: getCalendarData,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Failed to load weather data'}
        </Alert>
      </Box>
    );
  }

  // Sort months chronologically (newest first)
  const sortedMonths = Object.keys(calendarData)
    .sort((a, b) => new Date(b + '-01').getTime() - new Date(a + '-01').getTime());

  return (
    <Box sx={{ p: 0 }}>
      {/* App Title */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4,
        pt: 2
      }}>
        <Typography 
          variant="h5" 
          component="h1" 
          sx={{ 
            fontWeight: 400,
            color: '#4a5568',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Was The Weather Nice Enough To Spend Time Outside?
        </Typography>
      </Box>
      
      {sortedMonths.length === 0 ? (
        <Box sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          p: 4,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <Typography variant="body1" color="text.secondary">
            No weather data available yet.
          </Typography>
        </Box>
      ) : (
        sortedMonths.map((monthKey) => (
          <MonthView 
            key={monthKey}
            monthKey={monthKey}
            month={calendarData[monthKey].month}
            entries={calendarData[monthKey].entries}
          />
        ))
      )}
    </Box>
  );
};

export default CalendarGrid;