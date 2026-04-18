import { describe, expect, it } from "vitest";
import {
  buildWorldLinkedCreatureOptions,
  generateBeastProfile,
  mapWorldToCreatureTerrain,
  resolveArmor,
  resolveBodyStructure,
  resolveEcologicalNiche,
  resolveGravityMod,
  resolveLifeCycle,
  resolveLocomotion,
  resolveQuantity,
  resolveReaction,
  resolveSenses,
  resolveSize,
  resolveSpeed,
  resolveWeapon,
} from "./beastGenerator.js";
import { formatBeastSummary, formatReactionValue } from "./beastFormatting.js";

describe("beastGenerator rules foundation", () => {
  it("resolves gravity modifiers from world size", () => {
    expect(resolveGravityMod("0")).toBe(1);
    expect(resolveGravityMod("8")).toBe(0);
    expect(resolveGravityMod("D")).toBe(2);
  });

  it("resolves terrain locomotion from the BeastMaker table", () => {
    expect(resolveLocomotion("Clear", 6)).toBe("Flyer");
    expect(resolveLocomotion("Wet Woods", 5)).toBe("Triphib");
    expect(resolveLocomotion("Ocean", 1)).toBe("Flyphib");
  });

  it("resolves ecological niche and subniche from flux", () => {
    expect(resolveEcologicalNiche(0, "Omnivore")).toEqual({
      flux: 0,
      niche: "Omnivore",
      subniche: "Hunter/Gatherer",
      tableNiche: "Omnivore",
    });

    expect(resolveEcologicalNiche(3, "Carnivore").subniche).toBe("Killer");
    expect(resolveEcologicalNiche(-5, "Producer").subniche).toBe("Basker");
  });

  it("derives quantity, size, speed, reaction, weapon, and armor", () => {
    const quantity = resolveQuantity(1, () => 0.5);
    expect(quantity.label).toBe("Small Herd");
    expect(quantity.count).toBeGreaterThan(0);

    const size = resolveSize(0, 1);
    expect(size.size).toBe(4);
    expect(size.label).toBe("Typical");

    const speed = resolveSpeed({ roll: 4, locomotion: "Flyer", niche: "Omnivore" });
    expect(speed.speedC).toBe("V Fast");

    const reaction = resolveReaction("Grazer", () => 0);
    expect(reaction.attack).toBe(9);
    expect(reaction.flee).toBe(9);

    const weapon = resolveWeapon(0, "Herbivore");
    expect(weapon.weapon).toBe("Body");

    const armor = resolveArmor(2, [0, 1], () => 0.5);
    expect(armor.types).toEqual(["2D Armor", "1D Insulated"]);

    const body = resolveBodyStructure({ locomotion: "Flyer", terrain: "Mountain", niche: "Carnivore" }, () => 0);
    expect(body.bodySymmetry).toContain("bilateral");

    const senses = resolveSenses({ terrain: "Wetland", locomotion: "Swimmer", niche: "Scavenger" }, () => 0);
    expect(senses.length).toBeGreaterThan(1);

    const cycle = resolveLifeCycle({ size, quantity, niche: "Omnivore" }, () => 0);
    expect(cycle.reproduction).toBeTruthy();
  });

  it("generates a deterministic beast profile from a seed", () => {
    const first = generateBeastProfile({ seed: "forest-hunter", terrain: "Woods", worldSize: "8" });
    const second = generateBeastProfile({ seed: "forest-hunter", terrain: "Woods", worldSize: "8" });

    expect(second).toEqual(first);
    expect(first.terrain).toBe("Woods");
    expect(first.ecologicalNiche.subniche).toBeTruthy();
    expect(first.combat.weapon.weapon).toBeTruthy();
  });

  it("derives terrain and world-link metadata from stored world records", () => {
    expect(mapWorldToCreatureTerrain({ hydrographics: 10, avgTempC: 18 })).toBe("Ocean");
    expect(mapWorldToCreatureTerrain({ hydrographics: 1, avgTempC: 42 })).toBe("Desert");

    const linked = buildWorldLinkedCreatureOptions({
      name: "Mora",
      uwp: "A867A99-C",
      size: 8,
      hydrographics: 8,
      nativeSophontLife: true,
    });

    expect(linked.sourceWorld.name).toBe("Mora");
    expect(linked.sourceWorld.nativeSophontLife).toBe(true);
    expect(linked.worldSize).toBe(8);
    expect(linked.terrain).toBe("Wetland");
  });

  it("formats reaction labels and creature summaries for UI use", () => {
    expect(formatReactionValue("P")).toBe("Attack if possible");

    const beast = generateBeastProfile({
      seed: "summary-case",
      name: "Tyaeda",
      terrain: "Woods",
      worldSize: "5",
      primaryNiche: "Producer",
    });

    const summary = formatBeastSummary(beast);
    expect(summary).toContain("Tyaeda");
    expect(summary.toLowerCase()).toContain("woods");
    expect(beast.extended.bodySymmetry).toBeTruthy();
    expect(Array.isArray(beast.extended.senses)).toBe(true);
    expect(beast.extended.specialTraits.length).toBeGreaterThan(0);
    expect(beast.extended.encounterHooks.length).toBeGreaterThan(0);
  });
});
