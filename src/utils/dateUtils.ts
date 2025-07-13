/**
 * Calculate the date range for fetching weather data from January 1, 2023 to yesterday
 */
export function getWeatherDateRange(): { startDate: string; endDate: string } {
  const today = new Date();
  
  // Get yesterday (since we don't want today's incomplete data)
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  // Start date: Always January 1, 2023
  const startDate = new Date(2023, 0, 1); // January 1, 2023
  
  // End date: Yesterday (most recent complete day)
  const endDate = yesterday;
  
  // Format as YYYY-MM-DD for the API
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

/**
 * Get coordinates for Chicago, IL (default location for Phase 1)
 */
export function getChicagoCoordinates(): { latitude: number; longitude: number } {
  return {
    latitude: 41.8781,
    longitude: -87.6298
  };
}