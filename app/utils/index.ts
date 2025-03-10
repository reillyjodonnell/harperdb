import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function timeAgo(timestamp: number): string {
  const now = new Date().getTime();
  const secondsPast = (now - timestamp) / 1000;

  if (secondsPast < 60) {
    // less than a minute
    return 'just now';
  }
  if (secondsPast < 3600) {
    // less than an hour
    const minutes = Math.floor(secondsPast / 60);
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  }
  if (secondsPast < 86400) {
    // less than a day
    const hours = Math.floor(secondsPast / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (secondsPast < 604800) {
    // less than a week
    const days = Math.floor(secondsPast / 86400);
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  }
  if (secondsPast < 2419200) {
    // less than 28 days
    const weeks = Math.floor(secondsPast / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }

  // If more than 28 days ago, return the exact date in mm/dd/yyyy format
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
