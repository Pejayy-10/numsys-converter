"use client"

import { useEffect, useState } from "react";

const values = [
  "1010", "0110", "1101", "755", "ABC", "123", "7F", "F0", "0x1A", "0o10", "0b11",
  "99", "64", "0D", "E7", "FF", "42", "0011"
];

const minSpeed = 12; // seconds
const maxSpeed = 36; // seconds
const rowHeight = 20; // px, matches text-base (1.25rem ≈ 20px)

function getRandomValue() {
  return values[Math.floor(Math.random() * values.length)];
}

export default function AnimatedBackground() {
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    // Calculate how many rows fit in the viewport
    const updateRowCount = () => {
      setRowCount(Math.ceil(window.innerHeight / rowHeight));
    };
    updateRowCount();
    window.addEventListener("resize", updateRowCount);
    return () => window.removeEventListener("resize", updateRowCount);
  }, []);

  if (rowCount === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {Array(rowCount).fill(null).map((_, i) => {
        const top = i * rowHeight;
        return (
          <div
            key={i}
            className="absolute w-[200vw] whitespace-nowrap select-none font-mono text-base font-bold text-eerie-black opacity-10"
            style={{
              top: `${top}px`,
              left: 0,
              lineHeight: 1,
              height: `${rowHeight}px`,
              background: 'rgba(255,0,0,0.2)'
            }}
          >
            <div className="animate-[scroll-left_30s_linear_infinite]" style={{ display: "inline-block", minWidth: "100vw" }}>
              {Array(200)
                .fill(null)
                .map((_, j) => {
                  const val = getRandomValue();
                  return (
                    <span key={j} className="mx-0" style={{
                      color:
                        j % 4 === 0
                          ? "#1e90ff"
                          : j % 4 === 1
                          ? "#ff9800"
                          : j % 4 === 2
                          ? "#388e3c"
                          : "#b71c1c",
                      display: "inline-block"
                    }}>
                      {val}
                    </span>
                  );
                })}
            </div>
            {/* Duplicate for seamless scroll */}
            <div className="animate-[scroll-left_15s_linear_infinite]" style={{ display: "inline-block", minWidth: "100vw" }}>
              {Array(200)
                .fill(null)
                .map((_, j) => {
                  const val = getRandomValue();
                  return (
                    <span key={j} className="mx-0" style={{
                      color:
                        j % 4 === 0
                          ? "#1e90ff"
                          : j % 4 === 1
                          ? "#ff9800"
                          : j % 4 === 2
                          ? "#388e3c"
                          : "#b71c1c",
                      display: "inline-block"
                    }}>
                      {val}
                    </span>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}