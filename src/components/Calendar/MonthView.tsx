import React, { useState } from 'react';
import { Box, Typography, styled, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface MonthViewProps {
  monthKey: string;
  month: string;
  entries: Array<{
    date: string;
    rating: 'good' | 'okay' | 'bad' | null;
    maxTemp?: number;
    minTemp?: number;
    apparentTempMean?: number;
    precipitation?: number;
    snowfall?: number;
    weatherCode?: number;
  }>;
}

const CalendarGrid = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '3px',
  maxWidth: 'min(320px, 85vw)',
  margin: '0 auto',
  justifyItems: 'center',
  placeItems: 'center',
  gridAutoFlow: 'row',
}));

const DayHeaders = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '3px',
  maxWidth: 'min(320px, 85vw)',
  margin: '0 auto 8px auto',
  justifyItems: 'center',
  placeItems: 'center',
}));

const DayHeader = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textAlign: 'center',
  width: '35px',
}));

const DaySquare = styled(Box)<{ rating?: 'good' | 'okay' | 'bad' | null; isEmpty?: boolean }>(({ theme, rating, isEmpty }) => {
  // If it's an empty buffer square, return minimal transparent styling
  if (isEmpty) {
    return {
      width: '35px',
      height: '35px',
      maxWidth: '35px',
      maxHeight: '35px',
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      backdropFilter: 'none',
    };
  }

  // Get theme colors
  const isDarkMode = theme.palette.mode === 'dark';
  const goodColor = theme.customColors.good;
  const okayColor = theme.customColors.okay;
  const badColor = theme.customColors.bad;
  
  let backgroundColor = isDarkMode 
    ? 'rgba(51, 65, 85, 0.4)' 
    : 'rgba(255, 255, 255, 0.4)';
  let borderColor = isDarkMode 
    ? 'rgba(51, 65, 85, 0.3)' 
    : 'rgba(255, 255, 255, 0.3)';
  
  switch (rating) {
    case 'good':
      backgroundColor = `linear-gradient(135deg, ${goodColor}dd 0%, ${goodColor} 100%)`;
      borderColor = `${goodColor}4d`;
      break;
    case 'okay':
      backgroundColor = `linear-gradient(135deg, ${okayColor}dd 0%, ${okayColor} 100%)`;
      borderColor = `${okayColor}4d`;
      break;
    case 'bad':
      backgroundColor = `linear-gradient(135deg, ${badColor}dd 0%, ${badColor} 100%)`;
      borderColor = `${badColor}4d`;
      break;
    case null:
      backgroundColor = isDarkMode 
        ? 'rgba(75, 85, 99, 0.4)' 
        : 'rgba(156, 163, 175, 0.4)';
      borderColor = isDarkMode 
        ? 'rgba(75, 85, 99, 0.3)' 
        : 'rgba(156, 163, 175, 0.3)';
      break;
    default:
      backgroundColor = isDarkMode 
        ? 'rgba(71, 85, 105, 0.6)' 
        : 'rgba(148, 163, 184, 0.6)';
      borderColor = isDarkMode 
        ? 'rgba(71, 85, 105, 0.4)' 
        : 'rgba(148, 163, 184, 0.4)';
  }

  return {
    width: '35px',
    height: '35px',
    maxWidth: '35px',
    maxHeight: '35px',
    background: backgroundColor,
    borderRadius: '10px',
    border: `1px solid ${borderColor}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: rating 
      ? theme.palette.common.white 
      : theme.palette.text.secondary,
    cursor: 'default',
    boxShadow: rating 
      ? (isDarkMode 
          ? '0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)' 
          : '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)')
      : (isDarkMode 
          ? '0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
          : '0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.3)'),
    backdropFilter: 'blur(8px)',
    transition: 'transform 0.1s ease-in-out',
    '&:hover': {
      transform: rating ? 'scale(1.05)' : 'none',
    },
  };
});

const MonthView: React.FC<MonthViewProps> = ({ monthKey, month, entries }) => {
  const theme = useTheme();
  const [clickedDay, setClickedDay] = useState<string | null>(null);
  
  // Create a map of entries by date for quick lookup
  const entriesMap = new Map(entries.map(entry => [entry.date, entry]));
  
  // Helper function to convert weather code to description
  const getWeatherDescription = (weatherCode: number): string => {
    const weatherDescriptions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    
    return weatherDescriptions[weatherCode] || `Weather code ${weatherCode}`;
  };
  
  // Helper function to format tooltip content
  const formatTooltipContent = (entry: MonthViewProps['entries'][0] | undefined, dateString: string) => {
    if (!entry) return null;
    
    const lines = [];
    lines.push(`${dateString}: ${entry.rating || 'No data'}`);
    
    // Max temp F
    if (entry.maxTemp !== undefined) {
      const maxTempF = Math.round((entry.maxTemp * 9/5) + 32);
      lines.push(`Max temp: ${maxTempF}°F`);
    }
    
    // Min temp F
    if (entry.minTemp !== undefined) {
      const minTempF = Math.round((entry.minTemp * 9/5) + 32);
      lines.push(`Min temp: ${minTempF}°F`);
    }
    
    // Average apparent temp F
    if (entry.apparentTempMean !== undefined) {
      const apparentTempF = Math.round((entry.apparentTempMean * 9/5) + 32);
      lines.push(`Avg apparent temp: ${apparentTempF}°F`);
    }
    
    // Precipitation in inches
    if (entry.precipitation !== undefined && entry.precipitation > 0) {
      const precipInches = (entry.precipitation / 25.4).toFixed(2);
      lines.push(`Precipitation: ${precipInches}"`);
    }
    
    // Snowfall in inches (only if > 0)
    if (entry.snowfall !== undefined && entry.snowfall > 0) {
      const snowfallInches = (entry.snowfall / 25.4).toFixed(2);
      lines.push(`Snowfall: ${snowfallInches}"`);
    }
    
    // Weather condition
    if (entry.weatherCode !== undefined) {
      const weatherDescription = getWeatherDescription(entry.weatherCode);
      lines.push(`Condition: ${weatherDescription}`);
    }
    
    return (
      <Box>
        {lines.map((line, index) => (
          <Typography key={index} variant="body2" sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
            {line}
          </Typography>
        ))}
      </Box>
    );
  };
  
  // Get the first day of the month and number of days
  const [year, monthNum] = monthKey.split('-');
  const firstDay = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  const lastDay = new Date(parseInt(year), parseInt(monthNum), 0);
  const startOfWeek = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();
  
  // Check if this is the current month and find the most recent filled date
  // const currentMonth = new Date().getMonth() + 1;
  // const currentYear = new Date().getFullYear();
  // const isCurrentMonth = parseInt(year) === currentYear && parseInt(monthNum) === currentMonth;
  
  // let mostRecentFilledDate = null; // Not currently used
  // if (isCurrentMonth) {
  //   // Find the most recent date with data
  //   for (let day = daysInMonth; day >= 1; day--) {
  //     const dateString = `${year}-${monthNum.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  //     if (entriesMap.has(dateString)) {
  //       mostRecentFilledDate = day;
  //       break;
  //     }
  //   }
  // }
  
  // Calculate weather summary counts
  const weatherCounts = { good: 0, okay: 0, bad: 0 };
  entries.forEach(entry => {
    if (entry.rating !== null && entry.rating in weatherCounts) {
      weatherCounts[entry.rating as keyof typeof weatherCounts]++;
    }
  });
  
  // Create array of all calendar squares
  const calendarSquares = [];
  
  // Add empty buffer squares for days before the month starts
  for (let i = 0; i < startOfWeek; i++) {
    calendarSquares.push(
      <DaySquare key={`empty-${i}`} isEmpty={true} />
    );
  }
  
  // Add squares for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${monthNum.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayEntry = entriesMap.get(dateString);
    const rating = dayEntry?.rating;
    // Use browser timezone for date comparisons
    const today = new Date();
    const todayDateString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    const isFuture = dateString > todayDateString;
    
    const showDateLabel = !isFuture || dayEntry; // Show date if it's not future OR if it has data
    const tooltipContent = formatTooltipContent(dayEntry, dateString);
    
    calendarSquares.push(
      <Tooltip 
        key={day}
        title={tooltipContent || dateString}
        arrow
        placement="top"
        open={clickedDay === dateString ? true : undefined}
        onClose={() => setClickedDay(null)}
        disableHoverListener={false}
        disableFocusListener={false}
        disableTouchListener={false}
        enterTouchDelay={0}
        leaveTouchDelay={3000}
      >
        <DaySquare 
          rating={rating}
          sx={{
            cursor: dayEntry ? 'pointer' : 'default',
            touchAction: 'manipulation', // Improve touch responsiveness
          }}
          onClick={() => {
            if (dayEntry) {
              setClickedDay(clickedDay === dateString ? null : dateString);
            }
          }}
          onTouchStart={() => {
            // Handle touch start for mobile
            if (dayEntry) {
              setClickedDay(clickedDay === dateString ? null : dateString);
            }
          }}
        >
          {showDateLabel ? day : ''}
        </DaySquare>
      </Tooltip>
    );
  }

  return (
    <Box sx={{
      background: theme.palette.mode === 'dark' 
        ? 'rgba(30, 41, 59, 0.8)' 
        : 'rgba(248, 250, 252, 0.8)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      p: 3,
      mb: 3,
      boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
        : '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${theme.palette.divider}`,
      maxWidth: '400px',
      mx: 'auto',
    }}>
      <Typography 
        variant="h6" 
        component="h2" 
        gutterBottom 
        textAlign="center"
        sx={{ 
          mb: 2, 
          fontWeight: 500,
          color: theme.palette.text.secondary,
          fontSize: '1.125rem'
        }}
      >
        {month}
      </Typography>
      
      {/* Weather Summary Row */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 3, 
        mb: 3,
        fontSize: '0.875rem',
        color: theme.palette.text.secondary
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
          }} />
          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Good: {weatherCounts.good}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
          }} />
          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Okay: {weatherCounts.okay}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
          }} />
          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Bad: {weatherCounts.bad}
          </Typography>
        </Box>
      </Box>
      
      <DayHeaders>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <DayHeader key={index}>{day}</DayHeader>
        ))}
      </DayHeaders>
      
      <CalendarGrid>
        {calendarSquares}
      </CalendarGrid>
    </Box>
  );
};

export default MonthView;