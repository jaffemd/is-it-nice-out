/**
 * Calculate the date range for fetching 24 calendar months of weather data
 * Example: If today is July 13, 2025 → fetch July 12, 2025 back to July 1, 2023
 */
export function getWeatherDateRange(): { startDate: string; endDate: string } {
  const today = new Date();
  
  // Get yesterday (since we don't want today's incomplete data)
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  // Get the current month and year
  const currentMonth = yesterday.getMonth(); // 0-indexed
  const currentYear = yesterday.getFullYear();
  
  // Calculate 24 months back from current month
  // If current month is July (6), 24 months back is July (6) of 2 years ago
  let startMonth = currentMonth - 23; // Go back 23 months from current (24 total months)
  let startYear = currentYear;
  
  // Handle year rollover
  while (startMonth < 0) {
    startMonth += 12;
    startYear -= 1;
  }
  
  // Start date: First day of the month 24 months ago
  const startDate = new Date(startYear, startMonth, 1);
  
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