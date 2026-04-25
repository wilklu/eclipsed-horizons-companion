import * as w from './apps/system-generator/frontend/src/utils/wbh/worldPhysicalCharacteristicsWbh.js';

console.log('determineTerrestrialComposition:', w.determineTerrestrialComposition({ sizeCode: '5', orbitNumber: 3.1, hzco: 3.3, systemAgeGyr: 5, rollTotal: 10 }));
console.log('determineTerrestrialDensity for Rock and Metal, roll 9:', w.determineTerrestrialDensity({ composition: 'Rock and Metal', rollTotal: 9 }));
console.log('determineTerrestrialDensity for Rock and Ice, roll 9:', w.determineTerrestrialDensity({ composition: 'Rock and Ice', rollTotal: 9 }));
console.log('getWbhWorldSizeEntry 5:', w.getWbhWorldSizeEntry('5'));
console.log('calculateWorldGravity with density1.03 and diameter8163:', w.calculateWorldGravity({ density: 1.03, diameterKm: 8163 }));
console.log('calculateWorldMass with density1.03 and diameter8163:', w.calculateWorldMass({ density: 1.03, diameterKm: 8163 }));
console.log('calculateEscapeVelocity with mass and diameter:', w.calculateEscapeVelocity({ mass: w.calculateWorldMass({ density: 1.03, diameterKm: 8163 }), diameterKm: 8163 }));

console.log('generateWorldPhysicalCharacteristicsWbh result:');
console.log(
	w.generateWorldPhysicalCharacteristicsWbh({
		worldName: 'Aab IV d',
		sizeCode: '5',
		orbitNumber: 3.1,
		hzco: 3.3,
		systemAgeGyr: 5,
		detailDie: 63,
		rollDie: w.createSequenceRoller ? w.createSequenceRoller([2, 4, 5, 2, 4, 5]) : null,
	}),
);
