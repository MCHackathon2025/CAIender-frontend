import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import WeatherCard from './WeatherCard';

// Mock the weather API
vi.mock('../../services/weatherApi', () => ({
  fetchWeather: vi.fn()
}));

import { fetchWeather } from '../../services/weatherApi';

describe('WeatherCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(fetchWeather).mockImplementation(() => new Promise(() => { })); // Never resolves

    render(<WeatherCard region="Hsinchu" />);

    expect(screen.getByText('Loading weather...')).toBeInTheDocument();
  });

  it('renders weather data in compact mode', async () => {
    const mockWeatherData = {
      temperature: 25,
      humidity: 60,
      region: 'Hsinchu',
      time: '2024-01-01T12:00:00Z'
    };

    vi.mocked(fetchWeather).mockResolvedValue(mockWeatherData);

    render(<WeatherCard region="Hsinchu" />);

    await waitFor(() => {
      expect(screen.getByText('25°C')).toBeInTheDocument();
    });
  });

  it('renders weather data in detailed mode', async () => {
    const mockWeatherData = {
      temperature: 25,
      humidity: 60,
      region: 'Hsinchu',
      time: '2024-01-01T12:00:00Z'
    };

    vi.mocked(fetchWeather).mockResolvedValue(mockWeatherData);

    render(<WeatherCard region="Hsinchu" showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('Hsinchu')).toBeInTheDocument();
      expect(screen.getByText('25°C')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    vi.mocked(fetchWeather).mockRejectedValue(new Error('Network error'));

    render(<WeatherCard region="Hsinchu" />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('shows refresh button when refreshInterval is set', async () => {
    const mockWeatherData = {
      temperature: 25,
      humidity: 60,
      region: 'Hsinchu',
      time: '2024-01-01T12:00:00Z'
    };

    vi.mocked(fetchWeather).mockResolvedValue(mockWeatherData);

    render(<WeatherCard region="Hsinchu" showDetails={true} refreshInterval={300000} />);

    await waitFor(() => {
      expect(screen.getByTitle('Refresh weather')).toBeInTheDocument();
    });
  });
});
