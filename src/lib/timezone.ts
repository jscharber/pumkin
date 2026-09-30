// Helpers for entering and displaying contest dates in a specific IANA time zone.
// Firestore stores absolute instants; the contest's timeZone controls how they are shown.

export const DEFAULT_TIME_ZONE = 'America/Chicago';

export const TIME_ZONE_OPTIONS: { value: string; label: string }[] = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Phoenix', label: 'Mountain Time - Arizona (no DST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' },
];

export function getBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function getZonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);

  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value || '0', 10);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

// Offset in ms between the wall clock in timeZone and UTC at the given instant
function getTimeZoneOffset(date: Date, timeZone: string): number {
  const p = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// Convert a datetime-local value ("YYYY-MM-DDTHH:mm") in timeZone to an absolute Date
export function zonedInputToDate(value: string, timeZone: string): Date {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    throw new Error(`Invalid date/time: ${value}`);
  }
  const [, y, mo, d, h, mi] = match.map(Number);
  const wallClockAsUtc = Date.UTC(y, mo - 1, d, h, mi);

  // Two passes so the offset is correct on either side of a DST change
  let result = wallClockAsUtc - getTimeZoneOffset(new Date(wallClockAsUtc), timeZone);
  result = wallClockAsUtc - getTimeZoneOffset(new Date(result), timeZone);
  return new Date(result);
}

// Convert an absolute Date to a datetime-local value ("YYYY-MM-DDTHH:mm") in timeZone
export function dateToZonedInput(date: Date, timeZone: string): string {
  const p = getZonedParts(date, timeZone);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

// e.g. "October 31, 2026 at 11:59 PM CDT"
export function formatDateTimeInZone(date: Date, timeZone: string): string {
  return date.toLocaleString('en-US', {
    timeZone,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}
