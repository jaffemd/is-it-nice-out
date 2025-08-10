import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface YearHeaderProps {
  year: string;
}

const YearHeader: React.FC<YearHeaderProps> = ({ year }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Box sx={{ 
      my: 4,
      mx: 'auto',
      maxWidth: 'min(600px, 100vw)',
      px: 2
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 3
      }}>
        <Divider sx={{ 
          flex: 1,
          borderColor: theme.palette.divider,
          borderWidth: '1px'
        }} />
        <Typography 
          variant="h5" 
          component="h2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: '1.5rem',
            textAlign: 'center',
            px: 3,
            py: 1,
            background: isDarkMode 
              ? 'rgba(30, 41, 59, 0.9)'
              : 'rgba(248, 250, 252, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: isDarkMode 
              ? '1px solid rgba(71, 85, 105, 0.4)'
              : '1px solid rgba(226, 232, 240, 0.4)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            minWidth: '120px'
          }}
        >
          {year}
        </Typography>
        <Divider sx={{ 
          flex: 1,
          borderColor: theme.palette.divider,
          borderWidth: '1px'
        }} />
      </Box>
    </Box>
  );
};

export default YearHeader;