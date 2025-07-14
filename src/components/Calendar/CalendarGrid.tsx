import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getCalendarData } from '../../services/api';
import MonthView from './MonthView';
import YearHeader from './YearHeader';
import YearSummaryChart from './YearSummaryChart';
import YearlyTotalChart from './YearlyTotalChart';

const CalendarGrid: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  // Summary Tab Content
  const renderSummaryTab = () => (
    <>
      {/* Year Summary Charts */}
      {sortedMonths.length > 0 && (
        <Box sx={{ mb: 4, px: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 2, 
            maxWidth: 'min(560px, 90vw)',
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

  // Calendar View Tab Content
  const renderCalendarTab = () => (
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
      
      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&:focus': {
                outline: 'none',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: 'primary.main',
                  borderRadius: '1px 1px 0 0',
                }
              },
              position: 'relative'
            }
          }}
        >
          <Tab label="Summary" />
          <Tab label="Calendar View" />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      {tabValue === 0 && renderSummaryTab()}
      {tabValue === 1 && renderCalendarTab()}
    </Box>
  );
};

export default CalendarGrid;