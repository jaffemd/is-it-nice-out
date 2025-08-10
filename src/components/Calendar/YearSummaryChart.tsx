import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
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
  avgHighTemp: number | null; // Average high temperature in Fahrenheit
}

// Calculate average high temperature for a set of weather entries
const calculateAvgHighTemp = (entries: CalendarData[string]['entries']): number | null => {
  const validTemps = entries
    .map(entry => entry.maxTemp)
    .filter((temp): temp is number => temp !== undefined);
  
  if (validTemps.length === 0) return null;
  
  // Convert to Fahrenheit if needed and calculate average (always display in °F)
  const fahrenheitTemps = validTemps.map(temp => (temp * 9/5) + 32);
  return fahrenheitTemps.reduce((sum, temp) => sum + temp, 0) / fahrenheitTemps.length;
};

// Custom tooltip component
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: {
      shortMonth: string;
      niceDays: number;
      avgHighTemp: number | null;
      totalDays: number;
    };
  }>;
  year?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, year }) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Convert short month to full month name
    const monthNames = {
      'Jan': 'January',
      'Feb': 'February', 
      'Mar': 'March',
      'Apr': 'April',
      'May': 'May',
      'Jun': 'June',
      'Jul': 'July',
      'Aug': 'August',
      'Sep': 'September',
      'Oct': 'October',
      'Nov': 'November',
      'Dec': 'December'
    };
    
    const fullMonthName = monthNames[data.shortMonth as keyof typeof monthNames] || data.shortMonth;
    
    return (
      <Box sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '4px',
        padding: '8px 12px',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 2px 4px -1px rgba(0, 0, 0, 0.3)'
          : '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        fontSize: '0.875rem'
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: theme.palette.text.primary }}>
          {fullMonthName} {year}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
          Nice Days: {data.niceDays}
        </Typography>
        {data.avgHighTemp !== null && data.avgHighTemp > 0 && (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
            Avg High: {data.avgHighTemp}°F
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};

const YearSummaryChart: React.FC<YearSummaryChartProps> = ({ year, calendarData }) => {
  const theme = useTheme();
  
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
    
    // Calculate average high temperature for this month
    const avgHighTemp = calculateAvgHighTemp(entries);
    
    monthSummaries.push({
      month: monthName,
      shortMonth,
      niceDays,
      totalDays,
      avgHighTemp
    });
  });
  
  // Don't render if no data
  if (monthSummaries.length === 0) {
    return null;
  }
  
  // Calculate max for scaling
  const maxNiceDays = Math.max(...monthSummaries.map(m => m.niceDays));
  
  // Transform data for grouped bars
  const chartData = monthSummaries.map(summary => ({
    shortMonth: summary.shortMonth,
    niceDays: summary.niceDays,
    avgHighTemp: summary.avgHighTemp ? Math.round(summary.avgHighTemp) : null,
    totalDays: summary.totalDays, // Keep for color calculation
  }));
  
  // Calculate dynamic temperature range
  const validTemps = chartData
    .map(d => d.avgHighTemp)
    .filter((temp): temp is number => temp !== null);
  
  let tempDomain: [number, number];
  if (validTemps.length === 0) {
    // No temperature data for this year, use default range
    tempDomain = [0, 100];
  } else {
    const tempMin = Math.min(...validTemps);
    const tempMax = Math.max(...validTemps);
    tempDomain = [Math.max(0, tempMin - 5), Math.min(120, tempMax + 5)];
  }
  
  // Color function based on nice days ratio
  const getBarColor = (niceDays: number, totalDays: number) => {
    if (totalDays === 0) return theme.palette.mode === 'dark' ? '#374151' : '#e2e8f0'; // Gray for no data
    const ratio = niceDays / totalDays;
    if (ratio >= 0.7) return theme.customColors.good;  // Green for 70%+ nice days
    if (ratio >= 0.5) return theme.customColors.okay;  // Yellow for 50-70% nice days
    if (ratio >= 0.3) return theme.customColors.orange; // Orange for 30-50% nice days
    return theme.customColors.bad;   // Red for <30% nice days
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
          color: theme.palette.text.secondary,
          fontSize: '0.875rem',
          fontWeight: 500
        }}
      >
        {year}
      </Typography>
      
      <Box sx={{
        height: 100,
        background: theme.palette.mode === 'dark' 
          ? 'rgba(30, 41, 59, 0.6)'
          : 'rgba(248, 250, 252, 0.6)',
        borderRadius: '8px',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(71, 85, 105, 0.3)'
          : '1px solid rgba(226, 232, 240, 0.3)',
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
          <ComposedChart 
            data={chartData} 
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            tabIndex={-1}
            style={{ outline: 'none' }}
          >
            <XAxis 
              dataKey="shortMonth" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              interval={0}
              height={20}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              domain={[0, Math.max(maxNiceDays, 10)]} 
              hide
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={tempDomain} 
              hide
            />
            <Tooltip 
              content={<CustomTooltip year={year} />} 
              cursor={{ 
                fill: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)' 
              }} 
            />
            
            {/* Nice Days Bar */}
            <Bar yAxisId="left" dataKey="niceDays" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.niceDays, entry.totalDays)}
                />
              ))}
            </Bar>
            
            {/* Average High Temperature Line */}
            <Line 
              yAxisId="right"
              type="monotone"
              dataKey="avgHighTemp" 
              stroke={theme.palette.mode === 'dark' ? '#ffffff' : '#6b7280'}
              strokeWidth={2}
              dot={{ r: 3, fill: theme.palette.mode === 'dark' ? '#ffffff' : '#6b7280' }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
      
    </Box>
  );
};

export default YearSummaryChart;