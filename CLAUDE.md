# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript weather tracking application that allows users to log daily weather ratings ("good", "okay", "bad") and view them in a calendar format. The app asks "Was The Weather Nice Enough To Spend Time Outside?" and displays historical weather data grouped by month.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Architecture

### Frontend Structure
- **Single Page Application** with single route:
  - `/` - Calendar view (CalendarGrid component)

### Key Components
- `CalendarGrid.tsx` - Main calendar view that fetches and displays weather data grouped by month
- `MonthView.tsx` - Individual month display component
- `api.ts` - Data service layer for fetching and transforming static weather data

### Data Source
- Uses static JSON file `default-weather-config.json` for weather data
- Data is fetched and transformed client-side into calendar format
- No backend API required

### Data Models
```typescript
interface WeatherEntry {
  date: string;
  rating: 'good' | 'bad' | 'okay';
}
```

### UI Framework
- Material-UI (MUI) for components and theming
- Mobile-first responsive design with max width of 430px
- Custom theme with blue primary color and yellow warning color for "okay" ratings

### State Management
- React hooks for local component state
- No global state management (Redux/Context) currently implemented
- API data fetching with loading/error states

## Deployment

- Configured for Render.com deployment via `render.yaml`
- Static site deployment with build command `npm run build`
- Includes `_redirects` file for client-side routing support

## Data Files

- `default-weather-config.json` - Contains sample weather data for the full year 2025 (appears to be seed/demo data)