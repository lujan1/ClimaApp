import React from "react";
import "./ForecastCarousel.css";

const ForecastCarousel = ({ data = [] }) => {
  return (
    <div className="carousel-container">
      {data.map((item, index) => (
        <div key={index} className="carousel-item">
          <div>{new Date(item.fecha).getHours()}:00</div>
          <img
            src={`https://openweathermap.org/img/wn/${item.icono}@2x.png`}
            alt={item.descripcion}
          />
          <div>{item.temperatura}°C</div>
          <div className="desc">{item.descripcion}</div>
        </div>
      ))}
    </div>
  );
};

export default ForecastCarousel;
