# Weather App Update Plan

## Overview
Transform the static weather app into a dynamic application that fetches real weather data from APIs and allows users to view weather ratings for different locations.

---

## Phase 1: Dynamic Weather Data Integration

### 1. Weather API Research & Selection

#### Selected Weather API: Open-Meteo ✅

**Open-Meteo**
- **Pros:** 
  - Completely free with no API key required
  - Historical data from 1940 onwards with hourly resolution
  - Global coverage
  - No rate limits for reasonable use
  - Returns temperature (min/max) and precipitation data
- **Cons:** 
  - Less commercial support
  - Documentation could be more extensive

**Why Selected:** Perfect fit for our needs with generous free tier, no API key requirements, and reliable historical data access.

### 2. API Integration Implementation

#### Files to Modify:
- `src/services/api.ts` - Replace static JSON fetch with weather API calls
- Update TypeScript interfaces to match weather API response structure

#### API Integration Details:
- **Location:** Chicago, IL (Coordinates: 41.8781, -87.6298)
- **Data Required:** Daily max/min temperature, precipitation
- **Date Range:** 13 calendar months back from current date
  - Example: If today is July 13, 2025 → fetch July 1, 2024 to July 12, 2025
- **API Endpoint Example (Open-Meteo):**
  ```
  https://archive-api.open-meteo.com/v1/archive?latitude=41.8781&longitude=-87.6298&start_date=2024-07-01&end_date=2025-07-12&daily=temperature_2m_max,temperature_2m_min,precipitation_sum
  ```

### 3. Weather Rating Algorithm

