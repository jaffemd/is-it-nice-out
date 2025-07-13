export interface WeatherEntry {
  date: string;
  rating: 'good' | 'bad' | 'okay';
}

export interface MonthData {
  month: string;
  entries: WeatherEntry[];
}

export interface CalendarData {
  [monthKey: string]: MonthData;
}

// Get calendar data (grouped by month)
export const getCalendarData = async (): Promise<CalendarData> => {
  // Fetch from static JSON file
  const response = await fetch('/default-weather-config.json');
  const weatherEntries: WeatherEntry[] = await response.json();
  
  // Group entries by month
  const groupedData: CalendarData = {};
  
  weatherEntries.forEach(entry => {
    // Parse date more reliably - the JSON has YYYY-MM-DD format
    const [year, month, day] = entry.date.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    
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
};