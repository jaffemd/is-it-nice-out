import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getCalendarData } from '../../services/api';
import MonthView from './MonthView';
import YearHeader from './YearHeader';
import YearSummaryChart from './YearSummaryChart';
import YearlyTotalChart from './YearlyTotalChart';

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
            {sortedYears.map((year) => (
              <YearSummaryChart key={year} year={year} calendarData={calendarData} />
            ))}
          </Box>
          
          {/* Single Legend */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mt: 3,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#22c55e', borderRadius: '2px' }} />
              <Typography variant="caption" sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                70%+
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#eab308', borderRadius: '2px' }} />
              <Typography variant="caption" sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                50-70%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#f97316', borderRadius: '2px' }} />
              <Typography variant="caption" sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                30-50%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#ef4444', borderRadius: '2px' }} />
              <Typography variant="caption" sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                &lt;30%
              </Typography>
            </Box>
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
        <Typography 
          variant="h5" 
          component="h1" 
          sx={{ 
            fontWeight: 400,
            color: '#4a5568',
            fontSize: '1.5rem'
          }}
        >
          Historical Weather Simple Rating Tracker
        </Typography>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            fontWeight: 300,
            color: '#64748b',
            fontSize: '1.125rem',
            mt: 1
          }}
        >
          Data for Chicago, IL
        </Typography>
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