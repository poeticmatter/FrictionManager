import {
  Flame,
  Snowflake,
  Lightbulb,
  type LucideIcon
} from 'lucide-react';
import type { FrictionLevel, ProjectStatus } from './types';

interface FrictionConfigItem {
  label: string;
  score: number;
  color: string;
  bg: string;
  border: string;
}

export const FRICTION_CONFIG: Record<FrictionLevel, FrictionConfigItem> = {
  none: { label: 'None', score: 0, color: 'text-gray-400', bg: 'bg-gray-100', border: 'border-gray-200' },
  low: { label: 'Low', score: 1, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  moderate: { label: 'Mod', score: 3, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  high: { label: 'High', score: 5, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
};

interface StatusConfigItem {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

export const STATUS_CONFIG: Record<ProjectStatus, StatusConfigItem> = {
  hot: { label: 'Hot', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  cold: { label: 'Cold', icon: Snowflake, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100' },
  idea: { label: 'Idea', icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
};
