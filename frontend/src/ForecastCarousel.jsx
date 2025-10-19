// ForecastCarousel.jsx
import React from "react";
import ForecastCard from "./ForecastCard";

/*
  Carrusel horizontal del pronóstico.
  Props:
  - data: array de bloques pronóstico
*/

export default function ForecastCarousel({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="forecast-outer">
      <div className="forecast-track">
        {data.map((item, idx) => (
          <ForecastCard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}
