interface LocationParams {
  city: string;
  state: string;
}

/**
 * Utility for managing location-related URL parameters and page titles
 */
export const urlParams = {
  /**
   * Set city and state in URL query parameters
   */
  setLocationParams: (city: string, state: string): void => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    
    // URL-encode the values to handle special characters
    urlSearchParams.set('city', encodeURIComponent(city));
    urlSearchParams.set('state', encodeURIComponent(state));
    
    // Use pushState to create browseable history
    const newUrl = `${window.location.pathname}?${urlSearchParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  },

  /**
   * Get city and state from URL query parameters
   */
  getLocationParams: (): LocationParams | null => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const city = urlSearchParams.get('city');
    const state = urlSearchParams.get('state');
    
    if (city && state) {
      return {
        // URL-decode the values to convert back to normal strings
        city: decodeURIComponent(city),
        state: decodeURIComponent(state),
      };
    }
    
    return null;
  },

  /**
   * Clear location parameters from URL
   */
  clearLocationParams: (): void => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.delete('city');
    urlSearchParams.delete('state');
    
    // Create new URL without the location parameters
    const newUrl = urlSearchParams.toString() 
      ? `${window.location.pathname}?${urlSearchParams.toString()}`
      : window.location.pathname;
    
    window.history.pushState({}, '', newUrl);
  },

  /**
   * Build search query string from location parameters
   */
  buildSearchQuery: (params: LocationParams): string => {
    return `${params.city}, ${params.state}`;
  },

  /**
   * Update page title based on location
   */
  updatePageTitle: (city?: string): void => {
    if (city) {
      document.title = `${city} Historical Weather`;
    } else {
      document.title = 'Historical Weather Tracker';
    }
  },
};