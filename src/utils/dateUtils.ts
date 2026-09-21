/**
 * Malaysian Date & Time Utility Helpers (Asia/Kuala_Lumpur)
 */

export const MY_TIMEZONE = 'Asia/Kuala_Lumpur';

/**
 * Format a Date or ISO string / timestamp to Malaysian presentation: DD/MM/YYYY
 */
export function formatMalaysianDate(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: MY_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

/**
 * Format a Date or ISO string / timestamp to Malaysian presentation: DD/MM/YYYY, hh:mm am/pm
 */
export function formatMalaysianDateTime(dateInput: string | number | Date | null | undefined): {
  datePart: string;
  timePart: string;
  full: string;
} {
  if (!dateInput) {
    return { datePart: '—', timePart: '', full: '—' };
  }
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return { datePart: String(dateInput), timePart: '', full: String(dateInput) };
    }

    const datePart = new Intl.DateTimeFormat('en-GB', {
      timeZone: MY_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);

    const timePart = new Intl.DateTimeFormat('en-US', {
      timeZone: MY_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);

    return {
      datePart,
      timePart,
      full: `${datePart} ${timePart}`,
    };
  } catch {
    return { datePart: String(dateInput), timePart: '', full: String(dateInput) };
  }
}

/**
 * Extract YYYY-MM-DD in Asia/Kuala_Lumpur
 */
export function getMalaysianDateParts(referenceDate = new Date()): { year: number; month: number; day: number; dayOfWeek: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: MY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(referenceDate);
  const year = parseInt(parts.find((p) => p.type === 'year')?.value || '2026', 10);
  const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
  const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);

  // Determine weekday in MY timezone
  const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: MY_TIMEZONE,
    weekday: 'short',
  });
  const weekdayStr = weekdayFormatter.format(referenceDate);
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = weekdayMap[weekdayStr] ?? 0;

  return { year, month, day, dayOfWeek };
}

/**
 * Calculate Sunday to Saturday date range for the current week in Asia/Kuala_Lumpur
 */
export function getSundayToSaturdayWeekRange(referenceDate = new Date()): {
  startOfWeek: Date;
  endOfWeek: Date;
  startDateStr: string;
  endDateStr: string;
} {
  const { year, month, day, dayOfWeek } = getMalaysianDateParts(referenceDate);

  // Construct anchor date in UTC/local neutral
  const anchor = new Date(year, month - 1, day);
  const sunday = new Date(anchor);
  sunday.setDate(anchor.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  const pad = (n: number) => String(n).padStart(2, '0');
  const toYMD = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  return {
    startOfWeek: sunday,
    endOfWeek: saturday,
    startDateStr: toYMD(sunday),
    endDateStr: toYMD(saturday),
  };
}

/**
 * Get start and end of month in Asia/Kuala_Lumpur
 */
export function getMonthRange(referenceDate = new Date()): {
  startDateStr: string;
  endDateStr: string;
  startOfMonth: Date;
  endOfMonth: Date;
} {
  const { year, month } = getMalaysianDateParts(referenceDate);

  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const pad = (n: number) => String(n).padStart(2, '0');
  const toYMD = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  return {
    startDateStr: toYMD(startOfMonth),
    endDateStr: toYMD(endOfMonth),
    startOfMonth,
    endOfMonth,
  };
}

/**
 * Get start and end of year in Asia/Kuala_Lumpur
 */
export function getYearRange(referenceDate = new Date()): {
  startDateStr: string;
  endDateStr: string;
  startOfYear: Date;
  endOfYear: Date;
} {
  const { year } = getMalaysianDateParts(referenceDate);
  const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const pad = (n: number) => String(n).padStart(2, '0');
  const toYMD = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  return {
    startDateStr: toYMD(startOfYear),
    endDateStr: toYMD(endOfYear),
    startOfYear,
    endOfYear,
  };
}

/**
 * Get today's YYYY-MM-DD string strictly in Asia/Kuala_Lumpur timezone
 */
export function getTodayYMD(): string {
  const { year, month, day } = getMalaysianDateParts(new Date());
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}
