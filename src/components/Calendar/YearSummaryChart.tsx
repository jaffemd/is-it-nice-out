import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import type { CalendarData } from '../../services/api';

interface YearSummaryChartProps {
  year: string;
  calendarData: CalendarData;
}

interface MonthSummary {
  month: string;
  shortMonth: string;
  niceDays: number;
  totalDays: number;
}

// Custom tooltip component
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: MonthSummary;
  }>;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <Box sx={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        padding: '4px 8px',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        fontSize: '1rem',
        fontWeight: 600
      }}>
        {data.niceDays}
      </Box>
    );
  }
  return null;
};

const YearSummaryChart: React.FC<YearSummaryChartProps> = ({ year, calendarData }) => {
  // Calculate nice days per month for the given year
  const monthSummaries: MonthSummary[] = [];
  
  // Get all months for this year from the calendar data, sorted chronologically
  const yearMonths = Object.keys(calendarData)
    .filter(monthKey => monthKey.startsWith(year))
    .sort(); // Sort chronologically (oldest to newest for the chart)
  
  yearMonths.forEach(monthKey => {
    const monthData = calendarData[monthKey];
    const entries = monthData.entries;
    
    // Count nice days (good + okay ratings)
    const niceDays = entries.filter(entry => 
      entry.rating === 'good'
    ).length;
    
    const totalDays = entries.filter(entry => entry.rating !== null).length;
    
    // Extract short month name (first 3 letters)
    const monthName = monthData.month.split(' ')[0]; // "January 2025" -> "January"
    const shortMonth = monthName.substring(0, 3); // "January" -> "Jan"
    
    monthSummaries.push({
      month: monthName,
      shortMonth,
      niceDays,
      totalDays
    });
  });
  
  // Don't render if no data
  if (monthSummaries.length === 0) {
    return null;
  }
  
  // Calculate max for scaling
  const maxNiceDays = Math.max(...monthSummaries.map(m => m.niceDays));
  
  // Color function based on nice days ratio
  const getBarColor = (niceDays: number, totalDays: number) => {
    if (totalDays === 0) return '#e2e8f0'; // Light gray for no data
    const ratio = niceDays / totalDays;
    if (ratio >= 0.7) return '#22c55e'; // Green for 70%+ nice days
    if (ratio >= 0.5) return '#eab308'; // Yellow for 50-70% nice days
    if (ratio >= 0.3) return '#f97316'; // Orange for 30-50% nice days
    return '#ef4444'; // Red for <30% nice days
  };
  
  return (
    <Box sx={{ 
      width: '100%'
    }}>
      <Typography 
        variant="body2" 
        sx={{ 
          textAlign: 'center', 
          mb: 1, 
          color: '#64748b',
          fontSize: '0.875rem',
          fontWeight: 500
        }}
      >
        {year}
      </Typography>
      
      <Box sx={{
        height: 100,
        background: 'rgba(248, 250, 252, 0.6)',
        borderRadius: '8px',
        border: '1px solid rgba(226, 232, 240, 0.3)',
        p: 1,
        '& .recharts-bar-rectangle': {
          outline: 'none !important'
        },
        '& .recharts-bar-rectangle:focus': {
          outline: 'none !important'
        },
        '& svg': {
          outline: 'none !important'
        },
        '& svg:focus': {
          outline: 'none !important'
        },
        '& *': {
          '&:focus': {
            outline: 'none !important'
          }
        }
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={monthSummaries} 
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            tabIndex={-1}
            style={{ outline: 'none' }}
          >
            <XAxis 
              dataKey="shortMonth" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval={0}
              height={20}
            />
            <YAxis 
              hide 
              domain={[0, Math.max(maxNiceDays, 10)]} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
            <Bar dataKey="niceDays" radius={[2, 2, 0, 0]}>
              {monthSummaries.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.niceDays, entry.totalDays)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
    </Box>
  );
};

export default YearSummaryChart;