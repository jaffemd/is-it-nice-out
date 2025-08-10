import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7, SettingsBrightness } from '@mui/icons-material';
import { useWeatherTheme, type ThemeMode } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { themeMode, setThemeMode } = useWeatherTheme();
  
  const handleToggle = () => {
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setThemeMode(nextMode);
  };
  
  const getIcon = () => {
    switch (themeMode) {
      case 'light': 
        return <Brightness7 />;
      case 'dark': 
        return <Brightness4 />;
      case 'system': 
        return <SettingsBrightness />;
      default:
        return <SettingsBrightness />;
    }
  };
  
  const getTooltip = () => {
    switch (themeMode) {
      case 'light': 
        return 'Switch to Dark Mode';
      case 'dark': 
        return 'Switch to System Mode';
      case 'system': 
        return 'Switch to Light Mode';
      default:
        return 'Switch Theme Mode';
    }
  };
  
  return (
    <Tooltip title={getTooltip()}>
      <IconButton 
        onClick={handleToggle} 
        color="inherit"
        sx={{
          ml: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;