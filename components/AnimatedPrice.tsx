"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface AnimatedPriceProps {
  value: number;
  className?: string;
  currency?: string;
  digits?: number;
  showSymbol?: boolean;
}

const AnimatedPrice = ({
  value,
  className = "",
  currency = "usd",
  digits = 2,
  showSymbol = true,
}: AnimatedPriceProps) => {
  const previousValue = useRef(value);

  const [displayValue, setDisplayValue] = useState(value);

  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;

    if (start === end) return;

    if (end > start) {
      setFlash("up");
    } else {
      setFlash("down");
    }

    const duration = 350;
    const startTime = performance.now();

    let frame: number;

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);

      const current = start + (end - start) * progress;

      setDisplayValue(current);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        previousValue.current = end;
        setDisplayValue(end);

        setTimeout(() => {
          setFlash(null);
        }, 300);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span
      className={`
    ${className}
    transition-all
    duration-500
    ease-out
    ${
      flash === "up"
        ? "text-green-400 scale-110"
        : flash === "down"
          ? "text-red-400 scale-110"
          : "scale-100"
    }
  `}
    >
      {formatCurrency(displayValue, digits, currency, showSymbol)}
    </span>
  );
};

export default AnimatedPrice;
