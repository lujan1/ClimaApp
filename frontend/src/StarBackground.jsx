// ✅ StarBackground.jsx (Componente aislado para que NO se re-renderice)
import { useEffect, useRef } from "react";
import "./App.css";

export default function StarBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    for (let i = 0; i < 30; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = Math.random() * 100 + "vw";
      star.style.animationDuration = 2 + Math.random() * 3 + "s";
      star.style.animationDelay = Math.random() * 5 + "s";
      container.appendChild(star);
    }
  }, []); // ✅ Se ejecuta SOLO UNA VEZ

  return <div ref={containerRef} className="stars-container"></div>;
}
