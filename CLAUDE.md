# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript historical weather tracking application that displays weather ratings ("good", "okay", "bad") in a calendar format. The app automatically calculates weather ratings based on temperature and weather conditions using real weather data from the Open-Meteo API.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Architecture

### Frontend Structure
- **Single Page Application** with conditional routing and shareable URLs:
  - Initial state: Location input screen (LocationInput component) OR automatic location loading from URL
  - After location selection: Calendar view (CalendarGrid component) with URL parameters
  - **URL-driven persistence**: Location state is managed through URL query parameters (`?city=Chicago&state=IL`)

### Key Components
- `LocationInput.tsx` - Location search with Radar API autocomplete integration
- `CalendarGrid.tsx` - Main calendar view with responsive two-column layout
- `MonthView.tsx` - Individual month display component
- `YearHeader.tsx` - Year section headers in calendar
- `YearSummaryChart.tsx` - Monthly summary charts for each year
- `YearlyTotalChart.tsx` - Aggregated yearly statistics chart
- `api.ts` - Data service layer for fetching and transforming Open-Meteo weather data
- `urlParams.ts` - URL parameter management and dynamic page title updates
- `locationResolver.ts` - Service for resolving city/state to coordinates via Radar API

### Data Source
- **Open-Meteo API** (https://archive-api.open-meteo.com) for historical weather data
- **Radar API** for location autocomplete (requires API key)
- Date range: January 1, 2023 to yesterday (most recent complete day)
- Real-time weather rating calculation based on temperature and weather code algorithms

### Data Models
```typescript
interface WeatherEntry {
  date: string;
  rating: 'good' | 'okay' | 'bad' | null; // null for missing temperature data
  maxTemp?: number;
  minTemp?: number;
  apparentTempMean?: number;
  precipitation?: number;
  snowfall?: number;
  weatherCode?: number;
}
```

### Weather Rating Algorithm
- **Bad**: maxTemp > 87°F, maxTemp < 50°F, apparent temp < 40°F or > 85°F, weather code > 63, freezing drizzle (56-57)
- **Good**: maxTemp 57-82°F with clear/cloudy/fog conditions
- **Okay**: maxTemp 50-57°F or 82-85°F, or good conditions downgraded by slight/moderate rain

### UI Framework
- **Material-UI (MUI)** for components and theming
- **Recharts** for data visualization
- **TanStack Query** for data fetching and caching
- Responsive design: single column mobile, two-column desktop (800px+ breakpoint)
- Custom theme with blue primary color and yellow warning color for "okay" ratings

### State Management
- React hooks for local component state
- TanStack Query for server state management
- **URL-based location persistence**: Location state managed through URL query parameters
- Dynamic page title updates based on selected location

### Dependencies
Key production dependencies:
- `@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers` - UI components
- `@tanstack/react-query` - Data fetching and caching
- `react-router-dom` - Client-side routing
- `recharts` - Data visualization
- `axios` - HTTP client
- `date-fns` - Date utilities

## Environment Configuration

- `.env` file contains Radar API key: `VITE_RADAR_API_KEY`
- Default fallback location: Chicago, IL (41.8781, -87.6298)

## Shareable URLs and Location Persistence

- **URL-Based Persistence**: Location data is stored in URL query parameters (`?city=Chicago&state=IL`) making weather views shareable
- **Dynamic Page Titles**: Page title updates based on location:
  - Default: `"Historical Weather Tracker"`
  - With location: `"[City] Historical Weather"`
- **URL Resolution**: On page load, city/state from URL is resolved to coordinates via Radar API
- **Automatic Navigation**: Users with valid URL parameters skip location input and go directly to weather view
- **Graceful Fallback**: When URL resolution fails (API issues, invalid location), users see location input screen
- **URL Encoding**: Special characters in city/state names are properly URL-encoded and decoded

## Deployment

- Configured for Render.com deployment via `render.yaml`
- Static site deployment with build command `npm run build`
- Includes `_redirects` file for client-side routing support
- Build script: `render-build.sh`

## Important Instructions for Claude Code

**ALWAYS after every code edit**:
1. **Validate code changes**: Run `npm run build` to ensure TypeScript compilation and build succeeds
2. **Update documentation**: Review both CLAUDE.md and README.md to determine if they need updates to reflect new features, architecture changes, or functionality. Update both files when:
   - New features are added (like shareable URLs and URL-based persistence)
   - Architecture or data flow changes
   - New dependencies or utilities are introduced  
   - User experience or interface changes
   - Development or deployment processes change

**Never commit or present code that fails `npm run build`** - always fix TypeScript errors and build issues immediately.