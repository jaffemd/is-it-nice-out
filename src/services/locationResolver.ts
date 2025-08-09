interface SelectedLocation {
  id: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

interface RadarAddress {
  formattedAddress?: string;
  addressLabel?: string;
  city?: string;
  state?: string;
  geometry?: {
    coordinates?: [number, number]; // [longitude, latitude]
  };
}

/**
 * Service for resolving city/state combinations to coordinates using Radar API
 */
export const locationResolver = {
  /**
   * Resolve a search query (e.g., "Chicago, IL") to a SelectedLocation with coordinates
   */
  resolveLocation: async (searchQuery: string): Promise<SelectedLocation | null> => {
    try {
      const apiKey = import.meta.env.VITE_RADAR_API_KEY;
      if (!apiKey || apiKey === 'your_radar_api_key_here') {
        throw new Error('Radar API key not configured. Please add your API key to the .env file.');
      }

      const response = await fetch(
        `https://api.radar.io/v1/search/autocomplete?query=${encodeURIComponent(searchQuery)}&country=US&limit=1`,
        {
          headers: {
            'Authorization': apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Radar API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
        const address: RadarAddress = data.addresses[0]; // Take the first result

        if (address.geometry?.coordinates) {
          return {
            id: `${address.geometry.coordinates[1]},${address.geometry.coordinates[0]}`,
            formattedAddress: address.formattedAddress || address.addressLabel || 'Unknown Address',
            latitude: address.geometry.coordinates[1],
            longitude: address.geometry.coordinates[0],
            city: address.city,
            state: address.state,
          };
        }
      }

      return null; // No results found
    } catch (error) {
      console.error('Location resolution error:', error);
      throw error;
    }
  },
};