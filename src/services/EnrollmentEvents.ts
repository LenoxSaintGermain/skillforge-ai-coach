/**
 * Global event system for enrollment changes
 * Allows components to react to enrollment updates without prop drilling
 */

export const ENROLLMENTS_UPDATED = 'enrollments:updated';

export const broadcastEnrollmentsUpdated = () => {
  window.dispatchEvent(new Event(ENROLLMENTS_UPDATED));
};
