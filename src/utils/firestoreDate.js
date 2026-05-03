/**
 * Normalize Firestore Timestamp, Date, ISO string, or millis for display/sort.
 */
export function parseFirestoreDate(value) {
  if (value == null || value === '') return null;
  if (typeof value.toDate === 'function') {
    try {
      const d = value.toDate();
      return Number.isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatFirestoreDate(value, locale, options) {
  const date = parseFirestoreDate(value);
  if (!date) return '';
  return date.toLocaleString(locale ?? undefined, options ?? {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
