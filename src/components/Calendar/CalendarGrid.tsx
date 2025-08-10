import React from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { getCalendarData } from '../../services/api';
import MonthView from './MonthView';
import YearHeader from './YearHeader';
import YearSummaryChart from './YearSummaryChart';
import YearlyTotalChart from './YearlyTotalChart';
import ThemeToggle from '../ThemeToggle';

interface CalendarGridProps {
  onStartOver?: () => void;
  locationName?: string;
  coordinates?: { latitude: number; longitude: number };
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ onStartOver, locationName, coordinates }) => {
  const theme = useTheme();
  const { 
    data: calendarData = {}, 
    isLoading: loading, 
    error,
    isError 
  } = useQuery({
    queryKey: ['weatherData', coordinates?.latitude, coordinates?.longitude],
    queryFn: () => getCalendarData(coordinates),
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });

  if (loading) {
    return (
      <Box sx={{ p: 0 }}>
        {/* App Title */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 3,
          pt: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 400,
                color: theme.palette.text.primary,
                fontSize: '1.5rem'
              }}
            >
              Historical Weather Simple Rating Tracker
            </Typography>
            <ThemeToggle />
          </Box>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontWeight: 300,
              color: theme.palette.text.secondary,
              fontSize: '1.125rem',
              mt: 1
            }}
          >
            Data for {locationName || 'Chicago, IL'}
          </Typography>
        </Box>
        
        {/* Loading Spinner */}
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
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

  // Group months by year for year headers
  const monthsByYear: { [year: string]: string[] } = {};
  sortedMonths.forEach(monthKey => {
    const year = monthKey.split('-')[0];
    if (!monthsByYear[year]) {
      monthsByYear[year] = [];
    }
    monthsByYear[year].push(monthKey);
  });

  // Sort years (newest first)
  const sortedYears = Object.keys(monthsByYear)
    .sort((a, b) => parseInt(b) - parseInt(a));

  // Summary Content Component
  const renderSummaryContent = () => (
    <>
      {/* Year Summary Charts */}
      {sortedMonths.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 2, 
            maxWidth: '100%',
            mx: 'auto'
          }}>
            <YearlyTotalChart calendarData={calendarData} />
            
            {/* Chart Legend */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2, 
              mt: 1,
              mb: 2,
              p: 2,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(30, 41, 59, 0.6)' 
                : 'rgba(248, 250, 252, 0.6)',
              borderRadius: '8px',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(71, 85, 105, 0.3)'
                : '1px solid rgba(226, 232, 240, 0.3)',
            }}>
              {/* Chart Type Legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 16, height: 12, bgcolor: theme.customColors.good, borderRadius: '2px' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary, fontWeight: 500 }}>
                    Nice Days
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 2, 
                    bgcolor: theme.palette.primary.main, 
                    borderRadius: '1px',
                    position: 'relative'
                  }}>
                    <Box sx={{
                      width: 4,
                      height: 4,
                      bgcolor: theme.palette.primary.main,
                      borderRadius: '50%',
                      position: 'absolute',
                      top: -1,
                      left: 6
                    }} />
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary, fontWeight: 500, ml: 0.5 }}>
                    Avg High Temp
                  </Typography>
                </Box>
              </Box>
              
              {/* Nice Days Color Scale */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: theme.customColors.good, borderRadius: '2px' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                    70%+
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: theme.customColors.okay, borderRadius: '2px' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                    50-70%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: theme.customColors.orange, borderRadius: '2px' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                    30-50%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: theme.customColors.bad, borderRadius: '2px' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                    &lt;30%
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {sortedYears.map((year) => (
              <YearSummaryChart key={year} year={year} calendarData={calendarData} />
            ))}
          </Box>
        </Box>
      )}
      
      {sortedMonths.length === 0 && (
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
      )}
    </>
  );

  // Calendar Content Component
  const renderCalendarContent = () => (
    <>
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
        sortedYears.map((year) => (
          <React.Fragment key={year}>
            <YearHeader year={year} />
            {monthsByYear[year].map((monthKey) => (
              <MonthView 
                key={monthKey}
                monthKey={monthKey}
                month={calendarData[monthKey].month}
                entries={calendarData[monthKey].entries}
              />
            ))}
          </React.Fragment>
        ))
      )}
    </>
  );

  return (
    <Box sx={{ p: 0 }}>
      {/* App Title */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 3,
        pt: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 400,
              color: theme.palette.text.primary,
              fontSize: '1.5rem'
            }}
          >
            Historical Weather Simple Rating Tracker
          </Typography>
          <ThemeToggle />
        </Box>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            fontWeight: 300,
            color: theme.palette.text.secondary,
            fontSize: '1.125rem',
            mt: 1
          }}
        >
          Data for {locationName || 'Chicago, IL'}
        </Typography>
        
        {onStartOver && (
          <Button
            variant="outlined"
            onClick={onStartOver}
            sx={{
              mt: 2,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '0.875rem',
            }}
          >
            Start Over
          </Button>
        )}
      </Box>
      
      {/* Responsive Layout */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '600px',
        mx: 'auto',
        gap: 0,
        height: 'auto',
        '@media (min-width: 800px)': {
          flexDirection: 'row',
          maxWidth: '1200px',
          gap: 3,
          height: 'calc(100vh - 200px)',
        }
      }}>
        
        {/* Summary Column */}
        <Box sx={{
          flex: 'none',
          maxWidth: '600px',
          mx: 'auto',
          overflow: 'visible',
          pr: 0,
          mb: 4,
          '@media (min-width: 800px)': {
            flex: 1,
            maxWidth: '50%',
            mx: 0,
            overflow: 'auto',
            pr: 2,
            mb: 0,
          }
        }}>
          {renderSummaryContent()}
        </Box>
        
        {/* Calendar Column */}
        <Box sx={{
          flex: 'none',
          maxWidth: '600px',
          mx: 'auto',
          overflow: 'visible',
          pl: 0,
          '@media (min-width: 800px)': {
            flex: 1,
            maxWidth: '50%',
            mx: 0,
            overflow: 'auto',
            pl: 2,
          }
        }}>
          {renderCalendarContent()}
        </Box>
        
      </Box>
    </Box>
  );
};

export default CalendarGrid;