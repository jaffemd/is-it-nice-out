import { getWeatherDateRange, getChicagoCoordinates } from '../utils/dateUtils';

// Updated interfaces to match our requirements
export interface WeatherEntry {
  date: string;
  rating: 'good' | 'okay' | 'bad' | null; // null for missing temperature data
  maxTemp?: number;
  minTemp?: number;
  apparentTempMean?: number;
  precipitation?: number;
  snowfall?: number;
  weatherCode?: number;
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
    apparent_temperature_mean: (number | null)[];
    precipitation_sum: (number | null)[];
    snowfall_sum: (number | null)[];
    weather_code: (number | null)[];
  };
}

/**
 * Weather rating algorithm based on temperature and weather code rules
 */
function calculateWeatherRating(
  maxTemp: number | null, 
  apparentTempMean: number | null, 
  weatherCode: number | null
): 'good' | 'okay' | 'bad' | null {
  // Handle missing data
  if (maxTemp === null) return null; // Missing temp = no rating
  
  // Convert from Celsius to Fahrenheit
  const maxTempF = (maxTemp * 9/5) + 32;
  const apparentTempMeanF = apparentTempMean !== null ? (apparentTempMean * 9/5) + 32 : null;
  
  // Automatic "bad" conditions from apparent temperature
  if (apparentTempMeanF !== null) {
    if (apparentTempMeanF < 40 || apparentTempMeanF > 85) return 'bad';
  }
  
  // Automatic "bad" conditions from max temperature
  if (maxTempF > 87 || maxTempF < 50) return 'bad';
  
  // Base temperature rating
  let baseRating: 'good' | 'okay';
  if (maxTempF >= 57 && maxTempF <= 82) {
    baseRating = 'good';
  } else if ((maxTempF >= 50 && maxTempF <= 57) || (maxTempF >= 82 && maxTempF <= 85)) {
    baseRating = 'okay';
  } else {
    return 'bad';
  }
  
  // Weather code adjustments
  if (weatherCode !== null) {
    // Anything above 63 is automatic bad
    if (weatherCode > 63) return 'bad';
    
    // 56 or 57 (freezing drizzle) is automatic bad
    if (weatherCode === 56 || weatherCode === 57) return 'bad';
    
    // Slight rain (61) or moderate rain (63) knocks rating down one level
    if (weatherCode === 61 || weatherCode === 63) {
      return baseRating === 'good' ? 'okay' : 'bad';
    }
    
    // Non-freezing drizzle (51-55) has no effect on rating
    // Clear, cloudy, or fog (0-3, 45, 48) don't change base rating
  }
  
  return baseRating;
}

/**
 * Fetch weather data from Open-Meteo API for specified coordinates
 */
export const fetchWeatherData = async (coordinates?: { latitude: number; longitude: number }): Promise<CalendarData> => {
  const { startDate, endDate } = getWeatherDateRange();
  const { latitude, longitude } = coordinates || getChicagoCoordinates();
  
  const url = `https://archive-api.open-meteo.com/v1/archive?` +
    `latitude=${latitude}&longitude=${longitude}` +
    `&start_date=${startDate}&end_date=${endDate}` +
    `&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_mean,precipitation_sum,snowfall_sum,weather_code` +
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
      const apparentTempMean = data.daily.apparent_temperature_mean[index];
      const precipitation = data.daily.precipitation_sum[index];
      const snowfall = data.daily.snowfall_sum[index];
      const weatherCode = data.daily.weather_code[index];
      
      const rating = calculateWeatherRating(maxTemp, apparentTempMean, weatherCode);
      
      return {
        date,
        rating,
        maxTemp: maxTemp ?? undefined,
        minTemp: minTemp ?? undefined,
        apparentTempMean: apparentTempMean ?? undefined,
        precipitation: precipitation ?? undefined,
        snowfall: snowfall ?? undefined,
        weatherCode: weatherCode ?? undefined,
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