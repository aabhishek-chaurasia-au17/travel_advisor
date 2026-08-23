import axios from 'axios';

export const getPlacesData = async (type, sw, ne) => {
  const { data: { data } } = await axios.get(`https://travel-advisor.p.rapidapi.com/${type}/list-in-boundary`, {
    params: {
      bl_latitude: sw.lat,
      bl_longitude: sw.lng,
      tr_longitude: ne.lng,
      tr_latitude: ne.lat,
    },
    headers: {
      'x-rapidapi-key': process.env.REACT_APP_RAPID_API_TRAVEL_API_KEY,
      'x-rapidapi-host': 'travel-advisor.p.rapidapi.com',
    },
  });

  return data;
};

export const getWeatherData = async (lat, lng) => {
  if (!lat || !lng) return null;

  const { data } = await axios.get('https://community-open-weather-map.p.rapidapi.com/find', {
    params: { lat, lon: lng },
    headers: {
      'x-rapidapi-key': process.env.REACT_APP_RAPID_API_WEATHER_API_KEY,
      'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com',
    },
  });

  return data;
};
