import React from "react";
import type { FrictionLevel } from "../types";

interface FrictionBarProps {
  level: FrictionLevel;
  className?: string;
  style?: React.CSSProperties;
}

export const FrictionBar: React.FC<FrictionBarProps> = ({
  level,
  className = "",
  style,
}) => {
  const getFrictionBarStyle = (level: FrictionLevel) => {
    switch (level) {
      case "none":
        return { width: "10%", className: "bg-cyan-500" };
      case "low":
        return { width: "25%", className: "bg-violet-500" };
      case "moderate":
        return { width: "45%", className: "bg-fuchsia-600" };
      case "high":
        return { width: "70%", className: "bg-rose-600" };
    }
  };

  const barStyle = getFrictionBarStyle(level);

  return (
    <div
      className={`h-full transition-all duration-300 ${barStyle.className} ${className}`}
      style={{ width: barStyle.width, ...style }}
    />
  );
};
