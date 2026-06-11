import { describe, expect, it } from "vitest";
import { formatTemperatureFromCelsius, formatTemperatureFromKelvin } from "./temperatureFormatting.js";

describe("temperatureFormatting", () => {
  it("formats Celsius values with Fahrenheit companions", () => {
    expect(formatTemperatureFromCelsius(14)).toBe("14 °C / 57.2 °F");
    expect(formatTemperatureFromCelsius(-40)).toBe("-40 °C / -40 °F");
  });

  it("formats Kelvin values with Celsius and Fahrenheit companions", () => {
    expect(formatTemperatureFromKelvin(288.15)).toBe("15 °C / 59 °F");
    expect(formatTemperatureFromKelvin(5800, { includeKelvin: true })).toBe("5,800 K / 5,526.9 °C / 9,980.3 °F");
  });

  it("returns a blank em dash for missing inputs", () => {
    expect(formatTemperatureFromCelsius(null)).toBe("—");
    expect(formatTemperatureFromKelvin(undefined)).toBe("—");
  });
});
