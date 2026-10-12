import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';

type WeatherData = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    time: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
  timezone: string;
};

const weatherCodeMap: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Moderate drizzle', icon: '🌦️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  56: { label: 'Freezing drizzle', icon: '🌧️' },
  57: { label: 'Heavy freezing drizzle', icon: '🌧️' },
  61: { label: 'Slight rain', icon: '🌦️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🌧️' },
  67: { label: 'Heavy freezing rain', icon: '🌧️' },
  71: { label: 'Slight snow', icon: '🌨️' },
  73: { label: 'Moderate snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Heavy showers', icon: '🌧️' },
  82: { label: 'Violent showers', icon: '⛈️' },
  85: { label: 'Slight snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Heavy hail storm', icon: '⛈️' },
};

const formatDay = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

export default function App() {
  const [query, setQuery] = useState('Mexico City');
  const [cityName, setCityName] = useState('Mexico City');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeatherByCity = async (city: string) => {
    if (!city.trim()) {
      setError('Please enter a city');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      const location = geoData.results?.[0];
      if (!location) {
        throw new Error('City not found');
      }

      const lat = location.latitude;
      const lon = location.longitude;
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
      );
      const data = await weatherRes.json();

      setWeather(data);
      setCityName(`${location.name}, ${location.country || ''}`.trim());
      setQuery(location.name || city);
    } catch (err: any) {
      setError(err.message || 'Could not load the weather');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission was not granted');
      }

      const current = await Location.getCurrentPositionAsync({});
      const lat = current.coords.latitude;
      const lon = current.coords.longitude;
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
      );
      const data = await weatherRes.json();
      setWeather(data);
      setCityName('Current location');
      setQuery('');
    } catch (err: any) {
      setError(err.message || 'Could not get your location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherByCity('Mexico City');
  }, []);

  const currentWeather = weather?.current;
  const daily = weather?.daily;

  const summary = useMemo(() => {
    if (!currentWeather) return null;
    const code = currentWeather.weather_code;
    return weatherCodeMap[code] || { label: 'Weather', icon: '🌤️' };
  }, [currentWeather]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.title}>Weather Dashboard</Text>

        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Enter city"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => fetchWeatherByCity(query)}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.locationButton} onPress={fetchWeatherByLocation}>
          <Text style={styles.locationButtonText}>Use my location</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#60A5FA" />
            <Text style={styles.loadingText}>Loading weather...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {currentWeather && weather && summary && (
          <>
            <View style={styles.card}>
              <Text style={styles.location}>{cityName}</Text>
              <Text style={styles.temp}>{Math.round(currentWeather.temperature_2m)}°C</Text>
              <Text style={styles.condition}>
                {summary.icon} {summary.label}
              </Text>

              <View style={styles.statRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Feels like</Text>
                  <Text style={styles.statValue}>{Math.round(currentWeather.apparent_temperature)}°C</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Humidity</Text>
                  <Text style={styles.statValue}>{currentWeather.relative_humidity_2m}%</Text>
                </View>
              </View>

              <View style={styles.statRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Wind</Text>
                  <Text style={styles.statValue}>{Math.round(currentWeather.wind_speed_10m)} km/h</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Updated</Text>
                  <Text style={styles.statValue}>{new Date(currentWeather.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.forecastTitle}>5-day forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {daily?.time.map((day, index) => {
                const code = daily.weather_code[index];
                const info = weatherCodeMap[code] || { label: 'Weather', icon: '🌤️' };
                const high = Math.round(daily.temperature_2m_max[index]);
                const low = Math.round(daily.temperature_2m_min[index]);

                return (
                  <View key={day} style={styles.forecastItem}>
                    <Text style={styles.forecastDay}>{formatDay(day)}</Text>
                    <Text style={styles.forecastIcon}>{info.icon}</Text>
                    <Text style={styles.forecastLabel}>{info.label}</Text>
                    <Text style={styles.forecastTemp}>{high}° / {low}°</Text>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020817',
  },
  container: {
    flex: 1,
    backgroundColor: '#020817',
    padding: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 18,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  locationButton: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  locationButtonText: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 10,
  },
  errorBox: {
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  errorText: {
    color: '#FEE2E2',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    marginBottom: 20,
  },
  location: {
    color: '#E2E8F0',
    fontSize: 22,
    fontWeight: '700',
  },
  temp: {
    color: '#F8FAFC',
    fontSize: 58,
    fontWeight: '800',
    marginTop: 8,
  },
  condition: {
    color: '#93C5FD',
    fontSize: 18,
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  forecastTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  forecastItem: {
    width: 120,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginRight: 12,
    alignItems: 'center',
  },
  forecastDay: {
    color: '#CBD5E1',
    fontSize: 14,
    marginBottom: 8,
  },
  forecastIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  forecastLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  forecastTemp: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
});
