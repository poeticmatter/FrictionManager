import React from 'react';
import type { FrictionLevel } from '../types';
import { FRICTION_CONFIG } from '../config';

interface FrictionBadgeProps {
  level: FrictionLevel;
  onClick?: () => void;
}

export const FrictionBadge: React.FC<FrictionBadgeProps> = ({ level, onClick }) => {
  const config = FRICTION_CONFIG[level];
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`
        px-2 py-0.5 rounded text-[10px] font-bold border ${config.border} ${config.bg} ${config.color}
        ${onClick ? 'cursor-pointer hover:opacity-80 select-none hover:shadow-sm' : ''}
        uppercase tracking-wide transition-all
      `}
      title={onClick ? "Click to cycle friction" : ""}
    >
      {config.label}
    </span>
  );
};
