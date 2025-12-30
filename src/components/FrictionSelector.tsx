import React from "react";
import { Wifi, WifiHigh, WifiLow, WifiZero } from "lucide-react";
import type { FrictionLevel } from "../types";

interface FrictionSelectorProps {
  value: FrictionLevel;
  onChange: (level: FrictionLevel) => void;
  className?: string;
}

export const FrictionSelector: React.FC<FrictionSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      {(["none", "low", "moderate", "high"] as FrictionLevel[]).map(
        (level) => {
          const Icon = {
            none: WifiZero,
            low: WifiLow,
            moderate: WifiHigh,
            high: Wifi,
          }[level];

          const activeColor = {
            none: "text-cyan-500",
            low: "text-violet-500",
            moderate: "text-fuchsia-600",
            high: "text-rose-600",
          }[level];

          const hoverColor = {
            none: "hover:text-cyan-500",
            low: "hover:text-violet-500",
            moderate: "hover:text-fuchsia-600",
            high: "hover:text-rose-600",
          }[level];

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`
                p-0.5 rounded transition-all border
                ${
                  value === level
                    ? `bg-white shadow-sm ${activeColor} border-slate-200`
                    : `text-slate-500 ${hoverColor} border-slate-200 bg-transparent`
                }
              `}
              title={level}
            >
              <Icon size={14} className="rotate-90" />
            </button>
          );
        }
      )}
    </div>
  );
};
