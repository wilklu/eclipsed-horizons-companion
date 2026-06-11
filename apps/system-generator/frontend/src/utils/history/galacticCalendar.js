export const GALACTIC_CALENDAR_NAME = "Galactic Calendar";
export const GALACTIC_CURRENT_DATE = Object.freeze({
  eon: 13,
  age: 6,
  millennium: 4,
  century: 3,
  year: 43,
  day: 128,
});

export const GALACTIC_ERAS = Object.freeze([
  {
    name: "Founding Ages",
    description: "Mythic deep history, origin legends, and the first great foundations of civilization.",
  },
  {
    name: "The Emergence",
    description: "The first civilizations reach space and establish durable orbital societies.",
  },
  {
    name: "The Reaching",
    description: "Early interstellar expansion, colonial routes, and frontier consolidation.",
  },
  {
    name: "The First Contact",
    description: "Discovery of other sophont species and the diplomacy that follows.",
  },
]);

const YEARS_PER_EON = 1_000_000_000;
const YEARS_PER_AGE = 1_000_000;
const YEARS_PER_MILLENNIUM = 1_000;
const YEARS_PER_CENTURY = 100;
const DAYS_PER_YEAR = 365;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function totalGalacticYears(date = GALACTIC_CURRENT_DATE) {
  return (
    (Number(date?.eon) || 0) * YEARS_PER_EON +
    (Number(date?.age) || 0) * YEARS_PER_AGE +
    (Number(date?.millennium) || 0) * YEARS_PER_MILLENNIUM +
    (Number(date?.century) || 0) * YEARS_PER_CENTURY +
    (Number(date?.year) || 0)
  );
}

export function resolveGalacticEra(yearsAgo = 0, totalSpan = 1) {
  const normalizedSpan = Math.max(1, Number(totalSpan) || 1);
  const ratio = Math.max(0, Number(yearsAgo) || 0) / normalizedSpan;

  if (ratio >= 0.75) {
    return GALACTIC_ERAS[0];
  }
  if (ratio >= 0.5) {
    return GALACTIC_ERAS[1];
  }
  if (ratio >= 0.25) {
    return GALACTIC_ERAS[2];
  }
  return GALACTIC_ERAS[3];
}

export function formatGalacticDate(date = {}, options = {}) {
  const { forceLong = false, includeTime = false, time = {} } = options;

  const parts = forceLong
    ? [date.eon ?? 0, date.age ?? 0, date.millennium ?? 0, date.century ?? 0, date.year ?? 0, date.day ?? 0]
    : [date.millennium ?? 0, date.century ?? 0, date.year ?? 0, date.day ?? 0];

  const base = parts.map((value) => Math.max(0, Number(value) || 0)).join(".");

  if (!includeTime) {
    return base;
  }

  const hh = String(clamp(Number(time?.hour) || 0, 0, 23)).padStart(2, "0");
  const mm = String(clamp(Number(time?.minute) || 0, 0, 59)).padStart(2, "0");
  const ss = String(clamp(Number(time?.second) || 0, 0, 59)).padStart(2, "0");
  return `${base}.${hh}.${mm}.${ss}`;
}

export function resolveGalacticDateFromYearsAgo(yearsAgo = 0, current = GALACTIC_CURRENT_DATE) {
  const wholeYearsAgo = Math.max(0, Math.floor(Number(yearsAgo) || 0));
  let remaining = Math.max(0, totalGalacticYears(current) - wholeYearsAgo);

  const eon = Math.floor(remaining / YEARS_PER_EON);
  remaining -= eon * YEARS_PER_EON;

  const age = Math.floor(remaining / YEARS_PER_AGE);
  remaining -= age * YEARS_PER_AGE;

  const millennium = Math.floor(remaining / YEARS_PER_MILLENNIUM);
  remaining -= millennium * YEARS_PER_MILLENNIUM;

  const century = Math.floor(remaining / YEARS_PER_CENTURY);
  remaining -= century * YEARS_PER_CENTURY;

  const year = Math.floor(remaining);
  const day = clamp(Number(current?.day) || 1, 1, DAYS_PER_YEAR);

  const forceLong = wholeYearsAgo >= YEARS_PER_AGE;
  const date = {
    calendar: GALACTIC_CALENDAR_NAME,
    eon,
    age,
    millennium,
    century,
    year,
    day,
    yearsAgo: wholeYearsAgo,
  };

  return {
    ...date,
    fullLabel: formatGalacticDate(date, { forceLong: true }),
    displayLabel: formatGalacticDate(date, { forceLong }),
    sortValue: totalGalacticYears(date),
  };
}

export function formatGalacticSpan(years = 0) {
  const span = Math.max(0, Number(years) || 0);
  if (span >= 1_000_000_000) return `${(span / 1_000_000_000).toFixed(1)} eons`;
  if (span >= 1_000_000) return `${(span / 1_000_000).toFixed(1)} ages`;
  if (span >= 10_000) return `${(span / 1_000).toFixed(1)}k years`;
  return `${Math.round(span).toLocaleString()} years`;
}
