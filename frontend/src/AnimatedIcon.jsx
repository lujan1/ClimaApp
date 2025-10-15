// AnimatedIcon.jsx
// Devuelve una etiqueta <img> con una animación/GIF según la descripción del clima.
// Comentario: edita las URLs si quieres otras animaciones.

import React from "react";

export default function AnimatedIcon({ description, size = 72 }) {
  if (!description) return null;
  const d = description.toLowerCase();

  // Mapear keywords a URLs de iconos/gifs animados públicos
  // (si alguna URL falla, reemplázala por otra)
  const map = [
    { test: (s) => s.includes("rain") || s.includes("lluv"), url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" },
    { test: (s) => s.includes("storm") || s.includes("thunder") || s.includes("torment"), url: "https://media.giphy.com/media/5xaOcLGvzHxDKjufnLW/giphy.gif" },
    { test: (s) => s.includes("snow") || s.includes("nieve"), url: "https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif" },
    { test: (s) => s.includes("clear") || s.includes("despejad"), url: "https://media.giphy.com/media/3oEdv7Xfr2Cq1hKcFi/giphy.gif" },
    { test: (s) => s.includes("cloud") || s.includes("nubes"), url: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif" },
    { test: (s) => s.includes("mist") || s.includes("fog") || s.includes("niebla"), url: "https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif" },
  ];

  const found = map.find(m => m.test(d));
  const src = found ? found.url : "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif";

  return (
    <img
      src={src}
      alt={description}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5))"
      }}
    />
  );
}
