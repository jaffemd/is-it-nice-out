import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    customColors: {
      good: string;
      okay: string;
      bad: string;
      neutral: string;
      orange: string;
    };
  }

  interface ThemeOptions {
    customColors?: {
      good?: string;
      okay?: string;
      bad?: string;
      neutral?: string;
      orange?: string;
    };
  }
}