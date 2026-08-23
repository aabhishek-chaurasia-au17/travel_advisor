import React, { useState, useEffect } from 'react';
import { CssBaseline, Grid, CircularProgress } from '@material-ui/core';
import { useLoadScript } from '@react-google-maps/api';

import { getPlacesData, getWeatherData } from './api/travelAdvisorAPI';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';

// Defined outside component so the array reference is stable across renders
const GOOGLE_MAPS_LIBRARIES = ['places'];

const App = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState('');

  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.006 });
  const [bounds, setBounds] = useState(null);

  const [weatherData, setWeatherData] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [places, setPlaces] = useState([]);

  const [autocomplete, setAutocomplete] = useState(null);
  const [childClicked, setChildClicked] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });
      },
      () => {
        // Fallback to New York City when geolocation is denied or unavailable
        setCoords({ lat: 40.7128, lng: -74.006 });
      },
    );
  }, []);

  useEffect(() => {
    if (!rating) {
      setFilteredPlaces([]);
      return;
    }
    const filtered = places.filter((place) => Number(place.rating) >= Number(rating));
    setFilteredPlaces(filtered);
  }, [rating, places]);

  useEffect(() => {
    if (bounds) {
      setIsLoading(true);

      getWeatherData(coords.lat, coords.lng)
        .then((data) => setWeatherData(data))
        .catch((error) => console.error('Error fetching weather data:', error));

      getPlacesData(type, bounds.sw, bounds.ne)
        .then((data) => {
          if (data && Array.isArray(data)) {
            setPlaces(data.filter((place) => place.name && place.num_reviews > 0));
          } else {
            console.error('Data is not an array or is undefined:', data);
            setPlaces([]);
          }
          setFilteredPlaces([]);
          setRating('');
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching places data:', error);
          setPlaces([]);
          setFilteredPlaces([]);
          setRating('');
          setIsLoading(false);
        });
    }
  }, [bounds, type, coords.lat, coords.lng]);

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    const place = autocomplete?.getPlace();
    if (!place?.geometry?.location) return;
    setCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
  };

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size="5rem" />
      </div>
    );
  }

  return (
    <>
      <CssBaseline />
      <Header onPlaceChanged={onPlaceChanged} onLoad={onLoad} />
      <Grid container spacing={3} style={{ width: '100%' }}>
        <Grid item xs={12} md={4}>
          <List
            isLoading={isLoading}
            childClicked={childClicked}
            places={filteredPlaces.length ? filteredPlaces : places}
            type={type}
            setType={setType}
            rating={rating}
            setRating={setRating}
          />
        </Grid>
        <Grid item xs={12} md={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Map
            setChildClicked={setChildClicked}
            setBounds={setBounds}
            setCoords={setCoords}
            coords={coords}
            places={filteredPlaces.length ? filteredPlaces : places}
            weatherData={weatherData}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default App;
