import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherIcons, { getWeatherCondition, getTemperatureColor } from './WeatherIcons';

describe('WeatherIcons', () => {
  it('renders sunny icon by default', () => {
    const { container } = render(<WeatherIcons />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders different weather conditions', () => {
    const conditions = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'];

    conditions.forEach(condition => {
      const { container } = render(<WeatherIcons condition={condition} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('applies custom size and color', () => {
    const { container } = render(
      <WeatherIcons condition="sunny" size={32} color="#ff0000" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
    expect(svg).toHaveAttribute('fill', '#ff0000');
  });

  it('applies custom className', () => {
    const { container } = render(
      <WeatherIcons condition="sunny" className="custom-class" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });
});

describe('getWeatherCondition', () => {
  it('returns snowy for temperatures below 0', () => {
    expect(getWeatherCondition(-5, 50)).toBe('snowy');
  });

  it('returns foggy for temperatures below 10', () => {
    expect(getWeatherCondition(5, 50)).toBe('foggy');
  });

  it('returns rainy for high humidity', () => {
    expect(getWeatherCondition(20, 85)).toBe('rainy');
  });

  it('returns cloudy for moderate humidity', () => {
    expect(getWeatherCondition(20, 70)).toBe('cloudy');
  });

  it('returns sunny for normal conditions', () => {
    expect(getWeatherCondition(25, 50)).toBe('sunny');
  });
});

describe('getTemperatureColor', () => {
  it('returns blue for cold temperatures', () => {
    expect(getTemperatureColor(-5)).toBe('#3b82f6');
  });

  it('returns cyan for cool temperatures', () => {
    expect(getTemperatureColor(5)).toBe('#06b6d4');
  });

  it('returns green for mild temperatures', () => {
    expect(getTemperatureColor(15)).toBe('#10b981');
  });

  it('returns yellow for warm temperatures', () => {
    expect(getTemperatureColor(25)).toBe('#f59e0b');
  });

  it('returns red for hot temperatures', () => {
    expect(getTemperatureColor(35)).toBe('#ef4444');
  });
});
