import { describe, it, expect } from "vitest";
import {
  formatIISSGasGiantNote,
  generateIISSProfile,
  generatePlanetarySystemLongProfile,
  generatePlanetarySystemProfiles,
  generatePlanetarySystemShortProfile,
  parseIISSProfile,
} from "./iissProfileGenerator.js";

describe("iissProfileGenerator", () => {
  describe("generateIISSProfile", () => {
    it("generates single star profile with full spectral data", () => {
      const system = {
        stars: [
          {
            spectralClass: "G2 V",
            massInSolarMasses: 1.02,
            diameterInSolarDiameters: 1.01,
            luminosity: 1.05,
          },
        ],
        ageGyr: 5.5,
        metadata: {},
      };

      const profile = generateIISSProfile(system);

      // Format: T#-C-M-D-L-A
      // G2 V-V-1.02-1.01-1.05-5.5
      expect(profile).toBeDefined();
      expect(profile).toContain("G2");
      expect(profile).toContain("1.02"); // mass
      expect(profile).toContain("1.01"); // diameter
      expect(profile).toContain("1.05"); // luminosity
      expect(profile).toContain("5.5"); // age
    });

    it("generates binary star profile with primary and companion", () => {
      const system = {
        stars: [
          {
            spectralClass: "G2 V",
            massInSolarMasses: 1.02,
            diameterInSolarDiameters: 1.01,
            luminosity: 1.05,
            designation: "A",
          },
          {
            spectralClass: "M3 V",
            massInSolarMasses: 0.39,
            diameterInSolarDiameters: 0.42,
            luminosity: 0.022,
            systemDesignation: "B",
            stellarOrbitNumber: 1,
            stellarOrbitEccentricity: 0.25,
          },
        ],
        ageGyr: 4.2,
        metadata: {},
      };

      const profile = generateIISSProfile(system);

      // Should include colon separator
      expect(profile).toContain(":");

      // Should have primary profile
      expect(profile).toMatch(/G2.*1\.02.*1\.01.*1\.05.*4\.2/);

      // Should have companion profile
      expect(profile).toMatch(/B-1-0\.25-M3/);
    });

    it("generates trinary system profile with multiple companions", () => {
      const system = {
        stars: [
          {
            spectralClass: "F5 IV",
            massInSolarMasses: 1.5,
            diameterInSolarDiameters: 1.3,
            luminosity: 2.1,
          },
          {
            spectralClass: "M0 V",
            massInSolarMasses: 0.51,
            diameterInSolarDiameters: 0.6,
            luminosity: 0.031,
            systemDesignation: "B",
            stellarOrbitNumber: 2,
            stellarOrbitEccentricity: 0.1,
          },
          {
            spectralClass: "K7 VI",
            massInSolarMasses: 0.65,
            diameterInSolarDiameters: 0.82,
            luminosity: 0.15,
            systemDesignation: "Ca",
            stellarOrbitNumber: 3,
            stellarOrbitEccentricity: 0.35,
          },
        ],
        ageGyr: 3.5,
        metadata: {},
      };

      const profile = generateIISSProfile(system);
      const parts = profile.split(":");

      expect(parts.length).toBe(3); // Primary + 2 companions
      expect(parts[0]).toContain("F5"); // Primary
      expect(parts[1]).toContain("B"); // First companion
      expect(parts[2]).toContain("Ca"); // Second companion
    });

    it("defaults to age 5 if not provided", () => {
      const system = {
        stars: [
          {
            spectralClass: "A0 V",
            massInSolarMasses: 2.1,
            diameterInSolarDiameters: 1.7,
            luminosity: 16,
          },
        ],
        metadata: {},
        // No ageGyr provided
      };

      const profile = generateIISSProfile(system);

      expect(profile).toContain("5"); // Default age
    });

    it("handles empty or malformed input gracefully", () => {
      expect(generateIISSProfile(null)).toBe("");
      expect(generateIISSProfile({})).toBe("");
      expect(generateIISSProfile({ stars: [] })).toBe("");
    });

    it("extracts luminosity class from complex spectral types", () => {
      const system = {
        stars: [
          {
            spectralClass: "K5III", // No space, explicit luminosity class
            massInSolarMasses: 0.7,
            diameterInSolarDiameters: 8.5,
            luminosity: 60,
          },
        ],
        ageGyr: 8000, // Old red giant
        metadata: {},
      };

      const profile = generateIISSProfile(system);

      expect(profile).toContain("K5"); // Spectral type
      expect(profile).toContain("III"); // Luminosity class
      expect(profile).toContain("60"); // Luminosity
    });
  });

  describe("planetary system profiles", () => {
    it("generates short profile with eHex world counts", () => {
      const profile = generatePlanetarySystemShortProfile({
        worldPlacement: {
          counts: {
            afterAnomalies: {
              gasGiantCount: 4,
              planetoidBeltCount: 2,
              terrestrialPlanetCount: 12,
            },
          },
          steps: {
            step2: { baselineNumber: -2 },
            step5: { roundedSpread: 0.5 },
          },
        },
      });

      expect(profile).toBe("4-2-C-0-0.5");
    });

    it("generates long profile with M/GM/PM world tokens", () => {
      const longProfile = generatePlanetarySystemLongProfile({
        stars: [],
        worldPlacement: {
          steps: {
            step2: { baselineNumber: 3 },
            step3: { baselineOrbit: 2 },
            step5: { roundedSpread: 0.5 },
          },
        },
        planets: [
          { parentDesignation: "A", starKey: "primary", orbitNumber: 1.0, sourceType: "terrestrialPlanet" },
          {
            parentDesignation: "A",
            starKey: "primary",
            orbitNumber: 2.1,
            sourceType: "gasGiant",
            hasMainworldSecondary: true,
          },
          { parentDesignation: "A", starKey: "primary", orbitNumber: 4.0, sourceType: "planetoidBelt" },
          {
            parentDesignation: "B",
            starKey: "secondary-1",
            orbitNumber: 3.0,
            sourceType: "planetoidBelt",
            hasMainworldSecondary: true,
          },
          { parentDesignation: "B", starKey: "secondary-1", orbitNumber: 5.0, sourceType: "gasGiant" },
          { parentDesignation: "C", starKey: "secondary-2", orbitNumber: 0.5, sourceType: "mainworld" },
          { parentDesignation: "C", starKey: "secondary-2", orbitNumber: 1.2, sourceType: "terrestrialPlanet" },
        ],
      });

      expect(longProfile).toBe("A-2-T-GM-P-0.5:B-0-PM-G-0.5:C-2-M-T-0.5");
    });

    it("generates short and long profiles together", () => {
      const profiles = generatePlanetarySystemProfiles({
        worldPlacement: {
          counts: {
            gasGiants: 1,
            planetoidBelts: 0,
            terrestrialPlanets: 2,
          },
          steps: {
            step2: { baselineNumber: 4 },
            step3: { baselineOrbit: 3 },
            step5: { roundedSpread: 1 },
          },
        },
        stars: [{ spectralClass: "G2 V" }],
        planets: [
          { starKey: "primary", orbitNumber: 2.0, sourceType: "terrestrialPlanet" },
          { starKey: "primary", orbitNumber: 3.5, sourceType: "gasGiant" },
          { starKey: "primary", orbitNumber: 4.1, sourceType: "terrestrialPlanet" },
        ],
      });

      expect(profiles).toEqual({
        shortProfile: "1-0-2-4-1",
        longProfile: "A-2-T-G-T-1",
      });
    });
  });

  describe("parseIISSProfile", () => {
    it("parses single star profile", () => {
      const profileString = "G2 V-V-1.02-1.01-1.05-5.5";
      const parsed = parseIISSProfile(profileString);

      expect(parsed.primary).toBeDefined();
      expect(parsed.primary.spectral).toBe("G2");
      expect(parsed.primary.mass).toBe(1.02);
      expect(parsed.primary.diameter).toBe(1.01);
      expect(parsed.primary.luminosity).toBe(1.05);
      expect(parsed.primary.age).toBe(5.5);
      expect(parsed.companions.length).toBe(0);
    });

    it("parses binary system profile", () => {
      const profileString = "G2 V-V-1.02-1.01-1.05-5.5:B-1-0.25-M3 V-V-0.39-0.42-0.022";
      const parsed = parseIISSProfile(profileString);

      expect(parsed.primary).toBeDefined();
      expect(parsed.companions.length).toBe(1);
      expect(parsed.companions[0].designation).toBe("B");
      expect(parsed.companions[0].orbit).toBe(1);
      expect(parsed.companions[0].eccentricity).toBe(0.25);
      expect(parsed.companions[0].spectral).toBe("M3");
    });

    it("parses trinary system profile", () => {
      const profileString = "F5 IV-IV-1.5-1.3-2.1-3.5:B-2-0.1-M0 V-V-0.51-0.6-0.031:Ca-3-0.35-K7 VI-VI-0.65-0.82-0.15";
      const parsed = parseIISSProfile(profileString);

      expect(parsed.companions.length).toBe(2);
      expect(parsed.companions[0].designation).toBe("B");
      expect(parsed.companions[1].designation).toBe("Ca");
    });

    it("handles malformed input with defaults", () => {
      const parsed = parseIISSProfile("");
      expect(parsed.primary).toBeNull();
      expect(parsed.companions.length).toBe(0);

      const parsed2 = parseIISSProfile(null);
      expect(parsed2.primary).toBeNull();
    });

    it("roundtrips single star system", () => {
      const system = {
        stars: [
          {
            spectralClass: "G2 V",
            massInSolarMasses: 1.02,
            diameterInSolarDiameters: 1.01,
            luminosity: 1.05,
          },
        ],
        ageGyr: 5.5,
        metadata: {},
      };

      const profile = generateIISSProfile(system);
      const parsed = parseIISSProfile(profile);

      expect(parsed.primary.spectral).toBe(system.stars[0].spectralClass.split(" ")[0]); // G2
      expect(parsed.primary.mass).toBe(1.02);
      expect(parsed.primary.age).toBe(5.5);
    });
  });

  describe("formatIISSGasGiantNote", () => {
    it("formats full gas giant sizing note from slot metadata", () => {
      const note = formatIISSGasGiantNote({
        sourceType: "gasGiant",
        sizeCode: "GMB",
        gasGiantDiameterTerran: 11,
        gasGiantMassEarth: 340,
      });

      expect(note).toBe("GG-GMB-D11-M340");
    });

    it("can derive SAH code from category and diameter codes", () => {
      const note = formatIISSGasGiantNote({
        sourceType: "Gas Giant",
        gasGiantCategoryCode: "GL",
        gasGiantDiameterCode: "J",
        gasGiantDiameterTerran: 18,
        gasGiantMassEarth: 3000,
      });

      expect(note).toBe("GG-GLJ-D18-M3000");
    });

    it("returns empty string for non-gas worlds with no giant metadata", () => {
      const note = formatIISSGasGiantNote({
        sourceType: "terrestrialPlanet",
        sizeCode: "6",
      });

      expect(note).toBe("");
    });
  });
});
