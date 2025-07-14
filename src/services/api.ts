import { getWeatherDateRange, getChicagoCoordinates } from '../utils/dateUtils';

// Updated interfaces to match our requirements
export interface WeatherEntry {
  date: string;
  rating: 'good' | 'okay' | 'bad' | null; // null for missing temperature data
  maxTemp?: number;
  minTemp?: number;
  precipitation?: number;
}

export interface MonthData {
  month: string;
  entries: WeatherEntry[];
}

export interface CalendarData {
  [monthKey: string]: MonthData;
}

// Open-Meteo API response interfaces
interface OpenMeteoResponse {
  daily: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
  };
}

/**
 * Weather rating algorithm based on temperature and precipitation rules
 */
function calculateWeatherRating(
  maxTemp: number | null, 
  minTemp: number | null, 
  precipitation: number | null
): 'good' | 'okay' | 'bad' | null {
  // Handle missing data
  if (maxTemp === null || minTemp === null) return null; // Missing temp = no rating
  const precip = precipitation ?? 0; // Missing precip = 0mm
  
  // Convert from Celsius to Fahrenheit
  const maxTempF = (maxTemp * 9/5) + 32;
  const minTempF = (minTemp * 9/5) + 32;
  
  // Automatic "bad" conditions
  if (maxTempF > 85 || maxTempF < 50 || minTempF < 40) return 'bad';
  
  // Base temperature rating
  let baseRating: 'good' | 'okay';
  if (maxTempF >= 57 && maxTempF <= 82) {
    baseRating = 'good';
  } else if ((maxTempF >= 50 && maxTempF <= 57) || (maxTempF >= 82 && maxTempF <= 85)) {
    baseRating = 'okay';
  } else {
    return 'bad';
  }
  
  // Precipitation adjustments
  if (precip > 10) return 'bad'; // Heavy precipitation
  if (precip > 2) return baseRating === 'good' ? 'okay' : 'bad'; // Light precipitation
  
  return baseRating;
}

/**
 * Fetch weather data from Open-Meteo API for Chicago
 */
export const fetchWeatherData = async (): Promise<CalendarData> => {
  const { startDate, endDate } = getWeatherDateRange();
  const { latitude, longitude } = getChicagoCoordinates();
  
  const url = `https://archive-api.open-meteo.com/v1/archive?` +
    `latitude=${latitude}&longitude=${longitude}` +
    `&start_date=${startDate}&end_date=${endDate}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&temperature_unit=celsius` +
    `&precipitation_unit=mm`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data: OpenMeteoResponse = await response.json();
    
    // Check if we got any data
    if (!data.daily || data.daily.time.length === 0) {
      throw new Error('No weather data returned from API');
    }
    
    // Transform the data into our format
    const weatherEntries: WeatherEntry[] = data.daily.time.map((date, index) => {
      const maxTemp = data.daily.temperature_2m_max[index];
      const minTemp = data.daily.temperature_2m_min[index];
      const precipitation = data.daily.precipitation_sum[index];
      
      const rating = calculateWeatherRating(maxTemp, minTemp, precipitation);
      
      return {
        date,
        rating,
        maxTemp: maxTemp ?? undefined,
        minTemp: minTemp ?? undefined,
        precipitation: precipitation ?? undefined,
      };
    });
    
    // Group entries by month
    const groupedData: CalendarData = {};
    
    weatherEntries.forEach(entry => {
      // Parse date more reliably
      const [year, month] = entry.date.split('-').map(Number);
      const date = new Date(year, month - 1, 1); // Create date for first of month
      
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!groupedData[monthKey]) {
        groupedData[monthKey] = {
          month: monthName,
          entries: []
        };
      }
      
      groupedData[monthKey].entries.push(entry);
    });
    
    return groupedData;
    
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw error;
  }
};

// Keep the existing function name for compatibility
export const getCalendarData = fetchWeatherData;