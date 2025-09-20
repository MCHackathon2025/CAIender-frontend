// src/components/WeatherCard.jsx
import React, { useEffect, useState } from "react";
import { fetchWeather } from "../services/weatherAPI";

const WeatherCard = ({ region }) => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather(region)
      .then(setWeather)
      .catch((err) => {
        console.error("Weather fetch failed:", err);
        setError(err.message);
      });
  }, [region]);

  if (error) return <div style={{ color: "red" }}> {error}</div>;
  if (!weather) return <div>Loading...</div>;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        color: "#374151",
      }}
    >
      <span>{weather.temperature}°C</span>
      <div
        style={{
          width: "24px",
          height: "24px",
          backgroundColor: "#4b5563",
          borderRadius: "4px",
        }}
      ></div>
      <span>{weather.humidity}%</span>
    </div>
  );
};

export default WeatherCard;