#### Data Handling Rules:
- **Missing Precipitation:** Treat as 0mm (no precipitation)
- **Missing Temperature:** Treat entire day as missing data (don't rate)
- **No Data Returned:** Error scenario - display error message

#### Temperature-Based Rules:
```typescript
function calculateWeatherRating(
  maxTemp: number | null, 
  minTemp: number | null, 
  precipitation: number | null
): 'good' | 'okay' | 'bad' | null {
  // Handle missing data
  if (maxTemp === null || minTemp === null) return null; // Missing temp = no rating
  const precip = precipitation ?? 0; // Missing precip = 0mm
  
  // Automatic "bad" conditions
  if (maxTemp > 85 || maxTemp < 45) return 'bad';
  
  // Base temperature rating
  let baseRating: 'good' | 'okay';
  if (maxTemp >= 55 && maxTemp <= 82) {
    baseRating = 'good';
  } else if ((maxTemp >= 45 && maxTemp <= 54) || (maxTemp >= 83 && maxTemp <= 85)) {
    baseRating = 'okay';
  } else {
    return 'bad';
  }
  
  // Precipitation adjustments
  if (precip > 10) return 'bad'; // Heavy precipitation
  if (precip > 2) return baseRating === 'good' ? 'okay' : baseRating; // Light precipitation
  if (precip > 0.5 && baseRating === 'okay') return 'okay'; // Very light precipitation on borderline days
  
  return baseRating;
}
```

#### Precipitation Thresholds:
- **Very Light:** 0.1-0.5mm
- **Light:** 0.5-2mm  
- **Heavy:** >10mm
- **Missing Data:** Treated as 0mm

### 4. Data Caching Strategy

#### Selected Caching Solution: React Query / TanStack Query ✅

**React Query / TanStack Query**
- **Pros:**
  - Built-in caching, background updates, and stale-while-revalidate
  - Excellent TypeScript support
  - Handles loading states and error handling
  - Easy to configure TTL (24 hours)
  - Scales well for Phase 2 & 3 (multiple locations)
- **Implementation:** Cache weather data by location key with 24-hour TTL
- **Future-Proof:** Easily handles multiple locations and complex cache invalidation

**Why Selected:** Provides robust caching infrastructure that scales perfectly from single location (Phase 1) to multi-location tabs (Phase 3) with minimal code changes.

---

## Phase 2: User Location Input

### 1. Location Input Implementation

#### UI Changes:
- Replace current calendar view with location input form on initial load
- Add location input field with autocomplete
- Add submit button to fetch and display weather data
- Add "Start Over" button to clear data and return to location input

#### Component Structure:
```
App.tsx
├── LocationInput.tsx (new)
│   ├── LocationAutocomplete.tsx (new)
│   └── SubmitButton.tsx
└── CalendarGrid.tsx (existing - conditional render)
    └── StartOverButton.tsx (new)
```

### 2. Location Autocomplete API Research

#### Top 3 Recommended APIs:

**1. Radar Address Autocomplete (RECOMMENDED)**
- **Pros:**
  - Most generous free tier: 100,000 requests/month
  - $0.50 per 1,000 calls after free tier
  - 100% address coverage in US
  - Fast response times
  - Perfect fit for US-focused requirements
- **Cons:**
  - Primarily US-focused (acceptable per requirements)

**2. PlaceKit**
- **Pros:**
  - 10,000 requests/month free
  - No credit card required for free tier
  - Worldwide coverage
  - Typo-tolerant search powered by Algolia
  - Fast response times
- **Cons:**
  - Lower free tier than Radar

**3. LocationIQ**
- **Pros:**
  - Up to 10,000 calls/day free tier
  - Affordable Google Maps alternative
  - Good documentation
  - Global coverage
- **Cons:**
  - Requires API key registration

**Recommendation:** Radar for optimal US coverage and generous free tier.

### 3. Implementation Details

#### State Management:
- Selected location coordinates
- Weather data for current location
- Loading states for location search and weather fetch
- Error handling for both APIs

#### Workflow:
1. User types location → Autocomplete suggestions appear
2. User selects location → Extract coordinates
3. Fetch weather data using coordinates
4. Display calendar grid with "Start Over" option

---

## Phase 3: Multi-Location Tabs

### 1. Architecture Changes

#### Data Structure:
```typescript
interface LocationTab {
  id: string;
  name: string;
  coordinates: { lat: number; lon: number };
  weatherData: CalendarData;
  lastFetched: Date;
}

interface AppState {
  tabs: LocationTab[];
  activeTabId: string;
}
```

#### Component Updates:
```
App.tsx
├── Header.tsx (new)
│   ├── TabNavigation.tsx (new)
│   └── AddLocationButton.tsx (new)
├── LocationInput.tsx (modified for tab creation)
└── CalendarGrid.tsx (modified to show active tab data)
```

### 2. UI/UX Considerations

#### Header Design:
- Tab-based navigation showing location names
- "+" button to add new location tab
- Close button on each tab (except if only one tab)
- Active tab highlighting

#### Data Management:
- Each tab maintains its own weather data cache
- React Query cache keys by location coordinates
- Lazy loading of weather data (fetch only when tab is viewed)

#### Storage Strategy:
- Session-only storage (no localStorage persistence)
- Weather data cached in React Query during session
- Maximum 5 tabs to prevent performance issues
- Tab configuration cleared on browser refresh/close

---

## Implementation Timeline

### Phase 1 (Estimated: 2-3 days)
1. **Day 1:** API integration and weather rating algorithm
2. **Day 2:** Data caching implementation with React Query
3. **Day 3:** Testing and refinement

### Phase 2 (Estimated: 2-3 days)
1. **Day 1:** Location input UI and autocomplete integration
2. **Day 2:** Workflow implementation and state management
3. **Day 3:** Testing and UX improvements

### Phase 3 (Estimated: 3-4 days)
1. **Day 1-2:** Multi-tab architecture and data structure changes
2. **Day 3:** Header and tab navigation implementation
3. **Day 4:** Testing, performance optimization, and polish

---

## Technical Dependencies

### New Packages to Install:
```json
{
  "@tanstack/react-query": "^5.0.0", // Selected: Data fetching and caching
  "@tanstack/react-query-devtools": "^5.0.0", // Selected: Development tools
  "axios": "^1.7.7" // Already installed, keep for API calls
}
```

### Environment Variables:
```env
# Phase 1: No API keys needed (Open-Meteo is free)
# Phase 2: Location autocomplete
VITE_RADAR_API_KEY=your_radar_api_key
```

---

## Requirements Summary

✅ **Date Range:** 13 calendar months back from current date  
✅ **Location Scope:** US-focused (sufficient for current needs)  
✅ **Data Persistence:** Session-only, no cross-session persistence  
✅ **Performance:** Maximum 5 location tabs  
✅ **Missing Data Handling:** 
- Missing precipitation = 0mm
- Missing temperature = entire day not rated
- No API data = error scenario