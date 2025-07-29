export interface StoredLocation {
  id: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  savedAt: string; // ISO timestamp for potential cleanup/validation
}

export const STORAGE_KEY = 'most-recent-location';

/**
 * Validates that a stored location object has all required properties
 */
function isValidLocationData(data: unknown): data is StoredLocation {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.formattedAddress === 'string' &&
    typeof data.latitude === 'number' &&
    typeof data.longitude === 'number' &&
    typeof data.savedAt === 'string' &&
    !isNaN(data.latitude) &&
    !isNaN(data.longitude) &&
    data.latitude >= -90 &&
    data.latitude <= 90 &&
    data.longitude >= -180 &&
    data.longitude <= 180
  );
}

/**
 * Utility for managing location persistence in localStorage
 */
export const locationStorage = {
  /**
   * Save a location to localStorage
   */
  save: (location: Omit<StoredLocation, 'savedAt'>): void => {
    try {
      const locationWithTimestamp: StoredLocation = {
        ...location,
        savedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locationWithTimestamp));
    } catch (error) {
      // Handle quota exceeded, private browsing, etc.
      console.warn('Failed to save location to localStorage:', error);
      // Continue without persistence - don't break the app
    }
  },

  /**
   * Load a location from localStorage
   */
  load: (): StoredLocation | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return isValidLocationData(parsed) ? parsed : null;
    } catch (error) {
      // Clear corrupted data and continue
      console.warn('Failed to load location from localStorage, clearing corrupted data:', error);
      locationStorage.clear();
      return null;
    }
  },

  /**
   * Clear the stored location
   */
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear location from localStorage:', error);
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: (): boolean => {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};