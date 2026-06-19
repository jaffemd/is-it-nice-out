import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { CalendarData } from '../../services/api';

interface YearlyTotalChartProps {
  calendarData: CalendarData;
}

const YearlyTotalChart: React.FC<YearlyTotalChartProps> = ({ calendarData }) => {
  const theme = useTheme();

  const yearData: { [year: string]: { niceDays: number; totalDays: number } } = {};

  Object.keys(calendarData).forEach(monthKey => {
    const year = monthKey.split('-')[0];
    const monthData = calendarData[monthKey];
    const entries = monthData.entries;

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

  const yearSummaries = Object.keys(yearData)
    .sort((a, b) => b.localeCompare(a))
    .map(year => ({
      year,
      niceDays: yearData[year].niceDays,
      totalDays: yearData[year].totalDays
    }));

  if (yearSummaries.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
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
        Total Nice Days
      </Typography>
      <Box sx={{
        background: theme.palette.background.paper,
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 2px 4px rgba(0, 0, 0, 0.2)'
          : '0 2px 4px rgba(0, 0, 0, 0.04)',
        px: 3,
        py: 1.5,
        minWidth: '300px',
        maxWidth: '400px',
        mx: 'auto',
      }}>
        {yearSummaries.map((entry, index) => (
          <Box
            key={entry.year}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 1,
              px: 1.5,
              borderRadius: '6px',
              backgroundColor: index % 2 === 0
                ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)')
                : 'transparent',
            }}
          >
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '1.25rem',
                fontWeight: 500,
              }}
            >
              {entry.year}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                color: theme.customColors.good,
                fontSize: '1.25rem',
              }}
            >
              {entry.niceDays}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default YearlyTotalChart;
