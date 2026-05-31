import { differenceInDays } from 'date-fns';
import type { Task, Warmth, Friction } from '../types';

export const calculateWarmth = (lastTouchedAt: string): Warmth => {
  const days = differenceInDays(new Date(), new Date(lastTouchedAt));
  if (days <= 7) return 'Hot';
  if (days <= 30) return 'Warm';
  return 'Cold';
};

export const calculateTaskFriction = (task: Task): Friction => {
  if (task.completedAt) return 'None';

  const days = differenceInDays(new Date(), new Date(task.createdAt));
  if (days < 7) return 'Low';
  if (days <= 30) return 'Medium';
  return 'High';
};

export const getFrictionValue = (f: Friction): number => {
  switch (f) {
    case 'High': return 3;
    case 'Medium': return 2;
    case 'Low': return 1;
    case 'None': return 0;
  }
};

export const calculateProjectFriction = (tasks: Task[], projectId: string): Friction => {
  const incompleteTasks = tasks.filter(t => t.projectId === projectId && !t.completedAt);
  if (incompleteTasks.length === 0) return 'None';

  let highestFriction: Friction = 'Low';
  let highestValue = 1;

  for (const task of incompleteTasks) {
    const f = calculateTaskFriction(task);
    const val = getFrictionValue(f);
    if (val > highestValue) {
      highestValue = val;
      highestFriction = f;
    }
  }

  return highestFriction;
};
