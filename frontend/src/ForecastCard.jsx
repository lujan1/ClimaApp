// ForecastCard.jsx
import React from "react";
import AnimatedIcon from "./AnimatedIcon";

/*
  Tarjeta individual del pronóstico.
  Props:
   - item: { hora, temperatura, clima, mensaje }
*/

export default function ForecastCard({ item }) {
  return (
    <div className="forecast-card">
      <div className="card-top">
        <div className="time">{item.hora}</div>
        <AnimatedIcon description={item.clima} size={64} />
      </div>

      <div className="card-middle">
        <div className="temp">{item.temperatura}</div>
        <div className="desc">{item.clima}</div>
      </div>

      <div className="card-bottom">
        <div className="advice">{item.mensaje}</div>
      </div>
    </div>
  );
}
