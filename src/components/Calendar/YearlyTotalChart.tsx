import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { CalendarData } from '../../services/api';

interface YearlyTotalChartProps {
  calendarData: CalendarData;
}

interface YearSummary {
  year: string;
  niceDays: number;
  totalDays: number;
}

const YearlyTotalChart: React.FC<YearlyTotalChartProps> = ({ calendarData }) => {
  const theme = useTheme();
  
  // Calculate nice days per year
  const yearSummaries: YearSummary[] = [];
  
  // Group data by year
  const yearData: { [year: string]: { niceDays: number; totalDays: number } } = {};
  
  Object.keys(calendarData).forEach(monthKey => {
    const year = monthKey.split('-')[0];
    const monthData = calendarData[monthKey];
    const entries = monthData.entries;
    
    // Count nice days (good + okay ratings)
    const niceDays = entries.filter(entry => 
      entry.rating === 'good'
    ).length;
    
    const totalDays = entries.filter(entry => entry.rating !== null).length;
    
    if (!yearData[year]) {
      yearData[year] = { niceDays: 0, totalDays: 0 };
    }
    
    yearData[year].niceDays += niceDays;
    yearData[year].totalDays += totalDays;
  });
  
  // Convert to array and sort chronologically (oldest to newest for the chart)
  Object.keys(yearData)
    .sort()
    .forEach(year => {
      yearSummaries.push({
        year,
        niceDays: yearData[year].niceDays,
        totalDays: yearData[year].totalDays
      });
    });
  
  // Don't render if no data
  if (yearSummaries.length === 0) {
    return null;
  }
  
  return (
    <Box sx={{ 
      width: '100%'
    }}>
      <Typography 
        variant="body2" 
        sx={{ 
          textAlign: 'center', 
          mb: 2, 
          color: theme.palette.text.secondary,
          fontSize: '1rem',
          fontWeight: 500
        }}
      >
        Total Nice Days Per Year
      </Typography>
      
      <Box sx={{
        display: 'flex',
        gap: 1.5,
        justifyContent: 'center'
      }}>
        {yearSummaries.map((yearData) => (
          <Box 
            key={yearData.year}
            sx={{
              background: theme.palette.background.paper,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 2px 4px rgba(0, 0, 0, 0.2)'
                : '0 2px 4px rgba(0, 0, 0, 0.04)',
              p: 3,
              textAlign: 'center',
              flex: 1,
              maxWidth: '200px',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 8px rgba(0, 0, 0, 0.3)'
                  : '0 4px 8px rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            <Typography 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 1
              }}
            >
              {yearData.year}
            </Typography>
            <Typography 
              sx={{ 
                fontWeight: 700,
                color: theme.customColors.good,
                fontSize: '2rem',
                lineHeight: 1
              }}
            >
              {yearData.niceDays}
            </Typography>
            <Typography 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                fontWeight: 500,
                mt: 0.5
              }}
            >
              nice days
            </Typography>
            {yearData.year === '2025' && (
              <Typography 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  mt: 0.25
                }}
              >
                (so far)
              </Typography>
            )}
          </Box>
        ))}
      </Box>
      
    </Box>
  );
};

export default YearlyTotalChart;