function toFiniteNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value, maximumFractionDigits = 1) {
  const numeric = toFiniteNumber(value);
  if (numeric === null) return "";

  return numeric.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
}

export function celsiusToFahrenheit(value) {
  const numeric = toFiniteNumber(value);
  return numeric === null ? null : (numeric * 9) / 5 + 32;
}

export function kelvinToCelsius(value) {
  const numeric = toFiniteNumber(value);
  return numeric === null ? null : numeric - 273.15;
}

export function kelvinToFahrenheit(value) {
  const celsius = kelvinToCelsius(value);
  return celsius === null ? null : celsiusToFahrenheit(celsius);
}

export function formatTemperatureFromCelsius(value, options = {}) {
  const { maximumFractionDigits = 1, fallback = "—" } = options;
  const celsius = toFiniteNumber(value);
  const fahrenheit = celsiusToFahrenheit(celsius);

  if (celsius === null || fahrenheit === null) {
    return fallback;
  }

  return `${formatNumber(celsius, maximumFractionDigits)} °C / ${formatNumber(fahrenheit, maximumFractionDigits)} °F`;
}

export function formatTemperatureFromKelvin(value, options = {}) {
  const { includeKelvin = false, maximumFractionDigits = 1, kelvinFractionDigits = 0, fallback = "—" } = options;

  const kelvin = toFiniteNumber(value);
  const celsius = kelvinToCelsius(kelvin);
  const fahrenheit = kelvinToFahrenheit(kelvin);

  if (kelvin === null || celsius === null || fahrenheit === null) {
    return fallback;
  }

  const dualUnitValue = `${formatNumber(celsius, maximumFractionDigits)} °C / ${formatNumber(fahrenheit, maximumFractionDigits)} °F`;
  return includeKelvin ? `${formatNumber(kelvin, kelvinFractionDigits)} K / ${dualUnitValue}` : dualUnitValue;
}
