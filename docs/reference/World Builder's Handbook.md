# CHAPTER 3: STARS
## PRIMARY STAR  
A star system has one or more stars. For the generation of a new system, the first step is the  determination of the system’s primary star. More than  half of all star systems contain more than one star and  of these, the primary star is considered the one that is  the most massive. In most cases it is also the brightest  star in the system.

Most stars will be small main sequence stars with  straightforward generation procedures. The special  cases requiring extra detail are the rare bright stars,  giants and unusual objects.  
### PRIMARY STAR TYPES  
To determine the type of the primary star roll 2D on the Star Type Determination table and consult the Type column.

Brighter, more massive stars (A-type+) are rarer than the smaller M-types. On a roll of 12, roll 2D again and consult the Hot column to determine the star’s type. 

A roll of 2 indicates a special system. This includes all systems whose primary stars are not main sequence stars. Roll 2D again and consult the Special column. 

A roll of 2 on the Special column results in a peculiar object. Roll 2D again and consult the Peculiar column.

Any result starting with Class requires a second roll on the Type column with DM+1. Additionally, Class IV and VI stars are limited in their range of types:
+ Class IV is limited to types B0 to K4. Add 5 to any rolled result of M (3-6) on the Type roll and change any result of O to B on an Hot roll. 
+ Class VI is comprised of two separate populations, but neither include type F or A. Treat results of F as G and A as B.

A result of Class III+ requires a roll in the giants column to determine the final luminosity class of the star, followed by a roll on the type column with DM+1.

**Table 1: Primary Star Types Table**

| 2D+DM |  Type*  | Hot* |  Special  |  Unusual  |  Giants   |   Peculiar   |
| :---: | :-----: | :--: | :-------: | :-------: | :-------: | :----------: |
|  2-   | Special |  A   |  Unusual  | Peculiar  | Class III |  Black Hole  |
|   3   |    M    |  A   | Class VI  | Class VI  | Class III |    Pulsar    |
|   4   |    M    |  A   | Class VI  | Class IV  | Class III | Neutron Star |
|   5   |    M    |  A   | Class VI  |    BD     | Class III |    Nebula    |
|   6   |    M    |  A   | Class IV  |    BD     | Class III |    Nebula    |
|   7   |    K    |  A   | Class IV  |    BD     | Class III |  Protostar   |
|   8   |    K    |  A   | Class IV  |     D     | Class III |  Protostar   |
|   9   |    G    |  A   | Class III |     D     | Class II  |  Protostar   |
|  10   |    G    |  B   | Class III |     D     | Class II  | Star Cluster |
|  11   |    F    |  B   |  Giants   | Class III | Class Ib  |   Anomaly    |
|  12+  |   Hot   |  O   |  Giants   |  Giants   | Class Ia  |   Anomaly    |
\* Stars are Class V main sequence stars unless they result from Special or Unusual rolls.

#### SUBTYPES  
The subtype, or numeric value of the star type can be  determined one of two ways:
1. Using the Star Subtype table and choosing the Numeric or M-type column as appropriate The M-type column is appropriate for Primary M-Type stars, but additional M-types in a system should use the Numeric column or a straight 0-9 subtype.
###### Table 2: Star Subtypes Table
| <br>2D | <br>Numeric | M-type <br>(Primary only) |
| :----: | :---------: | :-----------------------: |
|   2    |      0      |             8             |
|   3    |      1      |             6             |
|   4    |      3      |             5             |
|   5    |      5      |             4             |
|   6    |      7      |             0             |
|   7    |      9      |             2             |
|   8    |      8      |             1             |
|   9    |      6      |             3             |
|   10   |      4      |             5             |
|   11   |      2      |             7             |
|   12   |      0      |             9             |
- **Numeric Column**: Use this for O, B, A, F, G, and K-type stars, and for additional M-type stars in a system (non-primary M-types)
- **M-type (Primary only) Column**: Use this only for Primary M-type stars
- **Roll Method**: Roll 2D and consult the appropriate column based on the star's spectral type

##### Example: 
A 2D roll of 6 results in:
- Subtype **7** for a G-type star (using Numeric column)
- Subtype **0** for a primary M-type star (using M-type column)

For a K-type Class IV star, subtract 5 (make lower) any subtype result above 4.

```Example
Here we begin a running in-line example of a star system named ‘Zed’ in the distant Storr sector. To begin this example, the roll for primary star is a 9, resulting in a type G-type main sequence, Class V star. A 2D roll of stars 6 on the Star Subtype table using the Numeric column for a non-M-type star results in a subtype 7, making the primary star a G7 V. (Had it been a type-M-type star, the same 2D roll of 6 on the M-type column would have resulted in a M0 V star.) 
```
### STAR MASS AND TEMPERATURE
The Star Mass and Temperature by Class table provides approximate values for a star’s mass in units of Sol’s mass, , and associated surface temperature. This table lists the values for numeric 0 and 5 (and 9 for M-type) subtypes, but masses between these entries can be extrapolated or estimated. The values presented are not absolute limits or precise; the specific trace element composition of a star can vary in the mass of a particular type, as can its variation from a standard luminosity class. A variance of 20% from the listed or extrapolated values for any particular star’s mass is not unreasonable; for giant stars the variance from the standard could exceed 50%. The upper limit for the most massive supergiant stars could be as high as 300 or more; the lower limit for hydrogen fusion is normally around 0.08 but could dip lower, depending on composition.

The major determinant for the subtype of a star is its temperature. Actual temperature values can be extrapolated from the table below but should not be varied outside the range for that stellar subtype, although linear variability within that range is possible.

```Example
Zed, the example type G7 V star, falls between G5 and K0 or a mass range of 0.9 to 0.8, a difference of 0.1. By treating a K0 V as a ‘G10 V’ the math becomes clearer: a G7 is 2/5 of the difference between the larger and smaller value or .04 less than 0.9, giving it a base mass of 0.86. To add an optional 20% variance, roll 2D-7. A roll of 9–7 results in a +2 out of a possible range of +5. So, it is 40% of the variance of 20% of 0.86. This is 0.4 times 0.172 (which is 0.2 × 0.86) or 0.0688, which is then added to 0.86 to become 0.9288, rounded to 0.929.

Zed’s temperature is also possible to interpolate as the difference between a G5 V and a K0 V star but a broad variance should not be applied to this value. The difference between 5,600 and 5,200 is 400, and Zed is 40% of 400K cooler than a G5 V or 5,440K. If the Referee should decide to add a variance, it should be no more than half of the difference between a G7 and a G6 or a G8, so 5,440 +40, with a linear variance being more appropriate.
```

**Table 3: Star Mass and Temperature by Class**

| Star Type | Ia  | Ib  | II  | III | IV  |  V   |  VI   | Temperature | Colour       |
| :-------: | :-: | :-: | :-: | :-: | :-: | :--: | :---: | :---------: | ------------ |
|    O0     | 200 | 150 | 130 | 110 |  —  |  90  |   2   |   50,000K   | Blue         |
|    O5     | 80  | 60  | 40  | 30  |  —  |  60  |  1.5  |   40,000K   |              |
|    B0     | 60  | 40  | 30  | 20  | 20  |  18  |  0.5  |   30,000K   | Blue White   |
|    B5     | 30  | 25  | 20  | 10  | 10  |  5   |  0.4  |   15,000K   |              |
|    A0     | 20  | 15  | 14  |  8  |  4  | 2.2  |   —   |   10,000K   | White        |
|    A5     | 15  | 13  | 11  |  6  | 2.3 | 1.8  |   —   |   8,000K    |              |
|    F0     | 13  | 12  | 10  |  4  |  2  | 1.5  |   —   |   7,500K    | Yellow White |
|    F5     | 12  | 10  |  8  |  3  | 1.5 | 1.3  |   —   |   6,500K    |              |
|    G0     | 12  | 10  |  8  | 2.5 | 1.7 | 1.1  |  0.8  |   6,000K    | Yellow       |
|    G5     | 13  | 11  | 10  | 2.4 | 1.2 | 0.9  |  0.7  |   5,600K    |              |
|    K0     | 14  | 12  | 10  | 1.1 | 1.5 | 0.8  |  0.6  |   5,200K    | Light Orange |
|    K5     | 18  | 13  | 12  | 1.5 |  —  | 0.7  |  0.5  |   4,400K    |              |
|    M0     | 20  | 15  | 14  | 1.8 |  —  | 0.5  |  0.4  |   3,700K    | Orange Red   |
|    M5     | 25  | 20  | 16  | 2.4 |  —  | 0.16 | 0.12  |   3,000K    |              |
|    M9     | 30  | 25  | 18  |  8  |  —  | 0.08 | 0.075 |   2,400K    |              |
#### UNUSUAL AND PECULIAR OBJECT MASS
If a star is defined as a hydrogen fusing object (standard hydrogen composed of one proton and no neutrons), then objects such as brown dwarfs, white dwarfs, neutron stars and black holes are not technically stars. All of these items are covered in greater detail in the Special Circumstances chapter. If these objects are the primary or only star, the procedures in that chapter should govern the entire system’s generation. If they are Secondary or Companion stars, consult the Special Circumstances chapter for mass and temperature specifics.
### STAR DIAMETER
The diameter of a star affects its luminosity, as a larger surface area at the same temperature puts out more energy. The same variances optionally applied to star mass can apply to the values in the Star Diameter by Class table page 19. Note that most of this book’s text will refer to diameter instead of radius. Diameter is used to ease calculation of jump distances but radius is more often used in physics-based formulas. As the base values for these are 1 in either case, the actual usage is often equivalent (in the text, not in actual distance). However, a measure that can become important for large stars and/or closely orbiting planets is the radius of the star itself. In most cases, no planet can survive inside the surface of a star. The radius of Sol is 695,700km or 0.00465AU.

```Example
The G7 V star Zed might be a little more massive than normal but its diameter is independently based on its class. It is again 2/5 of the way between a G5 V diameter of 0.95 and a K0 V diameter of 0.9. This results in a base diameter calculation of 0.93 for Zed. Adding a 20% variance roll of (2D-7) results in +1 and adds 1/5 of 20% of 0.93 to the diameter to bring it to 0.9672 or 0.967.
```
###### Table 4: Star Diameter by Class
| Star Type |  Ia   | Ib  | II  | III | IV  |  V   |  VI  |
| :-------: | :---: | :-: | :-: | :-: | :-: | :--: | :--: |
|    O0     |  25   | 24  | 22  | 21  |  —  |  20  | 0.18 |
|    O5     |  22   | 20  | 18  | 15  |  —  |  12  | 0.18 |
|    B0     |  20   | 14  | 12  | 10  |  8  |  7   | 0.2  |
|    B5     |  60   | 25  | 14  |  6  |  5  | 3.5  | 0.5  |
|    A0     |  120  | 50  | 30  |  5  |  4  | 2.2  |  —   |
|    A5     |  180  | 75  | 45  |  5  |  3  |  2   |  —   |
|    F0     |  210  | 85  | 50  |  5  |  3  | 1.7  |  —   |
|    F5     |  280  | 115 | 66  |  5  |  2  | 1.5  |  —   |
|    G0     |  330  | 135 | 77  | 10  |  3  | 1.1  | 0.8  |
|    G5     |  360  | 150 | 90  | 15  |  4  | 0.95 | 0.7  |
|    K0     |  420  | 180 | 110 | 20  |  6  | 0.9  | 0.6  |
|    K5     |  600  | 260 | 160 | 40  |  —  | 0.8  | 0.5  |
|    M0     |  900  | 380 | 230 | 60  |  —  | 0.7  | 0.4  |
|    M5     | 1,200 | 600 | 350 | 100 |  —  | 0.2  | 0.1  |
|    M9     | 1,800 | 800 | 500 | 200 |  —  | 0.1  | 0.08 |

#### UNUSUAL AND PECULIAR OBJECT DIAMETER
Non-stellar objects have diameters that do not necessarily follow a clear relationship between mass and diameter. Detailed information on these object’s properties is included in the Special Circumstances chapter.
## STAR LUMINOSITY
A star’s luminosity is its brightness and energy output. For the purpose of determining the habitable zone, this includes all wavelengths of light. O-type and B-type stars radiate much of their energy in the ultraviolet and M-type much of their energy in the infrared. At these extremes much of the energy will not be visible to a human observer. The total, or bolometric, luminosity is what will determine the energy output of a star and therefore the location of the habitable zone where the environment is comfortable for human life.
The Star Luminosity by Class table provides luminosity values typical for a star of the indicated type and class. Actual luminosity values can have a variance of 30% or more. For Class III giant stars, luminosity can vary by even greater amounts late in its giant phase, with an upper bound nearly 100 times the table’s value with considerable variability.
#### LUMINOSITY FORMULA
A more accurate method of determining luminosity that is directly related to a star’s diameter and temperature is to use the formula: 

The value for diameter in this formula is in solar units. The temperature (T) of Sol is 5,772K, but can be rounded to 5,800. This formula results directly from underlying physics and pre-determined values, so it is neither necessary or appropriate to apply a variance to the formula-derived value.

**FORMULA: Luminosity**
$Luminosity = (\frac{Diameter}{1})^{2} \times (\frac{Temperature}{5772})^{4}$
#### UNUSUAL AND PECULIAR OBJECT LUMINOSITY
As with regular stars, the luminosity of an unusual object is related to its diameter and temperature. Protostars should determine luminosity based on their temperature and diameter using the luminosity formula in the same manner as normal stars. For other objects the formula remains the same but information such as the object’s age and the brightness of other objects in orbit can influence the object’s temperature effect on surrounding bodies. See the Special Circumstances chapter for specific details.
## SYSTEM AGE
In most cases, the Primary star determines the system’s age, the exception being when subsequent stars created in the same system are determined to be post-stellar objects such as white dwarfs, neutron stars or black holes. In that exception, post-stellar objects set the parameters for the minimum age of the system.
#### MAIN SEQUENCE LIFESPAN
Technically only Class V stars are main sequence stars but the ‘normal’ phase of a star’s life is similarly determined for Class Ia, Ib, II, V and VI stars. The major determination for main sequence lifespan is mass. A star of one solar mass will spend approximately 10 billion years on the main sequence. Going forward, for brevity, the term billion years may be abbreviated as Gyrs or Gyr for giga-year. The relationship between mass and lifespan on the main sequence is approximately: 

**FORMULA: Main Sequence Lifespan**
$\text{Main Sequence Lifespan} = \frac{10}{Mass^{2.5}}\ \text{Gyr(s)}$ 

This means a star with a mass of 20 will spend only six million years in the main sequence while one of mass 0.1 will last for more than three trillion years. As the universe is only 13.8 billion years old and the oldest stars are perhaps 13.5, even the first stars of less than about 0.89 – essentially G6 V or cooler – have not yet left the main sequence. 

Different galaxies experience star formation at different rates at different times but for Traveller purposes, star formation rates are considered flat or constant, and stars in their main sequence phase are considered to be randomly aged within that timespan in a linear fashion. The Referee can modify these assumptions as they see fit. The galaxy is thought to be 13 billion years old. Any normal star of mass less than 0.9 – which is by far the majority of stars in the galaxy, have been in the main sequence for between 0.1 and 12 billion years. 

To randomly determine this age, roll 1D and multiply by 2. Then roll D3-1 and add that value to the first roll. This sum is the star’s age in billions of years. Roll d10 to add additional digits the age number if greater detail is desired but if doing so, also subtract one billion years from the result:

**FORMULA: Small Star Age**
$\text{Small Star Age} =  (\text{1D} \times 2) + (\text{D3} - 2 + \frac {\text{d10}}{10})\ \text{Gyr(s)}$

Adding additional digits of accuracy requires additional d10 rolls. Most star system ages will not be known to an accuracy of better than millions of years or three significant digits, whichever is more accurate. A remote Class 0 or I survey from outside the system will rarely achieve more than two digit accuracy. 

Larger stars, those of mass above 0.9, cannot use this formula directly, although for stars of moderately larger mass the Referee may choose to use it and discard values outside the lifespan bounds. Instead, directly determine the portion of main sequence lifespan experienced by the star using linear variance: 

**FORMULA: Large Star Age**
$\text{Large Star Age} = \text{Main Sequence Lifespan Gyr(s)} \times \frac {\text{d100}}{100})\ \text{Gyr(s)}$
 
Using multiple d10 to emulate d100 or even d1000 will allow for greater detail, if desired.

Any star with a mass of less than 4.7 should use 0.01 Gyr as a minimum age value; anything younger would be a protostar. Stars of mass 4.7 or larger effectively skip the protostar stage, going straight into their Primordial system stage. 

For all stars, a result of less than 0.1 Gyr results in a primordial system. See the Special Circumstances Primordial Systems section beginning on page 225 for primordial system effects. 
#### SUBGIANT (CLASS IV) LIFESPAN
Class IV stars have completed their main sequence lifespan and are on their way towards becoming a true giant star. There is no easy method to determine the lifespan of a star as a subgiant, although more massive stars spend increasingly shorter periods of time in this phase. For simplicity, apply the following approximate formula for total time a star spends as a subgiant:

**FORMULA: Subgiant Lifespan**
$\text{Subgiant Lifespan} = \frac{\text{Main Sequence Lifespan}}{(4 + \text{Mass})}\ \text{Gyr(s)}$

Next determine the star’s fraction of time spent in the subgiant phase. This linear variation can be determined by dividing the subgiant lifespan by 1D, 1D-1+1D÷6, d10, or d100 as desired.

**FORMULA: Total Class IV Star Age**
$\text{Total Class IV Star Age} = \text{Main Sequence Lifespan} + \text{Subgiant Lifespan} \times \frac {\text{d100}}{100}\ \text{Gyr(s)}$ 
#### GIANT (CLASS III) LIFESPAN
Main sequence stars end their fusing era years as Class III giant stars. The giant phase of a star’s life is actually quite dramatic, with luminosity generally brightening over age but being subject to large variations. For simplicity, treat the star’s giant lifespan as:

**FORMULA: Giant Lifespan**
$\text{Giant Lifespan} = \frac {\text{Main Sequence Lifespan}}{10 \times Mass^{3}}\ \text{Gyr(s)}$

The elapsed fractional period of the star’s giant phase is determined in a linear fashion as above but stronger consideration should be given to the star’s luminosity, with significant brightening occurring late in the giant phase. Extra complications such a mass loss late in the giant phase are beyond the scope of this description. A giant’s total age can be computed as:

**FORMULA: Total Class III Star Age**
$\text{Total Class III Star Age} = \text{Main Sequence Lifespan} + \text{Subgiant Lifespan} + \text{Giant Lifespan} \times \frac {\text{d100}}{100}\ \text{Gyr(s)}$ 
#### FINAL AGE
Stars that have evolved into white dwarfs or more exotic dead star objects should consider the total age prior to the death of a star. The mass of these remnant objects is between one-third and one-fifth of the mass of their progenitor star, so to determine a previous lifetime, multiply the mass of these dead stars by 2 + D3 before computing lifespans for input into the following formula: 

**FORMULA: Star Final Age
$\text{Star Final Age} = \frac{10}{Mass^{2.5}} \times (1 + \frac{1}{(4 + Mass)} + \frac{1}{10 \times Mass^{3}})$

**FORMULA: Dead Star Mass
$\text{Mass} = (\text{D3} + 2) \times \text{Dead Star Mass}$

Or, more concisely: The value of (D3+2) × dead star mass is used for post- stellar objects to account for the mass loss associated with their death. However, the progenitor star must have begun life with at least enough mass to create the proper type of object. For a neutron star, this mass value must be at least 8 and for a black hole it should be at least 20. In all cases, objects should be less than 13.8 billion years old. Unless the Referee wants to create an anomaly. 
#### UNUSUAL AND PECULIAR OBJECT AGE
Sub-stellar objects such as brown dwarfs can be as old as the universe. As such, the small star age formula can determine age. Post stellar objects should consider two ages: the final age of the progenitor star and the age of the post-stellar object. The former is only really relevant in systems with multiple stars where smaller members are still in early phases of their existence. For post stellar objects, pulsars usually last for less than about 100 million years before becoming ‘normal’ neutron stars. Other post-stellar objects can be almost as old as the oldest stars and so can use the small star range.

**Special and Unusual Object Age by Type**

| Object            | Age Determination (+ Age of any previous phase)                                       |
| ----------------- | ------------------------------------------------------------------------------------- |
| Brown Dwarf (BD)  | Small Star Age formula                                                                |
| White Dwarf (D)   | Small Star Age formula (+ Star Final Age of Star formula using 2+D3 × dead star mass) |
| Pulsar (PSR)      | 100 million years ÷ 2d10 (+ Star Final Age of Star using 2+D3 × dead star mass)       |
| Neutron Star (NS) | Small Star Age formula (+ Star Final Age of Star formula using 2+D3 × dead star mass) |
| Black Hole (BH)   | Small Star Age formula (+ Star Final Age of Star formula using 2+D3 × dead star mass) |
| Protostar         | 10 million years ÷ 2d10                                                               |

## SYSTEMS WITH MULTIPLE STARS
Most stars exist as part of a system with more than one star. Binary stars are very common but astronomers have discovered systems of up to seven stars. This book’s methodology allows for up to eight stars to exist in a single system. In reality, multiple star systems exist in a hierarchy or tree-like structure, usually with single or pairs of stars orbiting each other and their common center of mass – their barycenter – possibly in turn orbiting around another single or pair of stars’ barycenter. More massive stars orbit near the center of this configuration, with less massive stars or star pairs further out.

While this representation is technically correct, it introduces unnecessary complications without adding much to the system creation processes except more math, which after considerably more effort will provide similar results. A Referee is free to modify this book’s processes to build a barycenter-based system but for the purposes of this generation methodology and to maintain some compatibility with earlier Traveller versions and T5, the primary star will represent the center of the system and define its core orbital structure and all other stars or star pairs will orbit it.
### NUMBER OF STARS
More massive stars are more likely to be members of a multiple star system but a system can include a variety of objects. The basic simplifying assumption of the star system generation is that the primary star is the most massive in the system. For logical simplification, additional stars may circle this primary star in orbits characterized as Close, Near and Far. Each star – including the primary – may have a companion star in very close orbit to it. The presence of a star at these locations is determined by the Multiple Stars Presence table. The chance of a star occupying any of these positions is only modified by the properties of the primary star.

**Table 5: Multiple Stars Presence**

| **Orbit Class** | **Presence (2D)** |
| --------------- | ----------------- |
| Close\*         | 10+               |
| Near            | 10+               |
| Far             | 10+               |
| Companion       | 10+               |
 \* Stars of Class Ia, Ib, II, and III cannot have Close secondary stars

**Die Modifiers**
+ DM+1 if Primary star of Class Ia, Ib, II, III, or IV
+ DM+1 if Primary star of Class V or VI and Type O, B, A, or F
+ DM-1 if Primary star of Class V or VI and Type M
+ DM-1 if Primary star is a Brown Dwarf (BD) or White Dwarf (D)
+ DM-1 if Primary star is a Pulsar, Neutron Star or Black Hole

Roll for a companion star presence for the primary and for any star determined to be present in the Close, Near or Far orbit classes. Those stars that are not the primary star or companions of other stars will sometimes be referred to as the secondary stars of the system.
### STELLAR CLASSES AND TYPES FOR MULTI-STAR SYSTEMS
The key premise of generating multi-star systems is that the primary star is the most massive and likely the most luminous star in the system. Likewise, the companion of any Close, Near or Far star is assumed to be less massive than its parent. To determine the Type and Class of other stars in the system, consult the Non-Primary Star Determination table. Use the secondary column for all Close, Near and Far stars. Use the companion column for all companions but treat its direct secondary parent as the ‘primary’ for typing purposes. White dwarfs, pulsars, neutron stars and black holes use the post-stellar column. Brown dwarfs and protostar primary stars may only have additional ‘stars’ of the same type; all brown dwarfs use the sibling result and protostars use the secondary or companion columns to determine the nature of the non-primary protostars.

**Table 9: Non-Primary Star Determination**

| 2D + DMs | Secondary | Companion | Post-Stellar | Other |
| -------- | --------- | --------- | ------------ | ----- |
| <= 2     | Other     | Other     | Other        | NS    |
| 3        | Other     | Other     | Other        | D     |
| 4        | Random    | Random    | Random       | D     |
| 5        | Random    | Random    | Random       | D     |
| 6        | Random    | Lesser    | Random       | D     |
| 7        | Lesser    | Lesser    | Random       | D     |
| 8        | Lesser    | Sibling   | Random       | BD    |
| 9        | Sibling   | SIbling   | Lesser       | BD    |
| 10       | Sibling   | Twin      | Lesser       | BD    |
| 11       | Twin      | Twin      | Twin         | BD    |
| 12 =>    | Twin      | Twin      | Twin         | BD    |
**Die Modifiers**
+ DM-1 for all columns if Class III or IV primary stars

The table's results indicate next steps in star type determination:

**Random:** Roll on the regular Star Type Determination table . If the new star result is a hotter type/subtype than the primary, treat the result as lesser instead

**Lesser:** Treat the new star as the same class and one type cooler than the primary or parent , e.g., F becomes G, K becomes M, and reroll the new subtype. The lesser of a M-type star is another M-type star, but if this second star has a higher subtype than its parent, it is a brown dwarf instead. For post-stellar objects, a lesser result for a black hole becomes a neutron star, a lesser neutron star or pulsar becomes a white dwarf, and a lesser white dwarf becomes a brown dwarf. If a Class IV star has a lesser which is too cool to be a Class IV, convert the lesser to a Class V lesser type star instead.

**Sibling:** The new star is slightly smaller than the parent. Subtract 1D from the subtype. If this becomes a negative number, use a cooler type and subtract 10, e.g., a sibling result for a G8 V with a roll of 3 becomes a K1 V, not a G 11 V. Post-stellar sibling objects remain in the same class, but less massive by 1D × 10% of the mass of the parent, but do not reduce size past minimums for that type of object.

**Twin:** The new star is essentially the same size and type as its parent. Use the same class, type and subtype. Optional subtract 1D-1% from the mass and diameter of the new star to allow for some variation.

**Other:** Roll again on the other column.

### ORBIT# OVERVIEW
A star’s initial location within the system is based on Traveller Orbit Numbers – hereafter referred to as Orbit#s. These arbitrary locations originally corresponded roughly to locations of planets in the Solar System and to an 18th century mathematical relationship known as the Titus-Bode law, which was no law at all but a mathematical formula which roughly corresponded to most solar system planetary orbits. While these Orbit numbers do not work well for actual planetary orbits in other solar systems (or even Sol’s), they continue to be useful for placement of stars. Fractional versions of these Orbit#s are still useful for describing planetary orbital relationships. With a considerable Traveller history and lore associated with Orbit#s, they form a basis for describing star stars  system architectures in this book. A heavy emphasis on fractional Orbit#s allows them to conform to known extrasolar planetary system architectures.

Also useful for many of the formulas in this book are actual distances, either in astronomical units (AU) or in kilometres. The relationship between these values is indicated the Orbit# table with examples, mostly from the Solar System, included.
#### Orbit\#
The Difference (AU) column provides the difference between the current Orbit# and the next, allowing easier computation of fractional, or decimal orbits, e.g., Orbit# 0.1 would be 0.4 × 0.1 or 0.04AU. The Million Km column indicates the distance in millions of kilometres of the orbit from the center of the star.

**Table 6: Orbit\#**

| Orbit# | Distance (AU) | Difference (AU) | Million Km | Example                      |
| :----: | :-----------: | :-------------: | :--------: | ---------------------------- |
|   0    |      0.4      |        0        |     60     | Companion Orbit              |
|   1    |      0.4      |       0.3       |     60     | Mercury                      |
|   2    |      0.7      |       0.3       |    105     | Venus                        |
|   3    |      1.0      |       0.6       |    150     | Terra                        |
|   4    |      1.6      |       1.2       |    240     | Mars                         |
|   5    |      2.8      |       2.4       |    420     | Asteroid Belt (Ceres)        |
|   6    |      5.2      |       4.8       |    780     | Jupiter                      |
|   7    |      10       |       10        |   1,500    | Saturn                       |
|   8    |      20       |       20        |   3,000    | Uranus                       |
|   9    |      40       |       37        |   6,000    | Kuiper Belt (Pluto)          |
|   10   |      77       |       77        |   11,550   | Scattered Disk (Eris)        |
|   11   |      154      |       154       |   23,100   | —                            |
|   12   |      308      |       307       |   46,200   | —                            |
|   13   |      615      |       615       |   92,250   | Outer Scattered Disk (Sedna) |
|   14   |     1,230     |      1,270      |  184,500   | —                            |
|   15   |     2,500     |      2,400      |  375,000   | Inner Oort Cloud             |
|   16   |     4,900     |      4,900      |  735,000   | Middle Oort Cloud            |
|   17   |     9,800     |      9,700      | 1,470,000  | —                            |
|   18   |    19,500     |     20,000      | 2,925,000  | —                            |
|   19   |    39,500     |     39,200      | 5,925,000  | Outer Oort Cloud             |
|   20   |    78,700     |        —        | 11,805,000 | > 1 light-year               |
#### FRACTIONAL ORBIT#S
To determine fractional Orbit#s, the whole number Orbit# (Orbit #.00) is considered the start of an Orbit#. For Orbit# 1 and above a linear variance can be simulated with d10 (with 0 = 10) by dividing the result by 10 and adding this value to Orbit# – 1 + 0.5. For instance, Orbit#2 with fractional variance would become Orbit#1.5 + d10 ÷ 10.

Orbit# 0 is treated differently as 0 is the minimum value. For an Orbit# 0 fractional range, the roll is 0 + d10 ÷ 20, giving a range of Orbit # 0.00 to 0.50. Some tightly packed star systems may have all of the worlds in the Orbit# zero range, so this Orbit# can be divided into 100ths. Any Orbit# can have add an extra d10 ÷ 100 to the result to provide a two digit fractional value.
#### FRACTIONAL ORBIT# CONVERSION TO AU
As Orbit#s are of unequal sizes, determining the distance of a fractional Orbit# from a star in AUs requires interpolation between two Orbit#s. The distance in AU is equal to the whole number Orbit# plus the difference between the whole number Orbit# and the next highest Orbit# (this is the Difference (AU) value on the Orbit# table) times the fractional portion of the Orbit#:

**FORMULA: Fractional Orbit\# Conversion To AU**
$\text{AU} = \text{Distance (AU) column for Whole Orbit\#} + \text{Difference (AU) column} \times \text{Fractional value}$

For instance, an Orbit# of 4.3 is equal to 1.6 (Orbit #4) + 1.2 (Orbit#4’s Difference(AU) column value) × 0.3 or 1.96AU. To determine the orbital distance in kilometres, multiply by 149,597,870.9
#### AU CONVERSION TO FRACTIONAL ORBIT\#
To convert an AU value back to an Orbit# requires a check of the Orbit# table to find the greatest full Orbit# that the AU value exceeds, e.g., 3.4 AU would exceed Orbit# 5. The remainder AU value above that full Orbit# divided by the Difference (AU) column value for that Orbit# is the fractional part of Orbit# value. For instance, 3.4 - 2.8 (the AU value of Orbit# 5) = 0.6 and 0.6 ÷ 2.4 = 0.25, therefore 3.4AU would have an Orbit# value of 5.25. To summarize, with ‘Full Orbit#’ defined as the largest full Orbit# exceeded:

**FORMULA: AU Conversion To Fractional Orbit\#**
$\text{Orbit\# (with fractional value)} = \text{Full Orbit\#} + \frac {\text{AU} - \text{Distance(AU) of Full Orbit\#}}{\text{Difference (AU) of Full Orbit\#}}$
#### STELLAR ORBIT\#S
For system generation purposes, all stellar Orbit#s in a multi-star system are assumed to circle the primary star, except companion stars, whose Orbit#s are based on their parents, whether the primary, Close, Near or Far. This is a schematic of convenience, not a strict representation of the system itself. Non-primary star Orbit#s are determined as:

A companion star has a fractional Orbit# variance built into its determination. Adding a fractional Orbit# variance of up to 0.5 Orbit# for non-companion stars to allow for greater system variation. 

**Table 7: Stellar Orbit\# Ranges**

| Orbit Class |  Orbit\# Determination   | Orbit\# Range |  AU Range   |
| ----------- | :----------------------: | :-----------: | :---------: |
| Close       |         1D – 1\*         |    0.5 – 5    |  0.2 – 4.0  |
| Near        |          1D + 5          |    6 – 11     |  4.0 – 231  |
| Far         |         1D + 11          |    12 – 17    | 231 – 14650 |
| Companion†  | 1D ÷ 10 + (2D – 7) ÷ 100 |  0.05 - 0.65  | 0.02 – 0.26 |
\*A result of 0 = Orbit\# 0.5 or 0.2AU
†Companions of giants (Ia, Ib, II, or III) have Orbit\# equal to 1D x MAO of the Primary star 
#### ECCENTRICITY
The star orbit generation method assumes roughly circular orbits. Real star orbits are often far from circular. Eccentricity is a measure of variation in an orbit, from 0 (circular) to 1 (no longer an orbit but a parabolic approach fading off to infinity – values greater than 1.0 indicate a hyperbolic orbit of an unbound interstellar object). Adding orbital eccentricity is optional; it adds realism but also complicates systems dramatically.

Simulating the range and distribution of possible eccentricity for orbits of any object in a system requires a first and second roll on the Eccentricity Values table. The first 2D determines a base value and has various DMs based on the characteristics of the orbit or type of body. The second 1D or 2D roll determines the added value to compute the actual eccentricity. The Referee is free to avoid over-precision and treat all eccentricities derived from a first 2D roll result of 5 or less as an eccentricity of exactly 0. The Referee could also choose to apply a linear variance achieve up to three digits of accuracy for eccentricity results. Values should never exceed 0.999 and can never be below 0.

**Table 8: Eccentricity Values**

| 2D+DM\* |  Base  | + Second Roll | = Resultant Range | Average Result |
| :-----: | :----: | :-----------: | :---------------: | :------------: |
|  <= 5   | -0.001 |   1D ÷ 1000   |   0.000 – 0.005   |     0.0025     |
|  6 – 7  |  0.00  |   1D ÷ 200    |   0.005 – 0.03    |     0.0175     |
|  8 – 9  |  0.03  |   1D ÷ 100    |    0.04 – 0.09    |     0.065      |
|   10    |  0.05  |    1D ÷ 20    |    0.10 – 0.35    |     0.225      |
|   11    |  0.05  |    2D ÷ 20    |    0.15 – 0.65    |      0.4       |
|  12 =>  |  0.30  |    2D ÷ 20    |    0.40 – 0.90    |      0.65      |
\*All DMs apply only to the first roll

**Die Modifiers**
+ DM+2 if a Star
+ DM+1 for each star an object directly orbits beyond the first
+ DM-1 for all Orbit\#s below 1.0 if System Age greater than 1 Gyr
+ DM+1 if Object is a significant body in an asteroid or planetoid belt

The eccentricity value allows calculation of a minimum and maximum separation distance (with AU equal to the average distance, also known as the semi-major axis of the orbit).

**FORMULA: Minimum Separation**
$\text{Minimum separation} = \text{AU} \times (1\ –\ \text{Eccentricity})$

**FORMULA: Maximum Separation**
$\text{Maximum separation} = \text{AU} \times (1 + \text{Eccentricity})$

In some cases, adding these factors will cause stellar orbits to cross. If this occurs, the Referee can assume that inclinations, orientations, or timing prevent stellar collisions, or add one full Orbit# to the outer crossing star’s Orbit# and recompute until the issue resolves.
### SYSTEM AGE ADJUSTMENT
If a new star is a post stellar object but the primary is a fusing star, the age of the entire stellar system could be reset. Use the final age (see page 22) of the post-stellar object, remembering to multiply its post-stellar mass by an appropriate amount, and add the elapsed age of the object’s post stellar life to determine system age. 

If this new age exceeds the main sequence lifespan of a main sequence primary star, the Referee can arbitrarily increase the mass of the post-stellar object to the point where its elapsed age would be less than the main sequence lifespan of the primary star. Using this reverse engineering method, rare starting combinations, such as a blue supergiant and a white dwarf, will result in the mass of the post-stellar object becoming large enough to change its class, forcing it to be a neutron star or black hole. This is an acceptable result. 
### STAR ORBIT PERIOD
The time period (in standard years) required for two large masses to orbit each other is equal to the square root of the value of their separation (in AU) cubed, divided by their combined (solar) masses or:

**FORMULA: Star Orbit Period**
$\text{Period (years)} = \sqrt{\frac{\text{AU}^{3}}{(\text{M} + \text{m})}}$

With the mass of one star being M and the other m. When considering multiple stars orbiting each other, this equation holds for two bodies but when, for example, Zed’s third star orbits the primary and its companion, the mass of both the primary and companion is considered as M and the third star is m. For short periods, it may be more meaningful to convert years (y) to standard days (d) by multiplying the result by 365.25, or even to hours (h) by multiplying by 8,766.
## STAR DESIGNATIONS
In multiple star systems, the stars are designated alphabetically. For a binary star system, the primary star is always star A and the secondary, regardless of its status is star B. For systems with three or more stars (trinary, quaternary, quinary, and so on), designation becomes more complex. Companion stars are relegated to lower case b designations appended to their direct primary’s designation, while their primary gets an upper case followed by a lower case a. Close, Near or Far stars are given an appended lower case a designation if they have a companion or keep their upper case designation if they are ‘alone’. The combined stars with companions are indicated by an upper case letter followed by an ab designation. Planetary orbits that encompass multiple stars use a combination of all of the stars inside their orbit. The following table provides an illustration of a sextuple system with a primary and its companion, a Close star, a Near star with a companion and a Far star. In the primary-centric procedures of this book, when a companion exists unless the stars are very dim, neither the companion or its parent star normally have orbits associated with them individually, so in the example Aa, Ab, Ca, and Cb are not typically used alone but only in the combinations: Aab and Cab. Likewise, depending on spacing, a combination such as CabD (abbreviated to CD) could theoretically exist but such a situation is not covered by these system generation rules. If the Referee chooses to introduce such possible orbits, a secondary multi-star orbit designation procedure would need to be inserted into the process.
## STAR SYSTEM PROFILE
The IISS shorthand profile for a star system has two formats, one for a single star and one for a multi-star system. The single star format is:

**Single Star Profile**
```profile
#-T# C-M-D-L-A
```
Where:
\# =  \# of stars (often omitted if 1 star),
T# = Type and subtype,
C = Class,
M = Mass,
D = Diameter,
L = Luminosity,
A = System Age in Gyr(s)

**Multiple Star Profile**
```profile
#-T# C-M-D-L-A:D-O-E-T# C-M-D-L:D-O-E-T# C-MD-L…
```
Where each star beyond the primary is indicated by:
D = Designation (e.g., B or Ab),
O = Orbit in Orbit#,
E = Eccentricity,
and the rest follows the same pattern as the primary.
\# =  \# of stars (often omitted if 1 star)
T# = Type and subtype
C = Class
M = Mass
D = Diameter
L = Luminosity
A = System Age in Gyr(s)
# CHAPTER 4: SYSTEM WORLDS AND ORBITS
Besides stars and stellar-like objects detailed in the previous chapter, a star system is occupied by planets, moons and asteroids, as well as comets, dust and other detritus not generally considered by Traveller system generation rules. The Traveller Core Rulebook concerns itself with just two properties of a system: the mainworld and the presence of one or more gas giants. The World Builder’s Handbook concerns itself with all of the significant bodies in a system. In addition to the mainworld, these objects include any and all gas giants, substantial planetoid or asteroid belts, and all other significant worlds present in a system. This chapter deals with the initial enumeration, placement and sizing of these bodies.
## WORLD TYPES AND QUANTITIES
All systems have a designated mainworld. For a preexisting system, this world is already detailed using the basic system generation procedures in the Traveller Core Rulebook or is available from some other preexisting source. If generating a new ‘clean’ system strictly by the expanded method, this mainworld is not yet designated but will be determined by the Referee as system generation proceeds.
### GAS GIANTS
A gas giant is defined as any world with a thick atmosphere primarily consisting of hydrogen, generally of at least twice Terra’s diameter and ranging in mass from 10⊕ up to the lower limit of brown dwarfs at 13 Jupiter masses (MJ) or about 4,000 mass⊕. As determined by the Traveller Core Rulebook on page 246, gas giants are absent in a system on a 2D roll of 10+; this is the equivalent of gas giants not being present in one system out of six. An alternative method to determine if a gas giant exists is roll 1D and indicate existence on a 2+. The Referee can pick the method that works best for them and stick with it:

```Roll
Gas Giant Exists on a 2D roll of < 10
```

There are no DMs to the gas giant existence roll unless the primary star is subject to rules covered in the Special Circumstances chapter. If a gas giant is present, roll on the Gas Giant Quantity table to determine the number of gas giants present.

**Table 10: Gas Giant Quantity**

| 2D+DM  | Quantity |
| :----: | :------: |
|  <= 4  |    1     |
| 5 – 6  |    2     |
| 7 – 8  |    3     |
| 9 – 11 |    4     |
|   12   |    5     |
| 13 =>  |    6     |
**Die Modifiers**
+ DM+1 if System consists of a single Class V star
+ DM-2 if Primary star is a brown dwarf.
+ DM-2 if Primary star is a post-stellar object.
+ DM-1 per post-stellar object (including primary star)   
+ DM-1 if System consists of four or more stars
### PLANETOID BELTS
All systems have a few random rocks in orbit around their stars but many have substantial zones of small bodies, usually the result of failed planetary formation or of some catastrophic collision in the system’s past. If a mainworld is Size 0, this normally means that a planetoid belt exists and the mainworld is defined as one or more of its members. This is not necessarily the case; the mainworld could potentially be a lone rock, a planetary ring, or even an artificial station. The number of planetary belts recorded for an existing system does not consider the home belt of a Size 0 mainworld (if any) as a planetoid belt. The distinction of asteroid belt, for the mainworld and planetoid belt for other defined regions of many small bodies, is arbitrary but this distinction allows for Size 0 mainworlds of varying types.

Regardless of the nature of the mainworld, a planetoid belt is present on a roll of 8+.

```Roll
Planet Belt Exists on a 2D roll of => 8
```

There are no DMs to the planetoid belt existence roll unless the primary star is subject to rules covered in the Special Circumstances chapter. If a planetoid belt is present, roll on the Planetoid Belt Quantity table to determine the number.

**Table 9: Gas Giant Quantity**

| 2D+DM  | Quantity |
| :----: | :------: |
|  <= 6  |    1     |
| 7 – 11 |    2     |
| 12 =>  |    3     |
**Die Modifiers**
- DM+1 if System has 1 or more gas giants.
- DM+3 if Primary star is a protostar.
- DM+2 if Primary star is primordial.
- DM+1 if Primary star is a post-stellar object. 
- DM+1 per post-stellar object (including primary star)
- DM+1 if System consists of two or more stars
### TERRESTRIAL PLANETS
Besides the mainworld and any gas giants or planetoid belts, a system may have additional planets. These worlds can range in Size from 1 to F (15). They are termed terrestrial planets, because like Terra they are mostly solid bodies in orbit around their sun. Some, but not most, of these worlds may be habitable planets. These worlds could also include bodies orbiting within planetoid belts (think of the ‘dwarf planets’ of Ceres, Pluto and Eris).

All systems will have a quantity of terrestrial planets:

```Roll
Terrestrial Planets = 2D-2 + DMs
```
##### Die Modifiers
+ DM-1 per post-stellar object (including primary star)
+ Reroll as D3+2 if If the resultant terrestrial planets are less than 3
+ Reroll as D3-1 if If the resultant terrestrial planets are 3 or more
### TOTAL WORLDS
A system’s value of total worlds is simply the sum of planetoid belts, gas giants and terrestrial planets, with any mainworld that is not a moon counted as one of the terrestrial planets. If it is Size 0, then it is counted as one of the planetoid belts, unless it is determined to be something else: a ring, artificial body or lone small system object. However, in general:

**FORMULA: Total Worlds**
$\text{Total Worlds} = \text{Planetoid Belts} + \text{Gas Giants} + \text{Terrestrial Planets}$
## AVAILABLE ORBITS
The location of additional stars and worlds within a system is expressed in Orbit#s as described earlier, on page 24. Planets can only occupy certain orbits around one or more star depending on the configuration of the stars and their size.
### SINGLE STAR SYSTEMS
For a single star system, determining available orbits is a straightforward process, with the only restrictions being based on the diameter of very large giant stars, which may expand far beyond Orbit# 0 to Orbit# 6 or more in extreme cases, and on the tidal effects of the star which may shred objects orbiting too closely. This tidal effect, the Roche limit, depends on a number of factors but for simplicity, this process assumes the limit is about 0.01 AU (or 1.5 million kilometres) times the listed stellar diameter. Converting this distance to Orbit#s and assuming a minimum fractional Orbit# of 0.01 provides the results of the Minimum Allowable Orbit# table.
### MULTI-STAR SYSTEM ALLOWABLE ORBITS
Star systems with multiple stars add complexity to which Orbit#s are available. The actual mechanics of such calculations, especially in trinary or more complex systems with varying eccentricities, involves a considerable amount of math followed by approximation assumptions about multi-body gravitational interactions over time. This physics-based approach, called the n-body problem, does not actually have a general solution. Instead of attempting to solve this problem or develop numerous approximate formulas for special cases a set of simplifying assumptions can approximate feasibly stable planetary orbits in multi-star systems. For this procedure, available Orbit# ranges around the primary star and any other stars in the system follow these rules:
1. Each star Minimum Allowable Orbit# or MAO is indicated on the Minimal Allowable Orbit# table. 
2. If a star has a companion, all available Orbit#s around a star and its companion are considered circumbinary – they orbit both stars, and any Orbit# less than 0.50 plus the companion’ eccentricity are not available. For stars with an MAO of greater than 0.2 add the MAO of the larger star to the range of unavailable orbits. Optionally, if the star and/or its companion are dimmer than M5 V or M5 VI stars or are brown dwarfs and if the habitable zone center (determined in the following section) lies within Orbit# 0.13, then the maximum allowable Orbit# for that star, individually, is one-quarter the minimum distance between these stars, i.e., 0.25 × (1 – eccentricity) × Companion Orbit#.
3. The primary star (and its possible companion) can have Orbit# up to 20 available. 
4. For each star in Close, Near or Far orbits, note the Orbit# of the star and consider any companions to occupy the same Orbit# as their parent. For optional orbits between them, these star pairs follow the same rule as the primary and any companion as above. For the following steps companions are ignored. 
5. For the Close, Near or Far Orbit occupied by a secondary star, consider the Orbits# +1.00 from that secondary star to be the nearest available to the primary star, e.g., if a Near star occupied Orbit# 6.10, then the range of Orbit#s from 5.10 and below and from 7.10 and above would be available to the primary star but from 5.11 to 7.09 would be unavailable. If a secondary star has an MAO of greater 0.2, add its MAO to the exclusion zone around the primary star. 
6. If the eccentricity of any Close, Near or Far secondary star is greater than 0.2, add one more Orbit# on either side of the star’s Orbit# to the primary’s unavailability zone, e.g., in the same example, if the Near star’s eccentricity was more than 0.2, then the range of Orbit#s greater than 4.10 and less than 8.10 would be unavailable to the primary star. 
7. If any Close or Near secondary star has an eccentricity of greater than 0.5, add another Orbit# on either side of the primary star’s orbit to the unavailability zone, e.g., if the Near star had an eccentricity of more than 0.5, the primary star could not use Orbit#s between 3.10 and 9.10. Note that this additional condition does not apply to Far secondary stars. 
8. Close, Near or Far secondary stars have their own centered orbits. These can extend up to an Orbit# equal to their Orbit# minus 3, e.g., the Near star in Orbit# 6.10 is allowed its own Orbit#s, centered on itself, up to Orbit# 3.10. 
9. Reduce the allowed Orbit#s for each Close, Near or Far secondary star by one Orbit# if the system has stars in the adjacent zone, e.g., stars in Close and Near, or in Near and Far, but not stars in Close and Far only, so if the Near secondary star mentioned above was in a system that also had a Far star, it would only be able to use Orbit#s up to 2.10 from its center. Note that the primary star does not trigger this condition for any stars and that the condition only triggers once, even if a Near star had both Close and Far neighbors. 
10. Reduce the allowed Orbit#s for each Close, Near or Far secondary star by one Orbit# if they or any adjacent zone star has an eccentricity greater than 0.2, e.g., for the Near star if either it or the Far star (or both) had an eccentricity of more than 0.2, then the available orbits would be reduced to 1.10 for the Near star and the Far star would also have its available Orbit#s reduced by 1.00. As above, this condition can only be triggered once per star.
11. If any Close, Near or Far star has an eccentricity of greater than 0.5, reduce the available Orbit#s of that star by another Orbit#, e.g., if the Near star’s eccentricity was greater than 0.5, then its available Orbit#s would be reduced again to 0.10. Again, this condition can only be triggered once per star.

**Table 11: Minimum Allowable Orbit\# (MAO)**

| Star Type |  Ia  |  Ib  |  II  | III  |  IV  |  V   |  VI  |
| :-------: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
|    O0     | 0.63 | 0.60 | 0.55 | 0.53 |  —   | 0.5  | 0.01 |
|    O5     | 0.55 | 0.50 | 0.45 | 0.38 |  —   | 0.3  | 0.01 |
|    B0     | 0.50 | 0.35 | 0.30 | 0.25 | 0.20 | 0.18 | 0.01 |
|    B5     | 1.67 | 0.63 | 0.35 | 0.15 | 0.13 | 0.09 | 0.01 |
|    A0     | 3.34 | 1.40 | 0.75 | 0.13 | 0.10 | 0.06 |  —   |
|    A5     | 4.17 | 2.17 | 1.17 | 0.13 | 0.07 | 0.05 |  —   |
|    F0     | 4.42 | 2.50 | 1.33 | 0.13 | 0.07 | 0.04 |  —   |
|    F5     | 5.00 | 3.25 | 1.87 | 0.13 | 0.06 | 0.03 |  —   |
|    G0     | 5.21 | 3.59 | 2.24 | 0.25 | 0.07 | 0.03 | 0.02 |
|    G5     | 5.34 | 3.84 | 2.67 | 0.38 | 0.10 | 0.02 | 0.02 |
|    K0     | 5.59 | 4.17 | 3.17 | 0.50 | 0.15 | 0.02 | 0.02 |
|    K5     | 6.17 | 4.84 | 4.00 | 1.00 |  —   | 0.02 | 0.01 |
|    M0     | 6.80 | 5.42 | 4.59 | 1.68 |  —   | 0.02 | 0.01 |
|    M5     | 7.20 | 6.17 | 5.30 | 3.00 |  —   | 0.01 | 0.01 |
|    M9     | 7.80 | 6.59 | 5.92 | 4.34 |  —   | 0.01 | 0.01 |

\* See the Special Circumstances chapter for the MAO of post-stellar objects and brown dwarfs.
## DETERMINING HABITABLE ZONE CENTRE ORBIT# (HZCO)
An important factor to consider when placing planets is the location of the habitable zone around a system’s stars. Many factors can determine whether a world’s surface temperature is actually amicable to life but from an Orbit# standpoint, it is possible to determine a base ideal habitable zone orbit. This is the location where a planet similar to Terra will have conditions similar to Terra, namely an average surface temperature of about 15°C or 288K. Working backwards, by definition this corresponds to an orbit of 1 AU around a star with 1 luminosity. The relationship between temperature, distance and luminosity is:

**FORMULA: Temperature relationship with luminosity and distance
$\text{Temperature} ≈ \sqrt[4]{\frac{\text{Luminosity}}{\text{Distance}^{2}}}$

Considering temperature to be constant and solving for distance:

**FORMULA: Distance based on Luminosity
$\text{Distance} ≈ \sqrt[2]{\text{Luminosity}}$

Or the distance of Terran-equivalent habitable zone – defined here as the Habitable Zone Centre Orbit# or HZCO – is equal to the square root of the star’s luminosity. Plugging this into the Star Luminosity by Class table gives the following values in AU in the table above.

This table only applies to single stars. For circumbinary worlds of a star with a companion, the total luminosity of the two components can be added together to determine the effective location of the HZCO. Multiple stars in other orbits, especially if those orbits are outside the location of the world in question, become more complex but such effects will be considered in detail later. As a first pass for determining the habitable zone center, all stars with a lower Orbit# number than the planet, i.e., all of the stars the planet effectively orbits, are simply added together to arrive at a combined luminosity value to use in the distance equation.

Converting the above AU values into Orbit#s results in the table Habitable Zone Center Orbit#s (HZCO):

 **Table 12: Habitable Zone Center (AU)**
 
| Star Type |  Ia   |  Ib   |  II   |  III  |  IV  |   V   |  VI   |
| :-------: | :---: | :---: | :---: | :---: | :--: | :---: | :---: |
|    O0     | 1,844 | 1,789 | 1,643 | 1,549 |  —   | 1,483 | 13.4  |
|    O5     | 1,049 |  949  |  854  |  714  |  —   |  574  | 8.54  |
|    B0     |  539  |  374  |  316  |  268  | 214  |  187  | 5.39  |
|    B5     |  400  |  167  |  94   | 40.0  | 33.2 | 23.5  | 3.32  |
|    A0     |  361  |  148  |  89   | 14.8  | 11.8 | 6.56  |   —   |
|    A5     |  346  |  141  |  85   | 9.49  | 5.74 | 3.87  |   —   |
|    F0     |  346  |  141  |  84   | 8.37  | 5.00 | 2.85  |   —   |
|    F5     |  346  |  141  |  83   | 6.24  | 2.45 | 1.87  |   —   |
|    G0     |  346  |  141  |  82   | 11.0  | 3.16 | 1.18  | 0.85  |
|    G5     |  332  |  141  |  84   | 14.1  | 3.74 | 0.88  | 0.66  |
|    K0     |  332  |  145  |  88   | 16.1  | 4.80 | 0.72  | 0.48  |
|    K5     |  346  |  148  |  92   | 23.0  |  —   | 0.46  | 0.29  |
|    M0     |  361  |  155  |  94   | 24.5  |  —   | 0.29  | 0.16  |
|    M5     |  316  |  161  |  94   | 26.8  |  —   | 0.054 | 0.027 |
|    M9     |  300  |  138  |  85   | 34.6  |  —   | 0.017 | 0.014 |
**Table 13: Habitable Zone Center Orbit\#s (HZCO)**

| Star Type |  Ia  |  Ib  |  II  | III  |  IV  |  V   |  VI  |
| :-------: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
|    O0     | 14.5 | 14.4 | 14.3 | 14.3 |  —   | 14.2 | 7.3  |
|    O5     | 13.7 | 13.5 | 13.4 | 13.2 |  —   | 12.9 | 6.7  |
|    B0     | 12.8 | 12.2 | 12.0 | 11.7 | 11.4 | 11.2 | 6.0  |
|    B5     | 12.3 | 11.1 | 10.2 | 9.0  | 8.6  | 8.2  | 5.2  |
|    A0     | 12.2 | 10.9 | 10.2 | 7.5  | 7.2  | 6.3  |  —   |
|    A5     | 12.1 | 10.8 | 10.1 | 6.9  | 6.1  | 5.5  |  —   |
|    F0     | 12.1 | 10.8 | 10.1 | 6.7  | 5.9  | 5.0  |  —   |
|    F5     | 12.1 | 10.8 | 10.1 | 6.2  | 4.7  | 4.2  |  —   |
|    G0     | 12.1 | 10.8 | 10.1 | 7.1  | 5.2  | 3.3  |  —   |
|    G5     | 12.1 | 10.8 | 10.1 | 7.4  | 5.4  | 2.6  | 2.5  |
|    K0     | 12.1 | 10.8 | 10.2 | 7.6  | 5.8  | 2.1  | 1.9  |
|    K5     | 12.1 | 10.9 | 10.2 | 8.1  |  —   | 1.2  | 1.3  |
|    M0     | 12.2 | 11.0 | 10.2 | 8.2  |  —   | 0.72 | 0.40 |
|    M5     | 12.1 | 11.1 | 10.2 | 8.4  |  —   | 0.13 | 0.07 |
|    M9     | 12.0 | 10.8 | 10.1 | 8.8  |  —   | 0.04 | 0.03 |
### HABITABLE ZONE BREADTH
The entire habitable breadth zone of a star (or combination of stars) stretches across two full Orbit#s or +1.0 Orbit#s from the HZCO. This means that a world’s deviation from the HZCO can be computed as simply:

**FORMULA: HZCO Deviation**
$\text{HZCO Deviation} = \text{Orbit\#} - \text{HZCO}$

A negative number implies the orbit is closer to the sun and therefore hotter, and a positive number is further and therefore colder. This provides a value for all calculations of habitable zone and basic temperature above Orbit#1.

If either the HZCO or the Orbit# of the world lies below Orbit#1, the calculation becomes more complicated. The same basic subtraction occurs but the result is modified by dividing by the smaller of the HZCO or the worlds’ Orbit number and will result in a greater effective deviation. 

**FORMULA: Effective HZCO Deviation**
$\text{Effective HZCO Deviation} = \frac{\text{Orbit\#} - \text{HZCO}}{\text{smaller of Orbit\# or HZCO}}$

This calculation is not perfect but provides a good estimation of deviation from the HZCO to use in the Basic Temperature section table. For more accurate temperature, the Referee should use the Mean Temperature Determination process that starts immediately after the Basic Temperature section. The effective HZCO Deviation equation does not provide simple values for habitable zone breadth determination but the Referee can plug values into the equation based on various orbits to determine the bounds of temperature regions for use in the Step 3d when placing existing mainworlds in the following section.
### PLACEMENT OF WORLDS
With the ranges of available Orbit#s determined and the location of the HZCO computed, the Referee can place the worlds within a system. The placement process assigns orbit slots to stars and star combinations and determines the Orbit# of each orbit slot, then places worlds within those slots.

Disclaimer: The placement of worlds is a multistep process. It is straightforward in single star systems but possibly complex in multiple star systems, especially one as complex as the Zed example. In most cases the results of following this process are workable but in certain edge cases, both processes and results may become difficult to implement. As none of the values determined below for baseline number or spread are based on underlying physics, and although the process requires these variables to proceed, the Referee is free to ignore the dice and impose different values for these factors if it makes any system easier to develop or better matches a pre-existing vision of how to distribute worlds or how the orbits should line up. Likewise, this process places planets and planetoid belts arbitrarily. To make a star system match a pre-existing description or a design the Referee envisions, any planets can be placed as desired rather than as the dice fall and any available orbit around any star can be used as an orbit slot.
#### STEP 1: ALLOCATIONS BY STAR IN SYSTEMS (MULTIPLE STARS ONLY)
Single star systems skip this step. In systems with multiple stars, planets could orbit different stars. To determine how many worlds are in orbit around each star: for every star (or star pair) total the available potential Orbit#s – determined in the [[#AVAILABLE ORBITS|Available Orbits]] Section – and if that star does not have a companion but has at least some non-zero number of allowable orbits, add 1. Once all of a star ’s Available Orbits are added (possibly plus 1), round down any fractional remainder to determine each star’s Total Star Orbits.

**FORMULA: Total Star(X) Orbits**
$\text{Total Star(X) Orbits} = \sum{\text{Star(X)'s Allowable Orbits (with fractions)} + 1 \text{ if no Companion}^{*}}$
$^{*}\text{Only if the star had more than zero previously computed Allowable Orbits. Allowable orbits must be greater than 1}$
$\text{Round down resulting Total Star Orbits to nearest whole number}$

See the example for clarification. Next, add up the Total Star Orbits to compute the Total System Orbits.

**FORMULA: Total System Orbits**
$\text{Total System Orbits} = \text{Total Star(1) Orbits} + \text{Total Star(2)} + \text{...} + \text{Total Star(Last) Orbits}$

Next to determine how many worlds are assigned per star, multiply the Total Worlds by that star’s Total Star Orbits and divide by the Total System Orbits.

**FORMULA: Star(N) Worlds**
$\text{Star(N) Worlds} = \frac{\text{Total Worlds} x \text{Total Star(N) Orbits}}{\text{Total System Orbits}}$
$\text{round up for Star(1), down for Star(2) to Star(Last-1), assign all remaining worlds to Star(Last)}$

Calculate this value for each star starting with the primary star and working ‘outward’ to stars in their ascending Orbit#. For the system’s primary star, round this value up, for intermediate stars, round down, and for the outermost star, assign all remaining worlds. The example below walks through this process for a fairly complex system:

```Example
For the Zed system’s total worlds of 17, the allocation would proceed in this manner: The total Orbit#s for each star (or pair) was established when determining multi-star available orbits. Those values where Star Aab, 13.39, Star B 1.08, Star Cab, 6.36. Star B does not have a companion, so it adds 1 to its total to get 2.08. This rounds down to 13, 2 and 6 so Total System Orbits is 13 + 2 + 6 equals 21. Next, the number of worlds per star is determined for each star (or pair). Star Aab receives 17 × 13 ÷ 21 = 10.52, rounded up to 11, Star B receives 17 × 2 ÷ 21 = 1.62, rounded down to 1, and Star Cab gets the remainder, which is 17 - 11 - 1 = 5.
```
#### STEP 2: DETERMINE SYSTEM BASELINE NUMBER
Although the number of worlds is already determined, the location and spread of their orbits is not. Some systems will be compact, with many worlds inside the habitable zone, while others might be sparce, with just a few scattered worlds. The baseline number is the sequence number of the planetary object closest to the HZCO. In the Sol system, this world is Terra, and the baseline number is 3. A low baseline number creates a sparce planetary system with many worlds in the cold outer zone. A high baseline number creates a compact system with many worlds inside the habitable zone entirely. It is possible the entire planetary system lies inside the habitable zone or that all the worlds lie outside it.

In some instances, specifically in multi-star systems with one or more close stars, the HZCO is unavailable for placement of an orbit. These systems can have two configurations. In the simplest case, there are no orbits available to the primary star(s) until beyond the close stars(s). In this case, the baseline number is set to 0 and the first orbit occurs beyond the orbits not allowed by the close star(s). This system is considered ‘cold’. 

In the second case, some orbits are available to the primary star(s) prior to the unallowed zone. In this case, a random number of orbits are available to the primary stars in this space between their MAO and the region blocked by the next star(s). This number may be between 0 and the total number of orbits allocated to the primary star(s) as determined randomly or deliberately by the Referee but orbits should be separated by a minimum of 0.01 Orbits. For these ‘split’ systems, the baseline number is one more than the number of orbits placed in this inner region.

If the HZCO is available to the primary star(s), to determine baseline number for the primary star, roll 2D and apply the listed DMs:

**FORMULA: Baseline Number**
$\text{Baseline Number} = \text{2D} + \text{DMs}$

**Die Modifiers**
- Primary star is Class Ia, Ib, or II: DM+3
- Primary star is Class III: DM+2
- Primary star is Class IV: DM+1
- Primary star is Class VI: DM-1
- Primary star is a post-stellar object: DM-2
- Total worlds less than 6: DM-4
- Total worlds 6-9: DM-3
- Total worlds 10-12: DM-2
- Total worlds 13-15: DM-1
- Total worlds 18-20: DM+1
- Total worlds more than 20: DM+2
- For each secondary star (cumulative): DM-1

If the baseline number is greater than the total worlds, all of the star’s worlds orbit closer than the HZCO; if a pre-existing mainworld’s characteristics contradict this, it retains its position but becomes the outermost world of the system, if possible. If the baseline number is 0 or less, then all of the worlds have orbits outside the HZCO, with the same caveat for pre-existing mainworlds, which would then become the innermost world.

Since the baseline number determines the entire structure of the system, the Referee should feel free to modify this result if it creates a system different from what the Referee envisions. In some multi-star systems, the Referee may decide to treat each star separately and determine a baseline number for each based on their allocation of planets.

```Example
For the Zed system, with 17 worlds, the DMs are -2 for the companion and -2 for the secondary stars. A roll of 9 - 4 equals a baseline number of 5, indicating the Orbit# of the fifth world is located nearest the primary star’s HZCO.
```
#### STEP 3: DETERMINE SYSTEM BASELINE ORBIT
The baseline Orbit# is the actual orbital location of the world in the baseline number slot. For the continuation method and when a mainworld is known to be within the habitable zone, this is the Orbit# of the mainworld. Determination of the baseline Orbit# can proceed by one of four methods based on the conditions below:
1. The baseline number is between 1 and the system’s total worlds,
2. The baseline number is less than 1,
3. The baseline number is greater than the system’s total worlds
If the results of any of these processes place the baseline Orbit# in an unavailable Orbit#, the Referee should place the baseline orbit at the nearest available Orbit# with 2D-7 ÷ 10 Orbit# variance always moving the orbit ‘into’ the allowable zone regardless of the sign of the result. In the continuation method, if that placement is unacceptable because of a known mainworld environment, the Referee may need to move stars to different Orbits#.
##### STEP 3A: BASELINE NUMBER IS BETWEEN 1 AND THE SYSTEM’S TOTAL WORLDS
If the baseline number meets this condition, then it should correspond to a world lying well inside the habitable zone. Determine the exact location of this baseline Orbit# by rolling 2D-7 and dividing by 10 (or by 100 if the HZCO is less than 1.0) to determine the +0.5 (or 0.05) Orbit# variance.

**FORMULA: Baseline Orbit\# between 1 and Total System Worlds**
$\text{If HZCO greater than or equal to 1.0:}$
$\text{Baseline Orbit\#} = \text{HZCO} + \frac{(\text{2D} - 7)}{10}$
$\text{Or, if HZCO less than 1.0:}$
$\text{Baseline Orbit\#} = \text{HZCO} + \frac{(\text{2D} - 7)}{100}$

```Example
Zed’s baseline number of 5 meets condition a) above and places the fifth world’s orbit within the habitable zone. The combined luminosity of Zed’s Aab pair is 1.419 which corresponds to the HZCO being Orbit 3.3. Rolling 2D-7 to scatter the actual orbit of the fifth world by +0.5 Orbits results in a -2, making the baseline Orbit equal to 3.3 + (-2 ÷ 10) = 3.1. Therefore, of the 11 worlds whose orbits are based on the Aab primary, four worlds are within Orbit# 3.1 and six are further away from the stars.
```
##### STEP 3B: BASELINE NUMBER IS LESS THAN 1
If the baseline number is less than 1, all of the system’s worlds are further than the primary star’s HZCO. This is a cold system. The first orbit is beyond a point either based on the primary star(s) minimum Orbit#, its HZCO or MAO, whichever is greater. To determine the baseline Orbit#, subtract this negative (or zero) number (i.e., add the absolute value) - or a tenth of the baseline Orbit# if the HZCO is less than 1.0 – from the value of the HZCO and add a variance:

**FORMULA: Baseline Orbit\# Less Than 1**
$\text{If minimum Orbit\# greater than or equal to 1.0:}$
$\text{Baseline Orbit\#} = \text{HZCO} - \text{Baseline Number} + \text{Total Worlds} + \frac{(\text{2D} - 2)}{10}$
$\text{Or, if minimum Orbit\#  less than 1.0:}$
$\text{Baseline Orbit\#} = \text{Minimum Orbit\#} - \frac{\text{Baseline Number}}{10} + \frac{(\text{2D} - 2)}{100}$
##### STEP 3C: THE BASELINE NUMBER IS GREATER THAN TOTAL WORLDS
If the baseline number is greater than the total worlds, all of the primary star’s worlds are closer than its HZCO. This is a hot system. The baseline Orbit# becomes the Orbit# of the outermost planet circling the primary star. This Orbit# is equal to the HZCO minus the baseline number plus the total worlds. If either the HZCO or the result of this calculation is less than 1.0, then compute it as the HZCO minus baseline number divided by 10 plus the total worlds divided by 10. A variance can be added to the result.

**FORMULA: Baseline Orbit\# Greater Than Total System Worlds**
$\text{If HZCO – baseline number + total worlds is greater than or equal to 1.0 then:}$
$\text{Baseline Orbit\#} = \text{HZCO} - \text{Baseline Number} + \text{Total Worlds} + \frac{(\text{2D} - 7)}{5}$
$\text{Or, if HZCO – Baseline Number + total worlds is less than 1.0 then:}$
$\text{Baseline Orbit\#} = \text{HZCO} - \frac{(\text{Baseline Number} + \text{Total Worlds} + \frac{(\text{2D} - 7)}{5})}{10}$

If the latter formula still results in a negative number, then treat the baseline Orbit as the HZCO – 0.1 but no lower than the primary star’s MAO + the primary star’s total worlds x 0.01.
#### STEP 4: EMPTY ORBITS
In some systems the relatively neat progression of orbits is disrupted by an empty orbit not occupied by a planet or planetoid belt. Rolls for these orbital slots is assumed to be performed for the entire system but a Referee may choose to add more variance to a multi-star system by rolling for empty and anomalous orbits for each star in the system, rather than for the system as a whole. For each system (or star) check for the presence of an empty orbit with a 2D roll on the Empty Orbits table to determine the quantity.

**Table 14: Empty Orbits**

| <br>2D | Empty<br>Orbits |
| :----: | :-------------: |
|   9-   |        0        |
|   10   |        1        |
|   11   |        2        |
|   12   |        3        |

Empty orbits first increase the number of orbital slots available to a star – to make room for the gap without removing planets. Each empty orbit adds an orbital slot to its star(s)’s total orbits. Only stars with some available orbits can have an empty orbit allocated. In multi-star systems, if rolling for the entire system, empty orbits are placed (if possible) in Close, then Near, then Far star orbits, with the remainder allocated to the primary star.

```Example
For the Zed system, empty orbits are rolled for the system as a whole. The roll is a 10, indicating one empty orbit. Since the Near star (B) has a non-zero number of orbits allocated, it receives the extra orbital slot – note that this does not necessarily mean the empty orbit will be placed around the Near star, just that the extra slot goes to Zed B increasing its allocation from 1 to 2.
```
#### STEP 5: DETERMINE SYSTEM SPREAD
The spread is the average separation between Orbit#s for the system’s planets and planetoid belts. If the baseline number is less than 1, treat baseline number as 1 for spread calculations.

Determine the spread by subtracting the baseline Orbit# by the [[#Table 10 Minimum Allowable Orbit (MAO)|Minimum Allowable Orbit#]] for the parent star or the MAO by a parent star and its companion then divide the result by the baseline number. This value is the default fractional Orbit# separating worlds within the system:

**FORMULA: Spread**
$\text{Spread} = \frac{(\text{Baseline\#} - \text{MAO})}{\text{Baseline}}$

In some cases, especially where the baseline number is 1 or less and planets are plentiful, or if many Orbit#s are unavailable, the spread can become so large that the outermost planet in a system would be placed beyond Orbit# 20. If so, adjust the spread such that:

**FORMULA: Maximum Spread**
$\text{Maximum Spread} = \frac{\text{Primary star(s) Available Orbits}}{\text{Primary's Allocated Orbits} \ + \ \text{Total Stars}}$

For orbits around secondary stars, the spread value for these stars defaults to the system’s spread value but if the star (or star and companion pair) range of orbits, from MAO to the outermost allowed Orbit#, divided by the number of worlds is more than the system spread, then the spread can be changed to:

**FORMULA: Maximum Secondary Spread**
$\text{Maximum Secondary Spread} = \frac{\text{Outermost Allowable Orbit\#} \ - \ \text{Secondary MAO}}{\text{Secondary's Allocated Orbits} \ + 1}$

In rare cases, large spread and baseline values and a series of random rolls may still place orbital slots beyond Orbit# 20 or a secondary star’s allowed orbits. If so, the Referee can adjust the spread to a smaller value. The spread is designed to allow variations of orbital configurations but cannot account for all variables.

**Optional Rule:** In addition to the above spread limitation, for multi-star systems, each star or pair of stars can have their own baseline numbers, baseline Orbit#s and spreads, allowing for more compact planetary orbits around dimmer stars, if desired. Each spread would apply only to the worlds in direct orbit around that star or a star and companion pair. The total worlds DM would then be based on each star’s (or star and companion) allocated worlds.

```Example
The Zed system will not use this optional rule. For Zed, the baseline Orbit# is 3.1 and the MAO for Aab is 0.61. Dividing (3.1 - 0.61) by the baseline number of 5 results in 0.498 which rounds to 0.50.
```
#### STEP 6: PLACING ORBIT\#S
For Orbit#s inside the baseline, add the spread to the star’s MAO value to determine the slot for the innermost world’s Orbit#. If the Referee desires additional variation in Orbit# placement, a 2D-7 roll times one-tenth of the spread can provide that variety:

**FORMULA: Inner Slot Orbit\#**
$\text{Inner Slot Orbit\#} = (\text{MAO} \ + \ \text{Spread}) \ + \ \frac{(\text{2D} \ - \ 7) \ \times \text{Spread}}{10}$

Using an optional variance provides variety at the cost of complexity. Add the spread to this innermost slot to determine the distance to the next orbit slot’s Orbit#, and so on:

**FORMULA: Next Slot Orbit\#**
$\text{Next Slot Orbit\#} = (\text{Previous Slot Orbit\#} \ + \ \text{Spread}) \ + \ \frac{(\text{2D} \ - \ 7) \ \times \text{Spread}}{10}$

If using a variance, the Referee should decide whether to use the un-varied Orbit# value of the slot as a starting point for the next spread addition. Using cumulative varied values with many inner Orbit#s risks the chance the Orbit# slot just prior to the Baseline Orbit# becomes very close to, or possibly even larger than, the baseline Orbit#. With the expanded method, the Referee can choose to consider the baseline Orbit# as only a convention to establish spread, and let all orbital slots fall as the dice indicate.

**Optional Rule:** In very compact systems, the Referee may choose to separate each orbital slot by a minimum of 10–20% of the distance from the previous slot. Within an Orbit#, the 10% difference is approximately a 10:11 orbital period resonance; 20% is a 5:6 resonance. Existing exoplanet orbital resonances of 6:7, (16⅔%) have been discovered. Beyond Orbit#3, distances between whole Orbit# start to increase, so this limitation only applies within the same whole Orbit#. Alternatively, the Referee may choose to compare orbital slots using their AU values to determine true separation and orbital period relationships. The easiest method is to add 10% to the Orbit# (or AU) if the current orbital slot is within 10% of the previous.

Orbits# slots outside the baseline number slot are determined by continuing to add the spread to slots above the baseline Orbit#. If multi-star system considerations cause an Orbit# result to be unavailable, then add the width of that exclusion zone to the spread value to place the next slot.

```Example
With Zed Aab’s MAO of 0.61, the Orbit# for the innermost orbital slot is determined as the MAO plus the spread of 0.5 and a variance, which in this case is a 2D roll of 5, so the first Orbit# becomes 0.62 + 0.5 = 1.11 +((5-7) x 0.5) ÷ 10, which is 1.01. This rounds to 1.0 for the fractional orbit, as the Referee has chosen to stick with a single digit fractional above 1.0. Next, the second slot is based off this 1.0 to become 1.5 with a roll of 9 on 2D creating a variance of 0.1 or Orbit# 1.6 for a final value. The third orbit ends up with no variance and is just 1.6 + the 0.5 spread, or Orbit# 2.1. The fourth becomes 2.1 +0.5 +a variance of 0.1 or Orbit# 2.7, and the fifth is the baseline number world with the predetermined baseline Orbit# 3.1.

For orbital slots outside the baseline, continue to add the spread and variance, if any: slot six is at Orbit# 3.5, seven at Orbit# 4.1, eight at Orbit# 4.6.

The ninth slot should be at Orbit# 5.2 but that Orbit# is excluded by the presence of star B. This exclusion range is from Orbit#s 5.11 to 7.09 a difference of essentially 2.0, so adding that difference to 5.2 gives Orbit# 7.2 as the location for the nineth orbit of Zed Aab, which is actually the first circumtrinary orbit around AB. The tenth orbit then proceeds to Orbit# 7.8 and finally the eleventh is at Orbit# 8.3, which is still below the star of the next exclusionary zone which begins after Orbit# 10.1.

For star B now with two slots, its Orbit# will be the MAO + Spread. A K8 V star has a MOA of 0.02, therefore the orbital slot of B’s world is at Orbit# 0.52 and the variance roll is a 7, so it does not change. The second orbit is placed at Orbit #1.02, which the Referee rounds to Orbit #1.0. As this Orbit is below the maximum allowed Orbit# of 1.1 there is no reason to adjust the spread.

For the star Cab pair, with five orbits to place in the potential range of Orbit#s 0.74 – 7.1, there is likewise no need to adjust the 0.5 Orbit# Spread. The pair’s MAO is 0.74, adding the spread and a variance (rolling a 10) results in: 0.74 + 0.5 + 0.15 or 1.39, which rounds to Orbit# 1.4. The second orbit has a variance of -0.1, so it becomes Orbit# 1.8. The third of Cab’s orbital locations is 1.8 + 0.5 - 0.05, which rounds up to Orbit# 2.3. The fourth orbit is 2.3 + 0.5 + 0.1 = Orbit# 2.9 and the fifth 2.9 + 0.5 – 0.15 rounded up to orbit #3.3.
```
#### STEP 7: ADD ANOMALOUS PLANETS
An anomalous orbit is one that does not follow the system’s regular orbit pattern. The planet occupying this orbit may be a captured body, or just a world in an unusual orbit, such as one that is inclined, retrograde or highly elliptical. It could even be a trojan world co-orbiting with another planet either 60° ahead or behind it in orbit. Roll 2D on the Anomalous Orbits table.

If anomalous orbits exist, the count of terrestrial planets (and total worlds) is increased by one for each anomalous orbit. Consult the Anomalous Orbit Type table for details on this planet’s orbital slot.

**Table 15: Anomalous Orbits**

| 2D  | Anomalous Orbits |
| :-: | :--------------: |
| 9-  |        0         |
| 10  |        1         |
| 11  |        2         |
| 12  |        3         |

The maximum number of terrestrial planets in any system is 13. If adding anomalous orbit increases this amount beyond 13, then any additional anomalous orbits add planetoid belts to the system instead and increase the total worlds accordingly.

**Table 16: Anomalous Orbit Type**

|  2D   |   Description    |
| :---: | :--------------: |
|  7-   |   Random orbit   |
|   8   | Eccentric orbit  |
|   9   |  Inclined orbit  |
| 10-11 | Retrograde orbit |
|  12   |   Trojan orbit   |
**Random orbit:** The location of the orbit does not correspond to the spread pattern. In a multi-star system, randomly assign the orbit to a star or star pair that has a non-zero number of allowable orbits. For the assigned star(s), roll 2D-2 to determine the Orbit# value and add d10 to determine the fractional value. If the random roll results in an unavailable orbit, the Referee can allow some leeway to account for the orbit’s anomalous nature or can add or subtract 1D to the Orbit# result; this can be repeated as necessary but no Orbit# value should be less than the MAO or exceed 20.0. In compact systems, the Referee may choose to use spread as a multiplier to the 2D-2 roll rather than Orbit# but should avoid multipliers below 0.5 in systems with many worlds. A random orbit has a DM+2 when rolling on the Eccentricity Values table.

**Eccentric orbit:** Assign the orbit using the random orbit procedure above but apply DM+5 when rolling on the Eccentricity Values table.

**Inclined orbit:** Assign the orbit using a random orbit procedure above and apply DM+2 when rolling for eccentricity. Determine inclination by rolling 1D+2 × 10° and possibly adding d10 for additional variance. In notes on IISS forms, indicate the orbit as ‘Inclined XX°’ with XX as the number of degrees. As inclination is not normally considered for Traveller orbits, this may be more for flavor than for effect.

**Retrograde orbit:** Assign the orbit using the random orbit procedure above and apply DM+2 when rolling for eccentricity. On IISS forms, mark the Orbit# as within an ‘R’ postscript or a place leading negative sign in its period field or indicate ‘retrograde’ in the notes field. If desired, the Referee may also wish to declare the orbit as inclined and determine inclination by using the Inclined orbit procedure above and adding 90° to the result.

**Trojan orbit:** The planet occupying this Orbit# is either leading (on a 1D result of 1–3) or trailing (4–6) another world with the same Orbit# by 60°. Pick the Orbit# the planet will occupy using the placing worlds procedure prior to placing any worlds but after placing any other anomalous orbits. This Orbit# cannot be empty, so any subsequent roll of empty for the slot with a trojan orbital companion should be placed in an available unassigned slot using the following precedence: immediately inward, next available outward, random reroll until an available slot is found. A planet in a trojan orbit will share the orbital characteristics of Orbit# and eccentricity, and of inclination, if indicated, as the other occupant of the slot. The world in the trojan orbit is considered the least massive of the worlds in that orbital slot. It is possible, although rare, to have a planet at both the leading (or L4) and trailing (or L5) trojan locations of another planet.

```Example
For Zed a roll of 10 for anomalous orbits adds an orbit and a terrestrial world, bringing the total count up to 12 terrestrials and total worlds to 18 and now it needs to be typed and assigned: 

Rolling on the Anomalous Orbit Type table results in a 10, or a retrograde orbit, which is also random. To determine the star(s) which the anomalous world will be orbiting, the Referee considers the three ‘parent’ orbital groupings of primary(Aab), Near(B) and Far(Cab) and rolls D3, receiving a 1 and assigning the extra world to the Aab set of stars. Rolling 2D-2 for Orbit# results in a 5 with a d10 adding a 2, so 5.2 for the anomalous retrograde Orbit. This is technically outside the allowed orbit range because of the nearby star B in orbit 6.10 but as it is close (within 10%) to the allowable limit, the Referee allows it, rationalising that this orbit could be in some sort of resonance keep-away from the star or could be unstable over long periods. 

The random orbit from the anomalous world has been inserted in the primary and companion stars’ Aab Orbit sequence as ‘A1’ to give that pair of stars a total of twelve orbits.
```
#### STEP 8: PLACING WORLDS
After determining all the orbit slots in the system, worlds are placed into those slots in the following order: mainworld (if pre-existing), empty orbits, gas giants, planetoid belts, then terrestrial planets. To initiate the process, the Referee should list the orbital slots, starting with the primary star(s)’s slots, then moving on to any other stars in an outward order. In complex multi-star environments, Orbit#s around the primary and other stars, i.e., those with Orbit# numbers based on the primary star, should be listed prior to those for the other stars themselves, although this is not required. 

After compiling the list, determine a method to randomly select an orbital slot. One method to accomplish this is to assign each slot a number from 1 to 6, repeating as necessary if more than six worlds exist. Then for each set of 1–6, assign a prefix number beginning with 1, so the first orbit will be 1:1 and the seventh 2:1 and so on. In most systems this prefix number will range from 1 to 2 or 3, although systems with more than 18 worlds will require a 4. The prefix number can be treated as a D2 or D3 or even 1D in the case of those very dense systems. With a 1D prefix, rolls above the top prefix number (6 and likely 5) are rerolled. See the Zed example for a walkthrough of this process. 

Mainworlds with no climate-based pre-existing information determined could be in any orbital slot but those with atmospheres 4–9 will almost always be in the baseline slot or adjacent to it as informed by the Habitable Zone Regions table on page 42. Boiling worlds should be placed at least 1.0 full Orbit#s inside the HZCO (or 0.1 if dealing with Orbit#s less than 1.0), frozen worlds at least 1.0 (or 0.1) full Orbit#s outside the HZCO. If the mainworld is known to be a moon, then both the mainworld and its parent planet should occupy the proper slot. 

If a mainworld is not known to be a moon, but being a moon is not excluded, this world placement method may randomly determine a parent planet for it if that orbit subsequently houses a gas giant. If this occurs, the system gains one more terrestrial planet to place in an orbit. If the mainworld is Size 1 and a planetoid belt is placed in its orbit, the Referee could choose to roll again or could consider the mainworld to be inside this planetoid belt as a significant body – in that case the system would also gain one more terrestrial planet to place. 

For each world (or empty orbit) in the order indicated above, roll the dice and place the world in the slot indicated. If a world already occupies the slot, add one to the result (if it is the last slot in the system, go back to the first empty slot). The exceptions to this rule are noted above: mainworlds that could randomly have a gas giant parent or Size 1 mainworlds that could be within a planetoid belt. In those cases, the gas giant or belt becomes the primary ‘world’ of that orbit and the mainworld becomes a subordinate world in that orbit and an additional terrestrial world can be placed in the left-over orbit. Additionally, anomalous orbital slots are exempt from placement of empty orbits; if this occurs, roll again. 

Once all the empty orbits, gas giants and planetoid belts are placed, fill the remaining orbits with terrestrial planets.

```Example
For the Zed star system, consider the orbit table opposite. The ‘empty’ additional orbit slot has been placed in order as ‘B+’ in the sequence to give B two orbits to allocate. The random orbit from the anomalous world has been inserted in the primary and companion stars’ Aab Orbit sequence as ‘A+’ to give that pair of stars a total of 12 orbits. With 19 orbits, the prefix is 1D with only 1–4 as valid results and with a following 1D, which on a prefix of 4, anything but a 1 would require a reroll

Since there is no mainworld established, the empty orbit is determined first as: 3:3 or orbit slot C1. This is the orbit closest to the Cab pair, so the Referee decides, for no other reason than it is the Referee’s discretion to change or alter any of these rolls to create the desired vision of the system, to modify this result and use orbit slot C2 (the 3:4 result) instead.

Next, the Referee places the four gas giants and then two planetoid belts randomly. Ignoring a slew of rerolls, the results are gas giants at 3:5 (C3), then 1:5 (A5). The next roll is also 1:5 – this already exists, so 1 is added to the second dice to get 1:6 (Aab6) and finally 2:6 (A11).

Next, the two planetoid belts will be at 3:3 – the one orbit the Referee did not want empty – this time the roll stands and it becomes a belt. The second planetoid belt is at 1:4 (A4).

Next, the remaining orbits (not the one marked as empty) will be filled with terrestrial planets. The completed picture of worlds in orbit around the five stars of Zed look like this:

| Orbit Slot  | 1D:1D | Star  | Orbit# | World              |
| :---------- | :---- | :---- | :----- | :----------------- |
| A1          | 1:1   | Aab   | 1.0    | Terrestrial Planet |
| A2          | 1:2   | Aab   | 1.6    | Terrestrial Planet |
| A3          | 1:3   | Aab   | 2.1    | Terrestrial Planet |
| A4          | 1:4   | Aab   | 2.7    | Planetoid Belt     |
| A5          | 1:5   | Aab   | 3.1    | Gas Giant          |
| A6          | 1:6   | Aab   | 3.5    | Gas Giant          |
| A7          | 2:1   | Aab   | 4.1    | Terrestrial Planet |
| A8          | 2:2   | Aab   | 4.6    | Terrestrial Planet |
| A+          | 2:3   | Aab   | 5.2R   | Terrestrial Planet |
| A9          | 2:4   | AB    | 7.2    | Terrestrial Planet |
| A10         | 2:5   | AB    | 7.8    | Terrestrial Planet |
| A11         | 2:6   | AB    | 8.3    | Gas Giant          |
| B1          | 3:1   | B     | 0.52   | Terrestrial Planet |
| B+          | 3:2   | B     | 1.0    | Terrestrial Planet |
| C1          | 3:3   | Cab   | 1.4    | Planetoid Belt     |
| C2          | 3:4   | Cab   | 1.8    | Empty              |
| C3          | 3:5   | Cab   | 2.3    | Gas Giant          |
| C4          | 3:6   | Cab   | 2.9    | Terrestrial Planet |
| C5          | 4:1   | Cab   | 3.3    | Terrestrial Planet |
```
#### STEP 9: DETERMINING ECCENTRICITY
Like stars, planets can – and most often do – have orbits that are not exactly circular but exhibit some eccentricity. Planetoid belts do not have intrinsic eccentricities, but individual planetoids do, and these can be determined later if desired. For each world, determine the eccentricity of its orbit around its star(s) using the [[#Table 8 Eccentricity Values|Eccentricity Values]] table, adding any DMs listed with the table or received from anomalous orbit types.

Determining a planet’s eccentricity is not required but it will add realism to a system and may have significant effects on temperature variability in the course of a world’s orbit. In some cases, eccentric orbits of planets may result in crossing conditions. These do not necessarily raise the risk of collisions, other factors, such as orbital inclinations and periodicity likely prevent collisions in these systems, or else at least one of the crossing planets would not exist – at least not for long. For example, in the Solar System, the orbits of Neptune and Pluto cross but the two worlds never come closer than 17 AU from each other. If the Referee has chosen to use all six orbital characteristics for all stars and planets, these factors need to be explicitly explored but as this is not recommended, they can be assumed to be in effect for planetary orbits which appear to cross.
### PLANETARY ORBITAL PERIODS  (LENGTH OF ‘YEARS’)
A basic value to determine is the time a planet takes to orbit its sun(s). This is usually straightforward for a planet orbiting a single star, slightly more complicated if orbiting multiple stars and even more complicated if the two bodies orbiting each other have comparable masses. Regardless of the situation, the first step in this computation is to convert a body’s Orbit# value into an AU distance using the fractional Orbit# conversion to AU formula [[#FRACTIONAL ORBIT CONVERSION TO AU]]. Then determine the orbital period based on one of these three scenarios: PLANET ORBITING A SINGLE STAR

#### PLANET ORBITING A SINGLE STAR
Assuming the mass of the star is much larger than the mass of the planet, the simple formula for determining orbital period is the square root of the distance cubed (AU) divided by the star’s mass in Solar units (M) or:

**FORMULA: Planetary Orbital Period Single Star
$\text{P} = \sqrt{\frac{\text{AU}^{3}}{(\text{M})}}$

This formula provides an answer in years. Multiply by 365.25 to determine days or 8766 to determine hours.

```Example
For the case of the Zed system, the planet Zed B I orbits a single star. The planet’s Orbit# is 0.52 and the star’s mass is 0.626. Converting the Orbit# into AU yields 0 + 0.4 × 0.52 = 0.208 AU. Using the above formula, the period or year length for this planet is the square root of (0.2083 ÷ 0.626) = 0.1199 years or 43.79 days.
```

#### PLANETS ORBITING MULTIPLE STARS
If a planet orbits a primary and its companion or any two stars, or even three or more stars, the total mass of all the stars it orbits around is considered. The formula then becomes:

**FORMULA: Planetary Orbital Period Multiple Stars
$\text{P} = \sqrt{\frac{\text{AU}^{3}}{(\sum{\text{M}})}}$

In this case Σ M is the sum of the masses of all the stars interior to the planet’s orbit.

```Example
The Planet Zed AB I actually orbits three stars, the primary, its companion, and the Near star, Aa, Ab, B, at an Orbit# of 7.2. The AU distance = 10 + 10 × 0.2 = 12 AU. The total of the three solar masses is 0.929 + 0.907 + 0.626 = 2.462. This results in a period of (123 ÷ 2.462)1/2 = 26.493 years or, using just the fractional part for days, 26 years and 180 days.
```
#### LARGE PLANETS ORBITING STARS
The formula for orbital periods contains a simplification as the value M<sub>(Sol)</sub> is actual (M<sub>(Sol)</sub> + m) with the smaller case m indicating the mass of the orbiting body. In most cases, the star will be orders of magnitude larger than the orbiting body and the smaller mass is ignored. The below formula is the same used for stars orbiting another star but can be useful for a massive superjovian planet orbiting a star. In this case the m<sub>(Terra)</sub> value uses planetary masses converted to solar masses by multiplying by 0.000003.

**FORMULA: Planetary Orbital Period Large Planets**
$\text{P} = \sqrt{\frac{\text{AU}^{3}}{(\sum{\text{M}_\text{(Sol)} + \text{m}_\text{(Terra)} \times 0.000003})}}$

### DEFAULT PLANET DESIGNATONS
Planetary designations begin with the star designation of their component parent or parent stars. Single star systems will forgo the ‘A’ designation and record planetary designation directly after the system name. Planets within a system are designated by Roman numerals, starting with the closest planet to the parent star or set of stars. Each new set of ‘parents’ resets the planetary enumeration to ‘I’. A space separates the roman numeral from the Star(s) designation. Planetoid belts are not enumerated as planets – planet enumeration skips a belt location and continues uninterrupted with the next planet. A planetoid belt is designated by the capital letter P followed by a roman numeral indicating its position among other planetoid belts of the same parent. For example, a system with a parent that has, in ascending order from the star, two planets followed by a planetoid belt, then two planets and then another belt would enumerate these as I, II, PI, III, IV, PII. The gas giant that in the Zed example is located in Orbit#3.1, the fifth orbit of the Aab pair would be designated Zed Aab IV as the orbital slot before it is occupied by a planetoid belt. Planets orbiting multiple stars should collapse the enumeration to deal with only the pair lettering, for instance the Zed system planet in the Orbit# 7.2 is the first to orbit three stars: Aa, Ab, and B; it would be designated Zed AB I not Zed AabB I.

### BASIC WORLD SIZING
If a mainworld is to emerge from the extended system generation process, the system’s planets and significant moons need at least basic Size information to begin determining which worlds may be suitable for mainworld generation.

#### TERRESTRIAL WORLD SIZE
The category of terrestrial worlds covers anything that is not a planetoid belt or gas giant, meaning any world large enough to be round and yet small enough to not automatically retain a thick hydrogen-helium atmosphere. These worlds are often referred to as terrestrial, meaning not that they have a Terra-like environment but that they are primarily composed of metal, rock, and/or ice, less than twice the diameter of Terra, and in most cases less than 10 Terran masses.

Categorizing these worlds requires some Size codes for worlds both smaller and larger than those provided for in the Traveller Core Rulebook system generation method. The Basic Terrestrial World Size table provides the full range of these Size codes.

**Table 16: Basic Terrestrial World Size**

| Size | Basic Diameter | Size | Basic Diameter |
| ---- | -------------- | ---- | -------------- |
| 0    | 0 (planetoid)  | 7    | 11,200km       |
| R    | 0 (ring)       | 8    | 12,800km       |
| S    | 600km          | 9    | 14,400km       |
| 1    | 1,600km        | A    | 16,000km       |
| 2    | 3,200km        | B    | 17,600km       |
| 3    | 4,800km        | C    | 19,200km       |
| 4    | 6,400km        | D    | 20,800km       |
| 5    | 8,000km        | E    | 22,400km       |
| 6    | 9,600km        | F    | 24,000km       |
The Sizes of terrestrial worlds have more diversity than mainworlds typically exhibit. To determine the size of these worlds first roll 1D and then make a second roll as indicated in the Terrestrial World Sizing table.

**Table 17: Terrestrial World Sizing**

| <br>1D | Second<br>Roll | Size<br>Ranges |
| :----: | :------------: | :------------: |
| 1 – 2  |       1D       |     1 – 6      |
| 3 – 4  |       2D       |   2 – C (12)   |
| 5 – 6  |     2D + 3     |   5 – F (15)   |
#### GAS GIANT SIZE
Gas giants themselves are never mainworlds but their moons or rings could be. The size of a gas giant influences the number and Size of its moons, so to fully populate the system to determine the mainworld candidates, gas giants should be at least roughly sized. If the mainworld is already determined and is not a gas giant moon, then sizing of gas giants is optional.

Most gas giants range in size from 2–18 times Terra’s diameter but they do not follow a simple sizing curve. Instead, they require a 1D and up to two subsequent rolls on the Gas Giant Sizing table.

**Table 18: Gas Giant Sizing**

| 1D+DM | Description (Gas Giant Size Category) | Code | Second Roll (Diameter) | Diameter Ranges | Third Roll (mass) | Mass Ranges |
| ----- | ------------------------------------- | ---- | ---------------------- | --------------- | ----------------- | ----------- |
| 2-    | Small Gas Giant (Neptune)             | GS   | D3+D3                  | 2–6⊕            | 5 × (1D+1)        | 10–35⊕      |
| 3 – 4 | Medium Gas Giant (Jupiter)            | GM   | 1D+6                   | 6–12⊕           | 20 × (3D-1)       | 40–340⊕     |
| 5+    | Large Gas Giant (Superjovian)         | GL   | 2D+6                   | 8–18⊕           | D3 × 50 × (3D+4)  | 350–4,000⊕* |
\*If a large gas giant has an initial mass of 3,000⊕ or greater (resulting from a roll of 15+ on 3D), roll 2D-2 and subtract 200 times the result from 4,000 to determine its actual mass: | (4,000 - (2D-2) × 200).

**Die Modifiers**
- Primary star is a Brown Dwarf (BD), M-type Class V star, or any Class VI star = DM-1
- System Spread is less than .1 = DM-1

The first 1D roll determines the general size category (Small, Medium or Large) of the gas giant. If precision is not needed, the Referee can stop there. The second roll based on the initial sizing result row determines the actual diameter as a factor of Terran diameter (1 gas giant diameter unit is equivalent to Size 8). A third roll based on the initial sizing result determines actual mass as a multiple of Terran mass.

Gas giant information can be recorded using a modification of the SAH (Size, Atmosphere, Hydrographics) codes of the UWP. All gas giants can use the G Size code, with the second UWP digit indicating gas giant size category instead of Atmosphere: GS, GM, GL. The third SAH digit for gas giants corresponds to its diameter in Terran diameters and can use eHex notation as necessary to record the gas giant diameter from 2 to J (18). Gas giant mass can be recorded in the notes field in the IISS Class III form (see the end of the chapter). The Referee can add a variance to the mass value for variety but gas giants should remain within the mass range of 10–4,000⊕.

Rolls and results for determining Size for the example Zed star system’s worlds are shown below in the table with Size codes indicated.

**Example 1: Zed Star System's Worlds**

| Primary | Planet   | Orbit | World Type     | Size Rolls                            | Code |
| ------- | -------- | ----- | -------------- | ------------------------------------- | ---- |
| Aab     | Aab I    | 1.0   | Terrestrial    | 3: 4+4+3 = 11 or B                    | B    |
| Aab     | Aab II   | 1.6   | Terrestrial    | 1: 6 = 6                              | 6    |
| Aab     | Aab III  | 2.1   | Terrestrial    | 3: 3+4 = 7                            | 7    |
| Aab     | Aab PI   | 2.7   | Planetoid Belt | N/A                                   | 000  |
| Aab     | Aab IV   | 3.1   | Gas Giant      | 5: 4+4+6 = 14; 2 × 50 × (8+4) = 1,200 | GLE  |
| Aab     | Aab V    | 3.5   | Gas Giant      | 6: 2+4+6 = 12; 1 × 50 × (12+4) = 800  | GLC  |
| Aab     | Aab VI   | 4.1   | Terrestrial    | 3: 5+2+3 = 10 or A                    | A    |
| Aab     | Aab VII  | 4.6   | Terrestrial    | 4: 2+6 = 8                            | 8    |
| Aab     | Aab VIII | 5.2R  | Terrestrial    | 1: 1 = 1                              | 1    |
| AB      | AB I     | 7.2   | Terrestrial    | 3: 3+3 = 6                            | 6    |
| AB      | AB II    | 7.8   | Terrestrial    | 1 :3 = 3                              | 3    |
| AB      | AB III   | 8.3   | Gas Giant      | 3: 5+6 = 11; 20 × (10-1) = 180        | GMB  |
| B       | B I      | 0.52  | Terrestrial    | 5: 1+5+3 = 9                          | 9    |
| B       | B2       | 1.0   | Terrestrial    | 3: 3+1+4 = 8                          | —    |
| Cab     | Cab PI   | 1.4   | Planetoid Belt | N/A                                   | 000  |
| Cab     | Cab I    | 2.3   | Gas Giant      | 1: 1+3 = 4; 5 × (1+1) = 10            | GS4  |
| Cab     | Cab II   | 2.9   | Terrestrial    | 1: 4 = 4                              | 4    |
| Cab     | Cab III  | 3.3   | Terrestrial    | 6: 6+1+3 = 10 or A                    | A    |
### SIGNIFICANT MOONS
A planet may have many moons; some gas giants may have over 100, not counting large clumps within their rings. This process determines only significant moons, those of size S or above and also indicates whether a planet has significant rings.
#### QUANTITY OF SIGNIFICANT MOONS
The possible number of significant moons depends on the Size and Orbit# of the planet. The Significant Moon Quantity table specifies the quantity rolls for various planet Sizes, with DMs applying to location within a system. A negative number result indicates no significant moons. A result of exactly 0 indicates the presence of a planetary ring (Size code R).

**Table 19: Significant Moon Quantity**

| Planet Size                            | Quantity |
| -------------------------------------- | :------: |
| Planet Size 1 – 2                      |  1D – 5  |
| Planet Size 3 – 9                      |  2D – 8  |
| Planet Size A – F                      |  2D – 6  |
| Small Gas Giant (GS#)                  |  3D – 7  |
| Medium or Large Gas Giant (GM# or GL#) |  4D – 6  |
If any of the below conditions apply: DM-1 per dice
- Planet’s Orbit\# is less than 1.0
- Planet is an orbital slot adjacent to a companion
- Planet’s orbital slot around a primary star (or pair) is adjacent to a Close or Near star unavailability range
- Planet is in the adjacent orbital slot to the outermost Orbit# range of a Close, Near or Far star

A DM per dice is a DM-1 for 1D rolls, DM-2 for 2D rolls, etc. Only one DM can apply regardless of the number of conditions applying to a planet. The term adjacent means the orbital slot lies within the spread distance of the unavailability zone condition indicated.

```Example
For Zed’s planets – removing entries for the planetoid belts– significant moon quantity dice rolls and results are as follows (with DMs and why they apply (or do not) indicated to the right):
```
**Example 2: Zed Moon Quantity Roll Results

|        Planet        | Orbit | Size | Moon Rolls         | Results |
| :------------------: | :---: | :--: | ------------------ | :-----: |
|  Aab I<sup>1</sup>   |  1.0  |  B   | 2D-6 - 2 8-8 = 0   |    R    |
|        Aab II        |  1.6  |  6   | 2D-8 10-8 = 2      |    2    |
|       Aab III        |  2.1  |  7   | 2D-8 2-8 = -6      |    0    |
|        Aab IV        |  3.1  | GLE  | 4D-8 13-6 = 5      |    5    |
|        Aab V         |  3.5  | GLC  | 4D-8 14-8 = 6      |    6    |
|        Aab VI        |  4.1  |  A   | 2D-6 11-6 = 5      |    5    |
|       Aab VII        |  4.6  |  8   | 2D-8 5-8 = -3      |    0    |
| Aab VIII<sup>2</sup> |  5.2  |  1   | 1D-5 - 2 2-7 = -5  |    0    |
|   AB I<sup>3</sup>   |  7.2  |  6   | 2D-8 - 2 8 10 = -2 |    0    |
|        AB II         |  7.8  |  3   | 2D-8 10-8 = 2      |    2    |
|  AB III<sup>4</sup>  |  8.3  | GMB  | 4D-8 14-8 = 6      |    6    |
|   B I<sup>5</sup>    | 0.52  |  9   | 2D-8 - 2 8-10 = -2 |    0    |
|   B II<sup>6</sup>   |  1.0  |  8   | 2D-8 - 2 7-10 = -3 |    0    |
|        Cab I         |  2.3  | GS4  | 3D-8 14-8 = 6      |    6    |
|        Cab II        |  2.9  |  4   | 2D-8 3-8 = -5      |    0    |
| Cab III<sup>7</sup>  |  3.3  |  A   | 2D-6 6-6 = 0       |    R    |
[^1]: DM-1 per dice for being adjacent to the companion-induced MAO (0.61)
[^2]: DM-1 per dice for being adjacent to the Near star’s unavailability zone start (5.11)
[^3]: DM-1 per dice for being adjacent to the Near star’s unavailability zone start end (7.09)
[^4]: No penalty for being adjacent to a Far star’s zone
[^5]: DM-1 per dice for being in an orbit of less than 1.0
[^6]: DM-1 per dice for being adjacent to the Near star’s outer range (1.1)
[^7]: No penalty as it is more than the spread away from the Far star’s outer range (7.1)

```Example
The results call for 32 total significant moons (and two rings) across 16 planets. The principle of MOARN applies strongly here. The Referee is free to detail all of these worlds but may choose to examine just some or none of them.

To determine a mainworld using the extended method, the Referee should determine the other physical characteristics (atmosphere and hydrographics) for worlds within the system’s habitable zone(s). This can be accomplished by using the procedures in the Traveller Core Rulebook on pages 250 and 251. Developing these characteristics further and applying them to worlds outside the habitable zone will be subjects covered in the World Physical Characteristics chapter.

The Zed example will continue with the complete detailing of the system and its significant planets and moons but this is only necessary because it provides examples of the process. Unless the Referee really enjoys creating systems or has an automated method for doing so, it is not recommended or expected for this level of detail to be developed for even one system unless it is necessary for the game.
```

**Optional Rule:** If the Referee wishes to pre-determine Hill spheres for every planet (see page 75) the DM-1 per dice can instead apply to any planet with a Hill sphere of less than 60 planetary diameters.

### SIGNIFICANT MOON SIZE
After determining the number of significant moons, they can be sized. Moons may range in size from S to the Size of the parent planet. A result of 0 indicates a significant ring (R). A planet can have multiple significant rings, whose properties will be detailed in the Significant Rings section on page 77. All of these rings are indicated by a single modified SAH notation of R0#, where # is the number of significant rings, e.g., Saturn’s rings are noted as R03.

Gas giants can (rarely) have gas giant-sized moons. These monstrous moons must be smaller in size category and diameter than their parent, for example a Large gas giant with a Size of 12 times Terra’s diameter can have a moon as large as a Medium gas giant with a Size of 11 times Terra’s diameter.

Sizing requires a 1D roll to determine the Size range and a subsequent roll for final Size. An initial 1D result of 1–3 indicates a Size S significant moon of 400–800km diameter. A 1D result of 4–5 indicates a moderate sized moon, with a result of zero indicating a ring (R) instead. On a 1D roll of 6, for a terrestrial planet, roll 1D and subtract the result from the planet’s Size-1; a negative result indicates a Size S moon, a 0 indicates a ring. For a gas giant, a roll of 6 indicates a larger moon and requires a 1D roll on the Gas Giant Special Moon Sizing table, followed by a final roll for Size.

**Table 20: Significant Moon Sizing**

| 1D  | Second Roll                                      | Size Ranges |
| :-: | ------------------------------------------------ | :---------: |
| 1–3 | none                                             |      S      |
| 4–5 | D3-1                                             |  0 (R) – 2  |
|  6  | Terrestrial: (Size-1)-(1D)<br>Gas Giant: Special |  0 (R) – F  |
If a planet is Size 1, then any moon less than its Size is Size S. If any terrestrial world’s moon has a Size of exactly 2 less than its parent body, roll 2D and on a result of 2 the moon is just 1 Size less than the parent and on a 12, the moon is a twin world of identical Size to its primary world, otherwise it retains its current size.

The Gas Giant Special Sizing table allows for larger moons to exist.

**Table 21: Gas Giant Special Moon Sizing**

| 1D  | Second Roll                                      |  Size Ranges   |
| :-: | ------------------------------------------------ | :------------: |
| 1–3 | 1D                                               |     1  – 2     |
| 4–5 | D3-1                                             | 0 (R) – A (10) |
|  6  | Terrestrial: (Size-1)-(1D)<br>Gas Giant: Special |  6 – G (16)*   |
\* A second roll result of 16 or Size G indicates that the moon is a Small gas giant. On this result, determine the characteristics of the moon using the Small gas giant row on the Gas Giant Sizing table on page 55. If the moon’ s parent gas giant is a Large gas giant, roll another 2D and on a result of 12, determine the characteristics of the moon as a Medium gas giant instead.

```Example
Completing this process for all of Zed’s planets and significant moons is a repetitive but straightforward exercise, below are the results of moon sizing with each planet’s moon’s size separated by comma in the order they were generated.

The moon results end up converting four of the moons to rings, providing rather significant double ring systems for planets Aab VI and Cab I. A total of 13 moons are size S, of the remaining 15 moons only three, are larger than size 2, although one of these is a monstrous Size A. By chance all three of these large(ish) moons are theoretically within the habitable zone of the Aab system, whose HZCO of 3.3 stretches from 2.3 to 4.3. These three moons of Size 3, 5 and A are among the best candidates for Mainworld.
```

**Example 3: Moon Sizes for Zed System**

| Planet   | Orbit | Size | Results | Moon Sizes       |
| -------- | ----- | ---- | ------- | ---------------- |
| Aab I    | 1.0   | B    | R       | R                |
| Aab II   | 1.6   | 6    | 2       | 1, S             |
| Aab III  | 2.1   | 7    | 0       | —                |
| Aab IV   | 3.1   | GLE  | 5       | 2, S, S, 5, S    |
| Aab V    | 3.5   | GLC  | 6       | S, A, 1, 3, S, S |
| Aab VI   | 4.1   | A    | 5       | R, S, 1, R, 1    |
| Aab VII  | 4.6   | 8    | 0       | —                |
| Aab VIII | 5.2   | 1    | 0       | —                |
| AB I     | 7.2   | 6    | 0       | —                |
| AB II    | 7.8   | 3    | 2       | S, S             |
| AB III   | 8.3   | GMB  | 6       | 2, S, 2, S, 1, 1 |
| B I      | 0.52  | 9    | 0       | —                |
| B II     | 1.0   | 8    | 0       | —                |
| Cab I    | 2.3   | GS4  | 6       | R, 1, S, 2, 2, R |
| Cab II   | 2.9   | 4    | 0       | —                |
| Cab III  | 3.3   | A    | R       | R                |
### INSIGNIFICANT MOONS
The Referee is free to specify insignificant moons by fiat. These moons are generally considered to be at least one kilometre in diameter but can approach 400km. They are often captured planetoids orbiting in inclined, eccentric, retrograde or chaotic orbits. As a rule of thumb, a planet can have as many of these moons as its Size, multiplying Size by eight for gas giants.

The Zed system could have more than 400 insignificant moons, not to mention the denizens of the two planetoid belts and some other random flotsam such as cometary bodies. The Referee can toss these in as plot points if desired.
#### DEFAULT MOON DESIGNATIONS
A significant moon is designated by an alphabetic character appended after the name of its parent world. These moons are ordered from the closet to the farthest from the planet. A space separates the planet and moon designation. For instance, the Size 5 moon in the example Zed system’s habitable zone would be initially designated as Aab IV d; the Size A and Size 3 moons would be Aab V b and Aab V d.

Insignificant moons are often not initially discovered and occasionally transitory. Insignificant moons have a numeric designation, starting with a number one higher than the number of significant moons and are incremented in order of discovery, with identical discovery times ordered by the closeness to the planet. For instance, the first insignificant moon discovered around Aab IV would be Aab IV 6. As that gas giant could have 112 (14 × 8) insignificant moons, they could range up to Aab IV 117.

### PLANETARY SYSTEM PROFILE
A star system’s planetary system profile does not contain much information about the distribution of worlds or their significant moons but serves as an overall summary. The profile has a short and a long form. The short profile follows the format:

**G-P-T-N-S**
Where:
- G = gas giant quantity
- P = planetoid belt quantity
- T = terrestrial planet quantity
- N = baseline number
- S = spread. If a baseline number is less than zero it is recorded as 0.

The longer profile indicates relative position of these worlds, in the format:

**St-N-W-W-W…-S:-N-St-W-W…-S:…**
Where:
- St = star designation (A, B, Ab, etc.)
- N = baseline number
- W = planet type, a G, P, T or M (for mainworld, if designated – a moon of a gas giant, or asteroid belt mainworld is indicated as GM or PM, respectively)
- S = spread. 
- For all stars, the N is the placement in the string of the world closest to the HZCO, which might be different than the earlier determined baseline number, considering the possibility of empty or anomalous orbits. If all the worlds are outside the HZCO then N=0, and if all are inside then N= X.

```Example
The short profile for the Zed system is: 4-2-C-5-0.5. 
The long profile for the Zed System (without Mainworld) is: Aab-5-T-T-T-P-G-G-T-T-T-0.5:B-2-T-T-0.5:AB-0-T-T-G-0.5:Cab-0-P-G-T-T-0.5
```
### MAINWORLD CANDIDATE
If a mainworld is not designated, a system’s habitable zones are the best places to initially search for a likely candidate. The habitable zone is generally considered to be +/ 1.0 Orbit#s from the HZCO, with results of Orbit#s less than 1.0 treated as one-tenth as large. For any likely candidate worlds in this region, the Referee should roll for additional physical characteristics of atmosphere and hydrographics with the temperature raw roll (see page 108) assigned by deviations from the HZCO changing based on the Habitable Zones Regions table. For instance, an Orbit# of 3.3 in a system with a HZCO of 3.5 would add 2 to the simulated raw temperature roll of 7 to make it 9.

This process may provide the Referee with enough information to pick a mainworld. If not, the Referee can continue to develop the system’s worlds until finding a suitable candidate or can randomly pick a world. The mainworld does not need to be the ‘nicest’ planet or moon in the system. It could be the one with most resources, a convenient location for a starport or the home of the descendants of a shipwreck. The Referee can choose any world in the system to be the mainworld. After choosing a mainworld, the Referee may begin to delve deeper into the physical aspects of the world.

```Example
For the Zed system, the HZCO is 3.3 for the Aab pair of stars, which provides a habitable zone of Orbits 2.3–4.3, covering both large gas giants, all the system’s satellites larger than Size 2, and also the Size A world Aab VI.

For Aab IV d, the Size 5 moon of Aab IV, its atmosphere and hydrographics can be rolled with a predetermined Temperature result of 9 (Orbit# 3.1 is 0.2 Orbit#s closer than the HZCO and therefore warmer by +2). Rolling 8 for atmosphere results in a Standard (6) Atmosphere (2D-7 + Size(5)), which provides no DM on the temperature table. A roll of 7 for hydrographics results in 6 (2D-7 + Atmosphere(6)), giving the world a temperate environment and physical characteristics of 566, a little too small to be classified as a garden world but it could potentially become a rich and/or agricultural world.

Other worlds in the habitable zone with some potential for atmosphere or liquid water include the Size 2 moon of Aab IV – this is a stretch as we shall see later – the Size A and 3 moons of Aab V and the Size A world of Aab VI. All other moons are Size 1 or S and therefore have atmosphere and hydrographics codes of 0. The two moons of Aab V are at Orbit# 3.5, which makes the simulated temperature raw roll a 5. The planet Aab VI is at Orbit# 4.1 which gets a raw roll of 3. The results for these four worlds are 200 (temperate), AA6 (temperate), 340 (cold), AB6 (temperate). The 340 cold desert moon of Aab V is at least survivable with a filter mask but not pleasant as it has an automatic trade code of poor.

For Star B the HZCO is 0.92, leaving a range of 0.82–1.02 – but since this outer limit crosses 1.0, the upper limit is 1.2 instead. Planet B II is a possibility being 0.08 Orbit#s colder than the HZCO, which the Referee decides is a raw roll of 3 on the temperature table. Rolling 9 for atmosphere results in an Exotic (A) Atmosphere (2D-7 + Size(8)), which provides DM+2 on the temperature table, adjusting the result to be 5, more temperate, but still unbreathable. A roll of 7 for hydrographics results in 6 (2D-7 + Atmosphere(A) -4), noted for a final SAH of 8A6.

Stars Cab have a HZCO of 0.75, which creates the range of 0.65 to 0.85, excluding all of its worlds.

Based on these results, the Referee designates Aab IV d (SAH = 566) as the mainworld candidate and names it Zed Prime.
```

# CHAPTER 5: WORLD PHYSICAL CHARACTERISTICS
The procedures for system creation in the Traveller Core Rulebook are focused on creating the system’s mainworld, usually but not always located in a system’s habitable zone. Procedures in this chapter allow a Referee to validate the choice of a mainworld from likely candidates for the extended method and to detail its physical characteristics if it already exists as part of the continuation method. These processes also allow for the creation of the SAH (Size, Atmosphere, Hydrographics) characteristics of other worlds within the system.

While the procedures in this section include the process for creating a world from scratch, in the case of the continuation method where a whole UWP is known and in the case of an expanded method where at least the Size of a world is known, these established values can be carried forward and act as the starting point for additional details specific to a world.

These procedures assume a ‘middle-aged’ star system and are baseline procedures. Modifications to  these procedures for protostar systems (most systems under 10 million years old with planets still  under formation and constant bombardment) and primordial systems (those under 100 million years old  with atmospheres retaining primordial gases and with still chaotic orbits of minor and possibly  major bodies causing frequent impacts) are covered in more depth in the Special Circumstances chapter. 

This chapter’s procedures will expand the generic Size, Atmosphere and Hydrographics characteristics into additional detail and add other information to make the world unique. A major examination of conditions and calculation effort will help determine a world’s surface temperature, with regards to new factors such as axial tilt, day length, greenhouse effects and seismic stress. As with all of the procedures in this book, they build upon basics introduced in the Traveller Core Rulebook and need only be taken as far as the Referee desires.

## SIZE
The Size characteristic of a world determines much about its nature but it is a generic value, with a fairly broad range and no details as to the world’s density, which determines its gravity. Other basic physical details emerge from a world’s Size and density, including its mass and escape velocity. World Size is either determined during system generation in the Basic World Sizing section on page 54 or is determined by 2D-2 during normal Traveller Core Rulebook world generation. Each Size corresponds to a range of diameters indicated on the World Size table overleaf. 

If the Referee wishes to introduce world Sizes larger than A (10) without the procedures for creating an entire system using the System Worlds and Orbits chapter, worlds rolled with 2D-2 that result in Size A can be rerolled to allow for larger Sizes up to F (15). This can be done by rolling 1D+9 for Size in these cases, or, to create a less linear distribution: first roll 1D for a Size A world and on a 4+ increase its Size to B, then roll 1D again and on a result of 4+, increase the Size to C, and so on, up to Size F. Beyond Size F, gas giants almost always form.

If a world is Size 0 and is an asteroid or planetoid belt, as opposed to a single natural or artificial body, the following steps are not necessary, and, if applicable, the detailing of Size-related properties for belts can proceed in the Planetoid Belt Characteristics section.

**Table 22: World Size**

| Size | Average Diameter | Diameter Range  | Notes                                                             |
| :--: | :--------------: | :-------------: | ----------------------------------------------------------------- |
|  0   |        0         |       N/A       | One or more small bodies, an asteroid or planetoid belt           |
|  R   |        0         |       N/A       | This is a special code for planetary rings                        |
|  S   |      600km       |    400–799km    | These small bodies are dwarf planets or significant moons         |
|  1   |     1,600km      |   800–2,399km   | Small planets which may also exist in asteroid or planetoid belts |
|  2   |     3,200km      |  2,400–3,999km  | Example: Luna                                                     |
|  3   |     4,800 m      |  4,000–5,599km  | Examples: Mercury, Ganymede, Titan                                |
|  4   |     6,400km      |  5,600–7,199km  | Example: Mars                                                     |
|  5   |     8,000km      | 7,200– 8,799km  |                                                                   |
|  6   |     9,600km      | 8,800–10,399km  |                                                                   |
|  7   |     11,200km     | 10,400–11,999km |                                                                   |
|  8   |     12,800km     | 12,000–13,599km | Examples: Venus, Terra                                            |
|  9   |     14,400km     | 13,600–15,199km | Super-Earth                                                       |
|  A   |     16,000km     | 15,200–16,799km |                                                                   |
|  B   |     17,600km     | 16,800–18,399km |                                                                   |
|  C   |     19,200km     | 18,400–19,999km |                                                                   |
|  D   |     20,800km     | 20,000–21,599km |                                                                   |
|  E   |     22,400km     | 21,600–23,199km |                                                                   |
|  F   |     24,000km     | 23,200– 4,799km |                                                                   |
## DIAMETER
The World Size table (Table 22) provides conversion from a world’s Size characteristic to its diameter in kilometres. The diameter of a world is based on a span of 1,600 kilometres, or just 400 kilometres in the special case of a Size S world. The midpoint or average of the range is an acceptable value to use, but for greater detail any variance is assumed to be linear. A roll of two dice can simulate this variance, with a D3 and a 1D roll to indicate the increase in diameter from the minimum diameter value of a particular Size. Add the results from the D3 and 1D rolls. If the total is 1,600 or more, roll both dice again.

**Table 23: World Diameter D3 Roll**

| D3  | Increase from Minimum |
| :-: | --------------------- |
|  1  | +0                    |
|  2  | +600km                |
|  3  | +1,200km              |

**Table 24: World Diameter D6 Roll**

| D3  | Increase D3 Result |
| :-: | ------------------ |
|  1  | +0                 |
|  2  | +100km             |
|  3  | +200km             |
|  4  | +300km             |
|  5  | +400km             |
|  6  | +500km             |
To achieve even more detail, down to the kilometer level, roll d10 twice as a d100 to get a number from 00 to 99 and add that number to the determined diameter.

For a Size S world, simply roll on the second table, rerolling a 5 or 6, and then add that number to 400 kilometres to get the dwarf planet’s diameter. As with larger worlds, a d100 linear variance can be added to the result.

## COMPOSITION AND DENSITY
The density of a world depends greatly on its composition. Iron has a density of 7.8 times that of water and may be even more dense when compressed by the extreme pressures near the core of a world. Most ‘rocks’ have a density of about 2.5–3.0 – granite averages 2.7, basalt 2.9. At very cold temperatures ammonia, methane and nitrogen form ices lighter than water, and at the far extremes of cold, ices of hydrogen are even less dense. Small bodies may be ‘rubble piles’ half or more composed of empty space and although rocky, they are overall less dense than water. In general, the worlds that are larger and hotter will be denser, but exceptions will always occur.

The formulas based on density are also based on other Terra-centric units, so the value of 5.514g/ cm<sup>3</sup> is defined as 1.0 or standard density. On this scale, regular water or ice has a density of 0.181 and hydrogen ice has a density of 0.0126.

To determine the density of a world, first determine its basic structure on the Terrestrial Composition table, then determine its actual density on the Terrestrial Density table. These tables are suitable for terrestrial worlds from Size S to Size F – gas giant density could be reverse-engineered from their diameter and mass if the Referee wishes.

**Table 25: Terrestrial Composition**


| 2D+DM | Composition      |
| :---: | ---------------- |
| <= -4 | Exotic Ice       |
| -3–2  | Mostly Ice       |
|  3–6  | Mostly Rock      |
| 7–11  | Rock and Metal   |
| 12–14 | Mostly Metal     |
| 15 => | Compressed Metal |
**Die Modifiers**
- Size 0–4: DM-1
- Size 6–9: DM+1
- SIze A–F: DM+3
- World at HZCO or closer: DM+1
- World further than HZCO: DM-1
- And per full Orbit\# beyond HZCO: DM-1
- System age greater than 10 Gyr: DM-1

**Table 26: Terrestrial Density**

| 2D  | Exotic Ice | Mostly Ice | Mostly Rock | Rock and Metal | Mostly Metal | Compressed Metal |
| :-: | :--------: | :--------: | :---------: | :------------: | :----------: | :--------------: |
|  2  |    0.03    |    0.18    |    0.50     |      0.82      |     1.15     |       1.50       |
|  3  |    0.06    |    0.21    |    0.53     |      0.85      |     1.18     |       1.55       |
|  4  |    0.09    |    0.24    |    0.56     |      0.88      |     1.21     |       1.60       |
|  5  |    0.12    |    0.27    |    0.59     |      0.91      |     1.24     |       1.65       |
|  6  |    0.15    |    0.30    |    0.62     |      0.94      |     1.27     |       1.70       |
|  7  |    0.18    |    0.33    |    0.65     |      0.97      |     1.30     |       1.75       |
|  8  |    0.21    |    0.36    |    0.68     |      1.00      |     1.33     |       1.80       |
|  9  |    0.24    |    0.39    |    0.71     |      1.03      |     1.36     |       1.85       |
| 10  |    0.27    |    0.41    |    0.74     |      1.06      |     1.39     |       1.90       |
| 11  |    0.30    |    0.44    |    0.77     |      1.09      |     1.42     |       1.95       |
| 12  |    0.33    |    0.47    |    0.80     |      1.12      |     1.45     |       2.00       |
This table has no DMs but the Referee can choose to add a linear density between the values on the Terrestrial Density chart for variability

## GRAVITY AND MASS
Gravity is density multiplied by Size. Size in this case can be determined in two ways, either as world UWP Size ÷ 8 (Size of Terra) or as world diameter in kilometres divided by 12,742 (diameter of Terra). Either way the formula is:

**FORMULA: Gravity**
$\text{Gravity} = \frac{\text{Density}\times\text{Diameter}}{\text{Diameter⊕}}$

For later calculations of factors such as escape velocity and moon orbital periods, the mass of the world is important. Mass is proportional to the volume of a world times its density. Volume is proportional to the cube of diameter. To determine mass, use one of the same methods as above to calculate diameter and use the formula:

**FORMULA: Mass**
$\text{Mass} = \text{Density} \times (\frac{\text{Diameter}}{\text{Diameter⊕}})^{3}$

Mass allows for the computation of additional parameters of interest to Referees and Travellers such as the orbital and escape velocities of the world. Escape velocity from the surface of a world is proportional to the square root of the value of its mass divided by its diameter. To determine a velocity in meters per second:

**FORMULA: Escape Velocity (EscV)**
$\text{EscV} = \sqrt[2]{\frac{\frac{\text{Mass}}{\text{Mass⊕}}}{\frac{\text{Diameter}}{\text{Diameter⊕}}}}\times 11,186$

Divide by 1,000 to determine the velocity in kilometres per second. To determine the orbital velocity at the equivalent surface of the planet, divide this result by the square root of 2:

**FORMULA: Orbital Velocity(Surface)
$\text{Orbital Velocity(Surface)} = \text{EscV} \div \sqrt{2}$

This number is the velocity required to reach orbit, ignoring any additional thrust needed to overcome atmosphere and to gain altitude. To determine actual orbital velocity (in metres per second) at an arbitrary height (h in kilometres) above a world’s surface, a little juggling of formulas provides:

**FORMULA: Orbital Velocity(Surface)
$\text{Orbital Velocity(h)} = 11,186 \times \sqrt[2]{\frac{\frac{\text{Mass}}{\text{Mass⊕}}}{2 \times \frac{\text{Radius} + h}{\text{Radius⊕}}}}$

In this latter case, use kilometres for the radius (half the world’s diameter) and the height above the surface and 6,371 kilometres as the value for Terra.

## SIZE PROFILE
A Size profile is a concise information summary of related material, expressing:

**S-Dkm-D-G-M**
Where:
- S=Size
- Dkm = Diameter in kilometres
- D = Density
- G = Gravity
- M = Mass

```Example
For the Zed system’s proposed mainworld of Size 5, rather than use the standard 8,000km diameter, actual diameter is determined by rolls of D3, 1D and d100 as 7,200 + 600 + 300 + 63 = 8,163km. As a fraction of Terra’s diameter, this equals a diameter of 0.64. Density is determined by a 2D roll with DM+1 for being closer than the HZCO (Orbit 3.1 is within 3.3) resulting in 10 + 1 = 11 or rock and metal. Rolling on the Terrestrial Density table in the rock and metal column results in a 9, giving a density of 1.03 (about 5.68g/cm3). With these values, gravity can be computed as 1.03 × 0.64 = 0.66G, and mass as 1.03 × 0.643 = 0.27⊕.. Further calculations indicate an escape velocity from this world of 7,262 metres per second and orbital velocity of 5,135 metres per second at the surface and, for example, 4,847 at 500km orbital altitude. 

This world’s Size profile is 5-8163-1.03-0.66-0.27.
```

## PLANETOID BELT CHARACTERISTICS
A Size 0 world is a special case. It is not a world at all, but either a belt of planetoids, a single small body or an artificial body such as a space station. A Size 0 mainworld could even be a tiny moon or a ring around another world. This section will consider the general case, an asteroid/ planetoid belt, whether mainworld or not. The term ‘belt’ will be used below as a generic designation.

Major considerations for a belt are the breadth or span, its overall population or bulk, the composition of its bodies and the size and number of its largest bodies. Size distributions universally favor increasing numbers of smaller bodies down to countless pebble-sized rocks but often the majority of a belt’s overall mass is distributed in just a few large bodies.

#### BELT SPAN
A belt’s Orbit# is the orbit of the middle of the belt, halfway between its inner and outer established boundaries. Individual planetoids, sometimes quite large, may orbit outside the boundaries of this region but the majority (80% is the IISS figure) of the belt’s population have orbits which are centred within this region. To determine the belt’s span, first consider the system’s spread value, if it exists. This determines the adjacent inner and outer orbit slots and forms a barrier to the spread of the belt – even if one of these ‘next’ orbit slots contains another belt. A belt’s span is determined by the formula:

**FORMULA: Belt Span**
$\text{Belt Span} = \frac{\text{Spread} \times (\text{2D})}{10}$

**Die Modifiers**
- If the ‘next’ inner or outer orbital slot contains a gas giant: DM-1
- If the belt occupies the outermost orbital slot of a system: DM+3

If a spread has not been determined for a system, use the value of 2D × 0.1 Orbit# as the spread value in the belt span determination. A span is the total width of the belt, meaning the Orbit#s of most of its bodies are plus or minus half of this value from the belt’s overall Orbit\#.

#### BELT COMPOSITION
Most belts have a varied composition consisting of metallic (m), stony (s) and icy or carbonaceous (c) bodies. Other types exist, including peculiar bodies specific to one or more of a belt’s significant bodies or the remnants of a destroyed significant body.

The prevalence of one type or another is generally based on the belt’s location but it can be based on other factors, such as gravitational scattering or collisions. A belt inside a star’s habitable zone has very few c-type bodies, as they are sensitive to sublimation (evaporating) under the heat of the star. In outer zones, these c-type bodies predominate since it is easier for them to form. A 2D roll on the Belt Composition Percentages table determines the percentages of each type of body.

**Table 27: Belt Composition Percentages**

| 2D+DM | m-type  | s-type  | c-type  |
| :---: | :-----: | :-----: | :-----: |
| <= 0  | 60+1D×5 |  1D×5   |    0    |
|   1   | 50+1D×5 | 5+1D×5  |   D3    |
|   2   | 40+1D×5 | 15+1D×5 |   1D    |
|   3   | 25+1D×5 | 30+1D×5 |   1D    |
|   4   | 15+1D×5 | 35+1D×5 |  5+1D   |
|   5   | 5+1D×5  | 40+1D×5 | 5+1D×2  |
|   6   |  1D×5   | 40+1D×5 |  1D×5   |
|   7   | 5+1D×2  | 35+1D×5 | 10+1D×5 |
|   8   |  5+1D   | 30+1D×5 | 20+1D×5 |
|   9   |   1D    | 15+1D×5 | 40+1D×5 |
|  10   |   1D    | 5+1D×5  | 50+1D×5 |
|  11   |   D3    | 5+1D×2  | 60+1D×5 |
| 12 => |    0    |   1D    | 70+1D×5 |
**Die Modifiers**
- Belt Orbit# inside the HZCO: DM-4
- Belt Orbit# is beyond HZCO+2: DM+4

If the total of m-, s-, and t-types exceed 100%, remove any excess % first from m-type, then from s-type. If the total is less than 100%, then all the remaining % are allocated as ‘other’ composition.

#### BELT BULK
A belt’s bulk is an overall factor of the volume of the bodies comprising the belt. It considers the mass and density of all the bodies within the belt’s span. A belt with less dense objects has more bulk and a tendency to form larger bodies. A belt’s bulk tends to decrease over time: gravitational interactions tend to eject bodies and the smallest bodies are subject to interactions with solar radiation which tends to pull them towards the sun and eventual oblivion. Subsequent collisions cause more small bodies and the trend continues. The belt’s bulk is a relative factor determined by:

**FORMULA: Belt Bulk**
$\text{Belt Bulk} = \text{2D-2}+\text{DMs}$

**Die Modifers**
- System Age: DM-System Age (Gyr) ÷ 2 (round down)
- Composition: DM+(c-type%) ÷ 10 (round down)

If the belt bulk is less than 1, treat it as 1. For example, a belt in a system aged 4.5 Gyrs composed of 33% c-type bodies has DM-2 for age and DM+3 for composition for a total DM+1.

#### BELT RESOURCE RATING
An asteroid belt does not use the same procedures as a large world for determining resource rating but instead:

**FORMULA: Belt Resource Rating**
$\text{Belt Bulk} = \text{2D-7}+\text{DMs}$

**Die Modifiers**
- Bulk: DM + Belt Bulk
- Composition m-type%: DM + (m-type%) ÷ 10) (round down)
- Composition c-type%: DM - (c-type%) ÷ 10) (round down)

For example, a belt with a bulk of 4 and composed of 22% m-type bodies, and 18% c-type bodies has DM+4 for bulk and both +2 and -2 (since -1.8 _rounds down_ to -2) for composition, or DM+4 in total.

If the belt is in an inhabited system with an industrial trade code and at least TL8, reduce the resource rating by 1D to reflect previous exploitation. The Referee may rule that long-exploited belts, regardless of current trade codes and population levels, have the equivalent or greater reductions in their resource rating.

As belts always have some resources available, even if it is only ice for fuel or just salvage of abandoned facilities, resource rating results of less than 2 are still treated as 2. Ratings above 12 should be reduced to 12, although any industrial depletion can be subtracted prior to setting this upper limit.

#### BELT SIGNIFICANT BODIES
A belt may contain significant bodies or worlds of Size 1 or S. These bodies are large enough to be mostly round and may have complex differentiated interiors. The Referee may choose to just enumerate the number of Size 1 and Size S bodies or may choose to develop Orbit#s or additional details for them. The number of Size S bodies increases rapidly with bulk and even more so in the outer system, where the majority of the bodies are icy. A roll resulting in zero or less significant bodies of a certain size indicates a lack of such objects.

**FORMULA: Belt Size 1 Bodies**
$\text{Belt Size 1 Bodies} = \text{2D-12} + \text{Belt Bulk} + \text{DMs}$

**Die Modifiers**
- Belt Orbit# beyond HZCO+3: DM+2
- Belt span less than 0.1: DM-4

**FORMULA: Belt Size S Bodies**
$\text{Belt Size 1 Bodies} = \text{2D-12} + \text{Belt Bulk} + \text{DMs}$

**Die Modifiers**
- Belt Orbit# between HZCO+2 and +3: DM+1
- Belt Orbit# beyond HZCO+3: DM+3
- Belt span greater than 1.0: DM+1

If belt span is less than 0.1 divide the number of Size S bodies (if any) by 2, (round up).

**Optional Variance:** If more than 50 Size S bodies exist and the belt occupies the outermost orbit of a system, multiply the total by 1D/D3 and add 1D.

To determine the Orbit# of a significant body:

**FORMULA: Belt Significant Body Orbit#_**
$\text{Belt Significant Body Orbit\#} = \text{Belt Orbit\#} + \frac{(\text{2D - 7}) \times \text{Belt Span}}{8}$

Additional 10% variance to the span may be appropriate to add. To determine the orbital eccentricity of the body, roll on the Eccentricity Values table with relevant DMs.

Belt Size 1 significant bodies are treated as moons for the purpose of default naming, using a letter suffix, but Size S objects, often discovered in a haphazard and incomplete manner especially in the outer system, are named in order of discovery with a numeral designation similar to that of insignificant moons.

The physical characteristics of significant bodies are based on the general population of the belt. Each significant body has the same percentage of being metal, stony or icy as the percentage composition of m-type, s-type, or c-type bodies. To generate physical characteristics, the density of each type of body is determined from the Terrestrial Density table as follows:

- m-type: Use the Mostly Metal column
- s-type: Use the Mostly Rock column
- c-type: Use the Mostly Ice column
- other type: Roll on the Terrestrial Composition table to determine the column

With density established, the Referee can determine additional physical characteristics as if they were a normal world. Also, Size 1 significant bodies have the same chance of having a significant moon as a terrestrial planet.

#### BELT PROFILE
A specialized Class IV form exists for belt information recording but for a Class III survey, a shorthand in the notes field can record relevant belt information as:

**S-CC.CC.CC.CC-B-R-#-s**
Where:
- S = Span
- C = Composition divided into four dotted separated fields, as demonstrated in the examples below
- B = Bulk
- R = Resource Rating
- \# = number of Size 1 significant bodies
- s = number of Size S significant bodies.
```Example
The Zed system has two planetoid belts: Aab PI, which occupies Orbit# 2.7, which is inside the HZCO of that pair of stars and adjacent to a large gas giant, and Cab PI, which sits at star C’s Orbit# 1.4 outside that star pair’s HZCO, but only by 0.61 Orbit#s – which converts to 2.5, (1.0 - 0.75) × 10, + .4 = 2.9 Orbit#s outside the HZCO. The system Spread for the Zed system is 0.5 orbits and its age is 6.3 billion years. To further characterise these two belts:

Aab PI:
Orbit 2.7 
Belt Span = Spread × (6-1) ÷10 = 0.5 x 0.5 = 0.25 Orbit#s or +0.125 Orbit#s from 2.7: Orbit#s 2.575 – 2.825 
Belt Composition = 6-4 = 2: 40+15 = 55% m-type, 15+25 = 40% s-type, 2% c-type, 3% others 
Belt Bulk = 4 + 2 - 6.3÷2 + 2÷10 6 – 3 - 0 = 3 
Belt Resource Rating = 11-7 + 3 +55÷10 - 2÷10 11-7 + 3 + 5 - 1= B (11) 
Belt Significant Bodies = 8-12 + 3 = -1: 0 Size 1, and 10-10 + 3 +0 × (6+1) = 0 + 3 = 3 Size S bodies 
Belt Profile: 0.25-55.40.02.03-3-B-0-3

Cab PI:
Orbit 1.4
Belt Span = Spread × (6) ÷10 = 0.5 x 0.6 = 0.3 Orbits or +0.15 Orbits from 1.4: Orbits 1.25 – 1.55
Belt Composition = 8-2 = 6: 15% m-type, 60% s-type, 20% c-type, 5% others
Belt Bulk = 5 + 2 - 6.3 ÷2 + 20÷10 5 + 2 - 3 +2 = 6
Belt Resource Rating = 10-7 + 6 +15÷10 – 20 ÷10 10-7 + 6 +1 - 2 = 8
Belt Significant Bodies = 8-12 + 6 = 2 Size 1 bodies, and 4-10 + 2 × (6 + 1)= 8 Type S bodies
Belt Profile: 0.3-15.60.20.05-6-8-2-8

No attempt is made to determine orbits for these bodies at this time but for Aab PI bodies it would be 2.7 + (2D-7) × 0.25÷8 and for C PI it would be 1.4 + (2D-7) × 0.3÷8.
```

## CHARACTERISTICS OF SIGNIFICANT MOONS AND RINGS
During expanded method system creation, the Significant Moons procedure determined the number of significant moons and substantial rings of a world and their Size information but little additional detail.

For a world being developed with the continuation method whose moons and/or rings are not already established, the Significant Moons procedure of checking for moons and rings and determining moon size can proceed for the mainworld and any other worlds the Referee deems it necessary.

A moon is no different than a planet in its world SAH characteristics and moons follow most of the procedures relevant to planet detailing, but since they orbit a planet and not one or more stars directly, their orbits are defined differently. This section will detail how to determine these characteristics.
#### MOON ORBIT LIMITS
Moon orbits can be expressed in two manners: either as the distance from the center of a planet to the center of the moon in planetary diameters (PD), or as that same distance in kilometres. The latter is a universal fixed scale, but the former is a flexible scale which helps with the placement of moon orbits around planets of varying sizes.

A moon can only exist in regions of space where a planet’s gravitational influence is greater than that of its star(s) and where the force of the planet’s gravity is not so strong as to rend the moon apart into a ring. These bounds are known as the Hill sphere and Roche limit respectively.

For a planet in orbit around a star (or multiple stars) the radius of the Hill sphere depends on respective masses of star(s) and planet and their nearest separation distance – a value based on both semi-major axis (AU) and eccentricity (ecc). In this equation, the mass of the planet (m) must be converted to solar units by multiplying by 0.000003 and M is the total of the mass of all of the stars that the planet orbits – but not any orbiting beyond the planet’s Orbit#.

**FORMULA: Hill Sphere (AU)** 
$\text{Hill Sphere(AU)} = \text{AU} \times (1-\text{ecc}) \times \sqrt[3]{\frac{\text{m}}{3 \times \text{M}}}$

The result of this equation is the approximate Hill sphere radius of the planet expressed in AU. Multiplying by 150,000,000 (or 149,597,870.9) will provide the Hill sphere radius in kilometres and dividing that result by the planetary diameter in kilometres provides the Hill sphere limit for the planet in planetary diameters (PD):

**FORMULA: Hill Sphere (PD)**
$\text{Hill Sphere(PD)} = \text{Hill sphere(AU)} \times \frac{\text{149,597,870.9}}{\text{Planet' s diameter(km)}}$

```Example
The gas giant Aab IV in the Zed system has an eccentricity of 0.10. This gas giant, with 14 times the diameter of a Size 8 world, orbits stars with a combined mass of 1.836 at a distance of 1.06AU. The gas giant mass of 1,200⊕ converts to 0.0036 to yield a Hill sphere radius of 1.06 × (1 - 0.10) × (0.0036 ÷ (3 × 1.836))1/3 = 0.083AU or about 12,430,000km, which is 69.37 planetary diameters.
```

While the surface of the Hill sphere is the point where the gravity of planet and sun(s) balance, it is not the practical outer limit of an orbiting moon. That distance is closer to one-half or one-third of the Hill sphere radius. The one-third number applies to ‘prograde’ moons – those who orbit in the same direction as their primary, and the one-half number applies to ‘retrograde’ moons – those who orbit in the opposite direction and which are often captured bodies, not those that formed in orbit of the planet during initial accretion. Still, for system generation purposes, the Hill sphere moon limit can be determined to be one-half the planetary diameter value of the Hill sphere radius, rounded down.

**FORMULA: Hill Sphere Moon Limit**
$\text{Hill Sphere Moon Limit} = \frac{\text{Hill Sphere (PD)}}{2}$

```Example
For Zed Aab IV, the Hill Sphere Moon Limit is 69.37 ÷ 2 = 34.685 Planetary Diameters.
```

While the Hill sphere determines the outer limit for moons, the Roche limit determines the inner boundary. The Roche limit is based on tidal forces and the cohesion or density of respective bodies and the Size of the larger body. Inside the Roche limit, rings might exist, outside the Roche limit, moons can exist. This is a simplification and other factors may blur these distinctions. There are numerous methods and factors for calculating the Roche limit, but for Traveller, the formula for a ‘liquid body’, one that considers deformation of a moon is most likely to accurately model the borderline between rings and moons. To determine the Roche limit, the physics requires knowledge of the primary body’s diameter, the density of the primary (M) and the density of the secondary body (m).

**FORMULA: Roche Limit** 
$\text{Roche Limit} ≈ 1.22 \times \text{Planetary Diameter} \times \sqrt[3]{\frac{\text{Density(M)}}{\text{Density(m)}}}$

As the Roche limit around any one body varies with the density of the smaller body in question, there is no single Roche limit formula to apply to any one primary object. Instead, this book will rely on a major simplifying assumption: the density of the primary is about twice that of a reasonable secondary object. The logic for this relies on rocky worlds being more prevalent in the inner solar system and their moons being likewise rocky, but not as massive and therefore on average less compressed and less dense. In the outer system, where icy bodies predominate, so do icy moons. For a gas giant with a metal moon, this assumption provides a more pessimistic result than reality but for the purposes of generalized planets and moons, it works well enough. Using this value, the Roche limit becomes 1.22 × Diameter × (2)1/3 or 1.537 times the diameter of the planet as measured from its center. Essentially, this limit stretches one full planetary diameter above the surface of a planet.

#### MOON REMOVAL
If a computed Hill Sphere Moon Limit is less than 1.5 PD, then it is below the Roche limit and no significant moons can exist around that planet. If moons were indicated during the creation process, the first of these adds one significant ring or creates a ring around the planet if none exists. Any additional moons are assumed to be long gone, impacted, ejected or absorbed by the system’s sun(s). If the Hill Sphere Moon Limit is less than 0.5 PD, then it extends all the way to the surface of the planet and no rings can exist either. In practice, any limit of less than 0.55 probably precludes the existence of rings. Note that these limits only apply to significant moons. Smaller moons may exceed these limits, at least temporarily.

#### MOON ORBIT DETERMINATION
Moons can be formed by accretion processes, collisions or capture of errant bodies. Regardless of origin, if they persist, they will be within the bounds imposed by the Hill sphere and Roche limit. Moon Orbits are assigned by Planetary Diameters (PD) from the primary body. Determine the Moon Orbit Range (MOR) by subtracting the Roche limit (rounded to up to 2) from the Hill Sphere Moon Limit (rounded down):

**FORMULA: Moon Orbit Range (MOR)**
$\text{Moon Orbit Range (MOR)} = \text{Hill Sphere Moon Limit (rounded down)} - 2$
$\text{if MOR is greater than 200, treat MOR as 200 + number of moons (or actual MOR, if less)}$

This overall range determines the boundaries of a planet’s Inner, Middle and Outer moon orbit ranges. The inner sixth is the planet’s Inner moon range, the middle third is the Middle orbit range and the outer half is the Outer range. Next, determine the orbit for each of the planet’s moons by rolling 1D to determine the range. If the MOR is less than 60 apply DM+1 to the this first roll. Roll a second time to determine the orbit of the moon in planetary diameters (PD).

**Table 28: Moon Orbit Location**

| 1D+DM* | Range  | Orbit in Planetary Diameters (PD)                                 |
| ------ | ------ | ----------------------------------------------------------------- |
| 1–3    | Inner  | $(\text{2D-2}) \times \text{MOR} \div 60 + 2$                     |
| 4–5    | Middle | $(\text{2D-2}) \times \text{MOR} \div 30 + \text{MOR} \div 6 + 3$ |
| 6 =>   | Outer  | $(\text{2D-2}) \times \text{MOR} \div 20 + \text{MOR} \div 2 + 4$ |
\*For 1D roll: if MOR is less than 60: DM+1

The result in PD can be rounded to the nearest full number, or to add detail, a linear variance of 0.5 PD can be added to each orbital result – to either the indicated or rounded value. There is a small chance that this procedure could result in an outer moon exceeding the Hill Moon Sphere Limit but this is a soft limit – such moons can exist but receive an additional DM+2 to checks for retrograde orbits.

Significant moons have been generated and designated in order, from closest to furthest from the planet. To maintain this order, roll for the PD of all the significant moons and then reorder the results from smallest to largest and apply them to each moon. Alternatively, if desired, each moon could instead have its orbit determined in turn and its designation changed to reflect the new ascending orbital location. If two moons occupy exactly the same orbit, or if they orbit close enough for their diameters to overlap, either move one moon out a further 1 (or 1+0.5) PD, or treat the smaller moon as a trojan moon, giving it the same orbital characteristics as the larger.

```Example
Zed Aab IV has an MOR of 34 - 2 = 32. It has five moons to allocate and gets a DM+1 on the initial 1D roll to determine location as its MOR is less than 60. For the five moons the results are 6.26, 4.13, 21.6, 13.6 and 28.0, rounded and reordered as 4, 6, 14, 22 and 28. Adding a variance produces 4.5, 6.1, 14.0, 22.0 and 27.9. The habitable moon Zed Aab IV d, or Zed Prime, is at PD 22, or 22 × 14 × 12,800 = 3,942,400km from its gas giant primary.
```

#### ECCENTRICITY AND ORBITAL DIRECTION
To optionally add eccentricity values to moon orbits, use the Eccentricity Values table and apply DM-1 for Inner orbit moons, DM+1 for Middle moons, DM+4 for Outer moons and DM+6 for any moons exceeding the MOR.

To optionally determine the direction of a moon’s orbit, roll 2D and apply the same DMs as above. An orbit is retrograde on a result of 10+. A retrograde orbit can be indicated either by treating an orbital period as negative or adding a ‘R’ notation after the period.

```Example
For Zed Prime, a moon in the Outer range, rolling 2D+4 for eccentricity results in 6+4 = 10, followed by 5÷20 + 0.05 = 0.25 eccentricity. A check for retrograde results in 7+4 = 11, indicating that the moon is in retrograde orbit around the gas giant – quite possibly a former planet captured to become a moon.
```

**Optional Anomalous Moons Procedure:** If the Referee desires additional variation, any planet with existing significant moons may have one or more that is anomalous. On a roll of 12 on 2D – either once for the planet or for each moon – a moon’s orbit follows the Anomalous Orbit procedures on page 50, however a random orbit for an anomalous moon is determined by MOR ÷ (2D-1) PD plus a variance and must be at least 2 PD.

#### PERIOD OF A MOON’S ORBIT
The period of the orbit of a moon relies on the same physical laws as that of planets but the equations are easier using different units. There are two methods to compute orbital period, either just the planetary mass or using the combined masses of planet and moon. Moons tend to be smaller than their planets in a ratio similar to that of stars to planets, so for most instances the equations use the Terran mass of the planet as Mp. If greater precision is required, the moon’s mass must be computed and the Mp value instead becomes (Mp + Mm) where Mm is the mass of the moon.

To compute the period of the moon’s orbit using the planet’s Size and the moon’s PD orbital value:

**FORMULA: Moon Period(hours)**
$\text{Moon Period(hours)} = 0.176927 \times \sqrt[2]{\frac{(\text{PD} \times \text{Size})^3}{\text{Mp}}}$

Alternatively, using kilometres for the moon’s orbital distance from the planet in (Orbit(km)):

**FORMULA: Moon Period(hours)**
$\text{Moon Period(hours)} = \sqrt[2]{\frac{(\text{PD} \times \text{Size})^3}{\text{Mp}}} \div 361730$

```Example
Zed Prime orbits its parent planet in 0.17693 × (22 × 14 × 8)3 ÷ 1,200)1/2 = 624.69 hours or 26.03 days. Or (3,942,400)3 ÷ 1,200)1/2 ÷ 361,730 = 624.69, calculated by the second method, is essential the same answer. If the mass of the moon was added to either equation, the result would be 624.62 hours, or about four minutes less.
```

#### SIGNIFICANT RINGS
A world’s rings generally occur inside its Roche limit. Temporary rings may form further out, either early in a planet’s life or after a collision, but over time these may coalesce into new moons. As with moons, the enumeration of rings assumes ‘significant rings’. In the Solar System, all four gas giants have rings but Neptune’s are barely dense enough to form coherent rings and Jupiter’s are only visible under certain lighting conditions. Saturn has obvious bright rings and Uranus has rings somewhat more complex than the simple systems of Jupiter and Neptune but considerably less massive and wide than Saturn’s. To be considered a significant ring, this book assumes the ring has substantial mass, optical depth (ability to block light) and width – exact values depend upon the size of the parent body but even Saturn’s relatively faint C ring is tens of times more massive than all of Uranus’s rings combined. Brightness is not a factor in significance, as different material of the same size and mass may vary in brightness by a factor of 10 or more. By this arbitrary definition, across the entire Solar System, only three of Saturn’s rings count as significant and none of the other planets’ rings are considered such.

Rings have two properties: location and span. The initial placement of a significant ring uses the following formula:

**FORMULA: Ring Centre(PD)**
$\text{Ring Centre(PD)} = 0.4 + \frac{\text{2D}}{8}$

To determine each significant ring's span:

**FORMULA: Ring Span(PD)**
$\text{Ring Span(PD)} = \frac{\text{3D}}{100} + 0.07$

If this result causes overlap in the case of a planet with two rings, move the outer ring further outward until its inner edge matches the inner ring’s outer edge. The outer ring's new center location is determined adding half of the span of both rings to the inner ring’s center location.

If three or more rings exist, the third and subsequent rings must be moved to be either adjacent to or separated from the previous rings. If modifying a ring’s center location causes that ring’s span to intersect the planet’s surface (at 0.5 PD), narrow the ring’s span until the innermost part of the ring is 0.55 PD from the surface. If an outer ring span stretches beyond the Roche limit, the ring span remains unchanged and if this causes the ring to overlap with the orbit of a moon, then that moon will create a gap in the ring of size in kilometres of at least three times (roll as 1D+2) the moon’s diameter in kilometres.

#### RING PROFILE
Often, the only information recorded about a ring system is the number of rings, e.g., R01, or R03. A more detailed ring profile is:

**R0#:C-S,C-S, …**
Where:
- R0# = Number of Rings
- C = Ring Centre Location
- S = Ring Span
- ... repeated for each ring.

## ATMOSPHERE
A world’s Atmosphere code is determined by a roll of 2D–7 plus the world’s Size. Worlds of Size 0 or 1, or S, do not have significant atmospheres and automatically have an Atmosphere code of 0. Results of less than 0 equal 0. A resultant atmosphere code in the range of 2-9, or D, or E is a gas mix composed of primarily nitrogen and oxygen – most often as a by-product of carbon-based lifeforms. These atmosphere codes are usually only present within or near the edges of the system’s habitable zone but for the purpose of mainworld generation, the standard procedures for atmosphere typing apply. A later section of this chapter will deal with atmosphere code generation and classification on worlds far beyond the edges of the habitable zone.

**Variants:** While not stated in the Traveller Core Rulebook, much of mapped and previously developed Charted Space assumes that worlds of Size 4 or smaller do not have substantial atmospheres. A variant of the atmosphere generation procedure can allow a DM-2 to the atmosphere roll of worlds of Size 2–4. For extra flavor, the Referee may alternatively choose to use gravity rather than Size as the governing factor for the DM, if gravity has already been determined in the previous section, and instead apply a DM-2 if the world’s gravity is below 0.4G or DM-1 if it is between 0.4 and 0.5G. This variant can be retroactively applied during the expanded method, perhaps altering the candidate choices for mainworld.

Atmospheric composition based on the Atmosphere code is listed in the Atmosphere Codes table.

**Table 29: Atmosphere Codes**

| Atmosphere | Composition        | Pressure Range (bar) |  Span  | Survival Gear Required | Notes                      |
| :--------: | :----------------- | :------------------: | :----: | ---------------------- | -------------------------- |
|     0      | None               |     0.00–0.0009      |  N/A   | Vacc Suit              | Examples: Mercury, Luna    |
|     1      | Trace              |      0.001–0.09      | 0.089  | Vacc Suit              | Example: Mars              |
|     2      | Very Thin, Tainted |       0.1–0.42       |  0.32  | Respirator and Filter  |                            |
|     3      | Very Thin          |       0.1–0.42       |  0.32  | Respirator             |                            |
|     4      | Thin, Tainted      |      0.43–0.70       |  0.27  | Filter                 |                            |
|     5      | Thin               |      0.43–0.70       |  0.27  | None                   |                            |
|     6      | Standard           |      0.70–1.49       |  0.79  | None                   | Example: Terra             |
|     7      | Standard, Tainted  |      0.70–1.49       |  0.79  | Filter                 |                            |
|     8      | Dense              |      1.50–2.49       |  0.99  | None                   |                            |
|     9      | Dense, Tainted     |      1.50–2.49       |  0.99  | Filter                 |                            |
|     A      | Exotic             |        Varies        | Varies | Air Supply             | Example: Titan             |
|     B      | Corrosive          |        Varies        | Varies | Vacc Suit              | Example: Venus             |
|     C      | Insidious          |        Varies        | Varies | Vacc Suit              |                            |
|     D      | Very Dense         |      2.50–10.0       |  7.50  | Varies by altitude     |                            |
|     E      | Low                |      0.10–0.42       |  0.32  | Varies by altitude     |                            |
|     F      | Unusual            |        Varies        | Varies | Varies                 |                            |
|     G      | Gas, Helium        |         100+         | Varies | HEV Suit               | Dense helium-dominated gas |
|     H      | Gas, Hydrogen      |        1,000+        | Varies | Not Survivable         | Gas Dwarf                  |

Some large terrestrial worlds may be closer to gas giants in atmospheric composition, Atmosphere code F is a broad classification of rare and unusual results and includes some worlds with significant helium and/or hydrogen gas composition but a code G atmosphere is one dominated by a thick envelope of primordial helium and may contain a significant proportion of hydrogen. A code H atmosphere is nearly indistinguishable from the atmosphere of a small gas giant and are often called gas dwarfs. The major component of a gas dwarf world’s atmosphere is hydrogen; it may have a solid surface underneath its crushing pressure but while some armored vehicles might survive on that surface, even at TL15 no commercially available suit will protect a person. In any case, at such extreme pressures the atmosphere’s tiny hydrogen molecules will soon penetrate anything less than bonded superdense armor and will cause havoc with equipment and personnel. For compatibility, the Referee can choose to record atmosphere codes G and H as code F with a subtype of G or F if choosing a world with one of these atmospheres as a mainworld.

Most mainworlds with an atmosphere code of 4–9 reside within the habitable zone, or they have atmospheres that allow them to remain survivable just beyond the zone’s edges, e.g., thin (4 or 5) on the hot side of the zone or dense (8 or 9) on the cold size. For the generation of atmospheres of worlds further beyond the edges of the habitable zone, the procedures in the Non-Habitable Zone Atmospheres section will produce more realistic results.

### ZONE REGIONS

A temperate atmosphere location does not necessarily result in temperate conditions on the world’s surface. The DMs from the atmosphere code can skew the actual surface temperature significantly. Those DMs are listed below for easier reference:

**Table 30: Habitable Zones Regions**

| Raw Roll | HZCO Deviation | Type      | Average Temperature       | Description                                                                             |
| :------: | :------------: | --------- | ------------------------- | --------------------------------------------------------------------------------------- |
|    2-    |  +1.1 or more  | Frozen    | < 222K  (< -51°C)         | Frozen world. No liquid water, very dry atmosphere.                                     |
|    3     |     +1.00      | Cold      | 222 – 273K  (-51°C – 0°C) | Icy world. Little liquid water, extensive ice caps, few clouds.                         |
|    4     |     +0.50      |           |                           |                                                                                         |
|    5     |     +0.20      | Temperate | 273 – 303K  (0°C – 30°C)  | Temperate world. Earth-like. Liquid and vaporised water are common, moderate ice caps.  |
|    6     |     +0.10      |           |                           |                                                                                         |
|    7     |     +0.00      |           |                           |                                                                                         |
|    8     |     -0.10      |           |                           |                                                                                         |
|    9     |     -0.20      |           |                           |                                                                                         |
|    10    |     -0.50      | Hot       | 304 – 353K  (31°C – 80°C) | Hot world. Small or no ice caps, little liquid water. Most water in the form of clouds. |
|    11    |     -1.00      |           |                           |                                                                                         |
|   12+    |  -1.1 or less  | Boiling   | > 353K  (> 80°C)          | Boiling world. No ice caps, little liquid water.                                        |

**Die Modifiers**
- Atmosphere 0 or 1: No modifiers but temperature swings from roasting during the day to frozen at night.
- Atmosphere  2 or 3: DM-2
- Atmosphere 4, 5, or E: DM-1
- Atmosphere  6 or 7: DM+0
- Atmosphere 8 or 9: DM+1
- Atmosphere A, D, or F: DM+2
- Atmosphere B or C: DM+6

To determine the raw roll with limited information, assume the modified roll for a world known to be cold is 4, temperate is 7 and hot is 10. Many worlds have no temperature description. They can be assumed to be temperate unless some other information or the Referee’s wishes contradict that assumption. With at least partial information known about the mainworld’s temperature range and atmosphere, the raw roll can be reverse engineered by removing the DMs applied to the atmosphere and estimating the original dice roll.
### OPTIONAL RULE: RUNAWAY GREENHOUSE
An additional consideration is the eventual evaporation rate of the oceans of hotter worlds and the accelerating effect of this process caused by further rising temperatures. This process is suspected of contributing to Venus’s current incarnation as a roasting hot world under an extremely dense atmosphere. To simulate this, the Referee can examine any world within the habitable zone that has an Atmosphere code of 2–F and is boiling (adjusted temperature roll of 12+) or hot (10 or 11) as a result of basic generation – this can result from a combination of the real roll or Orbit# – simulated raw roll for temperature and the DMs applied for Atmosphere code Table. For these worlds with a base temperature result of hot or boiling the Referee can determine if a runaway greenhouse occurred by rolling 2D:

```Roll
Runaway Greenhouse occurred on 12+: roll 2D +DMs
```

**Die Modifiers**
- System Age: DM+1 per Gyr (round up)
- Boiling Temperature (12+): DM+4 (See below)

If desired, this roll can also be performed on any world closer than the HZCO, with DM-2 for a world with Temperate conditions.

Finally, this runaway greenhouse check can also be performed after detailed temperature determination for any world where the mean temperature exceeds 303K (30°C). For such worlds, use DM+1 for every full 10° above 303K instead of the boiling temperature DM.

If the world already has an Atmosphere code of A, B, C or F+, then the only effect of a runway greenhouse is to consider the world to be boiling if it was only considered hot. This can reduce the hydrographics roll by DM-6 instead of DM-2. For all other worlds, namely those with atmosphere codes 2–9, D, or E, a runaway greenhouse converts their atmosphere code to A, B or C, based on a 1D roll:

**Table 31: Runaway Greenhouse Atmospheres**

|  1D  | New Atmosphere Code |
| :--: | ------------------- |
|  1   | A                   |
| 2–4  | B                   |
| 5 => | C                   |

**Die Modifiers**
- If World Size is 2–5: DM-2
- If original atmosphere was tainted (2, 4, 7, or 9): DM+1

The temperature of any runaway greenhouse world is assumed to be boiling for Hydrographics code generation purposes, although further detailed atmosphere and temperature determination may alter this categorization. All worlds suffering a runaway greenhouse receive a DM+4 on Atmosphere code subtypes determination rolls.

### HABITABLE ZONE ATMOSPHERES
While the atmosphere codes are descriptive enough for most purposes, the Referee may choose to develop more precise values for both total atmospheric pressure and the partial pressure of oxygen for a world.

#### TOTAL ATMOSPHERIC PRESSURE
The value that determines an atmosphere’s classification as thin, standard or dense is its pressure measured in bar at a defined point, the world’s mean baseline altitude. For worlds with a globally consistent major ocean level (most worlds with a Hydrographics code of 6 or above), the mean baseline altitude is usually defined as mean sea level. For more land-dominated worlds with multiple ocean or sea levels or with none at all, an average value of sea levels or often just the world’s mean diameter is used instead.

To determine a more precise atmospheric pressure of a world, use a linear variance across the atmosphere code’s span as indicated in the Atmosphere Codes table. The first formula that follows assumes a linear approach with two standard six-sided dice but the requirement is to provide a linear result between 0 and 1 to multiply by the span, so a real or emulated roll of d100 ÷ 100 is just as valid:

**FORMULA: Total Atmospheric Pressure(bar)**
$\text{Total Atmospheric Pressure(bar)} = \text{Minimum Pressure Range} + \text{Span} \times \frac{(\text{1D - 1}) \times 5 (\text{1D - 1})}{30}$
$\text{or}$
$\text{Total Atmospheric Pressure(bar)} = \text{Minimum Pressure Range} + \text{Span} \times \frac{\text{d100}}{100}$

Round results to two or three digits. This procedure is valid for determining the Atmospheric pressures for any Atmosphere code with a value listed in span column of the Atmosphere Codes table.

#### OXYGEN PARTIAL PRESSURE
The factor that most makes a world habitable, to humans at least, is the partial pressure of oxygen in the atmosphere. This value is computed from the percentage of oxygen in the atmosphere. For most habitable worlds, this oxygen fraction will range between 10 and 30%. Values higher than this range make a world prone to widespread fires which tend to destroy enough flora to reduce the oxygen production and values lower than the range indicate an immature or dying ecosystem, neither of which will likely remain stable over long periods.

The partial pressure of oxygen of Terra is 20.95% of its atmosphere, or 0.212 bar of the 1.013 bar average atmospheric pressure at sea level. Without use of compressors or filters, unmodified humans can adapt to long term survival under oxygen partial pressures between 0.08 and 0.60 bar, although anything beyond the range of 0.1 to 0.5 bar will be difficult for an unacclimated human. Worlds whose pressure range is within the bounds of thin, standard or dense atmospheres (0.43– 2.49 atmospheres) where the oxygen partial pressure is outside this narrower 0.1–0.5 bar range are considered tainted with a low or high oxygen trait (see below).

To determine the fraction of oxygen in the atmosphere of worlds with Atmospheres 2–9, D or E:

**FORMULA: Oxygen Fraction**
$\text{Oxygen Fraction} = \frac{\text{1D + DMs}}{20} + \frac{\text{2D - 7}}{100} + \frac{1D - 1}{20}$
$\text{or}$
$\text{Oxygen Fraction} = \frac{(1D - 1 + DMs)}{20} + \frac{\text{d10}}{100}$*
$\text{*if using d10, treat it as a range of 1-10}$

**Die Modifier**
System age greater than 4 Gyr: DM+1 to 1D roll

The referee may add a linear variance of 0.005 for finer detail.

**Optional DMs:** For greater realism, the oxygen fraction roll can also have a negative DM for younger planets. The below DMs may be reasonable, but they will generate more ‘immature’ worlds with low oxygen than the Referee might want in a universe. These DMs are only recommended for use with the extended method of system generation.

**Optional Die Modifiers**
- System Age 3-3.5 Gyr: DM-1
- System Age 2-3 Gyr: DM-2
- System Age less than 2 Gyr: DM-4

This results in a value from 0–0.4. If the value is 0 (or less with the optional DMs method), then determine it instead as 1D × 0.01, plus a variance, if desired.

Multiplying this fraction by the total atmospheric pressure will give the partial pressure of oxygen (ppo) in bar:

**FORMULA: Partial Pressure of Oxygen(bar)**
$\text{ppo} = \text{Oxygen Fraction} \times \text{Total Atmospheric Pressure}$

If a breathable Atmosphere code of 5, 6 or 8 is already established and the partial pressure of oxygen determined by this procedure is outside the range of 0.1 and 0.50 bar, the Referee may choose to alter the computed values for either ppo or total pressure or both to bring the ppo back into the ‘safer’ 0.1–0.5 human range. Otherwise, the Referee may choose to alter the Atmosphere code of the world to its tainted equivalent (4, 7 or 9) and use high or low oxygen as at least the first factor in its taint (see taint type on page 82). This latter method works well for newly created systems using the extended system generation method but it is not a practical choice for existing defined mainworlds during in the continuation method.

If a Referee wants to specify the concentration of other gases in the atmosphere, then for nitrogen-oxygen atmospheres (2–9, D, E) most of the remaining gas will be nitrogen. The Referee can use 1D ÷ 3% or some other method to generate a random number of about 0.3–2.0% for other gases such as argon, carbon dioxide or neon. Concentrations of carbon dioxide above 0.015 bar will result in a gas mix taint type.

Alternatively, on worlds which can retain significant helium, (see the exotic atmosphere gases section) helium may be a major nonoxygen component in addition to nitrogen, especially for dense and very dense atmospheres.

#### SCALE HEIGHT
Another factor to consider for worlds is the rate at which atmospheric pressure decreases with altitude. This is the scale height of the atmosphere, a number corresponding to the altitude at which the pressure drops by a factor of e (the base of natural logarithms, approximately 2.718). Each multiple of the scale height decreases the atmosphere by another factor of e, and interpolation of values can approximate atmospheric pressures at different altitudes. The formula for determining scale height (H) is proportional to the world’s temperature (T in Kelvin) divided by its mean atmospheric composition (M – the mean mass of one mol of atmospheric particles) and its gravity (g):

**FORMULA: Scale Height(H)**
$\text{Scale Height(H)} ≈ \frac{\text{T}}{\text{M} \times \text{g}}$

The scale height value for Terra is approximately 8.5 kilometres. Assuming near-Terran temperature and atmospheric gas mix, scale height can be assumed to be roughly 8.5 kilometres divided by the world’s gravity. Worlds with lower gravity will have ‘higher’ atmospheres, all other things being equal. A similar effect will influence the height of terrain features, with worlds of lower gravity being able to support taller mountains – again with all other things being equal. This book will use the approximation:

**FORMULA: Scale Height(H)**
$\text{Scale Height(H)} ≈ \frac{8.5km}{\text{g}}$

This should be roughly valid for worlds with Atmospheres of 2–9, D and E and temperate climates. For greater precision, scale height will be less as temperatures become colder (use the Kelvin scale for the magnitude of comparison, assuming 288K as the value for Terra) and increase as temperatures become warmer:

**FORMULA: Scale Height(H)**
$\text{Scale Height(H)} ≈ \frac{8.5km \times \text{Mean Temperature (K)}}{\text{g}}$

Another result based on scale height that can be of interest to any Traveller climbing a mountain or descending into a chasm – and even more important in the case of Atmosphere D and E worlds – is the pressure at an arbitrary height (a). This is equal to the mean pressure (m) divided by e raised to the power of the arbitrary height(a) divided by the scale height (H) or:

**FORMULA: Pressure(a)**
$Pressure(a) = Pressure(m)\ ÷ (\frac{height(a)}{H})^{e}$

This equation requires both H and height(a) to be expressed in the same units (usually kilometres).

#### ATMOSPHERE PROFILE
For worlds with a nitrogen-oxygen atmosphere, a minimal shorthand record of the atmosphere needs to consider most of all the oxygen partial pressure of the world. The profile is written as:

**A-bar-ppo**
Where:
- A = Atmosphere code
- bar = atmospheric pressure in bar
- ppo = partial pressure of oxygen in bar. 

For instance, for Terra it would be 6-1.013-0.212. The exotic atmosphere profile and any taint profiles can accompany this information after a colon, e.g., 6-1.013-0.212:N2-78:O2-21:Ar-01.

```Example
Zed Prime’s Atmosphere is 6, meaning standard with no taint. To determine its actual atmospheric pressure, take the lower range value standard (0.7) and add a variable portion of the span (0.79). Using the sixside dice only method: rolling 1D-1 for 2,which gets multiplied by 5 to 10 and adding 1D-1 for 3 results in 13, so the pressure is 0.7 + 0.79 × 13 ÷ 30 = 1.0423, rounded to 1.042 bar.

Oxygen partial pressure benefits from the age of the system (DM+1) so it is rolled as (1D+1 ÷ 20) + (2D-7 ÷ 100) with 1D = 5 and 2D = 5, the result is (5+1) ÷ 20 + (5-7 ÷ 100) = 0.28 or 28%. Multiplied by the total atmospheric pressure, this results in an oxygen partial pressure of 0.292 bar. This is a little rich for the uninitiated but perfectly breathable. Fire risk is rather high at a 29% mix but within an acceptable range. Assuming all other factors being equal, scale height is computed as proportional to 1 ÷ G or 8.5 ÷ 0.66 = 12.88km. The pressure at an arbitrary height of 5km above the mean baseline altitude would be 0.707 bar, with oxygen partial pressure at that altitude of 0.206 bar. 

A basic atmosphere profile for Zed Prime would be:
6-1.042-0.292.
```
#### SUBTYPES: TAINT
Some worlds have nitrogen-oxygen atmospheres that would be perfectly breathable but for some small component or an odd ratio of gases. Humans consider these worlds to have tainted atmospheres, although their native life and perhaps other starfaring sophonts might find the atmosphere perfectly acceptable. Likewise, other species may find issue with worlds humans consider pleasant. The determination of taint is human-centric. Taint applies to Atmosphere codes 2, 4, 7, and 9. Taints have a subtype, a severity and a persistence. To determine the cause of this taint, roll 2D and consult the Taint Subtype table.

**Table 32: Taint Subtype**

|     2D+DM     | Taint Subtype                | Subtype Code |
| :-----------: | ---------------------------- | :----------: |
|      2-       | Low Oxygen                   |      L       |
|       3       | Radioactivity                |      R       |
|       4       | Biologic                     |      B       |
|       5       | Gas Mix                      |      G       |
|       6       | Particulates                 |      P       |
|       7       | Gas Mix                      |      G       |
|       8       | Sulphur Compounds            |      S       |
|       9       | Biologic                     |      B       |
|      10       | Particulates and roll again* |      P       |
|      11       | Radioactivity                |      R       |
|      12+      | High Oxygen                  |      H       |
| Atmosphere 4  | DM-2                         |              |
| Atmosphere 9: | DM+2                         |              |

**Die Modifiers**
- Atmosphere 4: DM-2
- Atmosphere 9: DM+2

(There are no DMs for very thin or very dense atmospheres – they are by definition already low or high oxygen).

\*A result of 10 indicates a taint from both particulates and one other cause – the outcome of this second roll can be a separate subtype of particulates or even another result of 10, requiring a roll for a third subtype of taint. A world should have no more than three taint conditions.

If a world of Atmosphere 4, 7, or 9 has already been determined to have a low or high oxygen taint, this condition is the first taint subtype for that world. A roll is still required to check for a result of 10. On a result of 10, particulates become the second taint subtype for the world. Another roll is now necessary but only on a 10 does a third taint condition occur and this third subtype is determined by one final roll.

If the resultant taint subtype becomes low or high oxygen as an outcome of a roll on the Taint Subtype table, adjust oxygen partial pressure to be less than 0.1 or greater than 0.5 by -1D/100 or +1D/10, respectively, lowering the oxygen percentage and replacing it with nitrogen or some other gas, keeping the atmospheric pressure constant. When rolling on the Taint Subtype table to determine taints or irritants of any atmosphere of a code outside the range of 4–9, results of low or high oxygen are treated as a gas mix (G) irritant instead, as do any second or third taints resulting in oxygen level taints.

**Biologic (B):** A biologic taint results from airborne or surface microbes. These could be virus, bacteria, fungi or some other microscopic organism causing harm if inhaled or touched. A result of a biologic taint or irritant forces the world to have a Biomass rating (see page 127) of at least 1.

**Gas Mix (G):** The composition or percentage mixture of various atmospheric components is harmful to humans. This could be trace gases such as carbon monoxide, or an irritant such as low levels of chlorine or fluorine. It could also be excess percentages of carbon dioxide (more than 0.015 bar can be hazardous) or certain mixtures of nitrogen and oxygen that lead to nitric acids or ‘acid rain’ under certain conditions. Excessive ozone or very high fractions of oxygen (usually, but not always, more than 30%) can also cause this taint. Nitrogen partial pressures above 2 bar can also cause a gas mix taint.

**High Oxygen (H):** The partial pressure of oxygen is above 0.5 bar. Some levels above this may be tolerable for short periods. Up to 0.6 may be tolerable with acclimation but higher levels will cause oxygen toxicity after longer term exposure.

**Low Oxygen (L):** The partial pressure of oxygen is below 0.1 bar. Ranges near this level might be survivable with acclimation but levels below 0.06 bar will always cause cell damage and eventual death unless significant medical interventions such as genetic manipulation or lung modifications are employed. Unlike other taints, a filter mask will not counter the effect of low oxygen; a respirator is required just as if the Atmosphere code was very thin (2 or 3). If the atmosphere was already very thin, tainted (2), then a more powerful respirator at twice the cost of a standard unit is necessary.

**Particulates (P):** The atmosphere contains airborne particulates such as dust, smoke or industrial pollutants. These particulates often cause haze, smog or other visibility impairments and are hazardous to inhale.

**Radioactivity (R):** Radioactive gases such as radon may be present in harmful concentrations. This taint may also arise from a world lacking a strong protective magnetic field to block cosmic radiation. It may result from a magnetic field that interacts with the surface, or it may occur from external conditions such as solar activity or the magnetic fields from nearby gas giants or neutron stars.

**Sulphur Compounds (S):** Sulphur compounds are present in the atmosphere. These gases may be volcanic or biologic in origin. On worlds that are cold or frozen (with mean temperatures below 273K) treat sulphur compound (S) results as particulates (P), instead.

#### TAINT SEVERITY AND PERSISTENCE
The effects and severity of taints vary greatly. In some instances, acclimation or inoculation can alleviate the consequences for residents even if the taint remains a factor for short-term or unprepared visitors. In other cases, the taint requires filters or other equipment for all inhabitants. Genetic or surgical alterations may overcome the effects of some taints. The detrimental impact of taints varies from irritant to potentially lethal levels. This can be established at the discretion of the Referee or randomly by rolling on the Taint Severity and Taint Persistence tables. If a world has multiple taints, the severity and persistence of each can be rolled separately.

Taint Severity and Persistence is an optional property. It can be ignored, or the Referee can use the tables for inspiration without making a roll. These tables are also used for determining the Severity of irritants in exotic, corrosive and insidious atmospheres.

**Table 33: Taint Severity**

| 2D+DM | Code | Severity              | Outcomes or Countermeasures                                                  |
| :---: | :--: | --------------------- | ---------------------------------------------------------------------------- |
|  4-   |  1   | Trivial irritant      | After 1D weeks acclimation, this taint is inconsequential                    |
|   5   |  2   | Surmountable irritant | After 1D months acclimation, this taint is inconsequential                   |
|   6   |  3   | Minor irritant        | Surmountable on Difficult (10+) END check                                    |
|   7   |  4   | Major irritant        | Filter masks required or TL10+ medical intervention                          |
|   8   |  5   | Serious irritant      | Filter masks required or TL12+ medical intervention                          |
|   9   |  6   | Hazardous irritant    | Filter masks required or TL14+ medical intervention                          |
|  10   |  7   | Long term lethal      | DM-2 to aging rolls. Filter masks required                                   |
|  11   |  8   | Inevitably lethal     | Death within 1D days. Filter masks required; protective clothing recommended |
|  12+  |  9   | Rapidly lethal        | Death within 1D minutes. Filter masks and protective clothing required       |
**Die Modifiers**
- High and Low Oxygen taints: DM+4\*
- Insidious Atmosphere(C): DM+6
\*Optionally, for these taints, set severity to levels specific to ppo: for low oxygen, Severity = 2 if ppo is at least 0.09, 3 if ppo is at least 0.08 and 8 or 9 if ppo is lower. For high oxygen, Severity = 2 if ppo is less than 0.6, 7 if ppo is less than 0.7 and 8 or 9 if ppo is higher.

**Table 34: Taint Persistence**

|2D+DM|Code|Persistence|
|---|---|---|
|2-|2|Occasional and brief|
|3|3|Occasional and lingering|
|4|4|Irregular|
|5|5|Fluctuating|
|6|6|Varying|
|7|7|Varying|
|8|8|Varying|
|9+|9|Constant|
- Occasional and brief: Occurs periodically or on a 2D roll of 12 per day and lasts 1D hours1
- Occasional and lingering: Occurs periodically or on a 2D roll of 12 per day and lasts 1D days1
- Irregular: Occurs on a 2D roll of 9+ and lasts for D3 days1
- Fluctuating: roll 2D daily: on 6-, reduce severity by one level; on 12 increase severity by one level1
- Varying: Always present but roll 2D daily: on 6-, reduce severity by one level for 1D hours1
- Varying: Always present but roll 2D daily: on 4-, reduce severity by one level for 1D hours1
- Varying: Always present but roll 2D daily: on 2, reduce severity by one level for 1D hours1
- Constant: Ever-present at indicated severity1

**Die Modifiers for Taint Persistence**
- High and Low Oxygen taints: DM+4 (DM+6 if Severity is 8+)
- Atmosphere C: DM+6

Some individuals may overcome a minor irritant. This could come from immunity, acclimation, the will to ignore an uncomfortable environment or some genetic advantage. A person may attempt to surmount this taint twice: once on first exposure and again after 1D months of acclimation. This acclimation does not need to be continuous but only full months of exposure – with filter masks and daily exposure to the environment, count towards this acclimation period. Filter masks and/or TL10+ medical intervention is also always effective against minor, surmountable and trivial taints. A medical procedure involves surgery or genetic manipulations and costs 1D × Cr1000 × minimum TL, though some worlds may offer free or reduced cost procedures to entice colonists.

Occasional taints that occur periodically can be triggered by seasonal effects, lifecycles of native organisms, the proximity of external objects, such as a secondary star or an eccentric planet, or some other regular event determined by the Referee.

#### TAINT PROFILE
An atmosphere’s taint(s) or irritant can be written as:

**T.S.P**

Where:
- T = Taint type
- S = Severity
- P = Persistence.

For instance, a biologic major irritant of fluctuating persistence can be recorded as B.4.5. 
Multiple taints are listed separated by a comma

```Example
The mainworld of the Zed system does not have a taint but the fourth moon of Aab V, with a SAH of 340, does. Prior to checking for taint, the Referee performs some detailed generation on this moon to ensure that it does not automatically suffer from the low oxygen taint. A quick generation of Size-related stats for Aab V d yields a 5,225km mostly rocky world with 0.65 density, resulting in a gravity of 0.27 for a 0.045⊕ mass body. Moving on to atmosphere, its pressure is thin, 0.544 bar, of which 21% or 0.114 bar is oxygen – enough to avoid an automatic low oxygen taint.

But the atmosphere is definitely tainted, so rolling for taint subtype (with DM-2 for Atmosphere 4) and getting a 12-2 = 10, results in particulates and another roll, which is a 5-2 = 3:radioactivity. This poor moon has both a particulate and a radioactive taint. The Referee decides that the result of particulates comes from windblow dust and sand on the desert world and radioactivity comes from radiation belts around the gas giant. Rolling for the particulates results in a severity of 6:hazardous – so a dangerous combination of particles – and persistence of 3:occasional and lingering – so that supports the interpretation of the taint as periodic dust storms. The radioactivity taint is 5:serious and 4:irregular, likely meaning that the moon resides near the edge of the radiation belt and only occasional changes in solar activity or other factors causes the radiation belt to penetrate the atmosphere. So, visitors to this moon could occasionally be safe from all taints but sudden dust or radiation storms could cause one or both conditions to occur.

Protective equipment of a filter mask and a very good sunscreen (or protective clothing) prevents long-term damage to visitors and inhabitants. An inhabitant wishing to use medical procedures to become immune to both taints would require two procedures but even then, skin damage from sharp particulates driven by dust storms likely requires at least some protection and radiation protection likely requires an expensive treatment – if available at all. The subtype codes for this world’s taints are P.6.3 and R.5.4.
```

### SUBTYPES: EXOTIC (A)
An exotic Atmosphere code (A) is unbreathable but otherwise not overly hazardous. This can result from a simple lack of oxygen in a pure or nearly pure nitrogen atmosphere, such as on a world with an absent or very immature ecosystem, or it can result from a variety of gases not compatible to human life, such as carbon dioxide, methane or ammonia. The category of exotic can range widely in pressure and may contain a number of irritants. This variety of atmospheres is optionally further detailed by the Exotic Atmosphere Subtype table.

Irritant is the exotic equivalent of a taint. This could require the donning of protective equipment in addition to oxygen tanks to survive. The Referee can use the Taint Subtype, Severity and Persistence tables from the preceding Subtype: Taint section to determine the nature and dangers of the irritant. Irritant gases can include ammonia and various compounds of nitrogen and sulphur.

Occasional corrosive atmospheres contain components such as chlorine or fluorine or other compounds which at some times and some locations make the atmosphere dangerous enough to qualify as corrosive (B). Treat such atmospheres as having a gas mix (G) irritant with a roll of 1D+9 on the Taint Severity table and a roll of 1D+1 on the Taint Persistence table.

More detailed atmospheric pressures for exotic atmospheres can be determined from pressure range (bars) and span using either of the total atmospheric pressure (bar) equations.

#### EXOTIC ATMOSPHERE GASES
The actual composition of an exotic atmosphere can vary widely and include more than one gas. In most cases these atmospheres will include inert gases such as argon or krypton, and on young or more massive worlds, neon and possibly helium gas may be present in substantial quantities. The major factors in determining possible gas mixes are the world’s mass, temperature, age and the relative natural abundance of different elements or molecules.

For Referees who just want a quick answer to gas compositions, the Atmosphere Gas Mix Tables section provides a quick reference based on atmosphere type and temperature. For those who wish to explore possibilities with greater realism, the following section provides this detail.

**Caution: In most cases, detailed interactions between gas types and other chemistry-related factors are not considered in this section. Such interactions may cause some gas combinations to be unstable over geological periods. This is not intended to be a chemistry textbook.**

Over time – a billion or more years – lighter gases will gradually migrate to the top of a world’s atmosphere and statistically reach escape velocity, especially at higher temperatures and lower gravities. The Atmospheric Gas Composition table provides possible gases that can exist in exotic, or really, any, atmospheres. A gas is possibly retained in the atmosphere over long periods (more than a Gyr) if its retention value is less than the mass of the world divided by its diameter and temperature and if the gas in question remains gaseous at the temperatures on the world. Each gas listed has an escape value based on its molecular weight, with heavier molecules receiving a lower value. Heavy molecules such as carbon dioxide and chlorine are more likely to be present on smaller planets than light gases such as methane and ammonia but these heavy gases may be liquid or solid on the worlds that are too cold. An assumption for this book is that only those worlds capable of retaining hydrogen ions are considered likely to remain gas giants or dwarfs over their multibillion- year lifespans.

**FORMULA: EXOTIC GASES EXISTS IN ATMOSPHERE**
$\text{Gas Can Exist if its Escape Value on the Atmosphere Composition meets the criteria:}$
$< 1,000 \times \frac{M}{D \times T}$

In the above formula, M and D are the world’s mass and diameter in terms of units of Terra and K is the temperature in kelvin. The temperature can be a rough estimate, with an assumption of about 290 for the HZCO and 340 and 240 as the habitable zone extremes.

**Table 35: Atmospheric Gas Composition**

| Gas               | Code  | Escape Value | Atomic Mass | Boiling  Point (K) | Melting  Point (K) | Relative Abundance | Taint |
| ----------------- | :---: | :----------: | :---------: | :----------------: | :----------------: | :----------------: | :---: |
| Hydrogen Ion      |  H-   |    24.00     |      1      |         20         |         14         |        n/a         |   —   |
| Hydrogen          |  H2   |    12.00     |      2      |         20         |         14         |       1,200        |   N   |
| Helium            |  He   |     6.00     |      4      |         4          |         0          |        400         |   N   |
| Methane           |  CH4  |     1.50     |     16      |        113         |         91         |         70         |   Y   |
| Ammonia           |  NH3  |     1.42     |     17      |        240         |        195         |         30         |   Y   |
| Water Vapour      |  H2O  |     1.33     |     18      |        373         |        273         |        100         |   N   |
| Hydrofluoric Acid |  HF   |     1.20     |     20      |        293         |        190         |         2          |   Y   |
| Neon              |  Ne   |     1.20     |     20      |         27         |         25         |         50         |   N   |
| Sodium            |  Na   |     1.04     |     23      |       1,156        |        371         |         40         |   Y   |
| Nitrogen          |  N2   |     0.86     |     28      |         77         |         63         |         60         |   N   |
| Carbon Monoxide\* |  CO   |     0.86     |     28      |         82         |         68         |         70         |   Y   |
| Hydrogen Cyanide  |  HCN  |     0.86     |     28      |        299         |        260         |         30         |   Y   |
| Ethane            | C2H6  |     0.80     |     30      |        184         |         90         |         70         |   Y   |
| Oxygen            |  O2   |     0.75     |     32      |         90         |         54         |         50         |   N   |
| Hydrochloric Acid |  HCl  |     0.67     |     36      |        321         |        247         |         1          |   Y   |
| Fluorine          |  F2   |     0.63     |     38      |         85         |         53         |         2          |   Y   |
| Argon             |  Ar   |     0.60     |     40      |         87         |         83         |         20         |   N   |
| Carbon Dioxide    |  CO2  |     0.55     |     44      |        216         |        194         |         70         |   Y   |
| Formamide         | CH3NO |     0.53     |     45      |        483         |        275         |         15         |   Y   |
| Formic Acid       | CH2O2 |     0.52     |     46      |        374         |        281         |         15         |   Y   |
| Sulphur Dioxide   |  SO2  |     0.38     |     64      |        263         |        201         |         20         |   Y   |
| Chlorine          |  Cl2  |     0.34     |     70      |        239         |        171         |         1          |   Y   |
| Krypton           |  Kr   |     0.29     |     84      |        120         |        115         |         2          |   N   |
| Sulphuric Acid    | H2SO4 |     0.24     |     98      |        718         |        388         |         20         |   Y   |

\*Carbon monoxide (CO) is only stable over long periods in the absence of liquid or gaseous water (H2O). Over time CO will react with H2O to create CO2 and H2 or, under higher pressure, formic acid (CH2O2). At most temperatures CH4 or CO2 will be more common but at temperatures above 900K CO will be more dominant that CH4 in most atmospheres

The Referee is free to include gases which fail the retention value test in a world’s atmosphere but such gases would then usually need a source of replenishment, such as underground reservoirs released by volcanism or artificial supplementation by technological means. For worlds younger than one Gyr, the Referee may also choose to divide the retention value for a gas by two or more. This table can be used to examine the possible atmospheric composition of a world’s taint as well. The code or chemical formula is an optional subtype value used to describe the major gas or gases in any atmosphere. The taint column indicates whether the gas is automatically considered a taint or irritant.

However, any gas, including oxygen and nitrogen, could potentially be considered a taint at certain concentrations and under certain conditions.

If the temperature of the world is greater than the Boiling Point (K) of the gas, that gas can potentially be a component of the atmosphere. If the temperature is only above the Melting Point (K), the gas could be a component of the world’s seas or might even fall as rain. Both Boiling and Melting Points can vary based on atmospheric pressure. These values are based on standard atmosphere and pressure. The relative abundance value is an arbitrary and rough value proportional the molecule’s likely abundance, although this can vary widely across different worlds and systems. In the Atmospheric Gas Composition table the abundance of oxygen gas is relatively lowered, as it can readily combine with other elements such as carbon and sulphur. Likewise, the prevalence of relatively inert gases such as helium, neon, argon and even nitrogen are slightly elevated. The Referee can use the abundance to estimate the probability of a gas being present in an exotic atmosphere and/or its relative abundance in that atmosphere.

#### EXOTIC ATMOSPHERE PROFILE (A)
An exotic atmosphere’s subtype is simply recorded as A–St# with A as the atmosphere code and the # indicating the subtype code. Irritants are recorded in the same manner as taints. If desired, the Referee can append a colon and the codes for the 1–3 most prominent gases as XX:YY:ZZ, or if using percentages as XX-##:YY-##:ZZ-##, with ## equal to the two-digit whole number percentage of the gas. If desired and computed, the bar value of the total atmospheric pressure can precede the gas mix. For example, an exotic subtype 4 atmosphere of 0.55 bar composed of 75% nitrogen, 20% carbon dioxide and 4% argon, with a serious(5), irregular(4), particulate(P) irritant, may be recorded as A-St4 P.5.4, or A-St4:N2:CO2:Ar P.5.4, or A-St4:N2-75:CO2-20:Ar-04 P.5.4, or A-St4:0.55:N2- 75:CO2-20:Ar-04 P.5.4 depending on the detail a Referee chooses to include. The full profile is of the form:

**A-St#:bar:XX-##:YY-##:ZZ-## I.S.P**

I = irritant type – equivalent to taint type, followed by the taint profile components

```Example
As an example, this section can also allow a Referee to examine if the desert moon Aab V d should really retain a nitrogen-oxygen atmosphere. Its values are mass = 0.045, diameter = 0.41 and first guess temperature = 240. This results in an escape value of 0.457. Checking the table, this is only good enough to retain sulphur dioxide and heavier gases. The retention value would need to be 0.75 or 0.86, to retain oxygen or nitrogen, respectively, and higher still to retain water. As the system is 6.3 billion years old, some other factor such as terraforming by the Ancients or continued outgasing from deep reservoirs of nitrogen and oxygenrich materials must be replenishing the atmosphere. A moon in orbit around a gas giant, especially accompanied by another large moon (see the Seismic Stress section on page 125) might experience enough tidal activity to remain geologically active even late into middle age and could still be spewing gases into the atmosphere. But it is little wonder this desert moon has lost all surface water, as water vapor has an even higher escape value than oxygen and nitrogen.

To examine a world with an actual exotic atmosphere in the Zed system, look to another moon of Aab V. The second moon has an SAH of AA6. First, back up and determine the moon’s actual diameter, density, gravity, and mass, rolling to get 15,992km (1.255⊕), 0.94, 1.18G and 1.86⊕, respectively.

Next, a 2D roll on the Exotic Atmosphere Subtype table results in 9:dense, irritant. Actual atmospheric pressure is rolled as 2.09 bar. Using the Taint Type table to check for irritant results in 9+2 (for the dense atmosphere) = 11:radioactivity, probably from radiation belts as this is a gas giant moon. Rolling for severity and persistence results in 2:surmountable and 9:constant – indicating a low level of radiation reaching the surface that can be countered with supplements and/or minor medical interventions. Now, with information on mass and diameter and using a 290K value for temperature (a concession for the dense atmosphere, although greenhouse factors will be covered in depth later) for this super-earth-sized moon, the resulting escape value is 5.1, enough to retain everything except hydrogen and helium. The gases with boiling points above 300 are all of the rest except water (good, since it would be best to stay liquid) and hydrochloric acid.

To determine the actual atmospheric composition of Aab V b, the Referee can look at the remainder of the gases and their abundance. Of these, the prevalent are gases based on carbon: methane, ethane and carbon dioxide. Oxygen is the next prevalent but as the world has an exotic atmosphere, the Referee rules that free oxygen does not exist, although it may be combined with another element to produce a gas such as carbon dioxide. The Referee chooses to have this world’s atmosphere dominated by nitrogen, carbon dioxide and methane. Its subtype code could be written as: A-St9:2.09:N2:CO2:CH4 with an irritant of R.2.9. The Referee can assign % values to these gases if desired, based upon their relative abundance and some randomisation. This atmosphere may cause a greater greenhouse effect (again, something which could be examined later) but recomputing the escape value limit even at 373K results in a value more than twice that required to retain methane.
```

### SUBTYPES: CORROSIVE (B) AND INSIDIOUS (C)
Atmosphere codes B and C are corrosive and insidious. Insidious is like corrosive, only more so. Proper protective equipment and countermeasures can counteract a corrosive atmosphere almost indefinitely but an insidious atmosphere will defeat even the best protective equipment in a manner of hours or, at best, days. These atmosphere types might have the same component gases as exotic atmospheres but in concentrations, pressures or temperatures which make them continually hazardous.

For both corrosive and insidious atmospheres roll on the Corrosive and Insidious Atmosphere Subtype table with the DMs indicated.

**Table 36: Corrosive and Insidious Atmosphere Subtype**

| 2D  | Code | Atmosphere Type                              | Pressure Range (bar) |  Span   |
| :-: | :--: | -------------------------------------------- | :------------------: | :-----: |
| 1-  |  1   | Very Thin, Temperature 50K or less           |       0.1–0.42       |  0.32   |
|  2  |  2   | Very Thin, Irritant                          |       0.1–0.42       |  0.32   |
|  3  |  3   | Very Thin                                    |       0.1–0.42       |  0.32   |
|  4  |  4   | Thin, Irritant                               |      0.43–0.70       |  0.27   |
|  5  |  5   | Thin                                         |      0.43–0.70       |  0.27   |
|  6  |  6   | Standard                                     |      0.70–1.49       |  0.79   |
|  7  |  7   | Standard, Irritant                           |      0.70–1.49       |  0.79   |
|  8  |  8   | Dense                                        |      1.50–2.49       |  0.99   |
|  9  |  9   | Dense, Irritant                              |      1.50–2.49       |  0.99   |
| 10  |  A   | Very Dense                                   |      2.50–10.0       |  7.50   |
| 11  |  B   | Very Dense, Irritant                         |      2.50–10.0       |  7.50   |
| 12  |  C   | Extremely Dense                              |        10.0+         | unbound |
| 13  |  D   | Extremely Dense, Temperature 500K+           |        10.0+         | unbound |
| 14+ |  E   | Extremely Dense, Temperature 500K+, Irritant |        10.0+         | unbound |

**Die Modifiers for Corrosive and Insidious Atmosphere Subtype**
- Size 2–4: DM-3
- Size 8+: DM+2
- Orbit less than HZCO-1: DM+4
- Orbit greater than HZCO+2: DM-2
- Atmosphere is Insidious (C): DM+2
- Runaway greenhouse result*: DM+4
\*If the atmosphere became Exotic because of a runaway greenhouse check

More detailed atmospheric pressures for these atmospheres can be determined from pressure range (bars) and span using either of the total atmospheric pressure (bar) equations.

Consult the Possible Gas Composition table or the Atmosphere Gas Mix tables section to determine likely corrosive and insidious components. At extreme pressures and temperatures, even relatively benign gases such as nitrogen or carbon dioxide can be considered corrosive as the atmosphere will require special protection against the crushing heat. The planet Venus is an example of a world with a corrosive atmosphere of this type (subtype D). Only insidious extremely dense atmospheres should have pressures exceeding 1,000 bar.

A corrosive or insidious atmosphere may include an irritant if indicated by type. The Referee can use the Taint Subtype, Severity and Persistence tables from the preceding Subtype: Taint section to determine the nature and dangers of the irritant.

In addition to a possible irritant, an insidious atmosphere always has an inherently hazardous component. This could be a particular gas, a combination of gases, or even a factor such as high levels of radiation that is not necessarily directly an atmospheric concern, although it could manifest in radioactive gas isotopes or secondary effects from radioactive reactions with existing gases. Unlike an irritant effect, these hazards are considered automatically lethal and constant, and their hazard code is added directly to their subtype. To determine the type of insidious atmosphere hazard roll on the Insidious Atmosphere Hazard table.

**Table 37: Insidious Atmosphere Hazard**

|2D|Hazard|Hazard Code|
|---|---|---|
|4-|Biologic|B|
|5|Radioactivity|R|
|6|Gas Mix|G|
|7|Gas Mix|G|
|8|Temperature|T*|
|9|Gas Mix|G|
|10|Temperature|T*|
|11|Radioactivity|R|
|12+|Temperature|T*|

\*If the insidious subtype is D or E, a T hazard automatically exists, roll again for an additional hazard

**Die Modifiers for Insidious Atmosphere Hazard**
- Atmosphere is extremely dense: DM+2

**Biologic (B):** A lifeform, possibly of exotic biochemistry, or even an organism based on plasma is a virulent danger to equipment and possibly to carbon-based lifeforms. A result of a Biologic hazard forces the world to have at Biomass Rating (see page 127) of at least 1. 

**Gas Mix (G):** Consult the Atmospheric Gas Composition table and select appropriate hazardous atmospheric components. Some surprising situations can lead to insidious effects. For instance, an atmosphere composed of high pressure high temperature water vapor can be extremely damaging to materials. Another potentially insidious effect is hydrogen gas which will infiltrate all but the highest technology armour (TL15+), and cause an explosive reaction when mixed with oxygen.

**Radioactivity (R):** Either as an effect of radiation belts, natural deposits or radioactive isotopes in the air itself, exposure outside of extremely heavily sheltered environments is often rapidly fatal. Radiation levels are 1D × 100 rads per exposure – compare radiation absorbed with protective suit Rad ratings and apply surplus radiation for every hour of exposure. Exposed equipment will degrade even with decontamination. Treat non-hardened equipment as under the constant effect of an EMP weapon of TL6 +1D.

**Temperature (T):** Most often this is an issue of very high temperatures, either caused by solar radiation, atmospheric pressure or volcanic activity – some worlds may be inundated by oceans of magma. In rare cases, extremely cold temperatures – below 5K – may cause damage to equipment and overwhelm a suit’s heating capabilities. At 4 K, helium becomes a superfluid, flowing up walls, acting as a superconductor and causing other unexpected effects. Insidious subtype D or E always has a temperature hazard.

##### CORROSIVE AND INSIDIOUS ATMOSPHERE PROFILE (B AND C)
Profiles for these atmospheres are similar to those for exotic atmospheres. For a corrosive atmosphere it is:

**B-St#:bar:XX-##:YY-##:ZZ-## I.S.P**

For an insidious atmosphere it includes the hazard code in the form:

**C-St#.H:bar:XX-##:YY-##:ZZ-## I.S.P**

With:
- H = hazard code 
- I = irritant
  
followed by the taint profile components. Insidious atmospheres of subtype D and E inherently include hazard T and only their additional hazard is normally indicated after the subtype. 

As with exotic atmosphere profiles, bar:XX-##:YY-##:ZZ-## are optional profile components.

```Example
In the Zed system, the world AaB VI has a SAH of AB6 and resides in the outer regions of the system’s habitable zone. The size profile determined for this world is A-16134-1.03-1.30G-2.09. Rolling on the Corrosive and Insidious Atmosphere Type table results in a 4 with DM+2 for Size = 6:standard. Total atmospheric pressure is rolled as 1.21 bar.

Next, determine the gas mix that makes this world corrosive: although in the outer part of the habitable zone, the slightly higher pressure makes a temperature of about 290K feasible for the escape value calculation which then becomes 1,000 x 2.09 ÷ 1.266(diameter) ÷ 290 = 5.87, which allows everything but hydrogen and helium as major components. Since neither temperature nor pressure makes the atmosphere corrosive, some nasty gases must be the cause. Ammonia may have the highest probability of causing issues, especially in high quantities. Rather than mix ammonia with nitrogen, of which it is a component, perhaps it would be better to make the other major component carbon dioxide, which makes for a nice corrosive world recorded as:

B-St6:1.21:NH3:CO2.
```

### TYPE: VERY DENSE (D)
A very dense atmosphere is a nitrogen-oxygen atmosphere whose pressure is too high to support human life at its mean baseline altitude. A human can experience oxygen toxicity from prolonged exposure of over 0.50 bar and will experience nitrogen narcosis – a degradation in function similar to euphoria or intoxication – at partial pressures of nitrogen above 2.0 bar. Other gases that are normally non-toxic will cause narcosis in high enough concentrations, with helium perhaps being the least dangerous, with tolerance of pressure of up to 40 or more bar. In most instances it will be the levels of nitrogen and oxygen that cause a very dense atmosphere to become unbreathable.

Nitrogen narcosis becomes a very severe impairment at levels above 5.0 bar. Treat all tasks occurring in a high nitrogen environment as having a negative DM equal to the nitrogen partial pressure minus 1 bar. Round this DM in the check’s favor, e.g., the partial pressure of nitrogen must be at least 2.0 bar for a DM-1 and becomes DM-2 only at 3.0 bar.

There is no acclimation process to eliminate nitrogen narcosis but medical procedures, similar to those for overcoming taint factors, are possible. For oxygen toxicity, beyond 0.6 bar, there is no treatment – the high levels of oxidation cause damage to tissues that can only be overcome by protective filters and/or clothing.

A very dense atmosphere ranges in pressure between 2.5 and 10 bar. Thicker atmospheres of nitrogen-oxygen are possible but these are considered extremely dense and are a subtype of unusual (F) atmospheres, as they have very limited altitudes where they are survivable. On worlds with considerable terrain height variation, especially those at the lower ranges of very dense atmospheres, certain uplands might have low enough pressures to support human life. Computing the density of nitrogen and oxygen at different heights above mean baseline altitude can determine where the atmosphere is breathable. A very dense atmosphere follows the same procedures as Atmospheres 2–9 to determine the oxygen partial pressure (see page 80) and determines the nitrogen partial pressure based on the guidelines provided in that section.

Scale height (see page 81) is the major determinant of this pressure and is inversely proportional to the world’s gravity. As worlds with very dense atmospheres tend to be large and likely have higher gravity, their scale heights will tend to be lower than Terra’s 8.5 kilometres. On Terra, only four mountain peaks exceed this height. Higher gravity and weathering from the effects of the very dense atmosphere may eliminate any suitable land on many worlds with these atmospheres, leaving only the skies available for a comfortable existence. At TL10 and above, this can lead to grav-supported flying cities. At lower Tech Levels, cities held aloft by balloons of lighter or heated gas might support sky settlements.

Habitable locations are defined by the minimum safe altitude for long-term survival and occur at altitudes which meet both of the following criteria:
- Nitrogen partial pressure < 2.0 bar (though < 3.0 might be acceptable)
- Oxygen partial pressure < 0.5 bar (though < 0.6 might be acceptable)

A derivative of the scale height formula – with help from a computer or calculator – can help determine the required altitude by taking the worst violation of these two criteria and comparing it to the safe level of that gas:

First, determine the ‘bad ratio’, or the ratio the worst offender must be reduced to be safe:

**FORMULA: Bad Ratio**
$\text{Bad Radio} = \frac{\text{Pressure of 'bad gas' at mean baseline altitude}}{\text{Safe Pressure of bad gas}}$

Next, determine the minimum safe altitude as a multiple of the scale height. The natural log (ln) of the bad ratio times the world’s scale height is equal to the minimum safe altitude:

**FORMULA: Minimum Safe Altitude**
$\text{Minimum Safe Altitude} = \text{In(Bad Ratio)} \times \text{Scale Height}$

If the minimum safe altitude for nitrogen causes oxygen levels to be below 0.1 bar, then a compressor would still be required to thrive and no level of the world’s atmosphere would be compatible with unprotected human existence.

At the Referee’s discretion, very dense atmospheres may also have a taint on a 1D roll of 4+. If a taint is present, the Referee can use the Taint Subtype, Severity and Persistence tables from the Subtype: Taint section on page 83 to determine the type(s), Severity, and Persistence of the taint. The format of the profile of a very dense atmosphere is similar to that of standard atmospheres but the leading character is a D.

### TYPE: LOW (E)
A low atmosphere is in some ways the opposite of a very dense atmosphere. At mean baseline altitude, the low atmosphere is undisguisable from a very thin atmosphere but because it occurs on a massive planet – usually Size 9 or above, the world has a low scale height, and deep valleys or other natural depressions may retain an atmosphere thick enough to be breathable. In some cases, worlds with low atmosphere levels may have artificial depressions created to support habitable regions.

Scale height equations apply to negative altitudes. To determine the altitude below mean baseline altitude required to support life, first determine the oxygen partial pressure (ppo) using the same procedures as for Atmospheres 2–9 and then divide 0.1 (or 0.08 for the extreme limit of human tolerance) by that number. This should result in a value greater than 1.0. This number is the ‘low bad ratio’:

**FORMULA: Low Bad Ratio**
$\text{Low Bad Ratio} = \frac{0.1}{ppo}$

Next, compute the natural log (ln) of the low bad ratio and multiply it by the scale height. The result is the altitude below mean baseline altitude required to support human life:

**FORMULA: Safe Altitude Below Mean Baseline Altitude**
$\text{Safe Altitude Below Mean Baseline Altitude} = \text{In(Low Bad Ratio)} \times \text{Scale Height}$

Nitrogen will increase in density in proportion to oxygen. If the low bad ratio times the nitrogen partial pressure increases nitrogen levels beyond 2.0 bar, it is possible nitrogen narcosis may begin to affect unprotected humans and as a result, no safe altitude exists on the world. As with very dense atmosphere worlds, the Referee may choose to impose a taint on low atmosphere worlds on a 1D roll of 4+. The format of the profile of a low atmosphere is similar to that of standard atmospheres but the leading character is an E.
### SUBTYPE: UNUSUAL (F)
An unusual atmosphere is a category best described by what it is not: it is not habitable without protection and it is neither entirely corrosive nor insidious in nature. It may be composed of an unlikely or rare combination of gases, or it may have a varying composition based on seasonal or other factors. Its density could be anything from very thin to beyond very dense. It could be a steamy world where an atmosphere of mostly water vapor blends nearly seamlessly into a boiling ocean as atmospheric pressures increase. It could also be a variation of the low atmosphere with different gases segregated by altitude: perhaps benign at some layers and corrosive or worse at others. The Unusual Atmosphere Subtypes table lists some of these possibilities. It is intended as a prompt for the Referee but could be used to randomly create an unusual atmosphere, subject to the conditions listed. A random occurrence of Atmosphere type F normally only occurs on worlds of Size A or greater. Note that three of these atmosphere types have prerequisites and should be rerolled if the world does not meet the requirements. Alternatively, the world’s other properties could be altered to meet the prerequisites.

**Table 38: Unusual Atmosphere Subtypes**

| D26 | Code | Subtype              | Atmospheric Conditions                                                                                                                                                                                                        |
| :-: | :--: | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11  |  1   | Dense, Extreme       | Density between 10 and 100 bar, possibly with free oxygen                                                                                                                                                                     |
| 12  |  2   | Dense, Very Extreme  | Density between 100 and 1,000 bar, possibly with free oxygen                                                                                                                                                                  |
| 13  |  3   | Dense, Crushing      | Density above 1,000 bar; surface may be unreachable or indistinct                                                                                                                                                             |
| 14  |  4   | Ellipsoid            | Either tidal forces or very fast rotation has elongated one axis of this world; as scale height is based on average diameter, pressure may range from near vacuum to very dense and some bands of atmosphere may be habitable |
| 15  |  5   | High Radiation       | Internal or external factors bombard the world with constant high radiation; this may cause unusual gases to form or may just be lethal emanations permeating an otherwise normal atmosphere                                  |
| 16  |  6   | Layered              | Different altitudes have different gas compositions. Prerequisite: gravity above 1.2                                                                                                                                          |
| 21  |  7   | Panthalassic         | A world ocean hundreds of kilometres deep covers the world; atmospheric pressure is at least standard and often very or extremely dense prerequisites: Hydrographics A (10), atmospheric pressure 1.0+ bar                    |
| 22  |  8   | Steam                | Water vapor merges with oceans; very dense or above pressures. Prerequisite: Hydrographics 5+, atmospheric pressure 2.5+ bar                                                                                                  |
| 23  |  9   | Variable Pressure    | Tides or storms cause large variations in atmospheric pressure                                                                                                                                                                |
| 24  |  A   | Variable Composition | Composition varies with seasons, lifeform lifecycles or some other factor                                                                                                                                                     |
| 25  |  —   | Combination          | Pick (roll) two types with compatible conditions                                                                                                                                                                              |
| 26  |  F   | Other                | Something else entirely                                                                                                                                                                                                       |

##### UNUSUAL ATMOSPHERE PROFILE
An unusual atmosphere can use the same format as an exotic atmosphere, with subtype listed. If the atmosphere has more than one subtype, they can be listed one after another, separated by a period. The minimal format for an unusual atmosphere with two conditions would be:

**F-St#.#**

With:
- \# = each subtype.

### NON-HABITABLE ZONE ATMOSPHERES
Mainworld generation procedures heavily favor worlds within the habitable zone, or +1 Orbit# from the habitable zone center. Atmosphere codes 2–9, D and E, all assume a nitrogen-oxygen mix, which brings with it the secondary assumption of familiar carbon-based lifeforms and liquid water. Nitrogen might be a common component of many atmospheres – it is fairly common, stable and gaseous down to very cold temperatures but oxygen is associated – at least in the Solar System – with biological activity. As a common gas and component of water, ice and many minerals, oxygen is even more prevalent than nitrogen as an element but its reactivity seems to limit its existence as a plentiful atmospheric gas outside of living worlds. Temperature variations from the greenhouse effect (see a further development of temperatures, under the Mean Temperature section) or from very thin or very dense atmospheres may push the limits of the habitable zone further sunward (for very thin or low) and outward (for very dense) but in general, worlds beyond even these more generous habitable zone boundaries will not possess standard 2–9, D or E Atmospheres.

On the hot side of the habitable zone, the temperature component of the escape value equation for the Atmospheric Gas Composition table implies that many worlds, especially smaller ones, will simply lack an atmosphere. Those which retain an atmosphere will tend towards trace, exotic, corrosive, and insidious types. On the cold side of the habitable zone, smaller worlds may retain an atmosphere, but only within certain temperature ranges. The colder the world, the more likely its ‘heavy’ retained gases will have turned into solids or liquids, though few liquids will remain liquid under very low pressures.

To create atmospheres for worlds outside the habitable zones, roll 2D-7 plus Size on either the Hot Atmospheres or Cold Atmospheres tables in the column appropriate for the world orbit’s deviation from the HZCO. Divide by 10 for a HZCO below 1.0 and change the increment back to normal once past Orbit# 1.0.

**Table 39: Hot Atmospheres**

| Result | HZCO -2.01 or less       | HZCO -1.01 – -2.0               |
| :----: | ------------------------ | ------------------------------- |
|   0-   | None (0)                 | None (0)                        |
|   1    | None (0)                 | Trace (1)                       |
|   2    | Trace (1)                | Exotic (A), Very Thin, Irritant |
|   3    | Trace (1)                | Exotic (A), Very Thin           |
|   4    | Exotic (A), Very Thin*†  | Exotic (A), Thin, Irritant      |
|   5    | Exotic (A), Thin*†       | Exotic (A), Thin                |
|   6    | Exotic (A), Standard*†   | Exotic (A), Standard            |
|   7    | Exotic (A), Dense*†      | Exotic (A), Standard, Irritant  |
|   8    | Exotic (A), Very Dense*† | Exotic (A), Dense               |
|   9    | Corrosive (B)            | Exotic (A), Dense, Irritant     |
|   10   | Corrosive (B)            | Exotic (A), Very Dense*         |
|   11   | Corrosive (B)            | Corrosive (B)                   |
|   12   | Insidious (C)            | Insidious (C)                   |
|   13   | Corrosive (B)            | Corrosive (B)                   |
|   14   | Insidious (C)            | Insidious (C)                   |
|   15   | Unusual (F)              | Unusual (F)                     |
|   16   | Gas, Helium (G)          | Gas, Helium (G)                 |
|  17+   | Gas, Hydrogen (H)        | Gas, Hydrogen (H)               |

\*Roll 1D and add an irritant to the atmosphere on a 4+  
†If Orbit is HZCO -3.0 or less, roll 1D with DM+1 if dense or very dense:

**Table 40: Special Roll Orbit is HZCO -3.0 or less **

| 1D  | Result        |
| :-: | ------------- |
|  1  | Trace (1)     |
|  2  | No change     |
| 3–5 | Corrosive (B) |
| 6+  | Insidious (C) |

```Example
An example of a hot world is the innermost planet of the Zed system’s central stars: Zed Aab I, a Size B (11) world in Orbit# 1.0, a full 2.3 Orbit#s inside the HZCO. It determines its Atmosphere type from the HZCO -2.01 or less column of the Hot Atmospheres table. A 2D roll of 5 results in 5-7 + 11 = 9, which is corrosive (B). Despite that result satisfying the Class III survey form for the world’s SAH, further generation on the corrosive and Insidious Atmosphere Type table is a 2D roll of 7 to which DM+2 for being Size 8+ and DM+4 for being sunward of the HZCO results in a 13 for subtype code D:‘extremely dense, temperature 500K+’ which is perhaps not surprising for a world so close to its sun; Zed Aab I might be termed a ‘Super-Venus’ world.

```

**Table 41: Cold Atmospheres**

| Result | HZCO +1.01 – +3.0              | HZCO +3.01 or more             |
| :----: | ------------------------------ | ------------------------------ |
|   0-   | None (0)                       | None (0)                       |
|   1    | Trace (1)                      | Trace (1)                      |
|   2    | Trace (1)                      | Trace (1)                      |
|   3    | Exotic (A), Very Thin*         | Exotic (A), Very Thin*         |
|   4    | Exotic (A), Thin, Irritant     | Exotic (A), Thin, Irritant     |
|   5    | Exotic (A), Thin               | Exotic (A), Thin               |
|   6    | Exotic (A), Standard           | Exotic (A), Standard           |
|   7    | Exotic (A), Standard, Irritant | Exotic (A), Standard, Irritant |
|   8    | Exotic (A), Dense              | Exotic (A), Dense              |
|   9    | Exotic (A), Dense, Irritant    | Exotic (A), Dense, Irritant    |
|   10   | Exotic (A), Very Dense*        | Exotic (A), Very Dense*        |
|   11   | Corrosive (B)                  | Corrosive (B)                  |
|   12   | Insidious (C)                  | Insidious (C)                  |
|   13   | Very Dense (D)                 | Gas, Helium (G)                |
|   14   | Corrosive (B)                  | Gas, Hydrogen (H)              |
|   15   | Unusual (F)                    | Unusual (F)                    |
|   16   | Gas, Helium (G)                | Gas, Hydrogen (H)              |
|  17+   | Gas, Hydrogen (H)              | Gas, Hydrogen (H)              |

\*Roll 1D and add an irritant to the atmosphere on a 4+

```Example
As examples of cold worlds and the concept of HZCO increase across 1.0, the two outer worlds of Zed’s Cab stars are useful. The HZCO value for Zed Cab is Orbit# 0.75. The first 0.25 Orbit# values count as 2.5 Orbit#s on the Orbit# 0.x scale, then Orbit# increments begin to accrue normally. The World Zed Cab II is at Orbit# 2.9; its effective orbit beyond the HZCO is 2.5 plus (2.9-1.0 = 1.9) or 4.4, which means it uses the HZCO +3.01 or more column on the Cold Atmosphere table. With a Size 4 world, a 2D roll of 10 results in 10-7 + 4 = 7, which is exotic (A), standard, irritant – looking back at the Exotic Atmosphere Subtype table, this is subtype 7. Only an A need be added as the SAH atmosphere code, but to continue further, rolling within the standard atmsphere range results in a pressure of 0.98 bar. No roll for partial oxygen pressure is required for an exotic atmosphere. For irritant, rolling on the Taint table results in 8:sulphur compounds, but as this is a cold world, it is treated as a more generic result of particulates instead. Roll for severity gets 4:major and for persistence 7:varying.

Looking also at Zed Cab III, a Size A world which is further out at orbit 3.3, no math is necessary, since it is further out than II, so already in the colder column of the Cold Atmosphere table. A 2D roll of 10 results in 10-7 + 10 = 13 or gas, helium (G) – this world has a thick helium atmosphere and might even have some free hydrogen for those who wish to do the extra work to attempt to skim it but landing is likely to be impossible for a normal spacecraft.
```
#### ATMOSPHERE GAS MIX TABLES
Although the Referee can customise atmospheric gas types for exotic, corrosive and insidious atmosphere types based on the Atmospheric Gas Composition table on page 87, a quicker method to determine random atmospheric mixes uses the tables and guidelines in this section. Each of the following tables provides random results based on the temperature range and atmosphere type. The Referee should roll at least twice for gas mixes, with either the first roll or most common (closest to 7 on each table) determining the primary gas component. If desiring a percentage mix determination, the primary gas can be (1D+4) × 10% (with variance, but only up to 100%) of the mix, and the other(s) the majority, or (1D+4) × 10%, of the remainder but allowing multiple results of the same gas to add to an existing percentage until 95% or more of the atmosphere is determined. To ensure no gas receives 100%, the Referee can instead choose to use (1D+3) × 10% for each roll.

**Caution: Other than the notes on carbon monoxide, these tables do not take chemical interactions into account and may also result in rarer gases (krypton, argon, or neon) becoming a dominate portion of the atmosphere. Referees should remain free to alter the results and/or the percentages of results from these tables. The tables are for simplicity and inspiration and need not be followed slavishly.**

**Table 42: **Boiling Atmosphere Gas Mix (HZCO -2.01-)****  
(Use for mean temperatures of 453K+ | 180°C+)

| 2D+DM | Exotic (A)          | Corrosive (B)       | Insidious (C)       |
| ----- | ------------------- | ------------------- | ------------------- |
| <= -2 | Silicates (SO, SO2) | Silicates (SO, SO2) | Metal Vapours       |
| -1    | Sodium              | Sodium              | Silicates (SO, SO2) |
| 0     | Krypton             | Krypton             | Sodium              |
| 1     | Argon               | Argon               | Sulphuric Acid      |
| 2     | Sulphur Dioxide     | Sulphur Dioxide     | Hydrochloric Acid   |
| 3     | Carbon Monoxide*    | Hydrogen Cyanide    | Chlorine            |
| 4     | Carbon Dioxide      | Formamide           | Fluorine            |
| 5     | Nitrogen            | Carbon Dioxide      | Formic Acid         |
| 6     | Carbon Dioxide      | Nitrogen            | Water Vapour        |
| 7     | Nitrogen            | Carbon Dioxide      | Nitrogen            |
| 8     | Water Vapour        | Sulphur Dioxide     | Carbon Dioxide      |
| 9     | Sulphur Dioxide     | Water Vapour        | Sulphur Dioxide     |
| 10    | Nitrogen            | Nitrogen            | Hydrogen Cyanide    |
| 11    | Methane             | Ammonia             | Ammonia             |
| 12    | Water Vapour        | Ammonia             | Hydrofluoric Acid   |
| 13 => | Methane             | Methane             | Methane             |

\*Worlds without H<sub>2</sub>O only. otherwise CO<sub>2</sub>

**Die Modifiers for Boiling Atmosphere Gas Mix (HZCO -2.01-)**
- Mean temperature 700–2,000K: DM-2
- Mean temperature above 2,000K: DM-5
- Size 1–7: DM-1  
- Size A+: DM+1

**Table 43: Boiling Atmosphere Gas Mix (HZCO -1.01 – -2.0)**  
(Use for mean temperatures of 353–453K | 80–180°C)

| 2D+DM | Exotic (A)      | Corrosive (B)    | Insidious (C)     |
| :---: | --------------- | ---------------- | ----------------- |
|   1   | Krypton         | Argon            | Hydrochloric Acid |
|   2   | Argon           | Sulphur Dioxide  | Chlorine          |
|   3   | Sulphur Dioxide | Hydrogen Cyanide | Fluorine          |
|   4   | Ethane          | Ethane           | Formic Acid       |
|   5   | Carbon Dioxide  | Carbon Dioxide   | Water Vapour      |
|   6   | Nitrogen        | Nitrogen         | Nitrogen          |
|   7   | Carbon Dioxide  | Carbon Dioxide   | Carbon Dioxide    |
|   8   | Nitrogen        | Sulphur Dioxide  | Sulphur Dioxide   |
|   9   | Water Vapour    | Water Vapour     | Hydrogen Cyanide  |
|  10   | Sulphur Dioxide | Nitrogen         | Ammonia           |
|  11   | Methane         | Ammonia          | Methane           |
|  12   | Neon            | Ammonia          | Hydrofluoric Acid |
|  13   | Methane         | Methane          | Methane           |

**Die Modifiers for Boiling Atmosphere Gas Mix (HZCO -1.01 – -2.0)**
- Size 1–7: DM-1  
- Size A+: DM+1

**Table 44: Hot Atmosphere Gas Mix**  
(Use for mean temperatures of 303–353K | 30–80°C)

| 2D+DM | Exotic (A)       | Corrosive (B)    | Insidious (C)     |
| :---: | ---------------- | ---------------- | ----------------- |
|   1   | Krypton          | Argon            | Hydrochloric Acid |
|   2   | Argon            | Sulphur Dioxide  | Chlorine          |
|   3   | Sulphur Dioxide  | Hydrogen Cyanide | Fluorine          |
|   4   | Ethane           | Ethane           | Sulphur Dioxide   |
|   5   | Carbon Dioxide   | Carbon Dioxide   | Carbon Monoxide*  |
|   6   | Nitrogen         | Nitrogen         | Nitrogen          |
|   7   | Carbon Dioxide   | Carbon Dioxide   | Carbon Dioxide    |
|   8   | Nitrogen         | Sulphur Dioxide  | Ethane            |
|   9   | Carbon Monoxide* | Carbon Monoxide* | Hydrogen Cyanide  |
|  10   | Sulphur Dioxide  | Nitrogen         | Ammonia           |
|  11   | Methane          | Ammonia          | Methane           |
|  12   | Neon             | Ammonia          | Hydrofluoric Acid |
|  13   | Methane          | Methane          | Helium            |

\*Worlds with Hydrographics 0 (or non-H<sub>2</sub>O hydrographics) only, otherwise CO<sub>2</sub>  

**Die Modifiers for Hot Atmosphere Gas Mix** 
- Size 1–7: DM-1
- Size A+: DM+1

**Table 45: Temperate Atmosphere Gas Mix**  
(Use for mean temperatures of 273–303K | 0–30°C)

|2D+DM|Exotic (A)|Corrosive (B)|Insidious (C)|
|---|---|---|---|
|1|Krypton|Krypton|Argon|
|2|Argon|Chlorine|Chlorine|
|3|Sulphur Dioxide|Argon|Fluorine|
|4|Nitrogen|Sulphur Dioxide|Sulphur Dioxide|
|5|Carbon Monoxide*|Carbon Monoxide*|Carbon Monoxide*|
|6|Nitrogen|Nitrogen|Nitrogen|
|7|Carbon Dioxide|Carbon Dioxide|Carbon Dioxide|
|8|Ethane|Ethane|Ethane|
|9|Nitrogen|Ammonia|Ammonia|
|10|Neon|Ammonia|Ammonia|
|11|Methane|Methane|Methane|
|12|Methane|Helium|Helium|
|13|Helium|Hydrogen|Hydrogen|

\*Worlds with Hydrographics 0 (or non-H<sub>2</sub>O hydrographics) only, otherwise CO<sub>2</sub>

**Table 46: Cold Atmosphere Gas Mix**  
(Use for mean temperatures of 223–273K | -50–0°C)

| 2D+DM | Exotic (A)       | Corrosive (B)    | Insidious (C)    |
| :---: | ---------------- | ---------------- | ---------------- |
|   1   | Krypton          | Krypton          | Argon            |
|   2   | Argon            | Chlorine         | Chlorine         |
|   3   | Ethane           | Argon            | Fluorine         |
|   4   | Nitrogen         | Nitrogen         | Ethane           |
|   5   | Carbon Monoxide* | Carbon Monoxide* | Carbon Monoxide* |
|   6   | Nitrogen         | Nitrogen         | Nitrogen         |
|   7   | Carbon Dioxide   | Carbon Dioxide   | Carbon Dioxide   |
|   8   | Nitrogen         | Nitrogen         | Nitrogen         |
|   9   | Ethane           | Ethane           | Ethane           |
|  10   | Methane          | Ammonia          | Ammonia          |
|  11   | Neon             | Methane          | Methane          |
|  12   | Methane          | Helium           | Helium           |
|  13   | Helium           | Hydrogen         | Hydrogen         |

\*Worlds with Hydrographics 0 (or non-H<sub>2</sub>O hydrographics) only, otherwise CO<sub>2</sub>

**Die Modifiers for Cold Atmosphere Gas Mix** 
- Size 1–7: DM-1
- Size A+: DM+1

**Table 47: Frozen Atmosphere Gas Mix (HZCO +1.01–+3.0)**  
(Use for mean temperatures of 123–223K | -150– -50°C)

| 2D+DM | Exotic (A)       | Corrosive (B)    | Insidious (C)    |
| :---: | ---------------- | ---------------- | ---------------- |
|   1   | Krypton          | Krypton          | Krypton          |
|   2   | Argon            | Argon            | Argon            |
|   3   | Argon            | Argon            | Fluorine         |
|   4   | Nitrogen         | Nitrogen         | Nitrogen         |
|   5   | Nitrogen         | Nitrogen         | Nitrogen         |
|   6   | Carbon Monoxide* | Carbon Monoxide* | Carbon Monoxide* |
|   7   | Nitrogen         | Nitrogen         | Nitrogen         |
|   8   | Methane          | Methane          | Methane          |
|   9   | Methane          | Methane          | Methane          |
|  10   | Methane          | Neon             | Neon             |
|  11   | Neon             | Methane          | Helium           |
|  12   | Methane          | Helium           | Hydrogen         |
|  13   | Hydrogen         | Hydrogen         | Hydrogen         |

\*Worlds with Hydrographics 0 (or non-H<sub>2</sub>O hydrographics) only, otherwise N<sub>2</sub>.  

**Die Modifiers for Frozen Atmosphere Gas Mix (HZCO +1.01–+3.0)** 
- Size 1–7: DM-2
- Size A+: DM+1

**Tables 48: Frozen Atmosphere Gas Mix (HZCO + 3.00+)**  
(Use for mean temperatures below 123K | -150°C)

| 2D+DM | Exotic (A)       | Corrosive (B)    | Insidious (C)    |
| :---: | ---------------- | ---------------- | ---------------- |
|   1   | Krypton          | Krypton          | Krypton          |
|   2   | Argon            | Argon            | Argon            |
|   3   | Argon            | Argon            | Fluorine         |
|   4   | Methane          | Methane          | Methane          |
|   5   | Carbon Monoxide* | Carbon Monoxide* | Carbon Monoxide* |
|   6   | Nitrogen         | Nitrogen         | Nitrogen         |
|   7   | Nitrogen         | Nitrogen         | Nitrogen         |
|   8   | Neon             | Neon             | Neon             |
|   9   | Helium           | Helium           | Helium           |
|  10   | Helium           | Helium           | Helium           |
|  11   | Hydrogen         | Hydrogen         | Hydrogen         |
|  12   | Hydrogen         | Hydrogen         | Hydrogen         |
|  13+  | Hydrogen         | Hydrogen         | Hydrogen         |

\*Worlds with Hydrographics 0 (or non-H<sub>2</sub>O hydrographics) only, otherwise N<sub>2</sub>.  

**Die Modifiers for Frozen Atmosphere Gas Mix (HZCO + 3.00+)**
- Mean temperature 70–100K: DM+3  
- Mean temperature below 70K: DM+5  
- Size 1–7: DM-3  
- Size A+: DM+1

```Example
For the Zed system examples, Aab I has a corrosive Atmosphere, with a subtype of D: ‘extremely dense, temperature 500K+’. Rolling on the Boiling Atmosphere Gas Mix (HZCO -2.01-) table and using the corrosive column with DM+1 for Size results in 11:ammonia as the major component. To determine how much ammonia, a 1D roll of 1 results in 50%, with a d10 roll of 2 for variance, or 47% ammonia (NH3). Rolling again on the same column for the next gas results in a 5:carbon dioxide (CO2), which is then determined from the remaining 53% to be 65% of that amount or about 34.5%, leaving 18.5% for a third roll of 7:carbon dioxide – again but that is a feature, not an issue – being 73% of that remainder or 13.5%. Now, the atmosphere stands at 48% CO2 and 47% NH3, with 5% unaccounted for. The Referee can leave this as ‘other gases’ but interested in seeing if the next roll changes the dominant gas rolls 8:water vapour at 60% of the remainder, or 3% of the total. Leaving the world as 48% CO2, 47% NH3, 3% H2O and 2% other gases, the Referee notes the profile as B-StD:CO2-48:NH3- 47:H2O-03 and moves on.

The world of Zed Cab II has a frozen (HZCO +3.00+) exotic Atmosphere (A), subtype 7. Temperature determination has not been performed on this world, and likely never will, but as it is effectively 4.4 Orbits beyond the HZCO with a standard density atmosphere, the Referee rules that it deserves the DM+3 for a mean temperature between 70 and 100K. A DM-3 for Size 4 nets DM+0 on the table rolls. The first roll is 7:nitrogen (N2) for 64% of the atmosphere. The next roll is also a 7, adding another 89% of 36% or 32% nitrogen to make the total 96%. The Referee could stop but rolls again for a 3, adding argon at 95% of the remainder or 3.8%. 

The world’s atmosphere is 96% nitrogen 3.8% argon, 0.2% other gases 

or: 

A-St7:0.98:N2-96:Ar-04 P.4.7.
```

## HYDROGRAPHICS
The hydrographics percentage is fairly straightforward to generate and comprehend for a world in the habitable zone with water as its liquid surface cover component. It is the rounded value of the tenth of the planet covered with water as shown on the Hydrographics Ranges table. Generation is based on atmosphere, rolling 2D-7 and adding the Atmosphere code, with certain modifications. Size 0 and 1 world have a Hydrographics code of 0; those with Atmospheres code 0,1, A or greater have a DM-4 to the roll.

Temperature can also influence the Hydrographics code. Even in the Traveller Core Rulebook, applying the modifications of DM-2 for hot and DM-6 for boiling temperature worlds requires an aside into temperature determination. As described in Step 3d of the Placement of Worlds section on page 43, the Referee can substitute the world’s location within the habitable zone as a proxy for the ‘temperature roll’ and add the DMs noted in that section to determine a provisional temperature range for the world. This provisional temperature range can determine DMs for the hydrographics roll.


**Table 49:  Hydrographics Ranges**

| Hydrographics | Percentage Range |
| :-----------: | :--------------: |
|       0       |      0%–5%       |
|       1       |      6%–15%      |
|       2       |     16%–25%      |
|       3       |     26%–35%      |
|       4       |     36%–45%      |
|       5       |     46%–55%      |
|       6       |     56%–65%      |
|       7       |     66%–75%      |
|       8       |     76%–85%      |
|       9       |     86%–95%      |
|    A (10)     |     96%–100%     |

**Die Modifiers for Hydrographics**
- Hot Temperature: DM-2
- Boiling Temperature: DM-6

Note: that these temperature-related DMs are ignored for very dense (D) or the panthalassic subtype (7) of unusual (F) atmospheres.

To determine a more precise value for hydrographics, use a linear variation. For most ranges, this involves adding a d10 roll to the lowest value of the range. For the extreme ranges, to simulate the greater chances of results of ‘all’ or ‘nothing’ the Referee should still use a d10, with Hydrographics 0 rolled as -4 + d10 and results below 0 treated as 0%. For Hydrographics A, the Referee can use as 96 + d10 with results above 100% treated as 100%, with worlds above Size code 9 with Hydrographics code A always treated as 100% liquid.

Precision beyond 1% or at most 0.1% is not necessary, as temporary conditions may cause variation in surface coverage. By convention, for worlds with environmental conditions suitable for liquid water on at least some of the surface, permanently ice-covered land is not considered part of the Hydrographics code or percent statistic but permanently ice-covered water is considered in these numbers.

#### SURFACE FEATURE DISTRIBUTION
Worlds with Hydrographics codes of 6 or more tend to be dominated by oceans, often an interconnected ‘world ocean’ as on Terra, and have individual continents and islands separated by water. Worlds with Hydrographics codes of 4 or less tend to be dominated by land, often an interconnected world spanning landmass, with isolated oceans and seas with perhaps differing ‘sea levels’ despite them being connected by river systems. A world with a Hydrographics code of 5 could trend in either direction, depending on the concentration and morphology of continents. 

These are not absolutes. A world with many water-filled craters or depressions could have a Hydrographics code of 6 or 7 and yet still have a single landmass and many unconnected sea or ocean basins. To determine the extent to which the dominant surface feature (land or water) is distributed, roll 2D-2 on the Surface Distribution table. The definition of ‘body’ depends on the Hydrographics code of the world. 

If Hydrographics is 6+, the foundational geography is a world ocean and the bodies are continents (major and minor) and islands (small). 

If Hydrographics is 4-, the foundational geography is land or a world continent and the bodies are oceans (major and minor) and seas (small). 

If the world’s Hydrographics code is an unrefined 5 and/or the percentage of hydrographics is exactly 50%, roll 1D and assume the fundamental geography is ocean on a 1–3, or land on a 4–6.

**Table 50: Surface Distribution**

| 2D-2 | Description            | Effect                                                                    |
| :--: | ---------------------- | ------------------------------------------------------------------------- |
|  0   | Extremely Dispersed    | Many minor and small bodies: no major bodies                              |
|  1   | Very Dispersed         | Mostly minor bodies: 5–10% of the surface coverage is in major bodies     |
|  2   | Dispersed              | Mostly minor bodies: 10–20% of the surface coverage is in major bodies    |
|  3   | Scattered              | Roughly 20–30% or less of the surface coverage is in major bodies         |
|  4   | Slightly Scattered     | Roughly 30–40% or less of the surface coverage is in major bodies         |
|  5   | Mixed                  | Mix of major and minor bodies: roughly 40–60% of body coverage is major   |
|  6   | Slightly Skewed        | Roughly 60–70% of surface coverage is in major bodies                     |
|  7   | Skewed                 | Roughly 70–80% of surface coverage is in major bodies                     |
|  8   | Concentrated           | Mostly major bodies: 80–90% of the surface coverage is in major bodies    |
|  9   | Very Concentrated      | Single very large major body: 90–95% of body coverage is in one body      |
|  A   | Extremely Concentrated | Single very large major body: 95% or more of body coverage is in one body |

Optionally, the Referee could choose to allow unexpected distributions (land versus water) by allowing this roll when the Hydrographics code is not 5 and applying DMs based on the deviation from 5, e.g., for a Hydrographics 4 world, the fundamental geography is ocean on a result of 1–2 and land on 3–6.

A major body covers 5% or more of the planet’ s surface, a minor body 1–5% and a small body less than 1%. The actual number of bodies depends on the overall Hydrographics code. In cases where a high or low Hydrographics code prevents the formation of any major bodies, treat references to major as minor and minor as small in the Surface Distribution table effect column.

Actual numbers of continents should be determined by the Referee based on the results of the Surface Distribution table and the Hydrographics code or percentage and the size parameters for various bodies as illustrated in the following example:

```Example
Zed Prime has a Hydrographics code of 6. Adding a d10 roll of 6 to the bottom of the range results in 62% of the surface covered by water. This world likely has oceans with continents in them but the Referee wants to explore the chance that a contiguous landmass covers the world. The Referee rolls 1D with a DM-1 since the Hydrographics is 6, and gets a 4-1 = 3, which still leaves oceans as dominant.

Next, a roll of 5 on the Surface Distribution table indicates a mix of continent sizes. With 100-62 = 38% of the surface covered by land, half, or about 19%, of that land is tied up in major continents and a similar percent in minor ones. With a minimum major continent size defined as 5%, there cannot be more than three major continents, so arbitrarily rolling D3 results in two major continents. The number of minor continents could number from as low as four, if they were all just below the major threshold (unlikely), to 19, if they were all just above the threshold (also unlikely). If they were about 3%, there would be about 6.3 minor continents. Given this distribution, the Referee decides to roll 3D-3 for the number of minor continents, conceding that a low result might require a re-roll and receives 12-3 = 9 minor continents.
```

#### OPTIONAL RULE: EXOTIC LIQUIDS
The standard procedure for determining hydrographics percentage for Hydrographics codes of exotic, corrosive, or insidious Atmospheres (A–C) is to apply a DM-4 to the roll. Instead, the Referee could choose to use the equivalent density atmosphere of the subtype (pages 92 to 93) as a baseline for the 2D-7 + Atmosphere roll (for example a standard density exotic atmosphere would use 6, not 10 for the atmosphere factor to add). In such instances, the Referee can keep the DM-4 for A+ types and a DM for hot (-2) or boiling (-6) temperatures, if appropriate. This will statistically lead to less liquids on Atmosphere A–C worlds.

Even on worlds with exotic atmospheres, water is a possible source of the world’s liquid surface area if temperatures allow for it. For much of Terra’s early history, it would have been considered Atmosphere A but its liquid surface would still be composed of water.

On worlds with corrosive or insidious atmosphere types, the liquid is less likely to be water but its composition depends greatly on the final surface temperature of the world. Consult the Atmospheric Gas Composition table and select from those ‘gases’ in between their melting point and boiling point at the mean temperature at the world’s surface.

If using the surface temperature calculations beginning on page 108, the results of those calculations could influence the choice of liquid material. The listed melting and boiling points assume an environment with a standard atmospheric pressure (1.013 bar) and may vary greatly under different conditions but checking on the properties of each gas under varying pressure conditions is an exercise for an ambitious world designer or chemist and outside the scope of this book.

If the surface temperature exceeds 1,000K, it is possible that the liquid on a surface is actually magma, or liquid rock.

The best candidates for surface liquids are molecules with a broader range of temperatures between their melting and boiling points. The molecules with at least 20° difference are listed in the Possible Exotic Liquids (Fluidic Worlds) table in order of their boiling point.

**Table 51: Possible Exotic Liquids (Fluidic Worlds)**

| Molecule          | Code  | Boiling Point (K) | Melting Point (K) | Relative Abundance |
| ----------------- | :---: | :---------------: | :---------------: | :----------------: |
| Fluorine          |  F2   |        85         |        53         |         2          |
| Oxygen            |  O2   |        90         |        54         |         50         |
| Methane           |  CH4  |        113        |        91         |         70         |
| Ethane            | C2H6  |        184        |        90         |         70         |
| Chlorine          |  Cl2  |        239        |        171        |         1          |
| Ammonia           |  NH3  |        240        |        195        |         30         |
| Sulphur Dioxide   |  SO2  |        263        |        201        |         20         |
| Hydrofluoric Acid |  HF   |        293        |        190        |         2          |
| Hydrogen Cyanide  |  HCN  |        299        |        260        |         30         |
| Hydrochloric Acid |  HCl  |        321        |        247        |         1          |
| Water             |  H2O  |        373        |        273        |        100         |
| Formic Acid       | CH2O2 |        374        |        281        |         15         |
| Formamide         | CH3NO |        483        |        275        |         15         |
| Carbonic Acid*    | H2CO3 |        607        |        193        |         20         |
| Sulphuric Acid    | H2SO4 |        718        |        388        |         20         |

\*Not listed on the Exotic Atmosphere Gas table but a viable liquid in isolation or combination

The actual fluid for a particular Atmosphere code and subtype should bear some resemblance to the gas mix, with sulphur, fluorine and chlorine compounds potentially present in atmospheres also containing these elements as part of the atmosphere or as a taint or irritant component. The other liquids, based on hydrogen, carbon, nitrogen and oxygen, have elements likely to be present in a variety of atmospheres. For worlds in the proper temperature range, water remains the most likely hydrographic liquid, although other exotic liquids may be present as well. Under some conditions, such as higher pressures or briny conditions, water’s range of liquid temperatures could exceed those listed in either direction. The same could be true for other liquids; this is something for a chemist to explore.

Near the boiling point of a liquid, it may be present as both an atmospheric gas and as a liquid. Titan is an example of such a world, although the actual percentage of its liquid surface that is methane is not well determined. Even Terra has a varying percentage (over 1% in many cases) of water vapour in its atmosphere.

#### HYDROGRAPHICS PROFILE
Whether the liquid filling a world’s seas is water or nitrogen, or possibly a combination of liquids, the fluid(s) and amount(s) can be written in the format:

**H-D:\%\%:XX-##:YY-##**

Where:
- H = Hydrographics Code
- D = the surface distribution
- \%\% = the actual hydrographic percentage
- XX and YY = the chemical formula for the liquid
- \#\# = the percentage of a mixture (if needed or determined). 
For instance:
- Terra would be 7:4:71:H2O, with no numbers since it is all water and
- Titan would be 0:8:02:CH4:C2H6, with a distribution of 8 to account for the polar-only nature of its lakes and with no numbers as the mixture is not known and may vary. 

```Example
The two examples from the Zed system Aab I, a very hot (above 500K) corrosive atmosphere world and Cab II, a very cold (70-100K) exotic atmosphere are candidates for non-water liquids, if they have any.

Aab I’s hydrographics roll is 7-7 + 11(for Atmosphere code B – as it is ‘extremely dense, the subtype will not change its code factor) - 10(-4 for Atmosphere code B and -6 for boiling) equals 1. The fluid needs to have a boiling point of more than 500K and that makes sulphuric acid (H2SO4) the likely choice, ajthough the Referee may want to allow for ‘polar’ or high altitude seas of formamide (CH3NO) instead, given the CO2 and NH3 atmosphere.

Cab II hydrographics roll is 6-7 + 7 (for Atmosphere code A but using subtype 7 as the base) – 4(for Atmosphere A) equals 2. The fluid needs to be liquid between 70 and 100K on a world with a predominantly nitrogen atmosphere. The choices are fluorine, oxygen, methane and ethane. The Referee could roll, assigning some probability to each (a low one for fluorine) but instead decides to make the seas full of liquid oxygen – just add heat and the world could become habitable (if tainted).
```

## ROTATION PERIOD (DAY LENGTH)
The length of a world’s day is an important detail, not just for flavor but for temperature and climate reasons. The rotation period of a world can vary greatly, from just a few hours to years-long, with possible tidal factors (see page 105) contributing to prolonged or even permanent daylight. There are no easy formulas for determining this latter condition, known as tidal lock, where one face of the world permanently faces its primary. None of the planets in the Solar System experiences actual tidal lock – although Mercury and Venus have day lengths that are certainly influenced heavily by the sun’s tidal forces. All of the significant moons of the Solar System experience tidal lock – the largest moon to avoid lock is Saturn’s moon Phoebe, a likely captured outer system object orbiting more than 100 planetary diameters from its parent body.

### BASIC DAY LENGTH
If no external factors, such as stars, planets or moons have significant impact on a world’s spin rate, the rotation period in hours is determined as:

**FORMULA: Basic Rotation Rate (hours)**
$\text{Basic Rotation Rate (hours)} = (\text{2D-2}) \times 4^* + 2 +\text{1D} + \text{DMs}$ 
$\text{*For gas giant or small body (Size 0 or S) rotation, multiply by 2 instead}$

**Die Modifiers for Basic Day Length**
- System age: DM+1 per 2 Gyrs (round down)

This yields a range of 3–48+ hours. If the result of this roll is 40 or greater, then roll 1D: on a 5+, add the results of another determination of basic rotation rate and then roll 1D again: on a further roll of 5+, roll for another addition of the basic rotation rate and so on.

To add greater precision to the length of the day , consider the hour value as a base value and add 0–59 minutes and 0–59 seconds. This can be emulated by rolling 1D-1 for the ‘tens’ digit and d10 for the ‘ones’ digit.

```Example
For Zed Prime, a roll for base rotation rate with DM+3 for system age results in (11-2) × 4 + 2 + 1 + 3= 42 hours, which requires a second roll, a 4, so no addition is required. For extra accuracy, additional rolls result in 42 hours, 22 minutes and 15 seconds, or in decimal form, 42.37 hours. 
```

### DAYS IN A YEAR AND SOLAR DAYS
A day as determined above is one rotation, the period of time required for a world to spin once on its axis. This is called its sidereal day. While the world rotates, it also revolves around its parent body. If it is a planet, the time between ‘noons’, with the parent star(s) in the same location in the sky, is called a solar day. For Terra, a solar day is exactly 24 hours (on average) but a sidereal day is slightly shorter: 23 hours, 56 minutes and 4 seconds. This is not much of a difference but on a world with a very slow rotation or one that is locked with one face to its primary, the difference becomes much larger. In the case of the locked planet, its sidereal day is equal to the length of its year but its solar day is infinite: the sun never moves (well, maybe a little, but not all the way across the sky).

The number of solar days in a year is equal to the length of the local year (in hours – use 8,766 hours for one standard year) divided by the length of the sidereal day (in hours) minus 1 and the length of the solar day is equal to the number of hours in the year divided by the number of solar days in the local year.

**FORMULA: Solar Days In A Local Year**
$\text{Solar Days in a local year} = \frac{\text{Years(hours)}}{\text{Sideral Day(hours)}} - 1$

**FORMULA: Solar Days (hours)**
$\text{Solar Days (hours)} = \frac{\text{Years(hours)}}{\text{Solar Days in a local year}}$

Notice that if the length of the year and sidereal day are the same, there are zero solar days in a year and the length of the solar day is undefined or infinite (divide by 0 error). For slowly rotating worlds, the disparity in sidereal and solar day lengths can be rather large and for worlds with an axial tilt of greater than 90°, they rotate retrograde, or ‘backwards’, and their sidereal day should be treated as a negative number, leading to even greater disparities. It is the length of the solar day that matters for determining the climatic effects from temperature swings but it is the length of the sidereal day that impacts such things as the Coriolis effect of weather patterns.

```Example
For Zed Prime, the extra level of complexity is that it is a moon. Its sidereal day is 42.37 hours but since the sun is the source of heat, not its gas giant primary, the length of the gas giant’s year is considered instead. This is not necessarily a perfect calculation but close enough: Using 0.805 years × 8,766 = 7,056.63 hours for the year, divided by 42.37 minus 1 equals 165.548 days in a year and the solar day becomes 7,056.63 ÷ 165.548 = 42.626 hours or 42 hours, 37 minutes and 33 seconds.
```

## AXIAL TILTS
The axial tilt of a world, also known as its obliquity, is the angle between its rotational axis and its orbital axis or the plane in which it orbits its sun or parent body. The axial tilt of a world influences the severity of a world’s seasons and its resistance to becoming tidally locked to its parent body. To determine axial tilt:

**Table 52: Axial Tilt**

| 2D  | Tilt                                 |   Range    |
| :-: | :----------------------------------- | :--------: |
| 2–4 | (1D-1) ÷ 50                          | 0.00–0.10° |
|  5  | (1D) ÷ 5                             |  0.2–1.2°  |
|  6  | 1D                                   |    1–6°    |
|  7  | 6 + 1D                               |   7–12°    |
| 8–9 | 5 + 1D × 5                           |   10–35°   |
| 10+ | Roll on the Extreme Axial Tilt table |            |

**Table 53: Extreme Axial Tilt**

| 1D  |     Tilt      |  Range   | Remarks                               |
| :-: | :-----------: | :------: | :------------------------------------ |
| 1–2 | 10 + 1D × 10  |  20–70°  | High axial tilt                       |
|  3  | 30 + 1D × 10  |  40–90°  | Extreme axial tilt                    |
|  4  | 90 + 1D × 1D  | 91–126°  | Retrograde rotation                   |
|  5  | 180 - 1D × 1D | 144–180° | Extreme retrograde                    |
|  6  | 120 +1D × 10  | 130–180° | Extreme retrograde with high variance |

Linear variance for axial tilt values is appropriate and should be additive (using the result as a base) on the Extreme Axial Tilt table. Since sub-divisions of degrees are expressed as minutes and seconds, they can be added using the same procedures as day length variation.

Retrograde rotation is any rotation between 90° and 180°. It means the planet spins in the direction opposite to that of its revolution around its primary – by convention a counter-clockwise or ‘right-hand’ direction is the default. Tilts of greater than 90° can also be expressed as 180° minus its tilt with the day considered negative. An axial tilt can never exceed 180°; any excess created by adding variation or multiple extreme rolls should be subtracted from 180 instead. An axial tilt of 90° places a world on its side, with the pole facing its parent body; from a climatic impact, such an orientation effectively leads to one whole hemisphere experiencing sunlight for half a year, just as at Terra’s poles.

A world’s axial tilt is a provisional value. A tidal lock (see below) could change the tilt if that is indicated.

```Example
For Zed Prime, a roll of 10 leads to the Extreme Axial Tilt table. A 1D roll on that table is a 3, resulting in an axial tilt of 70° further refined to 73° 39’ (the ‘ notation denotes minutes of arc, a ” would denote seconds) or 73.65°. Note this tilt is in relation to the primary, a gas giant, which may also have a tilt (and Zed Prime’s orbit could have an inclination, further complicating things). In this case, the tilt of the gas giant is 3° 45’ (3.75°) and the moon’s orbit is assumed to be in the plane of the gas giant’s equator.
```

## DETERMINING TIDAL IMPACTS
Tides are differential forces applied to the planet across the breadth of its diameter by potentially both parent and child objects. They can impact the length of day and even cause a tidal lock where the same face of a world always faces the body. Tidal forces also impact the magnitude of tides on a world’s shorelines and can cause seismic stress, increasing volcanic and other geologic activity. The tidal force relationship can be explained thus: tidal force is directly related to the mass of the other body and the diameter of the affected body and inversely related to the cube of the distance between them.

**FORMULA: TIDAL FORCE**
$\text{Tidal Force} ~ \frac{\text{Other Body's Mass} \times \text{Affected Body's Diameter}}{\text{Distance}^3}$

The following sections will use this basic relationship (without as much mathematics) to determine how a world is affected by tidal force.

## TIDAL LOCK EFFECT
A strong tidal force can cause a world to stop independent rotation and keep one face toward that body, rotating once per revolution. This can lock a planet to a star, a moon to its planet, or even a planet to its moon. Other factors may prevent a lock from occurring, such as a high axial tilt, a large orbital eccentricity, the presence and movements of other gravitational sources, or even a thick atmosphere. To account for these many factors, the tidal lock status of a world is the result of one or more rolls on the Tidal Lock Status table.

**Table 54: Tidal Lock Status**

| 2D+DM | Effect                                  | Remarks                                                       |
| ----- | --------------------------------------- | ------------------------------------------------------------- |
| 2-    | No effect on day length                 | Retain existing sidereal day length                           |
| 3     | Day length = day length × 1.5           |                                                               |
| 4     | Day length = day length × 2             |                                                               |
| 5     | Day length = day length × 3             |                                                               |
| 6     | Day length = day length × 5             |                                                               |
| 7     | Prograde rotation: 1D × 5 × 24 hours    |                                                               |
| 8     | Prograde rotation: 1D × 20 × 24 hours   |                                                               |
| 9     | Retrograde rotation: 1D × 10 × 24 hours | If axial tilt < 90o, change to axial tilt = 180o - axial tilt |
| 10    | Retrograde rotation: 1D × 50 × 24 hours | If axial tilt < 90o, change to axial tilt = 180o - axial tilt |
| 11    | 3:2 tidal lock                          | World spins on its axis three times for every two rotations†  |
| 12+   | 1:1 tidal lock*                         | World spins on its axis once for every rotation†              |

\*Even on a result of a 1:1 lock, a random condition such as an impact or nearby passage of a large object may have broken the tidal lock. Roll 2D, on a natural 12, roll again on the Tidal Lock Status table with no DMs. For the case of a moon locked to a planet only, if the resultant day length for a moon is greater than the period of its orbit around its parent planet, it remains in a 1:1 tidal lock.
†On either a 3:2 or 1:1 tidal lock, If a world’s axial tilt is more than 3°, reroll the world’s axial tilt as (2D-2) ÷ 10 degrees. For a 1:1 lock only, if the world’s eccentricity is more than 0.1, reroll the world’s eccentricity with DM-2 and use the lower of the original or new values.

This table determines tidal locks for three cases: the lock of a planet to a sun, the lock of a moon to a planet and the lock of a planet to a moon. Where multiple checks are possible for the same body or pair of bodies, such as a world with a Close moon and a Near star, only roll for the case with the highest DM. In the case of a tie, roll for a lock to a moon first (the closest moon if there are more than one) and if a lock condition does not occur, roll for a lock to the star (or the next moon and then the star if there are multiple possible moons with the same DM) and apply the effect of highest adjusted roll to the world.

This table has many DMs, some common to all cases, some to the specific case. All relevant DMs, common and specific apply to roll for the relevant case. The result applies to the world’s sidereal day and assumes that this value was determined using the procedure in the Basic Day Length section.

##### TIDAL LOCK DMS 
The following DMs apply to the Tidal Lock Status table (each case has a Base DM). In ‘edge’ conditions where a value corresponds to more than one DM or falls between two DMs, use the DM closer to 0.

**Die Modifiers for all tidal lock cases:**
- Size 1 or more: DM+Size ÷ 3 (round up)
- Eccentricity greater than 0.1: DM-Eccentricity × 10 (round down)
- Axial tilt above 30°: DM-2
- Axial tilt between 60° and 120°: DM-4
- Axial tilt between 80° and 100°: DM-4
- Atmospheric pressure above 2.5 bar: DM-2
- System age less than 1 Gyr: DM-2
- System age between 5 and 10 Gyrs: DM+2
- System age greater than 10 Gyrs: DM+4 (Axial tilt DMs are additive)

**Die Modifiers for a planet’s lock to a star (or multiple stars) only:**
- Base DM: DM-4
- Orbit# less than 1: DM+4 +(10 × (1-Orbit# fraction, rounded down)
- Orbit# between 1 and 2: DM+4
- Orbit# between 2 and 3: DM+1
- Orbit# greater than 3: DM-Orbit# (rounded down) × 2
- Star mass(es) less than 0.5: DM-2
- Star mass(es) between 0.5 and 1.0: DM-1
- Star mass(es) between 2 and 5: DM+1
- Star mass(es) greater than 5: DM+2
- Planet orbits more than one star: DM-Total number of stars orbited
- Planet has a significant moon of Size 1+: DM-Total Size of all moons (Size 1+)

**Die Modifiers for a moon’s lock to a planet only:**
- Base DM: DM+6
- Moon orbit greater than 20 PD: DM-PD ÷ 20 (round down)
- Moon orbit is retrograde: DM-2
- Planet mass between 1 and 10: DM+2
- Planet mass between 10 and 100: DM+4
- Planet mass between 100 and 1,000: DM+6
- Planet mass greater than 1,000: DM+8

****Die Modifiers for a planet’s lock to its moon only:**
- Base DM: DM-10
- Moon is Size 1 or above: DM+Moon Size
- Moon orbit less than 5 PD: DM+5 + (5 – PD) × 5 (round up)
- Moon orbit between 5 and 10 PD: DM+4
- Moon orbit between 10 and 20 PD: DM+2
- Moon orbit between 20 and 40 PD: DM+1
- Moon orbit greater than 60 PD: DM-6
- Planet has more than one significant moon: DM-2 per moon beyond the first

If total DMs for any case are -10 or less, there is no need to roll on the Tidal Lock Status table for that case. If the total DMs for case are +10 or more, then a 1:1 lock is automatic (except on a further roll of 12 on 2D).

## EFFECTS OF TIDAL LOCK:
A world that is tidally locked to a star has no defined solar day and has a rotation rate (sidereal day) equal to its period or year length. It is also referred to as a twilight zone world, with one side in constant sunlight, the other in constant dark, separated by a narrow region called the twilight zone. 

If a moon is locked to a planet, or a planet to its moon, it is still tidally locked but it is not a twilight zone world: the length of the sidereal day of the locked body is equal to the period of the moon, which may considerably lengthen the day but the solar day is still computed, based on this new sidereal day length, as normal.

An additional effect of a tidal lock is a change or reduction of the locked body’s axial tilt. This tilt is often close to the plane of its orbit, meaning in a simplified two-dimensional system representation with no orbital inclination considered, it is close to zero with regards to the sun(s).

A full lock can also reduce eccentricity as indicated above.

To summarize, a tidal lock has the following effects:
 1. For planets locked to stars, sidereal day equals period (year), solar day is undefined (twilight zone world).
 2. For moons locked to a planet, or a planet to its moon, sidereal day equals moon’s period.
 3. For a 1:1 lock, recompute the axial tilt by rolling 1D on the Axial Tilt table (page 104) to determine the new axial tilt. 
 4. For a 1:1 lock, recompute the world’s eccentricity with DM-2 if it is greater than 0.1 and use the lower of the original or new values.

```Example
Zed Prime is a moon in orbit around a gas giant. The gas giant has a mass of 1,200 and Zed Prime is a Size 5 world that orbits retrograde at 22 PD with an eccentricity of 0.25. The system age is 6.3 billion years. The resultant DM for all cases is +2 (Size), -2 (eccentricity), -2 (tilt greater than 30°), -4 (tilt between 60° and 120°), and +2 (system age) or a global -4 DM for all cases. DMs for a moon locked to a planet are +6 (Base), -1 (planetary diameters), -2 (retrograde), +8 (planet mass), or DM+11 in this case. Adding all DMs together results in a total DM of +7. Rolling 2D gets a 6 + 7 = 13, which is a 1:1 lock. But a (fudged by Referee) further roll of 12 results in a ‘DM free’ roll on the Tidal Lock Status table and that result is a 4 which doubles the sidereal day length to 84 hours, 44 minutes and 30 seconds, or in decimal form, 84.74 hours. The number of days in a year becomes 82.2739 and the solar day is now 85.77 hours, or 85 hours, 46 minutes and 12 seconds.
```

## SURFACE TIDAL EFFECTS
One ironic effect of a tidal lock is that the daily effects associated with ‘tides’ between the two bodies no longer directly affects the locked world. A world locked to its sun does not experience the daily changes in sea level associated with tides on Terra but it is the long-time consequence of those daily tides that slowed the world’s rotation and locked it so one hemisphere always faces its primary. The same is true for a planet locked to its moon, although a third body can still raise tides on both. The tidal force experienced by a world from a body to which it is not locked can be determined, although it will require translating Orbit#s into AU for planets and planetary diameters into kilometres for moons but planet sizes remains as the Size, not kilometres. A star’s influence in meters of tidal amplitude on the average ocean tides of a planet is:

**FORMULA: Star Tidal Effect**
$\text{Star Tidal Effect} = \frac{\text{Star Mass} \times \text{Planet Size}}{32 \times \text{AU}^3}$

For comparison, Sol causes a tidal amplitude effect of 0.25 meters on Terra’s oceans. The force of a star’s tides also applies to the moons of a planet even when those moons are tidally locked to their parent planet – substitute the moon’s Size for the planet’s Size in the equation above.

The tidal effect of a moon, locked or not, on a planet which is not locked to that moon is computed using the moon’s distance from the planet in millions of kilometres:

**FORMULA: Moon Tidal Effect**
$\text{Moon Tidal Effect} = \frac{\text{Moon Mass} \times \text{Planet Size}}{3.2 \times (\frac{\text{Moon Distance(km)}}{1,000,000})^3}$

For comparison, Luna causes a tidal effect of 0.54 meters on Terra’s oceans.

In cases where a moon is not tidally locked to its parent, the parent planet causes tides on the moon:

**FORMULA: Planet Tidal Effect**
$\text{Planet Tidal Effect} = \frac{\text{Planet Mass} \times \text{Moon Size}}{3.2 \times (\frac{\text{Moon Distance(km)}}{1,000,000})^3}$

Finally, around planets with multiple large moons, these moons can apply tidal pressures on each other. This force affects moons even when both are tidally locked. The force varies as moons orbit the planet, being strongest when the moon separation is equal to the differences between their orbital distances to the planet and weakest when the moon separation is equal to the total of their orbit distances from the planet:

**FORMULA: Moon to Moon Tidal Effect**
$\text{Moon to Moon Tidal Effect} = \frac{\text{Other Mass} \times \text{Moon Size}}{3.2 \times (\frac{\text{Moon Separation(km)}}{1,000,000})^3}$

This effect will wax and wane as the separation between the two bodies varies. Technically, this calculation could be done between all moon pairs but it should only be done at all if the Referee thinks it is important.

For all of these cases, the tidal effect in meters represents a near minimum amplitude value, what could be expected in the open ocean. On Terra, coastal features often channel tidal effects, causing be covered later) from its eccentric orbit could remain a large factor.

## MEAN TEMPERATURE
**Warning:** This section is the most mathematics-heavy
of the book, though there will be tables to bypass the need to calculate everything. A Referee could spend an inordinate amount of time accounting for complicated but essentially insignificant temperature profiles. In most cases, the only temperature needed
for describing a world is the basic temperature, which
can be used as the mean temperature.

#### BASIC TEMPERATURE
The Referee does not need to do any temperature calculations if all that is necessary is a vague idea of the world’s general temperature: Is it hotter or colder than Terra? For that determination, the modified temperature roll from page 251 of the Traveller Core Rulebook is sufficient. A modified value of 7 can be assumed to be a mean temperature of 15°C or 288K. The Basic Mean Temperature table provides a value based on this modified roll.

**Table 55: Basic Mean Temperature**

| Modified Roll | Mean Temperature                     |
| :-----------: | ------------------------------------ |
|      -1       | another -5° per result below 0*: 0°C |
|       0       | -85°C / 178K                         |
|       1       | -75°C / 198K                         |
|       2       | -55°C / 218K                         |
|       3       | -35°C / 238K                         |
|       4       | -10°C / 263K                         |
|       5       | 5°C / 278K                           |
|       6       | 10°C / 283K                          |
|       7       | 15°C / 288K                          |
|       8       | 20°C / 293K                          |
|       9       | 25°C / 298K                          |
|      10       | 40°C / 313K                          |
|      11       | 65°C / 338K                          |
|      12       | 115°C / 388K                         |
|  13 or more   | another +50° per result above 12     |

\*Temperature must be 3K or more, and if below 10K (lower than a modified -33), should be recomputed as 1D+5.

**Die Modifiers for Basic Mean Temperature**
- If Orbit# less than HZCO-1: DM+4 +1 per 0.5 Orbit# below HZCO-1 (round to nearest)
- If Orbit# greater than HZCO+1: DM-4 -1 per 0.5 Orbit# above HZCO+1 (round to nearest)

•  Apply all atmosphere DMs noted for the Habitable Zones Regions table
•  Adhere to divisional differential value translation when HZCO# or Orbit# is less than 1
•  Consider using a raw roll of 7 and all appropriate DMs outside the habitable zone

For variety, the Referee could choose to add linear variance to these temperatures within the bounds of the results.

#### ADVANCED TEMPERATURE RULES OF THUMB
If the Referee wishes to delve into temperature calculations, several rules of thumb apply. Determining global high and low temperatures and temperatures at specific locations or times of the day could be interesting in the course of an adventure, in many cases they can be improvised values based on the base temperature and certain straightforward rules of thumb:

**Thumb rule one:** The temperature of a world is ultimately based on how much energy it receives from its star(s), how much gets reflected and how much is trapped. Sometimes inherent heat is generated by the planet itself and added to other values.

**Thumb rule two:** Many of the conditions and equations in this section lead to modifications of the Luminosity factor in the temperature equation. The base or mean (not necessarily an arithmetical mean but a ‘normal’ value) for the world as a whole should always use a factor of luminosity × 1.0. A high temperature should never use a factor of more than luminosity × 1.999 and a low no less than luminosity × 0.001. Atmospheric conditions may compress these extreme limits closer to 1.0 but never beyond those limits. Local factors can exceed the high and low temperatures list under certain conditions but not over the course of a full year.

**Thumb rule three:** The basic temperature equation determines temperature in degrees Kelvin (K) and is of the form:

**FORMULA: Basic Temperature**
$\text{Basic Temperature (K)} = 279 \times \sqrt[4]{\frac{\text{Luminosity} \times (1-\text{Albedo}) \times (1+\text{Greenhouse Factor})}{\text{Distance}^2}}$

**Thumb rule four:** If a temperature factor is independent from solar radiation (luminosity) and other variables associated with the above temperature equation, it is added to the resultant temperature(s) as a separate and independent temperature using the fourth root of the total of the fourth power of each factor:

**FORMULA: Temperature Addition: T<sub>Total</sub>**
$T_Total = \sqrt[4]{T_1^4 + T_2^4 + \text{...}}$

Rule five: All of the equations below except the mean temperature are probably wrong, at least under certain conditions. Climate scientists with supercomputers do not always agree on models for temperature effects and even when their models agree, the results can be indeterminate.

With more thumbs than hands, the temperature section commences:

#### MEAN TEMPERATURE DETERMINATION
Computing the mean temperature of a world by formula requires four values:

1. The luminosity of its sun(s) (in Solar units)
2. The distance from its sun(s) (in AU)
3. The fraction of solar energy it reflects back into space (albedo)
4. The fraction of energy that the world’s atmosphere prevents from escaping (greenhouse factor)

The first and second values are determined in previous chapters. For the mean temperature, if a world orbits multiple suns, the luminosity of all of those ‘interior’ stars is added to determine luminosity and any ‘exterior’ stars are initially ignored. If a world is a moon, use the Orbit# of the world’s parent planet to determine the AU distance.

##### ALBEDO
The third value is the world’s albedo. More specifically for temperature generation, these formulas consider the Bond or bolometric albedo, which covers all wavelengths of light. A world’s albedo can vary from as little as 0.04 for the dark dusty surfaces of some asteroids and cometary cores, to nearly 1.0 for bright ice and clouds. An accepted value for Terra’s albedo is about 0.3, for Luna about 0.11 and Mars 0.25 but for brighter cloud-covered worlds, the numbers can be higher: Venus is 0.75 and gas giants range between 0.3 and 0.5. Icy outer system bodies often have high albedos, such as Enceladus at 0.81 and Eris at 0.96.

The Albedo Range table provides guidance for determining the albedo of different types of worlds. Select the proper type of world, then if the world has atmosphere or hydrographics values add the results from the appropriate modifier rows. On the table, a rocky terrestrial world is considered any world with a density greater than 0.4. The potential exception is a snowball world with extreme glaciation, which should be treated instead as an icy terrestrial beyond HZCO+2.

**Table 56: Albedo Range**

| World Types                           |        Albedo         |    Range     | Midpoint |
| ------------------------------------- | :-------------------: | :----------: | :------: |
| Rocky terrestrial (Density above 0.5) | 0.04 + (2D-2) × 0.02  |  0.04–0.22   |   0.14   |
| Icy terrestrial, up to HZCO+2         |  0.2 + (2D-3) × 0.05  |  0.15–0.65   |   0.40   |
| Icy terrestrial, beyond HZCO+2        | 0.25 + (2D-2) × 0.07* |  0.25–0.95   |   0.73   |
| Gas giant                             |   0.05 + 2D × 0.05    |  0.15–0.65   |   0.40   |
| **Modifiers**                         |                       |              |          |
| + Atmosphere 1–3 or E                 |    +(2D-3) × 0.01     | + -0.01–0.09 |  +0.04   |
| + Atmosphere 4–9                      |      +2D × 0.01       | + 0.02–0.12  |  +0.07   |
| + Atmosphere A–C or F+                |    +(2D-2) × 0.05     | + 0.00–0.50  |  +0.25   |
| + Atmosphere D                        |      +2D × 0.03       | + 0.06–0.36  |  +0.21   |
| + Hydrographics 2–5                   |    +(2D-2) × 0.02     | + 0.00–0.20  |  +0.10   |
| + Hydrographics 6+                    |    +(2D-4) × 0.03     | + -0.06–0.24 |  +0.09   |

\*Icy worlds beyond two orbits from the habitable zone center are likely to have significantly brighter surfaces but this can vary widely. On any result of 0.4 or less, subtract 1D-1 × 0.05 from the albedo to lower the limit of 0.02.
In the unlikely event of generating a result greater than 0.98 or less than 0.02, treat the albedo results as 0.02 and 0.98 respectively.

##### GREENHOUSE FACTOR
The fourth value for determining the base temperature is the greenhouse factor. Vacuum worlds have a greenhouse factor of 0 by definition. For worlds with an atmosphere, many gases contribute to the greenhouse factor, including atmospheric composition and thickness. These do not always contribute in a consistent manner, or at least they cannot be considered in isolation. For instance, methane is a greenhouse gas that is 40 times as potent as carbon dioxide per molecule, but on Titan the nitrogen-methane atmosphere actually has a reverse greenhouse effect on the surface temperature. Rather than attempting to model various gas interactions at differing pressures and temperatures, the greenhouse factor can be emulated using the following guidelines:

The initial greenhouse factor is equal to 0.5 times the square root of the world’s atmospheric pressure in bar:

**FORMULA: Initial Greenhouse Factor**
$\text{Initial Greenhouse Factor} = 0.5 \times \sqrt{\text{Atmospheric Pressure(bar)}}$

Next, Apply the following modifiers to the factor

**Modifiers for Initial Greenhouse Factor**
- Atmosphere 1–9 or D or E:+ 3D × 0.01
- Atmosphere A or F: × 1D-1 (minimum 0.5)
- Atmosphere B, C, G, or H: 1D: on 1–5, × the result (of 1–5); on 6, × 3D

After modifications, this value is the world’ s effective greenhouse factor at mean baseline altitude. It can be helpful to keep note of this modifier to the initial factor for use in determining altitude-based temperatures, although the modifier can also be recomputed from a known final value and the initial greenhouse factor formula.

With all four factors determined, the mean temperature of a world in Kelvin (K) is:

**FORMULA: Mean Temperature (K)**
$\text{Mean Temperature (K)} = 279 \times \sqrt[4]{\frac{\text{Luminosity} \times (1-\text{Albedo}) \times (1+\text{Greenhouse Factor})}{\text{AU}^2}}$

This value can be rounded to the nearest whole number. The Celsius equivalent is:

**FORMULA: Mean Temperature (°C)**
$\text{Mean Temperature (°C)} = \text{Mean Temperature (K)}-273$

The Fahrenheit equivalent is:

**FORMULA: Mean Temperature (°F)**
$\text{Mean Temperature (°F)} = \text{Mean Temperature (K)} \times 1.8 - 459.67$

If Referees have a particular temperature range in mind for their vision of the world, altering the values of albedo or greenhouse factors is the best way to ‘finetune’ a world’s climate to meet those expectations.

##### OPTIONAL RUNAWAY GREENHOUSE CHECK
If using the optional runaway greenhouse check procedure, the Referee should check for this effect on any world with an initial Atmosphere of 2–F with a mean temperature above 303K (30°C).

```Example
Zed Prime is a moon of a gas giant which orbits Zed Aa and Ab. Those two stars have a combined luminosity of 1.419 and the distance of Zed Prime’s gas giant primary from those stars is 1.06 AU.

To determine Zed Prime’s albedo, it is a rocky terrestrial with Atmosphere 6 and Hydrographics 6, resulting in 0.04 + 2D-2 × 0.02 + 2D × 0.01 + 2D-3 × 0.03 rolled as 0.04 + (8-2) × 0.02 + 8 × 0.01 + (6-3) × 0.03 = 0.33.

For greenhouse factor, Zed’s Atmosphere code 6 has a pressure of 1.04 bar. This yields a greenhouse factor of 0.5 × 1.041/2+3D × 0.01 which, with a 3D roll of 8 results in 0.59.

These four values entered into the mean temperature equation results in: 279 × (1.419 × (1 - 0.33) × (1 + 0.59) ÷ 1.062)1/4 = 300K. This is 12° warmer than Terra, although averages will not give a complete picture.
```

## HIGH AND LOW TEMPERATURES
A single mean temperature value does not describe the ranges of temperatures experienced on a daily basis across a world’s surface. Various scenarios can cover deviations from the mean temperature. The first of these will consider the values to record as High and Low temperatures for the world. These are not the world’s most extreme temperatures but are bounds on expected temperature values under most circumstances.

A major factor in determining temperature variations on many worlds is axial tilt. The effects of axial tilt are moderated and exacerbated by other factors, such as the length of days and years, the world’s atmosphere and even its general geography. These factors can modify the effective luminosity value of the temperature equation over varying time periods across the course of a planet’s year. The world’s orbital eccentricity can also influence temperatures as the world moves close and further from its suns. This section will build these factors in steps to compute the high and low temperature values.

##### STEP 1: AXIAL TILT FACTOR
The major influence on Terra’s annual temperature variation at a particular time of year comes from axial tilt, which causes the variation in temperature between summer and winter. In simple terms, the tilt of the world as it orbits its star is such that one hemisphere receives more energy than another – it has a longer day and the sun strikes at less of an angle. Locations above the arctic circle, those of higher latitude than 90 degrees minus axial tilt degrees, will experience at least some days of perpetual daylight in the summer and night in the winter and the actual poles will experience sunlight for half the year and night for the rest. The following procedure will determine the axial tilt factor for the world. The basic axial tilt factor is equal to the sine of the axial tilt:

**FORMULA: Basic Axial Tilt Factor**
$\text{Basic Axial Tilt Factor} = \sin({\text{axial tilt}})$

For the purposes of this calculation the axial tilt should be considered to be in the range of 0–90°. If the axial tilt is beyond this range, then treat it as positive if negative and/or if it is more than 90°, subtract its positive value from 180°.
- If the axial tilt is negative, this will result in a negative number – take the absolute value of this number instead.
- If using a calculator or spreadsheet, the function SIN() assumes generally radians not degrees. In these cases, first convert any arcminute or arcsecond values to their decimal equivalent and then multiply the tilt value by, which might be easier to render as ‘π÷180’, or use the RADIANS() function.

Very short or long orbital periods can alter the magnitude of this factor:
- If the length of a world’s year is less than 0.1 standard years (876.6 hours or 36.525 days) then divide the axial tilt factor by two to represent the dampening effect of short seasons.
- If the length of a world’s year is greater than 2.0 standard years, increase the axial tilt factor by 0.01 times the length of the year (in standard years) to a maximum increase of 0.25 or to a maximum value of 1.00, whichever is less.

```Example
Zed Prime sits nearly on its side. It has an axial tilt of 73.65°, which the Referee can ‘eyeball’ as an axial tilt factor of 0.96 from the table or compute as 0.95956. Since this tilt is around its gas giant planet and the length of that revolution is only 26 days, the axial tilt factor is halved to become 0.48 – note the axial tilt of the parent planet could also be a contributor but as it is less than 4° in this case and could influence the tilt factor either positively or negatively, the Referee decides not to worry about trying to add that extra wheel of detail.
```

##### STEP 2: ROTATION FACTOR
Longer days and nights can contribute to greater variation in temperature. While somewhat related to the axial tilt, this factor can be considered independently. In most cases the rotation factor is the square root of the length of the absolute value of the solar day (see page 104) in hours, divided by 50:

**FORMULA: Rotation Factor**
$\text{Rotation Factor} = \frac{\sqrt{\text{Absolute value of Solar Day (hours)}}}{50}$

Two exceptions to this exist, both based on the principle that no temperature modification factor to luminosity can be greater than 1.0:
- Any solar day of greater than 2,500 hours results in a rotation factor of 1.0 
- All worlds in a 1:1 tidal lock to their sun(s) have a rotation factor of 1.0

```Example
Zed Prime’s solar day is 85.77 hours long, so the resulting rotation factor is determined by taking the square root of that number and then dividing by 50 to get 0.185.
```

##### STEP 3: GEOGRAPHIC FACTOR
Liquid water has a moderating effect on temperature. Conversely, locations far from large bodies of water can experience greater extremes in temperature. To account for this, apply a Geographic Factor based on the world’s Hydrographics code (HYD) and results of the Surface Distribution table.

**FORMULA: Geographic Factor**
$\text{Geographic Factor} = \frac{10 - \text{Hydrographics}}{20} + \text{Modifier}$

If the world’s Hydrographics code is between 2–8, then geography can modify the factor:
- Surface Distribution is ‘Very Concentrated’ (9 +): +0.1
- Surface Distribution is ‘Very Distributed’ (1-): -0.1

A modified result can result in a negative number.

##### STEP 4: VARIANCE FACTOR ADDITION
At different times and locations, the factors above can combine in different ways to vary from the mean temperature of a world. However, the initial use of these factors is to help determine global high and low temperature values. These are not the extremes possible across a world’s surface but overall values to determine expected variation. For this purpose, the factors determined above can be added together:

**FORMULA: Variance Factors**
$\text{Variance Factors} = \text{Axial Tilt Factor} + \text{Rotation Factor} + \text{Geographic Factor}$

If this result is greater than 1.0, it must be reduced to 1.0; if it is less than 0, it becomes 0.

```Example
The variance factors for Zed Prime add up to 0.865.
```
##### STEP 5: ATMOSPHERIC FACTOR
Atmospheric circulation can dampen temperature variations across a surface, even to the point of eliminating any significant variances. The Atmospheric Factor for a world is equal to 1 plus its atmospheric pressure in bar:

**FORMULA: Atmospheric Factor**
$\text{Atmospheric Factor} = 1 + \text{Atmospheric Pressure (bar)}$

```Example
Zed Prime has an atmospheric pressure of 1.04 bar, so its atmospheric factor is 2.04
```
##### STEP 6: LUMINOSITY MODIFIER
The Luminosity Modifier is equal to the variance factors divided by the atmospheric factor. It will be a number somewhere between 1 and 0:

**FORMULA: Luminosity Modifier**
$\text{Luminosity Modifier} = \frac{\text{Variance Factors}}{\text{Atmospheric Factor}}$

If the variance factors remain within the bounds of 0 and 1, the luminosity modifier can never be more than 1 or less than 0.

```Example
Zed Prime’s luminosity modifier = 0.865 ÷ 2.04 = 0.424
```
##### STEP 7: HIGH AND LOW LUMINOSITY
A major element in the temperature equation used to compute the world’s overall high and low temperatures is set by applying the luminosity modifier to determine the effective luminosity experienced by the world under differing conditions. These modified values are:

**FORMULA: High Luminosity**
$\text{High Luminosity} = \text{Luminosity} × (1 + \text{Luminosity Modifier})$

**FORMULA: Low Luminosity**
$\text{Low Luminosity} = \text{Luminosity} × (1 - \text{Luminosity Modifier})$

```Example
With total luminosity from Stars Aab at 1.419, Zed Prime’s high and low luminosity values are 2.021 and 0.817.
```
##### STEP 8: ECCENTRICITY MODIFIERS: NEAR AND FAR AU
The final factor to consider in determining high and low temperature values is the world’s eccentricity. For a planet, the eccentricity of its orbit is the value to consider and for a moon, it is the eccentricity of the parent planet. The Referee could also compute the difference in orbital location based on the moon’ s orbit for extra complexity but in the interest of sanity , that is optional.

For the high temperature, the AU value of an orbit should be multiplied by 1 – eccentricity to set a Near AU value. For a low temperature by 1 + eccentricity to set a Far AU value:

**FORMULA: Near AU**
$\text{Near AU} = \text{AU} × (1 - \text{eccentricity})$

**FORMULA: FAR AU**
$\text{Far AU} = \text{AU} × (1 + \text{eccentricity})$

```Example
For Zed Prime, its parent planet’s orbit (of 1.06AU) is what matters for eccentricity. Its eccentricity is 0.10, so the Near AU value is 1.06 × (1 - 0.10) or 0.954 and the Far AU value is 1.06 × (1 + 0.10) or 1.166. Zed Prime’s orbit around its gas giant could add +3.9 million kilometres to this value but that is less than the variance of the planet’s eccentricity and the Referee feels no need to try to determine any difference this could cause.
```
##### STEP 9: HIGH AND LOW TEMPERATURE CALCULATION
From the combination of the above luminosity and distance modifiers, the world’s high and low temperatures are:

**FORMULA: High Temperature (K)**
$\text{High Temperature (K)} = 279 \times \sqrt[4]{\frac{\text{High Luminosity} \times (1-\text{Albedo}) \times (1+\text{Greenhouse Factor})}{\text{Near AU}^2}}$

**FORMULA: Low Temperature (K)**
$\text{High Temperature (K)} = 279 \times \sqrt[4]{\frac{\text{Low Luminosity} \times (1-\text{Albedo}) \times (1+\text{Greenhouse Factor})}{\text{Far AU}^2}}$

```Example
Using albedo = 0.33 and greenhouse factor = 0.59, with the above computed factor values, Zed prime’s high and low temperatures are 346K and 250K, respectively (73°C and -24°C). For comparison, the Terran values for these two temperatures computed in the same manner are 312K and 261K (38°C and -12°C).
```
## ADDITIONAL TEMPERATURE SCENARIOS
The mean, high and low temperatures are planetwide values valid at mean baseline altitude and temperate zone regions. Changes to the luminosity modifier’s components can provide different temperatures and ranges for differing latitudes and times of year or day.

Differing altitudes are addressed by modifying the greenhouse factor based on the varying atmospheric pressures at different altitudes. These calculations can become rather complex and rely on the interactions between various factors that can both increase and decrease the temperature values. If a Referee wants to work out various scenarios and determine temperature profiles for certain locations at different times, these procedures and equations will provide some guidance. They are intended to be tools to apply as necessary, not requirements for any or every situation.

#### TEMPERATURE SCENARIO: TEMPERATURE BY SEASON
The axial tilt factor sets bounds for global seasonal variation but actual variance depends on the latitude and the time of the year. If the axial tilt factor is significant (meaning the axial tilt factor divided by the atmospheric factor is more than 0.05) the Referee may wish to determine temperatures for the current season or the current day of the year in the ‘warmer ’ or ‘colder’ hemisphere.

The temperature for each season changes the axial tilt factor from its maximum value in local summer, to zero at the equinoxes and to the negative in winter, but the change is not linear and it will lag as the ground slowly heats and cools.

To model this effect, begin by calculating an adjusted fractional year by assigning a time to the beginning of the last local summer – the summer solstice (pick the relevant hemisphere). Determine the passage of time from that event then subtract the lesser of 0.1 standard years or 0.1 local years to account for lag in temperature effects, then divide that value by the length of the local year. The below calculation uses local solar days throughout and is not relevant for solar tidally locked or very slowly rotating worlds:

**FORMULA: Adjusted Fractional Year**
$\text{Adjusted Fractional Year} = \frac{\text{Days since summer solstice} - 0.1 \times \text{lag (days)}}{\text{local year length (days)}}$

Assuming a basically circular orbit around the star, multiply this interval by 360 and use the cosine of that value to determine the fraction of the axial tilt factor to apply. This will result in a number between +1 and -1 to multiply by the axial tilt factor to use as a substitute for the axial tilt factor when determining the luminosity modifier (which, regardless of all factor values, must still be between 0 and 1).

**FORMULA: Seasonal Axial Tilt Factor**
$\text{Seasonal Axial Tilt Factor} = \cos(\text{Adjusted Fractional Year} \times 360) \times \text{Axial Tilt Factor}$

#### TEMPERATURE SCENARIO: MEAN TEMPERATURE BY LATITUDE
Another modification to the axial tilt factor can help determine a temperature specific to a latitude between 0°–90°. For these procedures, convert an axial tilt that is negative or above 90° to an appropriate equivalent by treating negative tilts as positive and/or if it is more than 90°, subtracting its positive value or equivalent from 180°. The world’s axial tilt determines the borders of three basic seasonal zone types:

1. The tropical zone, defined as a region of a world with a latitude of less than or equal to the axial tilt or equivalent. In this region, the sun is directly overhead at least part of the year.
2. At the other extreme are the two arctic zones, defined as the regions with a latitude of more than 90° minus the axial tilt or equivalent. In these regions, for at least part of the year, the sun is below the horizon for the length of the day.
3. The regions in between are the two temperate zones, where neither of the prior conditions exist. However, if the axial tilt is between 45° and 90°, there is no temperate zone and regions that are tropical during one time in the year are arctic at another time. Note tropical, arctic and temperate do not imply particular temperature ranges, just zones of relative variations of sunlight. For clarity, in the processes below, the term middle zone will be used instead of temperate zone.
##### Part A: Worlds with Axial Tilts of less than 45°
The mean temperature of a world is defined as the mean temperature of the world at 45° latitudes. For worlds with an axial tilt of less than 45°, average temperatures over the course of the year can be divided into two zones by latitude, the tropical zone and everything else, both the middles and the arctics. For each of these cases a latitude adjustment applies, determined for each as:
###### CASE 1, TROPICAL ZONE:
In the tropical zone, an axial tilt is not a significant factor for differences in temperature during the course of varying seasons; tropical temperatures have little seasonal variation (from axial tilt, although a large eccentricity could provide season-like effects). Year-long temperatures remain essentially constant in the tropic zone and calculations regarding them can ignore any temperature by season calculation, instead experiencing temperatures warmer than the world’s mean all year long. This increase is related to the difference between 45° and the axial tilt.

**FORMULA: Tropical Zone Latitude Adjustment**
$\text{Tropical Zone Latitude Adjustment} = \sin(45°- \text{axial tilt})$

This provides the temperature adjustment for a location in this zone. If estimating varying temperatures during the course of the year in the tropical zone, an axial tilt factor modifier is not applied to the temperature equation.

###### CASE 2, MIDDLE AND ARCTIC ZONES:
The following provides a roughly accurate match of temperatures above the tropical zone:

**FORMULA: Middle and Arctic Zone Luminosity Adjustment**
$\text{Middle and Arctic Zone Luminosity Adjustment} = \sin(45°- \text{latitude})$

This adjustment is independent of tilt but during different seasons, the axial tilt factor will also apply to daily temperature variance factors in this zone.

###### BOTH CASES:
After determining a zone luminosity adjustment, it is applied to the luminosity modifier: 

**FORMULA: Luminosity Modifier**
$\text{Luminosity Modifier} = \frac{\text{Zone Latitude Adjustment}}{\text{Atmospheric Factor}}$

This luminosity modifier is used to determine the mean annual temperature for a specific latitude. In the tropical zone, this modifier replaces any axial tilt factor to modify luminosity when calculating any temperature for a specific latitude. For the rest of the world, it also replaces the axial tilt factor when computing a mean annual temperature for the latitude but to determine temperatures at a specific time of the year, the zone’s latitude adjustment it is added to the axial tilt factor for that time period and any other factors before dividing by the atmospheric factor to determine the mean temperature at that time of the year.

The luminosity multiplier for latitude to use in the temperature equation is equal to 1 plus the luminosity modifier:

**FORMULA: Latitude Luminosity**
$\text{Latitude Luminosity} = \text{Luminosity} \times (1 + \text{Luminosity Modifier})$

This is then added to the temperature equation to determine the mean temperature of a specific latitude (or latitude temperature):

**FORMULA: Latitude Temperature (K)**
$\text{Latitude Temperature (K)} = 279 \times \sqrt[4]{\frac{\text{Latitude Luminosity} \times (1-\text{Albedo}) \times (1+\text{Greenhouse Factor})}{\text{AU}^2}}$


##### Part B: Worlds with Axial Tilts of 45° or more
If a world has an axial tilt of 45°or more, it has no middle zones, and the tropical and arctic zones meet or overlap. For these worlds, use the following alternate procedure: 
- Apply the middle and arctic zone case (Case 2) for the entire arctic zone (90° - axial tilt)
- The latitude luminosity adjustment for the remaining equatorial tropical zone is equal to the result of middle and arctic zone case calculation at the edge of the arctic zone (90° - axial tilt) 

Determine the latitude luminosity and the latitude temperature as above.
###### TEMPERATURE SCENARIO: TEMPERATURE BY TIME OF DAY
Especially when a world has a long rotation period or solar day, temperature can vary greatly between day and night. If the rotation factor is significant (meaning the rotation factor divided by the atmospheric factor is more than 0.05), the Referee may wish to determine temperatures for the time of day. For worlds that are locked to their primary star(s), see the Temperature Scenario: Twilight Zone Worlds section.

Outside the extreme case of a twilight zone world, the Referee can determine the actual magnitude of the daily variation during the course of the day by one of two methods. The first, suitable for worlds with moderate or low axial tilts, is to assume that day and night lengths are fairly even, whereas the second adds the complexity for varying day and night fractions by season.

**METHOD 1, EVEN LENGTH DAYS:** Much like a seasonal variation, a temperature variation lags the sun. It is coldest near dawn and does not reach full heat until the afternoon. The actual lag in heating can vary in both absolute and relative terms but for simplicity this procedure assumes symmetry between day and night temperature lags. This method assumes a starting point of the day, using local dawn as hour zero. If there was no lag in hot and cold temperatures, it would be coldest at midnight and warmest at noon. Instead, estimate the lag by adding 15% of the solar day length to the hours since dawn time of day, then divide the sum by the total hours in a solar day to determine the adjusted fractional day:

**FORMULA: Adjusted Fractional Day**
$\text{Adjusted Fractional Day} = \frac{\text{Hours since dawn}}{\text{Solar Day (hours)}}+0.15$

Multiply the interval by 360 and use the sine of that value to determine the fraction of the rotation factor to apply to the temperature equation. This will result in a number between +1 and -1 to multiply by the previously computed rotation factor to be used as a substitute rotation factor when determining the luminosity modifier.

**FORMULA: Hourly Rotation Factor**
$\text{Hourly Rotation Factor} = \sin{(\text{Adjusted Fractional Day} \times 360)} \times \text{Rotation Factor}$

**METHOD 2, UNEVEN LENGTH DAYS:** When day and night have unequal lengths, the calculation becomes rather more complex. First, determine the fraction of the whole solar day that is daytime (see Calculating Sunlight Portion and Hours section). During daylight, use the following formula for adjusted fractional day:

**FORMULA: Adjusted Fractional Day**
$\text{Adjusted Fractional Day} = \frac{\text{Hours since dawn}}{\text{Solar Day (hours)} \times \text{Sunlight Portion} \times 2}+0.15$

During the night, use the following formula for adjusted fractional day:

**FORMULA: Adjusted Fractional Day**
$\text{Adjusted Fractional Day} = \frac{\text{Hours since dawn}}{\text{Solar Day (hours)} \times (1-\text{Sunlight Portion}) \times 2}+0.15$

Both day and night will then use the same hourly rotation factor equation as method 1.
###### TEMPERATURE SCENARIO: TWILIGHT ZONE WORLDS
In the extreme case of a world locked to its primary star(s), which has an infinite solar day, the rotation factor calculation is rather straightforward at the edge cases:

**FORMULA: Bright Side Rotation Factor**
$\text{Bright Side Rotation Factor} = +1.0$

**FORMULA: Dark Side Rotation Factor**
$\text{Dark Side Rotation Factor} = -1.0$

The twilight zone has a Rotation Factor of about 0.0. However, the twilight zone is a ‘zone’, not just a terminator line separating light from dark, especially on worlds with atmospheres. If the Referee wishes to determine variable effects based on world-specific factors, the Referee can determine how far from this terminator centerline the extreme rotation factors take hold.

###### TWILIGHT ZONES VARIABILITY FACTORS
A number of factors impact the breadth and characteristics of a twilight zone, including terrain, libration, solar disk size, atmospheric refraction and the effects of a twilit sky itself.

**Terrain:** An effect on all worlds is the actual terrain and altitude of intervening geography. This can both block and extend sunlight at the twilight zone. Many factors can influence the ‘contours’ of the terminator but the simplest case to consider is that of the distance to the horizon, as taller objects can see ‘further’ into the day side and likewise are able to receive sunlight when lower terrain is still in the dark. The distance to the horizon, which can be used as a proxy for how far ‘beyond’ the terminator line terrain remains lit, is based on the world’s diameter and the altitude of the location. The distance to the horizon in kilometres is:

**FORMULA: Horizon Distance (km)**
$\text{Horizon Distance (km)} ≈ \sqrt{\text{Height (km)} \times \text{World's Diameter (km)}}$

For compatibility with the following equations, which are based on degrees on the world surface, the distance in degrees is:

**FORMULA: Horizon Distance (°)**
$\text{Horizon Distance (°)} = \frac{360 \times \text{Distance (km)}}{\pi \times \text{World's Diameter (km)}}$

**Libration:** A world can experience a wobble as it revolves around its sun. An eccentric orbit results in libration around a world’s equatorial regions. Axial tilt results in libration around a world’s polar regions. These effects take place over the course of a local year, essentially ‘rocking’ the world along its equator and poles. Unless the year is very short this is a slow process but it might allow certain regions near the terminator to experience periods of ‘summer’ and ‘winter’ as sunlight periodically strikes the surface.

During the course of an eccentric orbit, a locked world’s rotation rate stays constant (one rotation per orbit) but its orbital velocity varies, creating a year-long ‘wobble’. For example, Luna, with an eccentricity of about 0.055, has a libration amplitude of nearly 8°. Accurate formulation and additional factors not considered here make this calculation very complex. For simplicity, assume eccentricity has a linear relationship with the amplitude of the libration and estimate the span of the libration in longitude on the equator is equal to 145 times the eccentricity:

**FORMULA: Eccentricity Longitudinal Libration (°)**
$\text{Eccentricity Longitudinal Libration (°)} = 145 \times \text{eccentricity}$

This effect will ‘yaw’ the world back and forth, exposing the region near the terminator, especially near the equator to periods of sunlight and sunset. This formula is likely to be less realistic for very eccentric orbits. For eccentricities above 0.3 the Referee should consider reducing this multiplier in stages from 145 towards 90.

For a world with an axial tilt, during the course of a local year, the axial tilt of the world will expose an additional slice of the world’s surface to sunlight equal to its axial tilt times the sine of the latitude:

**FORMULA: Eccentricity Latitudinal Libration (°)**
$\text{Eccentricity Latitudinal Libration (°)} = \text{Axial Tilt} \times \sin{(\text{latitude})}$

This effect will ‘pitch’ the world forward and back, exposing more of one polar zone to sunlight and then the other. Most worlds locked to their primary do not experience much axial tilt, so this effect is often not very pronounced.

**Solar Disk Size:** Another factor in the breadth of a twilight zone is the actual size of the disk of the sun: the sun of a world close enough to be tidally locked is liable to be larger than a point, perhaps as much as two or three degrees wide. Therefore, along a region of the twilight zone, all or part of the sun may hang above the horizon

The size of the disk of a world’s sun determines how much is visible. At the terminator, the sun is assumed to be half set but will still be visible in part across a stretch of longitude equal to half its angular size. The angular size of a star is determined from the procedure in ‘How Big is That Thing in the Sky?’. The width of the band between where the sun is completely visible on the horizon to where it is completely set is equal to the sun’s angular size on the surface of the world, or half of this size on either side of the terminator:

**FORMULA: Solar Disk Visibility Band (°)**
$\text{Solar Disk Visibility Band (°)} = \frac{\text{± Angular Size(°)}}{2} \text{ from Terminator}$ 

Only on the ‘bright’ side of this band is the full sun visible in the sky (assuming a flat horizon and ignoring the curvature of the planet), so sunward of this point, the full bright side rotation factor of 1.0 could be applied.

**Multiple Stars Separation:** When a locked world orbits multiple stars, those stars also orbit each other and at various points one or more stars may appear above the horizon. To determine how far, use the separation of the stars in AU plus their diameters (converted to AU) to determine their angular separation as the angular size for use in the equation. The period of the stars’ orbit determines the rise and fall of the (assumed for these purposes) smaller of the two stars above the terminator. This calculation assumes the plane of the stars’ orbit and those of the planet are the same.

**Atmospheric Refraction:** Atmospheric refraction can cause a sun to appear to be on the horizon or above it, even after the sun has set. This will extend the twilight zone into the dark side. It will also increase the span of the bright side. Atmospheric refraction is highly variable but on average can be assumed to be about 0.5° on Terra. Assume it increases in proportion to pressure and decreases 1% for every 3 degrees in temperature or roughly:

**FORMULA: Refraction (°)**
$\text{Refraction (°)} = 0.5 \times \frac{\text{Atmosphereic Pressure (bar)} \times 300}{\text{Temperature (K)}}$

For extra complexity, the atmospheric pressure would be lower at higher altitudes but so would the temperature and the distance to the horizon. These factors could also be considered.

**Atmospheric Scale Height, Horizon and Twilight:** Light persists after the full setting of the sun or before sunrise because the sun is still shining on the visible sky or upper atmosphere (see the discuss on terrain, above). On Terra, the resultant phenomena have many names but of note are the different definitions of twilight: 
- Civil twilight occurs when the sun is less than 6° below the horizon and artificial light is not needed. 
- Nautical twilight occurs when the sun is between 6° and 12° below the horizon and the horizon and vague shapes are discernible 
- Astronomical twilight occurs when the sun is between 12° and 18° degrees below the horizon and most astronomical objects are visible but fainter objects at sixth magnitude or dimmer are not visible.

The dark edge of each of these periods is considered to be their ‘dusk’ at night or ‘dawn’ in the morning. Many factors can influence the persistence and magnitude of twilight – just as many can influence the colour of a sky. In general, the scale height of the world’s atmosphere and the curvature of the world determine the distance beyond the horizon that the light of a sun can influence the visible sky. Obviously, a world with no atmosphere has no scale height and no ability to experience these forms of twilight but for all other atmospheres, trace and above, for simplicity, twilight will extend in proportion to scale height and the world’s Size:

**FORMULA: Twilight Zone Extent (°)**
$\text{Twilight Zone Extent (°)} = \frac{\text{Scale Height (Km)}}{8.5\text{km}} \times 6° \times \frac{\text{World Size}}{8}$

The previous equation determines the spread of each type of twilight zone (civil, nautical and astronomical) for various worlds in degrees along their longitude surface. Each could indicate a stepwise or gradual decrease of the rotational factor until -1.0 is reached at the dark edge of astronomical twilight.
##### SIMPLIFIED METHOD FOR MAPPING TWILIGHT ZONE WORLDS
All factors above can lead to special situations and unexpected effects but the level of detail provided is not necessary in most cases. To map a tidally locked twilight zone world, the following principles can apply: 
1. Turn the world map sideways: Treat the bright side as the top, the dark side as the bottom and the terminator as the ‘equator’. The north pole is now at the centre of the map and the south pole is on the far edges. In this situation the 10 triangles that form the center row of hexes, or half the map area, represent the region +30o from the terminator line and the upper and lower triangles represent the next 60° to the bright or dark center of the world. 
2. Assume that a Sol-sized star will shine 1° (from both disk size and refraction) into the dark side of the world at 1 AU. To determine the actual number of degrees simply multiply 1° by the star’s actual diameter and divide by the AU distance of the orbit. From the terminator into the dark side, this is the twilight zone area where the sun is visible. In this region, the rotation factor = 0.0. 
3. On the dark side, use 6° as a default measure of each zone of twilight (this can be adjusted by scale height and size). The start of civil twilight begins when the sun fully sets. Reduce the rotation factor gradually or in steps, with the dark edge of civil twilight = -0.3, the dark edge of nautical twilight being -0.6 and the dark edge of astronomical twilight reaching -1.0. From there (about 19° into the dark side) to the other side of the dark side where astronomical twilight begins, the rotation factor remains -1.0. 
4. The temperature begins increasing at the terminator. For each 3° into the bright side increase the rotation factor by 0.2 until it reaches 1.0 at 15% into the bright side. This is about half of the distance between the terminator and the end of the central triangles.
##### TEMPERATURE SCENARIO: ALTITUDE TEMPERATURE FACTOR
Rather than delving into possible atmospheric layers, inversion effects, cloud levels and other minutia, this book will simply assume that on worlds with an atmosphere the temperature will tend to drop as altitude increases. The basic simplifying assumption for altitude-related temperature changes is that the initial greenhouse factor is related to the atmospheric pressure, but the world’s atmospheric factor modifying the luminosity effects is a global value unchanged by altitude, as it distributes heat across the entire atmospheric layer.

Determination of the effects of altitude can come from two previously introduced equations. The first is derived from the scale height and the pressure at altitude equation on page 81. To review, this equation provides the atmospheric pressure at an altitude above mean baseline altitude as:

**FORMULA: Pressure(a)**
$\text{Pressure(a)} = \frac{Pressure(m)}{e^{\frac{height(a)}{H}}}$

Pressure(m) is the mean base altitude pressure in bar, H is the world’s scale height in kilometres and height(a) is the current altitude above mean baseline altitude, also in kilometres. The Referee can use the pressure at the current altitude to recompute a new ‘initial’ greenhouse factor based on Pressure(a) as:

**FORMULA: New 'initial' Greenhouse Factor**
$\text{New 'initial' Greenhouse Factor} = .5 \times \sqrt{\text{Pressure(a)}}$

Determine the adjusted Greenhouse Factor(a) by adding or multiplying the original greenhouse modifier (if this has not been retained, the Referee may need to perform some reverse engineering to determine it).

This new value, Greenhouse Factor(a), based on Pressure(a) is now used to compute the temperature with whatever basic or modified Luminosity(x) is appropriate:

**FORMULA: Temperature(a) (K)**
$\text{Temperature(a) (K)} = 279 \times \sqrt[4]{\frac{\text{Luminosity}_\text{(x)} \times (1-\text{Albedo}) \times (1+\text{Greenhouse Factor}_\text{(a)})}{\text{Distance}^2}}$
##### TEMPERATURE SCENARIO: STELLAR FACTORS: MULTIPLE STARS (WITH ECCENTRICITY)
Multiple stars within a system can add temperature to a world. As stars and planets orbit the system, varying proximity will change the luminosity effect of each star. For the case of binaries in companion orbits, this variance is often minor or results in only short-term variation, as noted in previous examples. If the effect is minor, the Referee can use a combined luminosity value and an average distance to compute the temperature – computing the temperature by using this combined luminosity value should result in the same. value as computing them separately for each star at the same AU then combining the temperatures with the temperature addition equation.

Each star except the primary has an Orbit# and an eccentricity value, as does the world (or parent planetary body for moon worlds). For temperature calculations, Orbit# must be translated to equivalent AU values. These can be plotted in a table and, if helpful for visualisation, with a basic diagram. In this handbook, orbits are simplified, defining only two parameters: the eccentricity and semi-major axis (AU) property. To calculate the temperature extremes and a mean value, the following procedure assumes that these orbits line up with each other.

For each star, the high temperature contribution for a star is the temperature when the star is closest, the low when it furthest away and the mean is determined by not considering the eccentricity of the various orbits at all. For a system with a single star, or with a pair of stars treated as one, these assumptions have already been accounted for by the Near AU and Far AU calculations for determining high and low temperatures. For multiple stars or detailed effects of a pair of stars previously considered as one, the Referee can create a table of high, mean and low temperature influences from each star in the system.

The simplest approach computes each star’s high contribution distance from nearest by subtracting the planet’s AU orbit from the star’s AU orbit (0 in the case of the primary). Note that distance values will be squared so the sign is unimportant. Compute mean contribution distance from the average distance, or the square root of the squares of the planet’s AU orbit plus the star’s AU orbit. Low is the furthest distance or the sum of the planet’s AU orbit and the star’s AU orbit.

When considering adding eccentricity to these AU values, the Referee can assume an average effect and ignore the eccentricities altogether, or take a worst case approach, where eccentricity will make the orbits as close as possible for the high temperature and as far as possible for the low temperature. Mean distance remains unchanged but high (nearest) distance becomes the difference between the planet’s AU × (1 - eccentricity) and the star’s AU × (1 + eccentricity) if the star is interior to the planet or the difference between the planet’s AU × (1 + eccentricity) and the star’s AU × (1 - eccentricity) if the star is exterior. Low (furthest) distance becomes the planet’s AU × (1 + eccentricity) plus the star’s AU × (1 + eccentricity), regardless of whether the star is interior or exterior.

The Referee could potentially incorporate other factors, such as axial tilt, rotation and geography to further modify luminosities to push high and low temperatures to further extremes, but such factors should never be added to a mean temperature determination. These further complications are rarely necessary; the Referee could consider how the eccentricity and axial tilt effects apply, which depends on where in each orbit they occur and when they apply to a specific hemisphere. These effects might not be felt evenly on both hemispheres of the planet. For instance, one may be closer to its star during winter months and further during summer, mediating these effects in one hemisphere and only reaching the extremes computed in the other, or the closest approach could occur in spring or fall, meaning axial tilt values should perhaps not be considered at all.

The Referee may choose what is appropriate for luminosity values for these equations. For multiple star systems, it can be complex to even make a detailed approximation of high, mean and low temperatures. If desiring precision and to understand the benefit and effort trade-off for making approximations of ‘reality’, consider the Zed Prime example:

```Example
This example is purely based on the orbit of Aab IV, Zed Prime’s gas giant primary and ignores any seasonal axial tilt variation – they would potentially need to be applied to both the planet and the moon. A strict calculation should also account for the nearly four million kilometre orbit of the moon around the planet, but this will also be ignored here. A table is needed to determine the combined effects of different stars at differing distances:

|Body|Eccentricity|AU|MaxS|MinS|MaxP|AveP|MinP|
|---|---|---|---|---|---|---|---|
|Star Aa|—|0.000|0.000|0.000|1.166|1.060|0.954|
|Star Ab|0.11|0.036|0.040|0.032|1.206|1.061|0.914|
|Star B|0.08|5.680|6.134|5.226|7.300|5.778|4.060|
|Star Cab|0.47|338.000|496.860|179.140|498.026|338.002|177.974|
|Planet|0.10|1.060|1.166|0.954|—|—|—|

The MaxS and MinS column values represent the maximum (AU × (1 + eccentricity)) and minimum (AU × (1 - eccentricity)) separation from the primary star. The pair Cab stars are treated as one star for simplicity.

The MaxP AveP, and MinP column values represent the furthest, mean and nearest distance a star comes to the planet in this simplified representation. For the primary star (Aa), this the same as the planet’s MaxS, AU and MinS values. For the other values are determined as described in the section’s text.

Next, for each star, calculate the temperature contribution for each low, mean and high values using the temperature formula with albedo = 0.33 and greenhouse factor = 0.59. Finally add these columns together using the temperature addition equation.
|Body|Luminosity|Low|Mean|High|
|---|---|---|---|---|
|Star Aa|0.738|243.30|255.17|268.98|
|Star Ab|0.681|234.47|250.02|269.32|
|Star B|0.136|63.71|71.61|85.43|
|Star Cab|0.896|12.36|15.00|20.67|
|Total|—|284.41|300.68|320.48|

This provides the following temperature ranges for Zed Prime, rounded to the nearest degree: low = 284K, mean = 301K, high = 320K. One thing to note before being overwhelmed by the maths is that had these calculations been performed strictly with the pair Aa and Ab, the temperatures would have been a fraction of one degree cooler and if they were treated as a single sun and, ignoring the rest with just the planet’s orbital differences, the results would have been 287, 300 and 317, which is a difference of three degrees at the margins – a value earlier discounted as too short term to be relevant, so the Referee should decide how much precision is necessary.

None of this accounts for axial tilt, geographic or rotation effects. The Referee in this case will choose to ignore all of the above complexity – negating the value of this exercise other than to show how it is possible – and use the values of 346, 300, and 262 – a broader range already established using the effects computed for the single star ‘approximation’ of high, mean and low already determined.
```
A complete and accurate temperature profile of this one world of Zed Prime orbiting a gas giant would require pages of calculations and charts, an advanced computer program or a custom made Antikythera-like mechanism and still add little to the game.

Given the potential for both exacerbating and moderating interactions between temperature effects, the Referee can choose which to apply and how much detail is necessary to develop. As stated in the beginning of the temperature section, the only temperature needed for describing a world is the mean temperature. Still, a high and low temperature, if expected to have an impact on habitability should be considered but beyond these three global numbers, the Referee should have some justification for spending the amount of time required to investigate complex variances that have no effect on the gaming session.

##### TEMPERATURE SCENARIO: INHERENT TEMPERATURE EFFECTS
An inherent temperature effect is a background global effect which persists over long periods. An example is internal heat from planetary creation or ongoing seismic or tidal stresses. This effect can uniformly alter all temperature values for a world by adding to all of them and so should be computed last.

Such temperature effects can be added to modify each temperature results using the temperature addition equation:

**FORMULA: New Temperature (K)**
$\text{New Temperature (K)} = \sqrt[4]{(\text{Old Temperature}^4 +\text{Added Temperature}^4)}$

Other temperature effects, such as the reflected light or internal radiance of a parent body or a large moon can add to overall temperature (or sometimes just to the temperature of the ‘bright’ hemisphere of a moon locked to a parent planet) but in most situations are too minor to be worth the calculation.

#### GAS GIANT RESIDUAL HEAT
Occasionally, residual heating effects of a young and/ or massive gas giant may increase the temperature of the body and contribute to its overall temperature. For a gas giant, a useful estimated formula for its inherent temperature is:

**FORMULA: Temperature (K)**
$\text{Temperature (K)} = 80 \times \sqrt[4]{\text{Mass}_\text{(Terra)}} \div \sqrt{\text{Age (Gyr)}}$

This effect would be added to the temperature of the gas giant from the luminosity of its sun(s) using the temperature addition equation. The Referee could then consider the gas giant a dim ‘star’ and use the luminosity formula to determine its heating effect on nearby moons.

```Example
For Zed Prime’s gas giant at 1,200⊕, its size could be a factor in heating even after 6.336 billion years. Its inherent temperature by the above formula is 187K. Its cloud top temperature based on its suns and an albedo of 0.40 is 235K. Adding these temperatures yields an effective temperature of 256K. An extremely diligent Referee may choose to use this number to determine if the gas giant’s heat adds to Zed Prime’s temperature in any significant way but it seems unlikely at a distance of 3.92 million kilometres (it actually adds 0.0055K to the planet-facing temperature).
```
## CALCULATING SUNLIGHT PORTION AND HOURS
The length of a day at a certain time of the year at a certain latitude requires math and a few simplifying assumptions. This calculation assumes no atmospheric refraction and no solar disk size – for guidance on the effects of those factors see the procedures for twilight zone worlds.

**STEP 1:** Calculate the solar declination, the angle between a sun’s rays and the plane of the world’s equator. This angle is equal to the axial tilt times the cosine of 360 times the solar days since the winter solstice (for the appropriate hemisphere), referred to as the date, divided by solar days in the year:

**FORMULA: Solar Declination**
$\text{Solar Declination} = \text{Axial Tilt} \times \cos{(\frac{360 \times \text{Date}}{\text{Solar Days (year)}})}$

**STEP 2:** Determine the solution to the sunrise equation, the angular span of time between noon and sunrise, by multiplying the tangent of the current latitude by the tangent of the solar declination. The solution is the cosine of the sunrise value:

**FORMULA: cos(Sunrise)**
$\text{cos(Sunrise)} = \tan{(Latitude)} \times \tan{(Solar Declination)}$

- If the cos(sunrise) is greater than 1.0, that latitude has no sunrise and zero sunlight hours. 
- If it is less than -1.0, that latitude experiences constant daylight and the entire day is sunlit.
- If it is between -1 and 1, determine the actual angle by taking the arccosine of the cosine of sunrise:

**FORMULA: Sunrise Angle**
$\text{Sunrise Angle} = \arccos{(\cos{(\text{Sunrise})})}$

This is the angle from 0° degrees (the location of the sun at noon) of the actual sunrise. A value of 90° means day and night are of equal length, while a larger number means a long day, until reaching 180°, which means sunset also stretches backwards to 180° degrees from 0° and that daylight is constant.

**STEP 3:** For days with sunrises, the sunlight portion of the day is:

**FORMULA: Sunlight Portion**
$\text{Sunlight Portion} = \frac{\text{Sunrise Angle}}{180}$

And the actual number of hours of sunlight is:

**FORMULA: Sunlight Hours**
$\text{Sunlight Hours} = \frac{\text{Solar Day (hours)} \times \text{Sunrise Angle}}{180}$

**STEP 4:** Putting everything together, this sunlight portion equation is valid on days when the sun rises and sets:

**FORMULA: Sunlight Portion**
$\text{Sunlight Portion} = \frac{\arccos{(\tan{(\text{Latitude})} \times \tan{(\text{Axial Tilt} \times \cos{(\frac{360 \times \text{Date}}{\text{Solar Days (year)}})})})}}{180}$

## SEISMOLOGY
Some worlds are geologically dead, others in a state of constant eruption, bursting with rivers of magma. Several factors, internal and external, contribute to seismic stress.
### RESIDUAL SEISMIC STRESS AND HEATING
Residual heat is based on the cooling rate of a world from its formation and from the decay of radioactive elements. It is most directly related to a world’s Size and age. By default, a world is effectively seismically dead after it is older than its Size in billions of years. Having a moon or being a moon and the associated tidal stresses can modify the time it takes for the residual heat to dissipate, as can the quantity of heavier elements in the world’s interior.

**FORMULA: Residual Seismic Stress**
$\text{Residual Seismic Stress} = (\text{Size} – \text{Age (Gyrs)} + \text{DMs})^2$

**Die Modifiers for Residual Seismic Stress**
- World is a moon: DM+1
- World has Size 1 or larger moons: DM+1 for each Size (1 or greater) of each moon, up to a maximum DM+12
-  Density greater than 1.0: DM+2
- Density less than 0.5: DM-1

Round down the value prior to squaring. Values of less than 1 prior to squaring are treated as 0.

```Example
For instance, Terra (density exactly 1), a Size 8 world with a Size 2 moon is 4.568 billion years old: 8 - 4.568 + 2 = 5.4322 rounded down to 5 and squared, so its residual seismic stress is 25. Luna (density 0.6) is: 2 – 4.568 + 1 = -1.5, which is less than 1 and therefore 0 residual stress. 

Zed Prime is a Size 5 moon with density 1.03 and is 6.3 billion years old: residual seismic stress is: 5 - 6.3 +1 (for being a moon) +1 (for density) = 0.7, rounded down to 0 prior to squaring.
```

### TIDAL STRESS FACTOR
To determine overall stress on a world from tides, add together all tidal effects in meters from page 126 and divide this number by 10 to determine a tidal stress factor:

**FORMULA: Tidal Stress Factor**
$\text{Tidal Stress Factor} = \frac{\sum\text{Tidal Effects}}{10}$

Round down the result. In most cases, except planets orbiting close to stars and moons orbiting large planets, this result will be less than 1.

```Example
For Zed Prime, the resultant effect of its parent planet (30.6) and stars (0.24) and other minor factors from the other moons is relatively low, so ~30÷10 is 3 stress from tides.
```
### TIDAL HEATING EFFECTS
Another effect of tidal forces is tidal heating. Even if a world is locked to its primary, if its orbit retains any eccentricity, the changing forces on the world as it completes a revolution around the parent body causes tidal movement across the entire body. In the Solar System, this is what contributes to volcanic activity on moons such as Io and Enceladus. Io’s crust flexes as much as 100 metres from tidal forces. Most tidally locked worlds have a near zero eccentricity, as over time this tidal energy forces a circularisation (less eccentricity) of the orbit, but in cases with an orbital resonance, as with both Io and Enceladus, the eccentricity can persist. The factors involved in tidal heating are complex and the Referee can ignore them by setting a tidally locked world’s orbital eccentricity to 0, but for those wanting the extra realism, tidal heating on a world from its primary can be approximated from this relationship:

**FORMULA: Tidal Heating**
$\text{Tidal Heating} = \frac{\text{Primary Mass}^2 \times \text{World Size}^5 \times \text{eccentricity}^2}{\text{Distance}^5 \times \text{Period} \times \text{World Mass}}$

For a moon in orbit around a planet, use standard days for the value of period and millions of kilometres for distance. For Io, this formula results in a value of about 303,000. Plugging in the same numbers in for Enceladus results in 33,000. For Luna it is 52, a relatively inconsequential result. To address seismic and heating factors, divide by 3,000 to treat a result equivalent to Io’s condition as a tidal heating factor of 101 (Enceladus would be 11) and ignore numbers less than 1.

**FORMULA: Tidal Heating Factor**
$\text{Tidal Heating Factor} = \frac{(\text{Primary Mass}_\text{(Terra)})^2 \times \text{World Size}^5 \times \text{eccentricity}^2}{3000 \times \text{Distance (Mkm)}^5 \times \text{Period (days)} \times \text{World Mass}_\text{(Terra)}}$

```Example
Zed Prime is also subject to tidal heating forces in its rather eccentric orbit around its primary. Plugging values into the equation results in a Tidal Heating Factor of 14, more in line with Enceladus than Io but still substantial.
```

### TOTAL SEISMIC STRESS
Total seismic stress is the sum of the residual seismic stress, ongoing tidal stress and tidal heating factors:

**FORMULA: Total Seismic Stress**
$\text{Total Seismic Stress} = \text{Residual Seismic Stress} + \text{Tidal Stress Factor} + \text{Tidal Heating Factor}$

The value for total seismic stress determines the chances of both earthquakes and volcanic eruptions. A world with a total seismic stress level of more than 100 has at least one ongoing volcanic eruption at any given time and near constant earthquake activity. A world with a total seismic stress level of less than 1 is essentially geologically dead. Total seismic stress can also globally influence a world’ s climate by adding an inherent temperature factor to all high, low, mean, local or periodic temperature values to determine the actual temperature:

**FORMULA: New Temperature (K)**
$\text{New Temperature (K)} = \sqrt[4]{(\text{Old Temperature}^4 +\text{Total Seismic Stress}^4)}$

For Terra, this adds only 0.004K to its temperature, which is inconsequential, drowned out by its external heating. Howver if Terra’s base temperature had been 25K instead of 288K, seismic stress factors would have added 4.7K to temperature and if Terra had been a rogue world in deep space with a base temperature of 10K, the seismic stress heating value would be the primary factor in its surface temperature. For most worlds in the habitable zone, the seismic heating factor can be ignored for temperature purposes but it can still play a significant role in determining seismic activity.

```Example
Zed Prime has a total seismic stress of 0+3+14=17. The new temperature equation using values of 300K and 17K alters the mean temperature from 300K to 300.00077, rounded back to 300K. Inconsequential for temperature but enough to allow for some ongoing geologic activity.
```

### TECTONIC PLATES
Worlds with a total seismic stress value of more than 0 and a liquid water-based Hydrographics code of at least 1 can have a crust divided into a number of tectonic plates. Only if both these conditions are true do moving tectonic plates exist and the number of plates is:

**FORMULA: Major Tectonic Plates**
$\text{Major Tectonic Plates} = \text{Size} + \text{Hydrographics}\ –\ \text{2D} + \text{DMs}$

**Die Modifiers for Major Tectonic Plates**
- Total seismic stress between 10 and 100: DM+1
- Total seismic stress greater than 100: DM+2

If the result of this check is 1 or less, then no tectonic plate activity exists on the world. Without tectonic plate activity, mountain building only occurs from isolated volcanoes or in regions of rising crust. These regions can become continents if they were once under an ocean, or if already on land they may result in continent-sized highlands.

The actual odds of volcanic or earthquake activity occurring vary greatly by location. The total seismic stress factor provides a global frequency but can also be a multiplier for likely activity in a particular region. The factor is a modifier for the Referee to consider in planning both the frequency and severity of activity. It may influence settlement patterns on a world or even architectural styles. Worlds with widespread activity and a total seismic stress factor of more than 100 may not even have long-term permanent settlements but mobile populations or even housing that can be relocated if local conditions become unbearable.

See the Determining World Surface Features section to apply tectonic plate details to world mapping.

```Example
Zed Prime has a total seismic stress factor of 17 and so has some tectonic activity. The total number of major tectonic plates is 5 + 6 - 2D + 1. A 2D roll of 8 results in 4 major plates.
```

## NATIVE LIFEFORMS
A world’s native life is life that has evolved with or completely acclimated to a world’s environment. These rules make no distinction based on the ultimate origin of the life; it may have originated on a world, have arrived via panspermia from another world in the same or a nearby system, or have been introduced as part of a terraforming effort thousands of years earlier. Native life is an integral part of the planet’s biosphere, which helps regulate its present atmosphere and temperature.

By this definition nearly all worlds with Atmosphere codes 4–9 or D, and most with Atmosphere codes 2, 3 and E have native life. Some worlds with Atmospheres A, B, C, F+, or even those with a Trace (1) or Vacuum (0) Atmosphere codes may have native life but these biospheres might be very different from ‘normal’ carbon-based lifeforms.

**Suggested Usage:** The Referee does not need to check every significant world in the system for lifeforms but should do so for the mainworld and consider doing so for other worlds in the habitable zone. Checking every vacuum world for a minute chance of biomass will undoubtably result in too many worlds with life. If the Referee wishes to check for life in unlikely and inhospitable places, a single 2D roll for all the inhospitable worlds of a system, with perhaps a natural 12 as a target number might be more appropriate, with placement of the actual life-bearing world determined by choice or chance.

### BIOMASS RATING
Biomass is a descriptive indicator of the amount of native life present on a world. Only systems older than 0.1 Gyrs have natively evolved recognizable life. To determine the presence and amount of native life present on a world roll 2D with a large number of possible DMs:

**FORMULA: Biomass Rating**
$\text{Biomass Rating} = \text{2D} + \text{DMs}$
$\text{Maximum combined Modifiers: DM+4, minimum: DM-12}$

**Die Modifiers for Biomass Rating**
- Atmosphere 0: DM-6
- Atmosphere 1: DM-4
- Atmosphere 2, 3, or E: DM-3
- Atmosphere 4 or 5: DM-2
- Atmosphere 8, 9 or D: DM+2
- Atmosphere A: DM-3
- Atmosphere B: DM-5
- Atmosphere C: DM-7
- Atmosphere F+: DM-5
- Hydrographics 0: DM-4
- Hydrographics 1–3: DM-2
- Hydrographics 6–8: DM+1
- Hydrographics 9+: DM+2
- System age is less than 0.2 Gyrs: DM-6
- System age is less than 1 Gyr: DM-2
- System age is greater than 4 Gyrs: DM+1
- High temperature above 353K†: DM-2
- High temperature below 273K†: DM-4
- Mean temperature above 353K†: DM-4
- Mean temperature below 273K†: DM-2
- Mean temperature between 279 and 303K†: DM+2

† When applying temperature DMs, if, and only if, detailed temperature calculations were not determined for the world, assume a temperate world receives a temperature related of DM+2, a cold world receives DM-2 and a boiling or frozen world receives DM-6.

A biomass rating of 0 or less indicates no native life exists. A healthy garden world has a biomass rating of A (10) or more. The biomass rating is an exponential indicator of the amount of life present in an average square kilometre on or near the surface. A Size 4 and a Size 8 world with the same biomass rating would have a similar ‘density’ of life, but across the entire surface area of the two worlds, the larger world would have more total life – absolute world-wide biomass scales by a factor of the square of world Size.

**Special Case 1:** If a world has an atmospheric taint or irritant of type ‘biologic’ but rolls a biomass rating of 0, its biomass rating becomes 1 and its biocomplexity rating is automatically set to 1.

**Special Case 2:** A rolled biomass rating of 1 or more on a world with Atmospheres 0, 1, A, B, C or F+ represents life not likely to be compatible with Terran life. If it exists, it could be well-developed within this environment. Add one less than the negative Atmosphere DM to the biomass rating for such worlds, e.g., for Atmosphere B, add 4.

**Optional Rule:** The Referee may rule that any world with oxygen in the atmosphere (Atmosphere codes 2–9, D and E), has at least a biomass rating of 1. This may not be appropriate, as some nonbiological processes may result in atmospheric oxygen. The Referee could choose to apply this rule only to Atmosphere codes 4–9 and D, instead. The Referee could also apply a ‘rare earth’ variant of this rule and change the Atmosphere code of any world (with codes 2–9, D, and E) with a biomass rating of 0 to Atmosphere code A and retain the previous atmospheric code as this exotic atmosphere’s subtype.

```Example
Zed Prime has an Atmosphere of 6 and a Hydrographics of 6. Its mean temperature is 300K, and its high temperature is 346K. System age is 6.3 billion years, It receives DM+4 (+1 for Hydrographics, +2 for temperature and +1 for age) on its 2D roll for 6 + 4 = 10, or biomass rating A.
```

### BIOCOMPLEXITY RATING
Biocomplexity is a descriptive indicator of the nature of lifeforms, ranging from simple microbes to highly evolved multicellular organisms. If a world has Biomass 0, it has Biocomplexity 0. If a world has a positive biomass rating:

**FORMULA: Biocomplexity Rating**

$\text{Biocomplexity Rating} = \text{2D-7} + \text{Biomass Rating*} + \text{DMs}$
$\text{*Biomass ratings above 9 are treated as 9 for this roll}$

**Die Modifiers for Biocomplexity Rating**
- Atmosphere not 4-9: DM-2
- Low oxygen taint: DM-2
- System age between 3 and 4 Gyrs: DM-2
- System age between 2 and 3 Gyrs: DM-4
- System age between 1 and 2 Gyrs: DM-8
- System age less than 1 Gyr: DM-10

If the system age is exactly at a limit between two DMs, use the worst DM. A result of less than 1 becomes 1. The Biocomplexity Rating table indicates the most advanced organisms possible at various ratings.

At any rating on the biocomplexity scale, more primitive organisms persist and may be the dominant type in biomass or in numbers of species. A biocomplexity rating of 8+ does not necessarily mean that native sophonts exist, but that forms exist that could easily evolve or qualify as sophonts. This is likely to include many ‘borderline’ species such as cetaceans and primates. Additionally, at biocomplexity 8, some lifeforms may have evolved psionic abilities; this need not be associated with intelligence but may be just a form of psionic lure or camouflage.

At biocomplexity 9 a sophont species either currently exists or has existed in the past, although it may not have been technological nor left any trace. If the species has left obvious signs of its existence, it may have permanently altered a world’s biosphere through degradation or enhancement. Additionally, at biocomplexity 9 in universes where psionics is prevalent, psionics become a major element of the ecosystem, with multiple organisms evolving to take advantage of various psionic abilities. At biocomplexity A (10) or above, cross-species links may cause the entire world’s ecosystem to behave as a Gaia-like organism; this behavior might not be immediately obvious to an observer, or could take an overt form at the Referee’s option, potentially including recognizable consciousness.

Biocomplexity does not necessarily follow Terran patterns or look anything like the examples provided but on most worlds, life consists of specialized ‘kingdoms’ of autotrophs or primary producers who generate energy from non-living sources (e.g., most plants and some procaryotes) which are generically referred to as ‘flora’, and heterotrophs, or secondary producers, which are generally referred to as ‘fauna’. Even these distinctions are less than clearcut and other very broad characterizations such as motile versus sessile also fail to capture the overall nature of a continuum of organisms or provide easy categorization. Detailed generation of lifeforms is beyond the parameters of this book.

**Table 57: Biocomplexity Rating**

| Biocomplexity Rating | Description                            | Examples                                        |
| -------------------- | -------------------------------------- | ----------------------------------------------- |
| 1                    | Primitive single-cell organisms        | Procaryotes such as bacteria and archaea        |
| 2                    | Advanced cellular organisms            | Eucaryotes such as algae and amoebae            |
| 3                    | Primitive multicellular organisms      | Lichen, sponges, some fungi                     |
| 4                    | Differentiated multicellular organisms | Ediacaran and early Cambrian age creatures      |
| 5                    | Complex multicellular organisms        | Insects, ferns, fish                            |
| 6                    | Advanced multicellular organisms       | Reptiles, birds, mammals, flowering plants      |
| 7                    | Socially advanced organisms            | Ants, bees, primates, elephants                 |
| 8                    | Mentally advanced organisms            | Sophont intelligence, psionics                  |
| 9                    | Extant or extinct sophonts             | At some point, this world had sophont lifeforms |
| A (10)+              | Ecosystem-wide superorganisms          | Cooperative sophont-like behaviour              |

```Example
Zed Prime has a biomass rating of A, treated as 9 for the biocomplexity roll, and a system age above 4 billion. The roll is 2D-7 + 9 and a roll of 3, results in only 5, so the life is complex, but not overly complex: simple plants and animals, perhaps similar to the Devonian age on Terra.
```

### NATIVE SOPHONTS
If the world’s biocomplexity rating is 8 or above, determine if a native sophont currently exists or once existed:

**FORMULA: Native Sophonts Exist**
$\text{Native Sophont Exists on 13+:}$
$\text{Native Sophont} = \text{2D} + \text{Biocomplexity* – 7}$
$\text{*Biocomplexity ratings above 9 are treated as 9 for this roll}$

To determine if evidence exists of an extinct native sophont on the world:

**FORMULA: Extinct Native Sophonts**
$\text{Extinct Native Sophont Existed on 13+:}$
$\text{Native Sophont} = \text{2D} + \text{Biocomplexity* – 7}$
$\text{*Biocomplexity ratings above 9 are treated as 9 for this roll}$

**Die Modifiers for Sophont Exist/Existed**
- If system age is greater than 5 Gyrs: DM+1 (for the extinct sophont check only)

Even if the biocomplexity rating is 9 or more, an extinct sophont, especially a primitive race that died of million or billions of years earlier may have left no trace; this roll only accounts for those which have left noticeable artefacts or other indications of their existence. Detailed generation of native sophonts is covered in The Sector Construction Guide’s Sophont Design chapter.

```Example
Zed Prime’s life is not advanced enough to warrant a check for native sophonts.
```
### BIODIVERSITY RATING
A world’s biodiversity rating is an indicator of the number of species present on a world. In some cases, it represents the health and resilience of its biomass but on some worlds, a few dominant species are able to provide a stable environment through feedback mechanisms. Biodiversity tends to increase with complexity but again, exceptions exist. On some worlds a hive species and its specialised food sources may completely dominate a region or even an entire planet, or sophonts could have devasted the ecosphere. Only worlds with a biomass rating of 1 or more have a biodiversity rating of more than 0. To determine a world’s biodiversity rating:

**FORMULA: Biodiversity Rating**
$\text{Biodiversity Rating} = \text{2D-7} + \frac{\text{Biomass Rating + Biocomplexity Rating}}{2}$

Results are rounded up and if the result is less than 1, it becomes 1. A biodiversity of A (10) or greater indicates complexity equivalent to pre-human Terra. Biodiversity of less than 3 indicates a very uniform biosphere with limited species dominating most environments.

```Example
Zed Prime’s biomass rating is A (10) and its biocomplexity rating is 5, so on 2D-7 + (10+5)÷2, a roll of 6 equals 6.5 rounded up to a biodiversity rating of 7, not particularly diverse, but probably not a problem for the ecosphere’s stability and resilience.
```

### COMPATIBILITY RATING
Another important attribute of native life is its compatibility, or how well the native life’s biochemistry meshes with other biochemistries. The compatibility rating is defined in relation to its compatibility to Terran life. While this works well for Terragen species, it does not necessarily indicate compatibility for other sophonts. A world’s compatibility rating should be independently determined for commonality with each interested sophont species.

A high compatibility rating is a two-edged sword. It means that Terran organisms are able to survive on the world and that many native forms of life may be edible food substances but it also indicates native diseases can potentially infect Terragen hosts, and native predators and parasites may find Terragens tasty. Only worlds with a biomass rating of more than 0 can have a compatibility rating of other than 0. To determine the compatibility rating:

**FORMULA: Compatibility Rating**
$\text{Compatibility Rating} = \text{2D} - \frac{\text{Biocomplexity Rating}}{2} + \text{DMs}$

**Die Modifiers for Compatibility Rating**
- Atmosphere 0, 1, B, G, or H: DM-8
- Atmosphere 2, 4, 7, 9 or otherwise tainted: DM-2
- Atmosphere 3, 5 or 8: DM+1
- Atmosphere 6: DM+2
- Atmosphere A or F: DM-6
- Atmosphere C: DM-10
- Atmosphere D or E: DM-1
- System age greater than 8 Gyrs: DM-2

Round results down. If the compatibility rating is 0 or less, all native life is incompatible and the rating is set to 0. This means that the life’s biochemistry is too different to provide any nutrition. This does not necessarily mean the life is otherwise safe; a predator may still attempt to eat a Traveller and some biologic taints could still be hazardous, potentially behaving more like particulates than lifeforms but still be dangerous or at least irritating.

A compatibility rating of A (10) is equivalent to full Terran compatibility and greater values are possible. If the world’s life has a compatibility rating of at least 1, any particular biological material’s compatibility rating is equal to its world’s compatibility rating plus 2D-7. The material does not benefit from receiving a rating of more than 10 (except, at the Referee’s option, being especially tasty or providing some other beneficial biologic effect) but if the rating is less than 10, then its nutritional value is its compatibility rating times 10% and any deficit in nutrition must be supplemented by an equivalent amount of fully compatible food or supplements.

```Example
Zed Prime has a biocomplexity rating of 5 and DM+2 for Atmosphere. A roll of 7 becomes a result of 7 + 3 – 2.5 + 2 = 9.5. rounded to 9, so the grubs and ferns found on the world are relatively edible, very similar to what could be expected on Terra itself.
```

### NATIVE LIFEFORM PROFILE
On IISS forms, native lifeform information can be coded as a string of four eHex digits:

**MXDC**

Where:
- M = Biomass
- X = Biocomplexity
- D = Biodiversity
- C= Compatibility

## RESOURCE RATING
*Prerequisite: For worlds with native life, determine all native lifeforms rating characteristics.*

A world may have a variety of natural resources, including recoverable minerals, liquids, gases of economic value and possibly biological resources if life is present. Asteroid (or planetoid) belts use a separate method for determining their resource rating, detailed on page 73. For all other worlds, the Size of the world is the main determinant in how many resources are available and for worlds with life, various lifeform ratings apply:

**FORMULA: Resource Rating**
$\text{Resource Rating} = \text{2D-7} + \text{Size} + \text{DMs}$

**Die Modifiers for Resource Rating**
- Density greater than 1.12: DM+2
- Density less than 0.5: DM-2
- Biomass rating 3+: DM+2
- Biodiversity rating 8-A: DM+1
- Biodiversity rating B+: DM+2
- Compatibility rating 0-3: DM-1 (only if biomass rating is at least 1)
- Compatibility rating 8+: DM+2

If a world’s resource rating is less than 2, treat it as 2, if it greater than C (12), treat it as C. A resource rating determines the value and likelihood of resource extraction enterprises:

**Table 58: Resource Rating**

| Resource<br>Rating | <br>Remarks                                                                                                                               |
| :----------------: | ----------------------------------------------------------------------------------------------------------------------------------------- |
|         2          | No economically extractable resources                                                                                                     |
|        3–5         | Marginal at best; avoided by most corporations and prospectors                                                                            |
|        6–8         | Worthwhile with considerable effort; prospectors or speciality firms may be able to turn a profit on worlds ignored by major corporations |
|        9–A         | Priority targets for both corporations and individual prospectors                                                                         |
|        B–C         | Liable to experience a resource ‘rush’ when first opened up for exploitation                                                              |

A world’s resource rating can decline over time. Every century of unfettered exploitation may change a world’s resource rating by D3-3 but a well-managed world may be able to alleviate or limit this decline and/or convert resources into sustainable industry. In no case should this exploitation reduce a world’s resource rating below 2.

```Example
Zed Prime is a Size 5 world. DM+3 results from its biomass rating of A (+1), and compatibility rating of 9 (+2). Rolling 10 on 2D, its resource rating is 10-7 + 5 +3 = 11 or B, meaning it likely experienced a resource rush
```

## HABITABILITY RATING
A world may be perfectly suited to its native lifeforms but partly or wholly unsuitable to settlers from another world. A world’s habitability rating is particular to one species or to related species originating on the same world, such as Terragens. The habitability rating described in this section applies to Terragens. Other sophonts might require separate ratings.

**FORMULA: Habitability Rating**
$\text{Habitability Rating} = 10 + \text{DMs}$

**Die Modifiers for Habitability Rating**
- **Hydrographics 1–3**: DM-2 \ Desert conditions prevalent
- **Hydrographics 9**: DM-1 \ Little useable land surface area
- **Hydrographics A**: DM-2 \ Very little useable land surface area
- **Solar tidally locked (1:1) world**: DM-2 \ Very little useable land surface area
- **High temperature greater than 323K\***: DM-2 \ Too hot at times
- **High temperature less than 279K\***: DM-2 \ Too cold all of the time
- **Mean temperature greater than 323K\***: DM-4 \ Too hot most of the time
- **Mean temperature 304 – 323K\***: DM-2 \ Too hot most of the time
- **Mean temperature less than 273K\***: DM-2 \ Too cold most of the time
- **Low temperature less than 200K\***: DM-2 \ Much too cold some of the time
- **Gravity less than 0.2†**: DM-4 \ Unhealthy low gravity levels
- **Gravity 0.2–0.7†**: DM-2 \ Very low gravity
- **Gravity 0.4–0.7†**: DM-1 \ Low gravity
- **Gravity 0.7–0.9†**: DM+1 \ Gravity very comfortable
- **Gravity 1.1–1.4†**: DM-1 \ Gravity somewhat high
- **Gravity 1.4–2.0†**: DM-3 \ Gravity uncomfortably high
- **Gravity greater than 2.0**: DM-6 \ Gravity too high for acclimation
- **Undefined gravity**: DM+1 \  – absolute value of (6 – Size)
- **Atmosphere 0**: DM-6
- **Atmosphere 1**: DM-4
- **Atmosphere 2, 3 or E**: DM-3
- **Atmosphere 4 or 5**: DM-2
- **Atmosphere 8, 9 or D**: DM+2
- **Atmosphere A**: DM-3
- **Atmosphere B**: DM-5
- **Atmosphere C**: DM-7
- **Atmosphere F+**: DM-5
- **Hydrographics 0**: DM-4
- **Hydrographics 1–3**: DM-2
- **Hydrographics 6–8**: DM+1
- **Hydrographics 9+**: DM+2
- **System age is less than 0.2 Gyrs**: DM-6
- **System age is less than 1 Gyr**: DM-2
- **System age is greater than 4 Gyrs**: DM+1
- **High temperature above 353K**: DM-2
- **High temperature below 273K**: DM-4
- **Mean temperature above 353K**: DM-4
- **Mean temperature below 273K**: DM-2
- **Mean temperature between 279 and 303K**: DM+2

\*For applying temperature DMs, if, and only if, detailed temperature calculation were not determined for the world, assume a hot or cold world receives DM-2 and a boiling or frozen world receives DM-6.
†Assume the worst DM for gravity at the edges of a DM criteria. If gravity is not computed, use the Undefined gravity DM instead.

The base natural (pre-human) habitability rating of Terra is considered A or 10. A world’s rating depends on (usually) negative DMs from this value.

Theoretically, a habitability rating of C (12) is possible but very unlikely. A habitability rating of less than 0 is treated as 0. Surveyors also include a miscellaneous scoring category which can raise or lower a world’s habitability rating based on unique factors that mitigate or worsen some conditions or result from a unique factor. This category can be simulated with D3-1, or the Referee can examine certain features, such as the type and severity of taint in a world’s atmosphere and deliberately apply a +1 miscellaneous habitability rating adjustment.

**Table 59: Habitability Table**

| Habitability<br>Rating | <br>Remarks                                                          |
| :--------------------: | -------------------------------------------------------------------- |
|           0            | Actively hostile world: not survivable without specialised equipment |
|          1-2           | Barely habitable world: full protective equipment often needed       |
|          3-5           | Marginally survivable world with proper equipment                    |
|          6-7           | Regionally habitable world: may require acclimation                  |
|          8-9           | Suitable for human habitation with minimal equipment or acclimation  |
|           A+           | Terra-equivalent garden world                                        |

A rating applies to an entire world. There may well be hostile regions on a world with a rating of A and survivable regions on a world with a rating of 0, but these are not large or permanent enough to warrant a change in the scoring.

```Example
Zed Prime does not have direct Size, Atmosphere or Hydrographics modifiers to habitability. Its high temperature of 346 exceeds 323 for a DM-2 but mean temperature is within bounds, as is low temperature. Gravity is only 0.66, so that warrants a DM-1, making Zed Prime’s habitability rating equal 7. The Referee could choose to roll D3-1 for an adjustment but instead considers that the gravity is close to where it would actually give a DM+1, a net change of +2 and notes the rather warm mean temperature is close to where it would give a DM-2, and so decides that these two factors balance and keeps the habitability rating at 7. Zed Prime is only regionally habitable, mainly because of the heat, so it is likely some areas would experience more temperate conditions, although with such a high axial tilt, it may take the Referee some time and effort to determine the best locations, especially since coastal areas suffer from very high (if slow) tides from the parent planet.
```

## FINAL MAINWORLD DETERMINATION
If a mainworld has yet to be determined, the Referee must pick a mainworld prior to moving on to developing this world’s social characteristics in the following chapter. Criteria for choosing a mainworld include:
- Highest habitability rating
- Native sophonts are present
- Highest resource rating
- Best refueling location

Still, the Referee is free to ignore these recommendations and pick another world, based on any factor including the Referee’s whims.

```Example
For the Zed system, the Referee could perhaps choose the barely habitable (SAH = 340) moon of the next gas giant as the mainworld. However, in this case, the selection of Zed Prime (SAH = 566) will be used going forward. However, the other moon, hereby dubbed Zed Secundus, will be used as an example of secondary world characteristics in the following chapter.
```

# CHAPTER 6: MAINWORLD MAPPING
A mainworld is most often an entire planet, with a large variety of terrain, ecosystems and local conditions. The effort a Referee puts into developing this depends on how Travellers will experience the world. If they are simply passing through a starport, especially a highport or an environmentally controlled downport and startown area, then no map is necessary and a world’s social and derived characteristics – particularly Law Level and Tech Level are more worthy of the effort to develop further than geography.

If a map is needed, it could be a world map for reference, or local maps specific to the region(s) where the Travellers will adventure. Here MOARN – Map Only As Really Necessary – comes to the forefront.

## WORLD MAPS
Traveller world maps are based on a 20-triangle regular icosahedron (a D20) approximation of a sphere. Each triangle is subdivided into hexagons. When mapping a world, a Referee may choose one of two methods to determine the size and number of these hexagons:

**METHOD 1:** Standard map, variable hex size. The standard world map template method assumes seven hexagons across the base of each triangle or 35 hexagons across the undivided middle section of a map. This map has the equivalent of 490 hexagons total (there are 12 mapped 5/6 hexagons, so for sticklers treating these as ‘whole’ makes 492). For most purposes, such as sizing continents or oceans, five hexagons can be considered 1% of the world’s surface area. The circumference of a world – π times diameter – is 35 hexes across, so the width of a world hex is Size × 1,600 × π ÷ 35. For a Size 1 world this would be 143 kilometres per hex. Therefore, Size ×143 kilometres would set the hex scale for any Size world. For a Size 7 world this is about 1,000 kilometres.

**METHOD 2:** Standard scale, variable hex number. Another paradigm for creating world maps assumes a standard hexagon size of 1,000 kilometres across. In this case, the number of hexagons in a triangle is equal to the Size of the world. A Size 7 world matches the standard world map template but separate map templates with differing numbers of hexagons per triangle would be necessary for each world Size.

The advantage of using a standard scale is presenting a more-or-less constant distance across each hex size (close, not completely accurate if using exact kilometer diameters for worlds). A disadvantage, besides the need for 10 or more different map templates, is that their total hex count will vary, making continent or ocean sizing less consistent. Still, a consistent number of triangles (20) allows for the assumption that a full triangle is 5% of a world’s surface area.

Standard scale, variable hex number maps allow for the extension of standard scale sub-maps within each hexagon. If a world hex is considered a 10-subhex-wide region, with the sub-hexes each 100 kilometres across, then each of those can be divided into 10 kilometres and one kilometre sub-hex maps. If instead using a standard map with a variable hex size, the first ‘level’ of sub-hexes – if set to 100 kilometres – would be a variable and not necessarily easily divisible number of sub-hexes, as the number of these sub-hexes per world hex would need to be equal to the world hex scale (143km × Size) divided by 100, or else the sub-hex would need to continue the paradigm of standard map, variable hex size.

### DETERMINING WORLD SURFACE FEATURES
For worlds with continents and oceans, the Hydrographics code and surface feature distribution (see page 100) can inform the size, quantity and distribution of land and water. On a standard 490-hexagon world map, five hexes equal about 1% of the surface area, so major bodies should occupy at least 25 hexes and each minor body at least five. A scattering of small bodies can also help reach the proper number of land and water hexes for the world’s Hydrographics code.

For placing terrain features, one consideration is temperature. On a world with liquid water, if a Referee wants to make a rough latitude-based temperature profile for a world, the following general regional guidelines can apply:
- Permanent icecaps or glaciers exist where the high temperature never exceeds 273K 
- Agriculture and unprotected settlements require a high temperature above 278K and a mean above 273K 
- Unprotected settlements require a high temperature below 323K or a mean below 318K

Unprotected settlements’ assume humans. Other species might have other restrictions. Detailed climatic classifications and weather patterns are beyond the scope of this book but temperature can inform local conditions.

**Table 60: Plate Interaction**

|  2D  | Interaction | Effect                                                                                                                                                                                |
| :--: | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2-5  | Converging  | One plate slides beneath another and is partially or fully melted as it descends into the mantle. The descending plate results in earthquakes and volcanoes on the over-riding plate. |
| 6-8  | Diverging   | Plates separate allowing magma to well up from the mantle and form new crust. The separation also causes earthquakes and volcanoes.                                                   |
| 9-12 | Transform   | Plates slide past each other. The sliding motion causes earthquakes. Volcanoes are not common.                                                                                        |

The seismology of a world has an impact on terrain features such as mountain ranges and volcanoes. A total seismic stress level above 1 implies at least some periodic seismic activity, which can include mountain-building from volcanic activity or plate tectonics, if present. On worlds with tectonic plates, their interaction becomes a possible guide for surface features. Each of the world’s plates has a relationship to its neighboring plate. The Referee can place and size the world’s plates as desired, perhaps traced lightly on a world map. For each interacting pair, the Referee can determine the interaction by rolling 2D on the Plate Interaction table above.

The mountain ranges and volcanic features of a world whose seismic activity has stopped will eventually erode but this rate of erosion is tied to weathering effects and can be assumed to correlate roughly with atmospheric pressure. Estimating the passage of time since residual seismic stress reached zero (see page 125) and multiplying that time period by atmospheric pressure could provide guidance on the current state of eroding mountains on a seismically dead world.

Tidally locked worlds are a special case to consider in mapping. As mentioned on page 104, for ease of representation the Referee can choose to rotate the world map 90 degrees, so the middle of the world map (normally the equatorial zone) is the terminator line or the middle of the twilight zone, with the bright side to the top, or ‘north’ and the dark side to the bottom or ‘south’.

## IISS PROCEDURAL
One basic objective of the Scout Service is to ensure that any system within or near the Imperial border is subject to at least a Class III survey, detailing all of the system’s significant bodies, identifying and providing a basic classification of life-bearing worlds and noting any large-scale features or anomalies.

While exploration office teams may conduct a Class II survey of some intermediary system on their way to a targeted objective system, survey office teams rarely stop at a Class II survey at a targeted system. If an internal or external mapping team embarks into a system, a Class III survey with a completed report is normally the minimum effort of an expedition.

A statutory, but often partially unfulfilled, objective of the IISS is to verify the data in a Class III survey every 20 years within the Imperium and every century in regions within 40 parsecs beyond its borders. Staffing, prioritisation and diplomatic issues may curtail these ongoing efforts. Systems rarely change significantly during intervals between Class III surveys and the main justification for the repetitive surveys – other than the budget of the internal and external mapping branches – is for this effort to act as a tripwire to detect non-physical changes in the systems, such as the arrival of new settlers or the establishment of outposts and commercial stations at different locations within a system. This detection can result in a thorough follow-up investigation.

### CLASS III SURVEY
The purpose of a Class III survey is to accurately record the physical characteristics of all the significant bodies within a system. This involves the deployment of probes to at least fly by the system’s planets and significant moons. On worlds of particular interest, such as those within the habitable zone or with evidence of native life, landing teams are often deployed to conduct sample gathering and assess environmental conditions, although this may be limited to probe landings and analysis instead if resource limitations or hazards make landings unpractical. A Class III survey makes no effort to establish contact with sophont native residents but if local populations belong to a contacted culture, communications are not prohibited and may occur at the discretion of the scout team leaders.

The time required for completing a Class III survey is usually about 10 weeks. Some of this period involves flight time between various worlds. If the system is fairly compact, a Class III survey could take as little as 30 days but if it consists of widely separate worlds or subsidiary stars in far orbits, short-range jumps might be used to complete the survey and its duration may exceed 100 days.

At the end of the survey, the SI of the system is 8, providing a reasonably accurate estimate of the Size, Atmosphere and Hydrographics of all planets and significant moons. Habitable zone worlds often receive the most attention but no attempt is made to do a detailed study of a world’s physical or xeno-logical characteristics. Other information, such as a detection of the presence of inhabitants, the identification of ruins, interesting lifeforms or natural phenomena is flagged for detailed investigation by a targeted survey team.

An outcome of a completed Class III survey is a filled out and verified Class III survey form. In most cases this data is then released in the RPSC database and freely available to all Imperial-registered starships. The scout team usually begins work on a Class IV Planetary Profile Form for interesting worlds or the recognized mainworld but the data is tagged as preliminary, for internal use only, and not released into the RPSC database.

### CLASS IV PART P SURVEY
For worlds with no known population, a targeted physical-only Class IV survey of a world might be undertaken as an adjunct to a Class III survey of a system. This survey is often referred to as a Class IV Part P or Class IV-P world survey. While a full Class IV survey may require more than half a year to complete, a physical survey of even a complex life-bearing world usually requires no more than 30 days. This survey almost always includes at least one landing but standard procedures call for at least three sample-gathering expeditions to separate locations on the world’s surface. Usually these are conducted by the crew but in some instances such as on worlds with highly corrosive atmospheres, the surveyors will only conduct one-way probe missions and gather nothing more than data and images from the surface with no expectation of probe recovery.

Most Class IV-P surveys are investigations of unexplored worlds beyond the Imperial border. The Scout Service does not consider these deep targeted surveys as necessary for confirmation of details of previously explored worlds, although this level of study was conducted on many worlds, inhabited and otherwise, during both grand surveys. Both the exploration branch and the external mapping branch conduct these surveys, with the exploration branch normally targeting ‘interesting’ worlds for initial examination and flagging ‘notable’ worlds for the survey office to follow up on during a subsequent expedition.

Examples upon request

# CHAPTER 7: WORLD SOCIAL CHARACTERISTICS
Inhabited worlds, mainworlds or others, have codes not only for their population, government and Law Level (PGL) but also for their Tech Level and starport class, though only the mainworld is considered to have an official starport – the rest are classified as ‘spaceports’ and use a different rating. These UWP ratings are broad categories with many potential subtypes and idiosyncrasies. This chapter will explore these factors. Additionally, beyond the scope of the PGL, a world will have a particular culture or multiple cultures, an economy and other characteristics of its people and society that makes the world unique. The procedures in this chapter assume the Referee has designated a mainworld for a system or that a mainworld and its UWP already exists.
## PREREQUISITE: INITIAL UWP AND TRADE CODE COMPLETION
Prior to adding detail to a world’s social characteristics, the Referee should complete the basic rolls for population, government, Law Level, starport type and Tech Level using the process, DMs and tables in the Traveller Core Rulebook pages 147-218 to create a full UWP for worlds which do not have one. All of these characteristics (and more) will be covered in considerably greater detail in their own sections, but having these initial values established allows for a smoother flow through the processes in this chapter.

Some DMs also require knowledge of trade codes which are based on the UWP. Trade codes (agricultural, et. al.) can be determined from the table on page 260 of the Traveller Core Rulebook or from page 186 of this book.

```Example
For Zed Prime the physical UWP or the SAH portion of the world is already computed. To complete the remaining characteristics, the population roll is 2D-2 = 9-2 =7, government is 2D-7 + 7 =7-7 + 7 = 7, Law Level is 2D-7 + 7 = 6-7 + 7 = 6. The starport has no DMs for population and a 2D roll of 8 makes it Class C. Finally, a 1D roll for Tech Level with DM+2 for government and DM+2 for the starport is a 4, making the Tech Level 8. Zed Prime’s complete UWP is C566776-8. These characteristics give the world the trade codes of Ag (Agricultural) and Ri (Rich).
```

### NATIVE SOPHONT MODIFICATIONS
A world with a native sophont population, especially a newly contacted population, should use modified UWP generation procedures appropriate to that species.
#### Population
In most cases, native sophont populations will number in the millions or greater. The Referee can certainly choose to have sophont species with only a few or perhaps even one member: either a lone survivor of a dying race, the hivemind of a globe-spanning super-organism or something in between but these should be special cases. The following methods are suitable for native sophont populations:
- Rolling 2D-2 but rerolling any result below 6
- Rolling 2D-2 but changing any roll below 6 to either 6 or 7
- Rolling 2D3+4

An alternate way creating rare ‘odd’ or low population native sophont worlds could be to roll 1D and add 4 for most worlds but if the 1D result is a 1, then instead roll 2D-7. If the result of the 2D-7 roll is negative, treat it as positive. Subtract the result of this roll from 6 to get a population of 1–5.

Beyond the mainworld, at least during a sophont species’ initial expansion, populations of other worlds they might settle are generally dependent on the mainworld’s population or at least overshadowed by it and should not exceed its value unless some disaster forced an exodus.

#### Government and Law Level
In most cases determination of government and Law Level for native sophonts can use the procedures in this book, although the Referee may choose to implement special cases for unique sophonts, either creating different government types or enforcing certain governments and legal systems specific to the sophont.

#### Starport
The Referee may choose to impose a negative DM on starport class for native sophonts to simulate a higher chance of encountering a more primitive native species. In most cases a DM-2 would be appropriate. If the Referee does not want a species to be starfaring, at least not by jump drive, a starport of class A should be unavailable, likewise, if the Referee does not want the species to be capable of spaceflight, class D or worse is most appropriate.

#### Tech Level
Native sophonts are assumed to be adapted to their homeworld. They do not receive any Tech Level DMs for SAH characteristics of their native world, nor are they bound by any Tech Level minimums for their homeworld’s environment.

## POPULATION
Determination of population for a mainworld depends on the origin of the population. For most worlds, the general population procedure is sufficient but worlds with a native sophont population warrant a modified procedure (see above), especially if they are the only intelligent inhabitants of the world.

The population digit of the UWP is generated with a roll of 2D-2 for a system’s mainworld. The population code indicates the number of people to the power of 10 living on a world, e.g., Population 6 indicates 1–9 million people. A Population of 0 generally means zero people, although it could refer to any number less than 10.

**Table 61: Population Code Values**

| Population | Range                                 |
| ---------- | ------------------------------------- |
| 0          | 0                                     |
| 1          | 1 – 99                                |
| 2          | 100 – 999                             |
| 3          | 1,000 – 9999                          |
| 4          | 10,000 – 99,999                       |
| 5          | 100,000 – 999,999                     |
| 6          | 1,000,000 – 9,999,999                 |
| 7          | 10,000,000 – 99,999,999               |
| 8          | 100,000,000 – 999,999,999             |
| 9          | 1,000,000,000 – 9,999,999,999         |
| A (10)     | 10,000,000,000 – 99,999,999,999       |
| B (11)     | 100,000,000,000 – 999,999,999,999     |
| C (12)     | 1,000,000,000,000 – 9,999,999,999,999 |

MegaTraveller introduced the PBG numbers to extended system information, with the P standing for population and giving a numeric value (1–9) to the population code: A Population code 6 world with a P of 3 would have a total population of about 3,000,000. This information exists for many Charted Space systems but for a newly generated system, it can be created with two D3 rolls, the first equaling 0, 3, or 6, and the second adding 1–3 to that number, as indicated in the Population P Value table. The end result will be referred to in the follow sections as the total world population.

**Table 62: Population P Value**

|First D3|+ Second D3|= P Value|
|---|---|---|
|1 = 0|1|1|
|1 = 0|2|2|
|1 = 0|3|3|
|2 = 3|1|4|
|2 = 3|2|5|
|2 = 3|3|6|
|3 = 6|1|7|
|3 = 6|2|8|
|3 = 6|3|9|

Instead of the above, a Referee could roll d10 and reroll a 0. Adding a population P value allows for documentation of a world’s population to at least one significant number. It does however pose a question about how the Referee should deal with the extreme population codes of 0 and A (10) or how to indicate greater population precision.
### POPULATION 0
For most purposes, this population code should be treated as no population, with a 0 for the P value as well. This allows consistent use of the barren (Ba) trade code and makes it clear at a glance that a world has no known or permanent inhabitants. There may be an undocumented population or temporary residents but officially, the world is unoccupied. The population code of 1 would cover the range of 1–99 recognised residents, with a P value of 1 covering the range of 1–19 inhabitants.

### POPULATION A
Populations in the tens of billions would be rare but a flat distribution of 10 to 90 billion residents may not be appropriate in all circumstances. First, even with a continued high natural increase and heavy immigration, it would likely take 1,000 years or longer to reach as many as 90 billion. Projections for 21st century Terra suggest the population will peak at barely more than 10 billion and never even approach 20 billion. But Traveller is based on science fiction settings. Charted Space has had human interstellar travel for 10 millennia and other methods than natural reproduction such as cloning can account for large populations in shorter timeframes. Alien sophonts may have differing rates of natural increase and extreme longevity may drive populations ever upward, even with a low birth rate.
#### Population A Variants
The Referee can choose to stay with a default linear distribution on populations in the tens of billions or may choose to decrease the odds of larger P numbers for these worlds. A method that still allows the same theoretical range is to begin with a value of 1 for P and roll 1D: on a result of 5 or 6, increase the P value to 2 and rolling again with each subsequent 5 or 6 increasing it by 1 and repeating the process until rolling a 4 or less or until reaching 9. Variation on the ‘P extinction rate’ could require a 6 for a P increase, or 4–6 for a P increase, or a varying requirement as P values increase.

### ADDITIONAL SIGNIFICANT DIGITS
While an inhabited world will have a P value of 1-9, any additional significant digits for the population could have any value from 0 to 9. A d10 can provide digits for arbitrary precision – though not to the level of fractional people. To keep with the intent of certain values as a cut-off for purposes of trade classifications, these additional digits should always be added to the previous value, even if they would cause the population to round up to a greater value if the precision were removed; a Population code of 6 implies 1,000,000 – 9,999,999 people. A Population code 6 world with a P value of 9 and a subsequent d10 roll of 9 would have 9,900,000 people, but its Population code would still be 6.

### REGIONAL POPULATION DIFFERENCES
Recently settled regions are less likely to abide by the standard 2D-2 population roll. The Sector Construction Guide provides suggestions for developing frontier populations profiles on pages 17–20, but as a simple expedient a Referee could apply a DM to the population roll: a negative DM for frontier regions. A positive DM for long-settled regions is possible, although the standard 2D-2 provides a good range for settled sectors where backwaters may still exist, although it could be appropriate to add a small positive DM to worlds along established trade routes, in important system clusters, or on major interstellar jump-1 mains.

Adding a positive DM to the population roll allows for the possibility of worlds with populations in the hundreds of billions (B) or trillions (C). The Referee may choose to allow this but such worlds are likely to dominate the relative population and economy of a region to such an extent as to overshadow everywhere else. If that is the type of setting the Referee wishes to create it should be a conscious choice, not the result of a random roll. If using population values so large, a variant method for generating diminishing P values should be considered, at least for the largest population code.

```Example
For Zed Prime, the Population code is 7, or tens of millions. Rolling for the P number results in a D3:D3 roll of 1:1 or 1, and the Referee chooses to add one more digit with a d10 roll of 8, giving the Zed Prime a total world population of 18,000,000.
```

### DEMOGRAPHICS
The population value and P digit make no distinction as to what sort of ‘people’ inhabit a world. They could all be human, a combination of sophonts and in some universes (not generally in Charted Space) they could even be robots.

From a sophont perspective, noting variance from the ‘normal’ population is more important than listing the normal population – normal is something to emphasize at the polity, subsector or sector level. While it can be recorded on a survey form or data sheet for completeness or to display in isolation, a world’s demographics information should focus on any significant deviations from a normal population. This is especially relevant for a sophont species’ homeworld or worlds with unusual immigrant or secondary population groups.

Travellermap maintains a list of four-character sophont codes for Charted Space and uses these on the map information on that site. This list is located in the remarks section of the Second Survey data description at https://travellermap.com/doc/secondsurvey#remarks. The standard method to display such data is by adding these to a world’s remarks (the trade code section), appended by a digit representing the 10s of percent of the population consisting of that sophont, with 0 representing less than 10% and an appended W indicating that the sophont represents the bulk, or close to 100% of the planet’s population.

### POPULATION CONCENTRATION
While no pattern is absolute, as technology begins to advance, worlds tend towards greater urbanization. Two factors govern this: the first is the decrease in relative population needed to produce food. While a TL1 society might have more than 90% of the population dedicated to food production, by TL8 the requirement drops to 2%. The second factor is efficiency of service delivery. A concentration of people requires less infrastructure in transportation and power transmission networks, hospitals and other facilities required for a higher technology civilization. Beyond TL8, in wealthier or free societies, this concentration may reverse, as wireless transmission of data and power, and services such as telerobotic medicine and fast ad hoc transport allow for dispersion of services with less associated cost. Governments may wish to concentrate population for environmental or for control reasons but options become greater at higher Tech Levels; by TL10 whole cities may float in the sky or be composed of sub-units that could disperse or cluster as desired. Cities may even exist in orbit, either hosting a world’s highport, providing exclusive domains for industry or for a world’s coddled elites.

Other factors, such as general habitability or the available habitable area, limited to the twilight zone of a tidally locked world or the equatorial regions of a cold world, may also affect concentration and urbanization levels. The size of the population is also a factor in global dispersion of that population.

A world’s urbanization ratio depends upon the concentration of its population to specific regions of a world’s surface (or orbital space). On a world with a Population code below 6 (less than 1,000,000 people) roll 1D. If the roll is greater than the population value, then the entire population resides in one settlement area.

On most worlds, a settlement area is defined as a single 1,000km hex on a world map. For a Size 0 world, this implies all settlement is on a single asteroid or space station. Concentration into one region gives a world a population concentration rating (PCR) of 9.

**FORMULA: Population Concentration Rating**
$\text{If 1D roll is greater than Population code , PCR = 9, otherwise:}$
$\text{Population Concentration Code} = \text{Roll 1D} + \text{DMs}$

**Table 63: Population Concentration Rating**

| 1D+DM | PCR | Population Concentration |
| :---: | :-: | ------------------------ |
|  0-   |  0  | Extremely Dispersed      |
|   1   |  1  | Highly Dispersed         |
|   2   |  2  | Moderately Dispersed     |
|   3   |  3  | Partially Dispersed      |
|   4   |  4  | Slightly Dispersed       |
|   5   |  5  | Slightly Concentrated    |
|   6   |  6  | Partially Concentrated   |
|   7   |  7  | Moderately Concentrated  |
|   8   |  8  | Highly Concentrated      |
|  9+   |  9  | Extremely Concentrated   |

**Die Modifiers for Population Concentration Rating**
Here are the modifiers that affect Population Concentration Rating (PCR), based on the provided text:

- **Size 1**: DM+2
- **Size 2-3**: DM+1
- **Twilight zone world**: DM+2
- **Minimal sustainable TL is 8 or greater**: DM+3
- **Minimal sustainable TL is 3–7**: DM+1
- **Population 8**: DM-1
- **Population 9+**: DM-2
- **Government 7**: DM-2
- **Tech Level 0–1**: DM-2
- **Tech Level 2–3**: DM-1
- **Tech Level 4–9**: DM+1
- **Tech Level 10+**: DM+1
- **Agricultural**: DM-2
- **Industrial**: DM+1
- **Non-Agricultural**: DM-1
- **Rich**: DM+1

The minimal sustainable TL is determined by the Tech Level and Environment table on page 175. Worlds with a Population code of 9 or more have a minimum PCR of 1; otherwise, the minimum is 0. The maximum PCR value is 9. A PCR is also useful for mapping settled regions on worlds with a moderate (Population code 6–8) amount of people. For these worlds, each value of the rating corresponds to about 10% of usable surface area without significant settlement. For instance, a world with a PCR of 3 would have 30% of usable hexes without significant settlement and 70% with at least some settlement. Worlds with populations in the billions have populations spread across most of the world regardless of PCR, but the PCR indicates the clumping of major urban areas.

A world’s total urbanization level is influenced by its PCR and other factors. To determine a world’s urbanization level, roll 2D on the urbanization percentage table with DMs for relevant conditions. Some of these DMs have a minimum or maximum listed. If range rolled based on the table results violates a percentage listed with a DM, roll based on the maximum or minimum as indicated for that DM instead. A minimum value will supersede a conflicting maximum value.

**Table 64: Urbanization Percentage**

| 2D+DM |      Range       | Urbanisation %   |
| :---: | :--------------: | ---------------- |
|  0-   |        —         | Less than 1%     |
|   1   |        1D        | 1–6%             |
|   2   |      6 + 1D      | 7–12%            |
|   3   |     12 + 1D      | 13–18%           |
|   4   |      18+ 1D      | 19–24%           |
|   5   | 22 + 1D × 2 + D2 | 25–36%           |
|   6   | 34 + 1D × 2 + D2 | 37–48%           |
|   7   | 46 + 1D × 2 + D2 | 49–60%           |
|   8   | 58 + 1D × 2 + D2 | 61–72%           |
|   9   | 70 + 1D × 2 + D2 | 73–84%           |
|  10   |     84 + 1D      | 85–90%           |
|  11   |     90 + 1D      | 91–96%           |
|  12   |     96 + D3      | 97–99%           |
|  13+  |       100        | Greater than 99% |

**Die Modifiers for Urbanization Percentage**
- PCR 0–2: DM-3+PCR
- PCR 7+: DM-6+PCR
- Minimal sustainable TL is 0–3: DM-1
- Size 0: DM+2
- Population 8: DM+1
- Population 9: DM+2, Minimum = 18% + 1D
- Population A+: DM+4, Minimum = 50% + 1D
- Government 0: DM-2
- Law Level 9+: DM+1
- TL0–2: DM-2, Maximum = 20% +1D
- TL3: DM-1, Maximum = 30% +1D
- TL4: DM+1, Maximum = 60% +1D
- TL5–9: DM+2, Maximum = 90%+ 1D
- TL10+: DM+1
- Agricultural: DM-2, Maximum = 90%+ 1D
- Non-Agricultural: DM+2
- 
A world’s total urban population can be computed from population and urbanization values:

**FORMULA: Total Urban Population**
$\text{Total Urban Population} = \text{Total World Population} \times \text{Urbanization Percentage}$

People are considered part of the urban population if they reside in a town or city of more than 10,000 people or in a settlement that includes 50% or more of the world’s total population. On a balkanized (government code 7) world the definition includes any settlement with 50% or more of the nation’s total population. On worlds of Tech Levels greater than 9, ‘virtual cities’ may exist as cultural or demographic units but in most cases a threshold density of 100 people per square kilometer and geographic continuity are considered the minimum requirements for a true urban area. In some arcologies, the population density may be in the millions per square kilometer and such giant edifices often measure their population density in people per cubic kilometer instead.

```Example
Zed Prime’s UWP is C566776-8 and its trade codes are agricultural and rich. To determine the PCR, the 1D roll has DM+1 (Tech Level), DM-2 (government), DM-2 (agricultural), and DM+1 (rich) for a net DM of -2. Rolling a 5 - 2 = PCR 3 or partially dispersed, with settlement areas possible over 70% of the world’s land or coastal surface – the extreme tides make the Referee rule out the coastal waters and limit settlements anywhere near the coast.

For Zed Prime’s urbanisation %, the Referee rolls 2D with DM-1 (minimum sustainable TL is 0-3) and DM+2 (Tech Level), DM-2 (agricultural) for net DM-1, rolling a 7 - 1 = 6, which requires a 1D and D2 roll on the range table resulting in 34 + 2 × 2 + 1 = 39%. Checking that against maximum and minimum restrictions from Tech Level (90% maximum) and agricultural (same) requires no changes. Total world population × 39% gives Zed Prime a total urban population of 7,020,000, which the Referee chooses to round to 7,000,000.
```

### NUMBER OF MAJOR CITIES
Major city population is the combined population of its major cities – if the world only has major cities, then this is the entire urban population. As populations increase and disperse, the population of major cities becomes a subset of the urban population. Determining the number of major cities or urban concentrations depends on the world’s population code and PCR. Varying cases have varying procedures:

**Case 1:** Any world with a PCR of 0. For worlds with a PCR of 0, no large cities exist, although a multitude of smaller urban areas may dot the planet.

**FORMULA: Major Cities**
$\text{Major Cities} = 0$
$\text{Major City Population} = 0$

**Case 2:** Population code is 5 or less and PCR is 9. In this situation:

**FORMULA: Major Cities**
$\text{Major Cities} = 1$
$\text{Major City Population} = \text{Total Urban Population}$

**Case 3:** Population code is 5 or less and PCR is 1–8. The world cannot have more major cities than its population code. Any city is a major city.

**FORMULA: Major Cities**
$\text{Major Cities} = \text{Lesser of: }(9 - \text{Population Concentration Rating}) \text{ or } (\text{Population})$
$\text{Major City Population} = \text{Total Urban Population}$

**Case 4:** Population code is 6 or greater and PCR is 9:

**FORMULA: Major Cities**
$\text{Major Cities} = \text{Greater of: }(9 - \text{Population Code} - \text{2D}) \text{ or } (1)$
$\text{Major City Population} = \text{Total Urban Population}$

The result is the number of major cities present on the world. If the result is 1 then as with the previous case, the world has only one concentrated city with the world’s entire urban population. On a Population A world, this could be a continent-spanning urban region but is considered one contiguous city. For results of multiple cities, follow the procedure for major city populations below to determine actual populations.

**Case 5:** For all other concentration values:

**FORMULA: Major Cities**
$\text{Major Cities} = \text{2D} - \text{PCR} + \frac{\text{Urbanization Percentage} \times 20}{\text{PCR}}$
$\text{Major City Population} = \frac{\text{PCR}}{\text{1D-7}} \times \text{Total Urban Population}$

Round results up. Results of less than 1 are equal to 1. This will result in 1–31 major cities on a world. If the world’s Population code is less than 6, then the major city quantity for that world is limited the value of its Population code. The actual population of each major city can be determined by the methods described in the next section. In the interests of sanity and time, the Referee may wish to limit the described major cities to the largest 10, regardless of the results of this case.

```Example
Zed Prime has a PCR of 3 and a 39% Urbanisation Rating with a Total Urban Population of 7,000,000.The world’s major city count is 2D - 3 + 0.39 × 20 ÷ 3 or rolling 7 - 3 + 0.39 × 20 ÷ 3 = 6.6, rounded to 7 major cities
```

### MAJOR CITY POPULATION
Major city is a relative term. It refers to the largest population centers on a planet, whether they are continent-wide arcology clusters or a few hamlets. These cities account for the bulk of a world’s total urban population. The population of a city is subject to interpretation. A city may have its population defined by its official borders, its metropolitan area or by its built-up urban area. The IISS standard is to attempt to estimate the latter figure to give a true picture of the urban environment and relate it back to the urbanization rate, regardless of how a local government might define a city’s boundaries and population.

If the Referee desires to determine the population of individual major cities, there are several separate cases to consider with increasing complexity:

**Case 1:** Worlds with a PCR of 0. No major cities exist. The largest city is equal in size to the world’s total urban population divided by 100, or 1D +2 × 10,000 people, whichever is less. If the result is less than 100 people, then the largest city population becomes the larger of the world’s total urban population divided by 10 or just 1D+1 people.

**Case 2:** Worlds with one major city. For these:

**FORMULA: Single Major City Population**
$\text{Major City Population} = \text{Total Major City Population}$

**Case 3:** Worlds with a PCR of 1-8 and 2–3 major city:
This population is spread among major cities, with each accounting for at least 1% of the major city population. If only two or three major cities exist, the population can be determined using a method similar to that used to determine atmospheric gases:

**FORMULA: Major City Population**
$\text{Major City Population} = ((\text{1D + 3}) \times 10\% ± \text{variance}) \times \text{Total Major City Population}$

Repeat this procedure for the second and third major city using the remaining unallocated total major city population, ensuring that each city receives at least 1%, and assigning any remainder to the first city.

**Case 4:** Worlds with a PCR of 1–8 and four or more major cities. All major cities should have at least 1% of the Major City Population. To ensure that each city receives at least 1% of this population, create a simple table and follow this process:
1. Make one table entry per major city and assign it 1% of the total major city population.
2. Subtract the number of major cities from 100 (100 - major cities) to determine the remaining pool to spread among the cities. If detailing no more than 10 major cities on worlds where the results are greater, reserve at least 1% for all the major cities rolled, not just the ones being detailed in this process.
3. Create population percentage ‘chunks’. Use the PCR as the maximum size in percent of each chunk to allocate. As the minimum chunk size, make sure the number of chunks is at least twice the number of major cities. Use whole numbers for chunk size. For instance, if there were nine major cities, there should be at least 18 chunks, so of the remaining (100-9 = 91) percent, there should be at least 18 chunks or chunks equal to 91÷18 or 5% in size, regardless of PCR. If the PCR was only 3, there could be 91÷3 or 30 total chunks.
4. Divide (100 - major cities) by the PCR to determine the whole number of chunks available, holding back any remaining population percentage.
5. For each major city roll 1D and allocate that many chunks to the city, continuing until all major cities have received 1D chunks, or until there are no more chunks to allocate.
6. If chunks remain, return to the first city and continue adding 1D chunks at a time to cities until no chunks remain.
7. Assign the remaining population percentage to the city that would have received one more chunk after the last whole chunk is gone.
8. Total the percentages for each city.
9. For each city, multiply the percentage by the amount of people represented by 1% of the total major city population.
10. Reorder cities from largest to smallest, if desired.
11. For identically sized cities, or any city, if desired, add some variance of an appropriate amount or transfer some people from one city to another to vary city population but ensure every major city has at least 1% of the total major city population.

Case 4 Example:
```Example
For Zed Prime (PCR 3)the total major city population is 3 ÷ (1D+7) × 7,000,000 rolled as 3 ÷ (3+7) × 7,000,000 = 2,100,000 people. To allocate these people:
1. Each of the 7 cities has at least 1% of this population.
2. The total number of major cities is 7. 100 - 7 = 93
3. The chunk % maximum is based on the PCR of 3. There must be at least 14 chunks for 7 cities.
4. The number of chunks is 93 ÷ 3 or 31 chunks, with no remainder.
5. The Referee rolls 1D for each city, allocating 2, 4, 2, 3, 1, 2, 6 or a total of 20 chunks
6. With 11 chunks to go, the Referee rolls 3, 4, 3 and 4, but the last roll is reduced to from 4 to 1 as that city gets the last of the 31 chunks.
7. There are no partial chunks to allocate – the last city would have gotten the partial as well.
8. For the seven cities, the percentages of major city population are 1+(2+3)×3, 1+(4+4)×3, 1+(2+3)×3, 1+(3+1)×3, 1+1×3, 1+2×3 and 1+6×3, or 16%, 25%, 16%, 13%, 4%, 7%, and 19%: 
   See table:
|City|1%|Chunks|Chunks×3|=%|×21,000|
|---|---|---|---|---|---|
|1|1|2 + 3 =5|15|16%|336,000|
|2|1|4 + 4 = 8|24|25%|525,000|
|3|1|2 + 3 = 5|15|16%|336,000|
|4|1|3 + 1 = 4|12|13%|273,000|
|5|1|1|3|4%|84,000|
|6|1|2|6|7%|147,000|
|7|1|6|18|19%|399,000|   
	With each % equal to 21,000 people. The totals are 336,000, 525,000, 336,000, 273,000, 84,000, 147,000 and 399,000.
9. The largest city of Zed Prime has a population of 525,000 people, the second 399,000 people, the third and fourth 336,000 and so on.
10. To vary the identical population of the third and fourth city, change them to 342,000 and 330,000 instead.
```

### ADDITIONAL CITIES
Any unallocated urban population, or total urban population minus major city population, reflects the residency of medium and small-sized cities. No medium sized cities should be larger than 1% of the major city population and small cities should be no larger than 0.1% of the major city population but the Referee is otherwise free to allocate the remaining urban population as desired.

### UNUSUAL CITIES
Higher technology worlds may have cities that move, float, or exist underwater, below ground or in space. Each of these situations have a minimum required Tech Level for viability.

**Table 65: Unusual City Types**

| City Type                         | Minimum TL | City Code |
| --------------------------------- | ---------- | --------- |
| Arcology, sealed city             | 8          | Ar        |
| Flying, buoyant gas               | 8          | Fb        |
| Flying, grav hover                | 10         | Fg        |
| Flying, grav mobile               | 14         | Fm        |
| Mobile, rails                     | 6          | Mr        |
| Mobile, tracked                   | 9          | Mt        |
| Space, spin                       | 8          | Ss        |
| Space, grav                       | 10         | Sg        |
| Underground, benign environment   | 6          | Ub        |
| Underground, hostile environment  | 8          | Uh        |
| Water, shore floating adjacent    | 0          | Wa        |
| Water, static floating deep water | 6          | Wd        |
| Water, free floating              | 8          | Wf        |
| Water, submerged                  | 9          | Ws        |
| Water, deep ocean                 | 12         | Wx        |
| Agricultural City                 | 6          | Ag        |
| Mining City                       | 6          | Mi        |
| Resort City                       | 6          | Re        |
| Research City                     | 8          | Rc        |
| Virtual City                      | 10         | Vc        |
| Autonomous City                   | 12         | Ax        |
| Biosphere City                    | 10         | Bs        |

An unusual city of any type is more expensive to build and maintain than a normal city. These cities exist for a few reasons: as protection from a hostile environment or populace or as a prestigious residence or symbol for a world’s elites. In some cases, specific industrial processes such as gas, ocean mining or space manufacturing may also warrant an unusual city type. Prototech versions of cities are also possible, although extremely expensive – a steam-punk city on rails is certainly a possibility. This list of types is not meant to be entirely comprehensive; a city inside a giant nuclearpowered gyro-stabilised mono-wheel could certainly exist, coded as Mx, but the Referee should invent a backstory for its existence.

If Referees wish to randomly determine if a city is of an unusual type, they can roll 2D for 12+ with the following DMs:

**Die Modifiers for Unusual City**
- Starport A with highport: DM+1
- Starport E or X: DM-2
- Atmosphere 0, 1, or A: DM+2
- Atmosphere B: DM+3
- Atmosphere C: DM+4
- TL9–12: DM+1
- TL13–15: DM+2
- TL16+: DM+3
- Industrial: DM+1
- Non-Industrial: DM-1
- Rich: DM+1
- Poor: DM-1

The type of unusual city still requires Referee choice based on circumstances or whim. In certain environments cities might be arcologies, underground or underwater by default because of the world’s surface conditions.

```Example
Zed Prime, a rich world at TL8, has a DM+1 and would only randomly have an unusual city on a roll of 11+, or 1:12 per city. The Referee, seeing little justification for an unusual city, forgoes the roll.
```

### OTHER CITY DESIGNATIONS
The Referee may choose to provide additional designations to a city based on its status as a capital or its faction, or nation membership (see the Government section starting on page 156) or as host of a starport or spaceport. As with any unusual city types, the Referee can list these codes after the city’s name.

**Table 66: City Capital Designation Codes**

| City Designation                         | City Code |
| ---------------------------------------- | --------- |
| World Capital                            | Cw        |
| Faction Capital                          | Cf        |
| National Capital                         | Cn        |
| Regiaonal (province, state, etc) Capital | Cr        |

### BALKANISED WORLD POPULATION DISTRIBUTION
In addition to a world population and city populations, a balkanized world has its population allocated to various factions and/or nations as indicated by procedures in the Government section on page 156. Depending on the number of nations or faction and the detail the Referee desires to create, the Referee can allocate population based on the method for distributing population for cities above, or the Referee can adapt the less formal method for determining the number of major geographical bodies continents described on page 152, or any other method, arbitrary or otherwise. The number and distribution of both major geographical bodies and cities may give the Referee some ideas about how to distribute the population.
### POPULATION PROFILE
A population profile is a compressed version of some of the information determined in the section. The format is:

**P-p.pp-C-\%\%-M**

Where:
- P = Population Code
- p.pp = P value with optional fractional digits
- C = PCR
- \%\% = Urbanization Percentage
- M = Number of Major Cities

Major cities may have standard profiles in the form:

**Name (Codes): Population: Port**
Where codes can include any city designation and possibly faction or nation information and port is any associated starport or spaceport class.

```Example
The population profile for Zed Prime would be 7-1.8- 3-39-7. Each city would receive at least a faction code, to be developed in the Government section and these are presented in the Zed example form at the end of this chapter.
```

### SECONDARY WORLD POPULATIONS
Other worlds besides the mainworld may have a population, either affiliated with the mainworld or independent. These worlds will almost always have a smaller population than the mainworld and if inhospitable are subject to Tech Level restrictions on habitation (see page 173). Depending on the world’s government, these secondary world populations could be included in the total for the mainworld or be treated as additional populations.

It is possible a secondary world population exists in a city in space with no associated world but most often these populations are considered to belong to some significant body within the system. Except in rare circumstances, the maximum population of a secondary world is one less than mainworld’s Population code.

Rather than check every significant body in the system, the Referee may choose to set the maximum offworld population as mainworld population - 1D and if this number is zero or less, it becomes unnecessary to check any other worlds. The Referee may also choose to assign a Population code to specific secondary worlds. The secondary world’s population digit, or P value, can remain random in any case.


```Example
At Zed Prime’s TL8, the prospect of worlds with secondary populations is rather low but with a balkanised government, it could be more likely than in some cases. A roll of Zed’s Population code (7) minus 1D (a 2) indicates that secondary worlds of Population code 5 or less could exist.

The Referee decides that the only secondary populations of note would reside on other moons of Zed Prime’s parent planet or on Zed Secundus the barely habitable moon of the gas giant in the orbit beyond (Aab V d). Assigning a Population code of 5 to this desert moon and randomly generating a P value of 1, then using d10 to add further precision gives this moon a population of 140,000. Additional work provides a population profile of 5-1.4-8-90-2.

For the other four significant moons of Aab IV, the Referee arbitrarily chooses to roll 1D for the population value, with a result of 5 or 6 meaning no population. These rolls result in 6, 5, 6, 4, and 2, meaning that only the two outer Size S moons have a population, the first numbering (P digit randomly assigned) 30,000 people and the other 700.
```

## GOVERNMENT
A world’s Government code is determined by a roll of 2D-7 plus the world’s Population code, resulting in a number between 0 and 15 as indicated on the Government Types table.

A government’s code may not correspond to its ‘official’ name or structure. A government claiming to be a representative democracy could be anything from a corporate government to a totalitarian oligarchy in effective function. Likewise, an official monarchy could be a representative democracy, charismatic dictatorship or even a balkanized world in reality. The Government code is the effective government. In Charted Space it is what an IISS survey team has determined it to be. In general Traveller terms, it is how the Referee should treat the government and how the government will treat the Travellers, regardless of whatever label the government places upon itself.

### GOVERNMENT TRAITS
#### Centralization
From Confederal to Unitary. This trait would measure the degree to which power is concentrated at the central government level versus distributed among sub-states
#### Authority
From Legislative to Executive or Judicial. This trait indicates which branch of government holds the most power. It could also be Balanced.
#### Structure
From Demos to Single Council, Multiple Councils, or Ruler. This describes how the authoritative function or branch is composed
#### Stability
From Stable to Unstable. This trait would reflect how prone the government is to collapse or revolution
#### Intrusiveness
From Minimal to Extensive. This measures how much the government interferes in the lives of its citizens and businesses
#### Ideology
 From Traditional to Progressive. This indicates how open the government is to new ideas and change.
#### Legitimacy
From High to Low. This trait reflects how much the population accepts the government's right to rule.
### BALKANISATION
If a world’s Government code is 7, then there is no recognized central government that has effective control over the entire world. As with other governments, there may be a recognized union of subordinate states but on a balkanized world, the subordinate states have effective sovereignty or localized dominant control over their territories and people. Each of these subordinate governments could be rolled for separately.

If the Referee chooses, these subordinate governments may be represented by a total of D3+1 factions (see the Factions section on page 160), with all members of a faction treated as having the same government, Law Level and culture, or the Referee can choose to subdivide these factions into individual governments or nations.

If choosing to portray individual nations, roll 1D for each faction to determine the number of nations within that faction. On a roll of 5, the Referee may choose to multiply the result by 10 minus the world’s PCR, and on a roll of 6, also multiply the result by the world’s Population code minus D3 (but at least by 2). For rolls of 5 or 6, the Referee may also add some variance factors to spread the results across differing ranges. Note this could theoretically lead to hundreds of national governments, which might be realistic but should be considered as flavor, not as a prelude to developing the details of hundreds of nations. With extreme balkanization, the Referee may wish to stick to overall factions or pick a particular nation relevant to the adventure at hand to develop. When in doubt, the Referee can choose the faction or nation surrounding or adjacent to the world’s starport as the government to further develop.

Balkanized world factions each roll for a Government code using the same Population code as the world as a whole, regardless of the strength of the faction.

**Table 67: Government Types**

| Hex Code | <br>Government Type          | <br>Description                                                                                                                                                                                   | <br>Examples                                                               |
| :------: | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------- |
|    0     | None                         | No government structure. In many cases, family bonds predominate                                                                                                                                  | Family, clan, anarchy                                                      |
|    1     | Company/Corporation          | Ruling functions are assumed by a company managerial elite and most citizenry are company employees or dependants                                                                                 | Corporate outpost, asteroid mine, feudal domain                            |
|    2     | Participating Democracy      | Ruling functions are reached by the advice and consent of the citizenry directly                                                                                                                  | Collective, tribal council, comm-linked consensus                          |
|    3     | Self-Perpetuating Oligarchy  | Ruling functions are performed by a restricted minority, with little or no input from the mass of citizenry                                                                                       | Plutocracy, hereditary ruling caste                                        |
|    4     | Representative Democracy     | Ruling functions are performed by elected representatives                                                                                                                                         | Republic, democracy                                                        |
|    5     | Feudal Technocracy           | Ruling functions are performed by specific individuals for persons who agree to be ruled by them. Relationships are based on the performance of technical activities that are mutually beneficial | Those with access to advanced technology tend to have higher social status |
|    6     | Captive Government           | Ruling functions are performed by an imposed leadership answerable to an outside group                                                                                                            | A colony or conquered area, military rule                                  |
|    7     | Balkanisation                | No central authority exists; rival governments complete for control. Law Level refers to the government nearest the starport                                                                      | Multiple governments, civil war                                            |
|    8     | Civil Service Bureaucracy    | Ruling functions are performed by government agencies employing individuals selected for their expertise                                                                                          | Technocracy, meritocracy, communism                                        |
|    9     | Impersonal Bureaucracy       | Ruling functions are performed by agencies that have become insulated from the governed citizens                                                                                                  | Entrenched castes of bureaucrats, decaying empire                          |
|  A (10)  | Charismatic Dictatorship     | Ruling functions are performed by agencies directed by a single leader who enjoys the overwhelming confidence of the citizens                                                                     | Revolutionary leader, monarch, emperor, president for life                 |
|  B (11)  | Non-Charismatic Dictatorship | A previous charismatic dictator has been replaced by a leader through normal channels                                                                                                             | Military dictatorship, hereditary kingship                                 |
|  C (12)  | Charismatic Oligarchy        | Ruling functions are performed by a select group of members of an organisation or class that enjoys the overwhelming confidence of the citizenry                                                  | Junta, revolutionary council                                               |
|  D (13)  | Religious Dictatorship       | Ruling functions are performed by a religious organisation without regard to the specific individual needs of the citizenry                                                                       | Cult, transcendent philosophy, psionic group mind                          |
|  E (14)  | Religious Autocracy          | Government by a single religious leader having absolute power over the citizenry                                                                                                                  | Messiah                                                                    |
|  F (15)  | Totalitarian Oligarchy       | Government by an all-powerful minority which maintains absolute control through widespread coercion and oppression                                                                                | World church, ruthless corporation                                         |

However, individual nations might roll based upon a modified Population code derived from their individual population levels if the Referee desires greater variety.

This handbook will not delve into specific procedures for determining the sizes of each nation on a balkanized world but the Referee can use similar methods and results as for determining major city populations  or even the guidelines and results for determining major bodies on the world’s surface as guides.

### GOVERNMENT STRUCTURE
Developing the internal workings of a government is definitely an optional procedure. It may be important to a specific adventure or be an interesting background flavor for a world but in many cases it is entirely unimportant to the Travellers if the ruling body of a world happens to be a group of senators chosen by an electorate of property owners and a group of random citizens chosen by a lottery.

A world with a Government code of 0 has no functioning government and the procedures that follow are unnecessary. Otherwise, to be called a government, the ruling authority must perform three basic government functions:

**Legislative:** This function makes the laws. It tells the people of the world what is legal and what is not, how to behave and maybe even the required color of footwear. 

**Executive:** This function enforces the law. It ensures the people follow the law and backs it up with whatever force is necessary or legal, as determined by the legislative function and evaluated by the judicial branch. 

**Judicial:** This function interprets the law. It determines whether the executive function is carrying out the laws correctly and it may have the authority to consider some laws created by the legislative function illegal because of some pre-existing or pre-emptive law, such as a constitution or a holy book.

These functions may all be performed by a single drunken half-mad dictator or by multiple meritoriously selected councils of experts but they must be performed in some manner for a government to be effective. A world’s government profile development uses the following steps:

#### Step 1: Degree of Centralization
Governments range in structure from a unitary or monolithic centralized state to a confederation of sovereign states bound by a weak authority. In between are varying degrees of unity, of which the middle ground is a federal government, where the central government and component states share or divide powers in a roughly balanced manner. This procedure will consider centralization characteristic of one of these three forms as determined on the Centralization table:

**Table 68: Centralization**

| 2D+DM | Centralization | Code | Description                                                            |
| :---: | -------------- | :--: | ---------------------------------------------------------------------- |
|  5-   | Confederal     |  C   | Sub-states considered sovereign, more powerful than central government |
|  6–8  | Federal        |  F   | Powers shared between sub-states and central government                |
|  9+   | Unitary        |  U   | Central government dominant                                            |

**Die Modifiers for Centralization**
- Government 2–5: DM-1
- Government 6, 8-B: DM+1
- Government 7: DM+1 (within each sovereign government or faction)
- Government C+: DM+2
- PCR 0–3: DM-1
- PCR 7–8: DM+1
- PCR 9: DM+3

Centralization rolls for the governments and factions of balkanized worlds receive both the DM+1 for balkanization and any DM for their specific government.

#### Step 2: Authority
A government’s structural components may take a variety of names but the structure is dependent on whether one aspect is the authoritative or dominant function or whether a balance exists between the three functions of legislative, executive and judicial power.

In some systems, the legislature may be authoritative, choosing an executive and ministers from within its ranks and appointing judicial officials. In another system a dictator or executive council may have complete authority to override or conduct both legislative and judicial functions. Less frequently, a supreme group of judicial experts may have veto authority over all decisions by the legislative or executive functions or may perform those functions directly, guided by a set of laws or traditions. Finally, some systems may balance these three functions, allowing each to limit the power of the others. Many governments may be officially structured in this balanced manner but this procedure is more concerned with the functional authoritative structure rather than any legal fictions which do not actually describe the functioning of the governmental system.

The Authority table determines the operational functioning and authority of the government.

**Table 69: Authority**

| <br>2D+DM | <br>Code | Authoritative<br>Function |
| :-------: | -------- | ------------------------- |
|    4-     | L        | Legislative               |
|     5     | E        | Executive                 |
|     6     | J        | Judicial                  |
|     7     | B        | Balance                   |
|     8     | L        | Legislative               |
|     9     | B        | Balance                   |
|    10     | E        | Executive                 |
|    11     | J        | Judicial                  |
|    12+    | E        | Executive                 |

**Die Modifiers for Authority**
- Government 1, 6, A, D, E: DM+6
- Government 2: DM-4
- Government 3, 5, C: DM-2
- Government B, F: DM+4
- Confederal government: DM-2
- Unitary government: DM+2

#### Step 3: Government Structure
Each function or branch of the government has a basic structure, ranging from a single individual to a group, to the entire community. The structure of the authoritative function is most important but even when one function is all-powerful, the secondary functions still require people and organization to operate. The types of composition are:

**Demos (D):** The entire citizenry (which may be a subset of the population or the entire population, perhaps with proxy rights for minors) has direct input into the operation and decisions of the function. 
**Single Council (S):** A single group controls the decision-making and actions of the function. 
**Ruler (R):** A single powerful individual with direct subordinate officials control the function. 
**Multiple Councils (M):** Multiple groups control some aspect of the function, either by division of labor, hierarchy, or checks and balances upon the other groups within the function.

Determine the composition of each function with the following procedures:
- For Government 2, the result is always Demos for the authoritative function or for the legislative function in a balanced authority.
- For Governments 8 and 9, the result is always Multiple Councils.
- For Governments 3, C or F, roll 1D: 1–4 = Single Council, 5–6 = Multiple Councils.
- For Governments A, B, D and E, for the authoritative function roll 1D: 1–5 = Ruler. 6 = Single Council; for any other function DM+2 on the Functional Structure table.
- For all other governments with a legislative authoritative function, roll 2D: 2–3 = Demos, 4–8 = Multiple Councils 9+ = Single Council.
- When a Ruler or Single Council is authoritative for the dominant function in a unitary government, that same leadership is authoritative throughout the government and there is no need to determine the composition of the other functions.
- Except as indicated above, for each functional roll 2D on the Functional Structure table:

**Table 70: Functional Structure**

| 2D+DM | Code | Structure         |
| :---: | :--: | ----------------- |
|  3-   |  D   | Demos             |
|   4   |  S   | Single Council    |
|   5   |  M   | Multiple Councils |
|   6   |  M   | Multiple Councils |
|   7   |  R   | Ruler             |
|   8   |  R   | Ruler             |
|   9   |  M   | Multiple Councils |
|  10   |  S   | Single Council    |
|  11   |  M   | Multiple Councils |
|  12+  |  S   | Single Council    |

### GOVERNMENT PROFILE
Subtyping for Government codes include entries for centralization, authority, structure, with a balanced authority including the structure for all branches. The basic format of a government profile is:

**G-CAS**

Where:
- G = Government code
- C = centralization code
- A = primary authority code
- S = structure code of that primary authority. 

For instance, a federal representative democracy with a dominate executive council would be 4-FES. Optionally, all three branches could be described, with the other two functions appended; if that same government had multiple legislative councils and a single council of judges, the profile would be 4-FES-LM-JS.

In the case of a balanced primary authority, the profile needs to include all branches of government:

**G-CBB-LS-ES-JS**

Where:
- BB = Balance Branches
- L = Legislative
- S = Structure (of each function individually)
- E = Executive
- J = Judicial

```Example
As Zed Prime is a balkanised world, its governmental structure will be determined by faction.
```

### FACTIONS
Even an effectively united government may have factions of various strengths as separate centres of power and influence. These could be a minority political party, a particular sophont race or distinct culture, a religious sect, a band of rebels, or some other group opposed to the policies or structure of the current government. To determine the number of factions:

**FORMULA: Number of Factions**
$\text{Number of Factions} = \text{D3} + \text{DMs}$

**Die Modifiers for Number of Factions**
- Government 0 or 7: DM+1
- Government A+: DM-1

A result of 0 or 1 indicates there are no significant factions on the world outside the official power structure. For each faction (beyond the first), roll again for a Government code using the same Population code as the world, regardless of the strength of the faction. Except for balkanised (7) worlds, if a faction has the same Government code as the first faction, the faction represents a splinter or rival group within the same government. If the faction is radically different than the government, it represents a dissident or rebel group. If the resulting faction Government code is 7 or balkanisation, this spawns D3+1 factions – this could spiral into dozens of factions with repeated rolls of 7.

For worlds with Government code 0, factions represent the unofficial political and social powers of a world, a code of 0 indicates a familial grouping, whether just an extended family or a larger band, clan or tribe.

Roll 2D for each faction (beyond the first) on the Faction Strength table to indicate its relative influence.

**Table 71: Faction Strength**

|  2D   | Code | Relative Strength                                            |
| :---: | :--: | ------------------------------------------------------------ |
|  2–3  |  O   | Obscure group – few have heard of them                       |
|  4–5  |  F   | Fringe group                                                 |
|  6–7  |  M   | Minor group                                                  |
|  8–9  |  N   | Notable group                                                |
| 10–11 |  S   | Significant – nearly as powerful as government               |
|  12   |  P   | Overwhelming popular support – more powerful than government |
|   —   |  G   | Code reserved for official government                        |

On a balkanised world, the size of each external faction or nation should be determined as indicated in the Balkanisation section. But each of these factions or nations might have internal factions to consider.

Each faction also has a level of animosity towards the ruling faction and possibly other factions. Roll 1D on the Faction Relationships table to determine mutual antagonism between each pair of factions. The Referee may choose to apply a global or specific DM to any relationship or might set the relationship as desired and forego the roll.

**Table 72: Faction Relationship**

| 1D+DM | Code | Relationship | Description                                                      |
| :---: | :--: | ------------ | ---------------------------------------------------------------- |
|  0-   |  0   | Alliance     | Factions present united front against any opposition             |
|   1   |  1   | Cooperation  | Factions support actions of one another                          |
|   2   |  2   | Truce        | Factions do not oppose each other’s actions                      |
|   3   |  3   | Competition  | Factions compete within bounds of the legal system               |
|   4   |  4   | Resistance   | Factions engage in disobedience and peaceful protests            |
|   5   |  5   | Riots        | Factions engage in violent protest or riot actions               |
|   6   |  6   | Uprising     | Factions engage in periodic murder, sabotage, bombings and raids |
|   7   |  7   | Insurgency   | Regions under factional control, widespread guerrilla warfare    |
|   8   |  8   | War          | Ongoing conventional warfare between factions                    |
|  9+   |  9   | Total War    | Warfare with the aim over conquest or annihilation               |

**Die Modifiers for Faction Relationship**
- Between the ruling faction and all external factions: DM+1
- Factions have the same Government code: DM-1

On a balkanised world, the Referee can impose any DM desired between nations or factions. Those with strongly divergent governments or cultures could receive a positive (more hostile) DM, those more aligned, a negative DM. The relationship column need not be taken literally but is an indication of the level of hostility and violence between factions. Higher hostility is likely to have an effect on a world’s economy and the actions and attitudes of the world’s law enforcement and military personnel. Hostile factions may lead to both risk and opportunities for adventurous Travellers.

### FACTION PROFILE
The Referee should consider giving each faction, or at least the ones not associated with the official government, a name. Each faction, including the governing faction can also have an assigned designation and profile of the form:

**I-G-S**

Where:
- I = a Roman numeral indicating the faction ‘number’ – this can either be replaced with a name or combined, as in Name (I).
- G = Government code for the faction. If a faction has multiple Government codes, they can be separated by a slash character in the form of G/G.
- S = faction strength, using the code from the Faction Strength table. 

For instance, the governing faction of an impersonal bureaucracy would be I-9-G, while an obscure movement for a democratic revolution might be II-4-O.

Each relationship between factions can be expressed by their Roman numerals (or their names, or both) separated by a plus character ‘+’, then an equal sign ‘=‘ and their relationship:

**I + II = #**

Where:
- \# = the faction relationship code. 

For example, resistance between the governing faction and faction II would be I+II=4.

This format can be used on balkanized worlds as well, with internal factions represented by a fractional additional Roman numerals, e.g., I.I-9-G and I.II-4-O for the above example of government and faction. Likewise, relations between them would be I.I+I.II=4. Nothing but the Referee’s time and sanity prevents the documentation of relationships between factions or even different nations. Again, the Referee may also choose to use names instead of Roman numerals, especially on worlds with many nations.

```Example
Zed Prime is a balkanised world. A D3+1 roll indicates two factions and the Referee decides to subdivide these with additional 1D rolls of 3 and 4, resulting in one faction of three nations and another faction of four. Since this happens to line up with the number of major cities, each faction can correspond to one major city and surrounding territory. For the first group of three nations, a roll of 2D-7+7 = 11(B) indicates that they are ruled by non-charismatic dictatorships, while the second group of four get a roll of 2D-7 + 7 = 3, or self-perpetuating oligarchies. These two global factions can be expressed as two blocks of nations: I-B-G and II-3-G. The Referee decides to randomly allocate major cities to each of these two blocks and to divide the world’s population in proportions based on each city’s population.

The Referee can roll to determine relationships between the two blocks (or between all seven nations but decides against dealing with all these interrelationships – at least for now) and rolls 1D, choosing to apply no worldwide DMs and receives a 6: uprising, recordable as I+II=6. This is about as bad as it can get without a DM. The Referee chooses to treat this uprising result as a condition of disputed borders on a world with a relatively low and disperse population, meaning incursions and raids on mining or logging camps in sparsely occupied regions.

Determining government particulars by faction, for the first group of nations, centralisation is rolled as 2D +1 (government B) +1 (government 7 also applies) -1 (PCR 3)= 9 or a unitary government. Authority is 2D +4 (government B) +2 (unitary) = 13 or executive. Structure for government B is determined on a 1D roll resulting in 4 = Ruler. As it is a unitary government, this ruler is authoritative throughout the government. This government type applies to all three independent states within the world faction. The Referee decides that the first group of nations is led by now-hereditary ‘governors’ from the days of the world’s original colonisation (hereafter faction I is referred to as the ‘governorship faction’), each coded as UER.

For the second group, centralisation is 2D -1(government 3) +1(government 7) -1(PCR3) = 5 or a confederal government. Authority is 2D -3(government 3) -2(confederal) = 2, legislative. Structure for government 3 is rolled on 1D = 2, single council. As a confederal government, the Referee checks for structure for the executive and judicial functions, which are also rolled on 1D for government 3 and, as both result in single council the Referee rules it is the same council in charge of all three factions. The Referee decides the second faction is led by wealthy agricultural landowners (and faction II is hereafter referred to as the ‘oligarch faction’) who rule as senators. The four oligarchies are coded as CLS-ES-JS.

Each of these seven governments might have individual factions within them. This can get tedious, so the Referee decides to concentrate on the largest of the governorships. Rolling for factions within this government – without a DM+1 since it is effectively government B, not 7 – results in two factions. One faction is the ruling government (already established as I-B-G, but as this is the first ‘nation’ in the world faction, it can be I.I.I-B-G). The other faction rolls 9 for government – an impersonal bureaucracy. A roll of 8 determines that this faction’s strength is notable, so it can be recorded as I.I.II-9-N. A roll of 4 +2 = 6 for uprising, indicating ongoing low-level assassinations and active hostility between the governor and the bureaucracy or I.I.I+I.I.II=6.

Given these data points, the Referee considers a scenario akin to the latter period of many dynasties, where the bureaucracy has taken over the reins of government, in this case against a governor who has chosen to assert authority. Subtle but deadly power plays absorb the governor’s retainers and the ministerial offices are only ostensibly under the governor’s direct authority, and none of it benefits the people of the small realm.

The Referee could choose to apply this same factional result to the other governorships, or to roll separately for each, but deems it only necessary if the Travellers are likely to get involved in the politics of a specific realm.
```

### SECONDARY WORLD GOVERNMENTS
If other worlds within a system have a population, they also have a government, or at least Government code. The Referee is free to decide whether the secondary world is subject to an authority on the mainworld or is independent. This decision determines the method for assigning a Government code. If a mainworld is balkanised, at the Referee’s discretion the secondary worlds can either belong to a nation or faction of the mainworld or be independent. If they belong to a government on the mainworld, they are treated as a secondary government using the table for Case 1 with modifiers based on their owner’s government.

**Case 1:** Secondary worlds under the authority of the mainworld or a nation or faction on the mainworld, roll 1D:

**Table 73: Secondary World Government Codes**

| Result | Government Code |
| ------ | --------------- |
| 1      | 0               |
| 2      | 1               |
| 3      | 2               |
| 4      | 3               |
| 5+     | 6               |

**Die Modifiers for Secondary World Government Codes**
- Mainworld Government 0: DM-2
- Mainworld Government 6: DM + Mainworld Population

**Case 2:** If the secondary world is independent, either as a ‘nation’ on a balkanized world or as a freeport. The world’s government is independently rolled using the secondary world’s population. If the result is Government 6, the Referee can choose to reroll or change the status of the secondary world to a dependency of the mainworld.

### SECONDARY WORLD CLASSIFICATIONS
A secondary world may have a specific reason for its existence. One or more of the following classifications may apply to any inhabited secondary world:


```Example
Since the Zed system is balkanised, the Referee decrees a separate government for the desert moon of Aab V d – Zed Secundus – and based on its Population of 5, rolls 7 on 2D-7 + 5 to give it 5: feudal technocracy as a government. This government has two factions… which the Referee decides to leave for another day. 

As for classifications, Zed Secundus does not qualify as a colony, nor farming, mining, military base or penal colony. A roll of 10 makes it a freeport (but the Referee has already arbitrarily declared it so regardless of the roll) and a roll of 5 indicates it is not a research base.
```

**Table 74: Secondary World Categorization**

| Classification  | Code | Requirements                                                     | Roll                                                                                      |
| --------------- | ---- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Colony          | Cy   | Population 5+, Government 6                                      | Automatic if requirements met                                                             |
| Farming         | Fa   | Habitable zone, Atmosphere 4–9, Hydrographics 4–8, Population 2+ | Automatic if requirements met                                                             |
| Freeport        | Fp   | Government 0–5, TL8+                                             | 10+*, DM-2 if mainworld starport is A or B                                                |
| Military Base   | Mb   | Mainworld is TL8+ and is not Poor, Government 6                  | 12+, DM+4 if mainworld has bases, DM+2 if secondary world is Government 6                 |
| Mining Facility | Mi   | Mainworld is Industrial, Population 2+                           | Any planetoid belt with Population 2+ is a mining facility on a roll of 6+, Otherwise 10+ |
| Penal Colony    | Pe   | Mainworld is TL9+ and is Law Level 8+, Government 6              | 10+, DM+2 if Law Level 8+                                                                 |
| Research Base   | Rb   | Mainworld is Population 6+ and is TL8+ and is not Poor           | 10+, DM+2 if mainworld TL12+                                                              |

\*The Referee may choose to establish a freeport on a secondary world, regardless of the roll on the categorization chart.

## LAW LEVEL
A world’s Law Level is determined by rolling 2D-7 and adding the world’s Government code. This Law Level is an overall categorization of the extent and enthusiasm applied by the government to restricting the activities of its citizens and any Travellers who might visit. The main application of Law Level – in the minds of Travellers – is its restrictions on weapons and armor and on the chances of being stopped, searched, arrested and detained. But Law Level is more than just restrictions on weapons and prevalence of law enforcement. It also influences personal freedoms such as speech and assembly, and determines the amount of regulation in economic matters such as trade and contracts. Another consideration is the law’s applicability; in some societies the law applies equally to all, in others, either by statute or by custom, the law applies unequally.

On balkanized worlds, the Law Level presented in the UWP might not apply to the entire world but only to the government hosting or adjacent to the starport. The Referee is free to decide how to approach varying Law Levels, including which apply inside the starport itself. In the Charted Space universe, starports in the Third Imperium are subject to the Imperial law imposed by the starport authority. The actual Law Level is 1 but restrictions on disruptive behavior and open display of weapons and armor is usually stricter.
### LAW LEVEL TRAITS
#### Severity
From Minimal to Oppressive. This reflects the strictness of the laws and their enforcement
#### Scope
From Personal to Universal. This indicates whether laws apply differently based on status or universally to everyone
#### System
From Inquisitorial to Adversarial to Traditional. This describes the type of judicial system in place
#### Focus
From Economic to Criminal to Private to Personal Rights. This shows which area of law is most emphasized
#### Transparency
From Opaque to Transparent. This indicates how accessible the laws and legal proceedings are to the public.
#### Complexity
From Simple to Complex. This indicates how easy or difficult it is for the average citizen to understand the laws.
#### Flexibility
From Rigid to Flexible. This reflects how easily the laws can be adapted or reinterpreted.
### JUDICIAL SYSTEM
Different worlds have different judicial systems. They are most commonly based on an inquisitorial or an adversarial system but may also be based on religious doctrine, traditional beliefs or other cultural-specific factors. Some systems presume innocence, others presume guilt and in a few the applicability of law may depend on who committed it, who was victimized by it and where or when the crime took place.

Worlds with no established governments (code 0) may still have an associated Law Level but it is based on community standards and informal and often arbitrary proceedings. Such worlds have a judicial system categorised as none (N). Other worlds with an established government may have an overall Law Level of 0 but still have a judicial system and subcategories of Law Level may still apply to different aspects of the law.

**Table 75: System of Justice**

| 2D+DM | Code | Judicial System |
| ----- | ---- | --------------- |
| 5-    | I    | Inquisitorial   |
| 6–8   | A    | Adversarial     |
| 9+    | T    | Traditional     |

**Die Modifiers for System of Justice**
- Government 1, 8-C or F: DM-2
- Government D or E: DM+4
- Law Level A+\*: DM-4
- TL0: DM+4
- TL1–2: DM+2
- Judicial authoritative government: DM-2
\*This DM does not apply to Government D or E

**Inquisitorial:** Also called civil law or an administrative legal system. Statutes and procedures take precedent. A judge or group of officials investigate and determine if a crime has occurred. The proceedings are based on evidence collected and decisions of guilt are determined by the court officers.

**Adversarial:** Also called common law. Precedents and interpretations of the law are paramount. The judicial court acts as referee for a prosecutor and defendant who present evidence to determine guilt. Final determination may be by judicial court officials, a jury or some other method.

**Traditional:** Often religious or tribal law but potentially any other cultural practices or the idiosyncrasies of a dictator’s whims. Guilt is determined by an expert in the tradition or a local official. Guilt depends on interpretations of texts, local customs or potentially other practices including divination, trial by ordeal or even trial by combat. 

**Secondary System:** Even if a world’s justice system is adversarial or traditional in criminal and private matters, it may be inquisitional for strictly economic or regulatory offenses. For those worlds with adversarial or traditional systems, on a roll of 12+, DM+ Law Level, economic infractions are handled by an administrative court using an inquisitional procedure instead of the general judicial system.

### UNIFORMITY OF LAW
Laws do not always apply equally to all people, nor do they apply equally in all local jurisdictions. Laws can be personal, territorial or universal. 

**Personal:** Laws vary based on a person’s status. This may refer to social status, profession, caste, religion, race or another factor. In such systems, distinct Law Levels may apply to different parts of society, some laws may not apply at all to some people, others only to certain groups. Some groups may receive a DM to determination of guilt and/or sentencing. 

**Territorial:** Within the world or nation’s government, subdivisions or local governments are able to set specific laws that may not apply to the government as a whole. Often, such differing restrictions apply to only one or two subcategories of Law Level or may result in complications such as non-transferable contracts, licenses or permits. 

**Universal:** The same laws apply equally to all. Certain government structures have a tendency towards uniformity: 
- If a government structure is confederal, uniformity is always territorial (T)
- If a government structure is federal, uniformity is territorial (T) on a 1D roll of 1– 5 and personal (P) on a 6 

For a unitary government and for any territory within a confederal or federal government which has overall territorial uniformity, roll 1D on the Law Uniformity table:

**Table 76: Law Uniformity**

| 1D+DM | Code | Uniformity  |
| ----- | ---- | ----------- |
| 2-    | P    | Personal    |
| 3     | T    | Territorial |
| 4+    | U    | Universal   |

**Die Modifiers for Law Uniformity**
- Government 3, 5, or A+: DM-1
- Government 2: DM+1

The specific effects of personal and territorial law are left to the discretion of the Referee but may be related to cultural details of that world. In some cases, the entire judicial system may be different for varying groups or territories.

### PRESUMPTION OF INNOCENCE
The basic legal tenet of whether a suspect is assumed to be innocent until proven guilty, as opposed to being assumed guilty unless the judicial system is otherwise convinced, has a major impact on the outcome of legal proceedings. To determine if the principle of a presumption of innocence principle exists in criminal proceedings, rule 2D and subtract the world’s Law Level, with a DM+2 if the judicial system is adversarial:

**Formula: Presumption of Innocence**
$\text{Presumption of Innocence} = \text{2D} + \text{DMs}$
$\text{Exists if Presumption of Innocence is => 0}$

**Die Modifiers for Presumption of Innocence**
- Law Level: DM-Law Level
- Adversarial system: DM+2

Any result of zero or more indicates that the defendant is presumed innocent in the eyes of the law.

### DEATH PENALTY
Some legal systems have a strict prohibition against the death penalty. Others may demand it for the most trivial offense. The Referee may unilaterally decide whether a society accepts the death penalty for certain crimes, or may determine it randomly:

**Formula: Death Penalty**
$\text{Death Penalty} = \text{2D} + \text{DMs}$
$\text{Exists if Presumption of Innocence is => 8}$

**Die Modifiers for Death Penalty**
- Government 0\*: DM-4
- Law Level 9+: DM+4
\*This applies to formal legal processes, which may be non-existent on such worlds. Actual extra-judicial actions may result in death for the accused, whether proven guilty or not.

The Referee is free to impose culture-wide modifications to this roll or to change the result to a mind-wipe or ‘death of personality’ at higher Tech Levels.

### JUDICIAL SYSTEM PROFILE
A world, faction or nation’s judicial system can be recorded as:

**PSU-I-D**

Where:
- P = primary judicial system code (I, A or T)
- S = secondary judicial system code (whether different or not) for economic and private matters
- U = uniformity of law (P, T or U)
- I = presumption of innocence as a simple (Y)es or (N)o and D = death penalty, also (Y)es or (N)o. 

For instance, an adversarial system using an inquisitorial process for economic and private matters, with presumption of innocence, no death penalty and territorial variation can be recorded as AIT-Y-N, while as a unitary system, traditional in nature, with no presumption of innocence and subject to the death penalty would be TTU-N-Y.

### LAW LEVEL SUBCLASSIFICATIONS
The UWP Law Level code provides the basis for the severity of a world’s laws. Subcategories of Law Level include restrictions on weapons, economic law, criminal law, private law and personal freedoms. Each subcategory is based on a variance from this overall Law Level. Results of less than zero are treated as 0 and those above J (18) may be treated as J. Beyond Law Level C (12), law enforcement is broadly oppressive and its qualities are covered by the universal characteristics of the Law Level Effects: Criminal, Private and Personal table.

#### WEAPONS AND ARMOUR
This subcategory is not typically a distinct body of law but it covers a specific topic of great interest to Travellers. The weapons and armour banned at each listed Law Level are generally banned for civilian possession. Just because a weapon is not banned this does not mean it is freely available and public displays of even legally obtained weapons and armour are often restricted or frowned upon, and can draw unwelcome law enforcement scrutiny. The Central Supply Catalogue provides additional guidance on permitting and restrictions of categories of weaponry, these are abbreviated as (C#) in the weapons and armour banned column in the Law Level Effects: Weapons and Economics table at the Law Level at which they are completely banned for non-governmental purchase and use. The Referee may choose to keep the Law Level regarding weapons equal to the overall Law Level for clarity and to account for pre-existing expectations, or may choose to vary it as with other subcategories:

**Formula: Weapons and Armor Law Level**
$\text{Weapons and Armour Law Level} = \text{Overall Law Level} + \text{2D3-4} + \text{DMs}$

**Die Modifiers for Weapons and Armor Law Level**
- PCR 0-3: DM-1
- PCR 8+: DM+1

#### ECONOMIC LAW
Economic laws are often more regulatory than-actual criminal law and may be adjudicated by an-administrative or inquisitional process regardless of-general legal system. This category includes not only-financial crimes such as fraud and tax evasion but-also business regulation and reporting requirements,-permitting, zoning and licensing of commercial-activities. At lower Law Levels, many activities-are unregulated or lightly regulated and financial-transactions are not audited unless they are large or-suspected of violating tax codes or being involved in-criminal activity. At higher Law Levels, the bureaucratic-requirements for performing any economic activity may-include prior approval, supervision, real-time auditing-and issuing of multiple licenses and permits.

**Formula: Economic Law Level**
$\text{Economic Law Level} = \text{Overall Law Level} + \text{2D3-4} + \text{DMs}$

**Die Modifiers for Weapons and Armor Law Level**
- Government 0: DM-2
- Government 1: DM+2
- Government 2: DM-1
- Government 9: DM+1

#### CRIMINAL LAW
When someone commits what the government-considers a crime, they are subject to criminal law. This-law determines not only the extent of what is illegal but-the enforcement and legal proceedings that accompany-any violation of criminal law. The Crime Categories-section on page 169 provides examples of activities-that qualify for each level of crime. Violations of any-category could result in criminal law proceedings. At-Law Levels above C (12) nearly all legal proceedings-occur under the jurisdiction of the often arbitrary and-severe criminal legal system.

**Formula: Criminal Law Level**
$\text{Criminal Law Level} = \text{Overall Law Level} + \text{2D3-4} + \text{DMs}$

**Die Modifiers for Weapons and Armor Law Level**
- Inquisitorial legal system: DM+1

#### PRIVATE LAW
Some legal action is not initiated by the government-but by one individual against another. In this instance,-the legal action is covered by private law (sometimes-also called civil law). On some low Law Level worlds,-duelling or payment of blood money is an acceptable-way to settle a dispute – even over something that-would be considered a crime on more restrictive-worlds. Private law covers agreements between two-parties, including contracts, dispute resolution, tort law-and private or government arbitration regulations. At-the highest Law Levels, the government takes over-these private or regulatory proceedings, treating them-no differently than criminal law or arbitrarily imposing-settlements or penalties upon the two feuding parties.

**Formula: Private Law Level**
$\text{Private Law Level} = \text{Overall Law Level} + \text{2D3-4} + \text{DMs}$

**Die Modifiers for Private Law Level**
- Government 3, 5, or C: DM-1

#### PERSONAL RIGHTS
This subcategory covers freedoms enjoyed by the-individual. These can vary based on government and-culture but generally cover the rights of expression,-association and privacy. This can include the right to-dissent, to membership in a political association, to-travel freely or worship a particular religion. As Law-Levels in this category become oppressive, even rights-to think freely or exist may be restricted or eliminated.

**Formula: Personal Rights Level**
$\text{Personal Rights Level} = \text{Overall Law Level} + \text{2D3-4} + \text{DMs}$

**Die Modifiers for Personal Rights Level**
- Government 0 or 2: DM-1
- Government 1: DM+2

### LAW LEVEL PROFILE
A detailed Law Level is recorded as follows:

**O-WECPR**

Where:
- O = overall Law Level
- W = weapons and armor
- E = economic law
- C = criminal law
- P = private law
- R = personal rights.

If Law Level is personal or territorial, differing groups-and differing territorial jurisdictions may have differing-Law Levels or differing laws and penalties noted.

### CRIMINAL CONVICTION
In some cases, determination of guilt can depend-nearly as much on the legal system as to whether a-person is actually guilty of a crime. In addition to actual-evidence against the accused, factors such as legal-protections and procedures, potential corruption and-the skills of an advocate or prosecutor can factor into-conviction. The higher the Law Level, the less likely-the guilty will escape justice but also the more likely an-‘innocent’ – either someone who actually did not do it,-or someone that did not know watering flowers on a-Thursday was a crime – will be found guilty.

A Referee may choose to forgo or modify a roll for-the determination of guilt for adventure purposes but-if a random result is desired, a defendant can avoid-conviction on a 2D roll of 8+:

```Roll
Avoid Conviction on 8+: roll 2D + DMs
```

**Die Modifiers for Avoid Conviction Roll**
- Judicial system is adversarial: DM+2
- Judicial system has presumption of innocence: DM+2
- Defendant was caught ‘red handed’: DM-6
- Evidence of guilt is overwhelming: DM-4
- Evidence of guilt is circumstantial: DM-2
- The defendant did not actually commit the crime: DM+4
- Criminal Law Level: DM-Criminal Law Level
- In favor of the prosecution: DM-Advocate skill of prosecutor, judge, or traditional expert
- In favor of the accused: DM+Advocate skill if an advocate is allowed
- Additional DMs based on bribes or other interference in-the judicial system may also influence the conviction roll.

If a defendant is convicted, an appeal is possible on-a successful Difficult (10+) Advocate (1 week, EDU)-check. But in an inquisitorial judicial system, if the-Criminal Law Level is 7+, the government is able-to appeal an acquittal on an opposed Difficult (10+)-Advocate (1 hour, EDU) check. At the Referee’s-discretion, other types of legal systems may allow-the prosecution to appeal an acquittal, especially at-higher Law Levels. An appeal has the same chance-of conviction as the original roll but DMs may change-if an advocate manages to have evidence included or-excluded or additional external factors apply.

An admission of guilt or a plea bargain may allow a-negative DM on the sentencing roll.

### CRIME CATEGORIES
Governments may disagree on what constitutes a-crime and how serious it is. The culture section will-delve into some of these peculiarities but in general-certain activities constitute a categorisation of crimes-ranging from atrocities to the trivial. On some worlds,-trivial or insignificant crimes may not even be codified,-on others they may be an excuse to confine a person-indefinitely. The enforcement column of the crime-severity is the Law Level at which punishment for-a crime is always pursued. At lower Law Levels,-a perpetrator may escape with a warning on a-successful Advocate or Persuasion check.

The severity of the crime influences the penalty-imposed. Where applicable, if the law broken generally-relates to a specific restriction on a column of the-Law Level Effects tables, the difference between the-Law Level under which the item or activity in question-is prohibited and the world’s applicable Law Level-determines the DM on the Legal Penalty table for the-crime, e.g., possession of a weapon that is banned at-Law Level 2 on a Law Level 6 world results in a DM of-6 - 2 = +4 on sentencing.

**Table 77: Law Level Effects: Criminal, Private, and Personal**

|Code|Criminal Law|Private Law|Personal Rights|
|---|---|---|---|
|0|No formal legal system|No formal legal system|No restrictions|
|1|Grave and serious crimes prosecuted|Duelling restricted, contract law enforceable|Speech risking physical harm (e.g., yelling fire in a crowded theatre) prohibited|
|2|Moderate crimes prosecuted|Duelling prohibited|Registration of identity, libel prohibited|
|3|Minor crimes prosecuted|Private settlement of Moderate crimes prohibited|Group-related regulations (e.g., drinking age)|
|4|Petty crimes prosecuted|Private settlement of all crimes prohibited|Hate speech prohibited|
|5|Trivial crimes prosecuted|Public filing of all disputes and settlements|Mandatory identification papers|
|6|Public surveillance|Government venue required for all settlements|Public surveillance|
|7|Insignificant crimes prosecuted|Limits on all tort settlements|‘Offensive’ speech prohibited|
|8|Indefinite detention allowed|Government review of all settlements|No right to protect personal data|
|9|No effective right to counsel|Government approval for all settlements|‘Subversive’ speech prohibited|
|A (10)|Pre-emptive detention allowed|Government adjudicated arbitration required|Restrictions on movement and residency|
|B (11)|Arbitrary indefinite detention allowed|Arbitrary government adjudication, government approval of all contracts|Warrantless searches, government control of all information, routine surveillance of private activities|
|C (12)|Arbitrary verdicts without defendant participation|All civil proceedings transferred to criminal justice system|Unrestricted surveillance of private activities, group punishments|
|D (13)|Paramilitary law enforcement, thought crimes prosecuted|||
|E (14)|Fully-fledged police state, arbitrary executions or ‘disappearances’|||
|F (15)|Rigid control of daily life, gulag state|||
|G (16)|Thoughts controlled, disproportionate punishments|||
|H (17)|Legalised oppression|||
|J (18)|Routine oppression|

For general criminal activity crimes, the sentencing DM-is related to the crime’s severity as indicated on the-Crime Severity table. For instance, an armed robbery-on a world with Law Level 4 for criminal law would be-a moderate crime with a DM of the criminal Law Level-minus 2 or DM = 4 - 2 = +2. If, on that same world, the-economic Law Level was only 2, a moderate economic-crime such as major tax evasion would have a DM of-the economic Law Level minus 2 or DM = 2 - 2 = +0.

### CRIMINAL LAW PENALTIES
Conviction of a crime, whether by trial or government-fiat, will lead to sentencing. Depending on the judicial-system, the convict may attempt to use Advocate-skill or another skill such as Persuade to influence-the result, although an attempt to bribe or otherwise-influence a judge by a non-judicial means should-involve an adventure and not just be a roll of the-dice. Any negative DMs the convict can acquire, plus-those from the severity of the crime or particulars of-the judicial system, are applied to the 2D roll on the-Criminal Penalty table.


**Table 78: Crime Severity**

| Severity      | Enforcement | Examples                                                             | DM            |
| ------------- | :---------: | -------------------------------------------------------------------- | ------------- |
| Insignificant |      7      | Technical violation of possibly forgotten law causing no harm        | Law Level -10 |
| Trivial       |      5      | Littering, speeding violations, permit infractions                   | Law Level -8  |
| Petty         |      4      | Misdemeanour assault or fraud, false identity, licensing infractions | Law Level -5  |
| Minor         |      3      | Destruction of property, significant theft, minor tax evasion        | Law Level -3  |
| Moderate      |      2      | Assault causing serious injury, armed robbery, major tax evasion     | Law Level -2  |
| Serious       |      1      | Manslaughter, negligent homicide, major fraud                        | Law Level -1  |
| Grave         |      1      | Murder, extremely serious fraud or economic disruption, espionage    | Law Level +0  |
| Appalling     |      0      | Multiple murders, treason, possession of weapons of mass destruction | Law Level +2  |
| Horrific      |      0      | Major atrocity, use of weapons of mass destruction                   | Law Level +5  |

**Table 79: Criminal Penalty**

| 2D+DM | Penalty                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------ |
| 0-    | Dismissed or trivial                                                                             |
| 1–2   | Fine of 1D × Cr1000 (per offense or ton of contraband)                                           |
| 3–4   | Fine of 2D × Cr5000 (per offense or ton of contraband)                                           |
| 5–6   | Exile or a Fine of 1D × Cr10000 (per offense or ton of contraband)                               |
| 7–8   | Imprisonment for 1D months or exile or a fine of 2D × Cr20000 (per offense or ton of contraband) |
| 9–10  | Imprisonment for 1D years or exile                                                               |
| 11–12 | Imprisonment for 2D years or exile                                                               |
| 13–14 | Life imprisonment                                                                                |
| 15+   | Death*                                                                                           |

\*Life imprisonment or alternative most-severe punishment if the death penalty is prohibited.

**Die Modifiers for Criminal Penalty**
- Severity of crime: DM + Crime Severity Die Modification (see Crime Severity table: DM column)
- In favor of the prosecution: DM - Advocate skill of prosecutor, judge, or traditional expert
- In favor of the accused: DM+Advocate skill if an advocate is allowed
- As with conviction, additional DMs based on bribes-or other interference in the judicial system may also-influence the conviction roll.

A result of exile is usually only applicable to Travellers-not native to the world and generally results in an-immediate and permanent expulsion from the world,-although the Referee may limit the period to a set-duration such as 10 years or allow the Traveller to-reapply for entry after such a time has passed.

Some legal systems may allow an automatic appeal of-a death sentence; others will carry it out the same day-as the conviction.

### ECONOMIC LAW PENALTIES
Violations of economic laws are often handled by-administrative or specialized courts. Criminal violations-such as fraud or theft are considered under the criminal-justice system but many regulatory violations such-as improper permitting, licensing, failure to declare-profits or file paperwork are usually not handled in the-same manner as more serious crimes against people-or property. Only on worlds of extreme Law Levels-will these regulatory violations be considered by the-same methods as criminal law, although the Referee-should exercise some discretion: failure to comply with-zoning laws is one thing, illegal dumping of dangerous-chemicals is another matter, most likely criminal.

**Table 80: Economic Penalty**

|2D+DM|Penalty|
|---|---|
|0-|Dismissed or trivial|
|1–2|Fine of 1D × Cr1000 (per offense or ton of contraband)|
|3–4|Fine of 2D × Cr5000 (per offense or ton of contraband)|
|5–6|Fine of 1D × Cr10000 (per offense or ton of contraband)|
|7–8|Fine of 2D × Cr20000 (per offense or ton of contraband)|
|9–10|Imprisonment for 1D months or exile and a fine of 2D × Cr50000 (per offense or ton of contraband)|
|11–12|Imprisonment for 1D years or exile and a fine of 2D × Cr100000 (per offense or ton of contraband)|
|13–14|Imprisonment for 2D years or exile and a fine of 2D × Cr500000 (per offense or ton of contraband)|
|15+|Imprisonment for 4D years or exile and a fine of 2D × MCr1 (per offense or ton of contraband)*|

\*If the world’s Law Level is 9+ or above and allows the death penalty, it could be imposed on economic crimes at the Referee’s discretion.

The process for determining guilt is identical to that for-criminal law but fines are possibly more prevalent and-extensive than for criminal matters. Using the same-DMs (including the differences between economic Law-Level proscription and the actual offense) roll 2D on the-Economic Penalty table.

As with criminal proceedings, appeals may be possible,-although the state may usually only appeal in an-inquisitorial system.

### PRIVATE LAW PENALTIES
Private law involves disputes between two parties. On-most worlds the government’s legal system acts as a-Referee in these matters but on the extremes of low and-high Law Level, the parties are either on their own or are-subject to the whims of the judicial system. Between the-extremes of duelling and government fiat, private law,-even in an administrative or traditional system, comes-down to a contest between two advocates. The offended-party or plaintiff must make an opposed Average (8+)-Advocate (INT or EDU) check, with DMs imposed by-the Referee based on any applicable conditions. If-punitive damages apply, the government may limit any-amount above actual damages caused, especially at-Law Level 7 or more. In generally, the higher the Effect-of a successful challenge, the greater the chances for,-and amount of, punitive damages that may apply. The-Economic Penalty table can act as guidance.

If an offended party fails to prove a case and-sometimes even if they do, they may be countersued-and will suffer a DM equal to the Effect of the failure (or-success) in such a case.

```Example
Zed Prime is a balkanised world. Its largest factions-have a Government code of B but the world’s overall-Law Level was determined to be 6 prior to delving-into the details of these factional governments. On a-balkanised world, the UWP Law Level is considered-to be that of the government nearest to or hosting the-starport. In this case, despite a Government code of B-generating a Law Level of 6 (by rolling a 2) it is more-likely that one of the nations of the oligarch faction-(Faction II), with a Government code of 3 has a Law-Level of 6 (rolling a 10 is three times as likely as rolling-a 2), so the Referee arbitrarily assumes one of these-oligarch governments, the largest, is host to the world’s-downport (if any highports exist, they will be determined-later, in the starport section).

Moving through the process with an oligarch-government of CLS-ES-JS, the roll for system-of justice has no DM and rolling 6 results in an-adversarial justice system. A roll of 12 makes the-secondary justice system for economic and private-law inquisitional. A confederal system is always-territorial with regards to law but within each territory,-the roll for uniformity of law on 1D results in a 3 with-DM-1 for Government code of 3 equals 2, which is-personal: the law does not apply equally to everyone.-In a self-perpetuating oligarchy, it takes very limited-imagination to wonder who benefits from this. For-presumption of innocence, a 2D roll of 10 – the Law-Level(6) + 2 for adversarial = 6, a positive result, so-the justice system assumes a defendant is innocent.-The death penalty roll of 3 has no relevant DMs,-so there is no death penalty. The oligarch judicial-system is AIP-Y-N.

But moving on for Law Level subclassifications, the-Referee rolls 2D3-4 from an overall Law Level of 6-for each subcategory and adds any relevant DMs,-resulting in 6, 8, 8, 4, 6 – stricter laws for economic-and criminal malfeasance but looser restrictions on-private law. The Referee arbitrarily determines that-the oligarchs and their families get better breaks on-all of these by two Law Levels and offworlders (e.g.,-Travellers) operate at a two Law Level disadvantage in-all categories, with regular citizens subject to the rules-as written. The oligarch government with jurisdiction-of the startown of Zed Prime’s downport has a Law-Level of 6-68846 but for Travellers, it is 8-8AA68. For-the wealthy elite it is 4-46624 even before their highly-skilled hired advocates get involved and many of the-oligarchs’ private matters are handled outside the-courts, including infractions that might be treated as-criminal if they had been committed by others.

Repeating the process for the governorships results-in a separate overall Law Level rolled as A (10), an-adversarial law system, also with an inquisitorial-secondary system and a personal uniformity – by-chance exactly the same as the oligarchies. The-system also has a presumption of innocence but-does have a death penalty: AIP-Y-Y. While likely-based on the same original underlying principles,-this faction’s laws are stricter, profiled as A-989B9,-with relatively lenient economic rules equivalent to-those of the oligarchies – perhaps as the result of-some trade agreements. The Referee decides that as-with the oligarchies, the governorships have a Law-Level two levels more lenient for elites (in this case-government officials) and two levels more severe-for Travellers – at an adjusted base Law Level of C,-outsiders are not welcome at all – no wonder it is one-of the oligarchies that hosts the downport.
```

### SECONDARY WORLD LAW LEVELS
Secondary world Law Levels are based on Government-code and allegiance.

#### Case 1: Captive Governments
If the secondary world has a captive Government (6),-it will tend to have a Law Level equal to the owning-government or even higher. Roll 1D:

**Table 81: Captive Secondary World Law Levels**

| 1D  | Result                                                                 |     |
| --- | ---------------------------------------------------------------------- | --- |
| 1–2 | Law Level is rerolled for a Government 6 world (2D-7 + 6)              |     |
| 3–4 | Law Level is equal to the owning mainworld government’s Law Level      |     |
| 5   | Law Level is equal to the owning mainworld government’s Law Level +1   |     |
| 6+  | Law Level is equal to the owning mainworld government’s Law Level + 1D |     |

**Die Modifiers for Captive Secondary World Law Levels**
- If the secondary world is a penal colony or military base: DM+1
#### Case 2: Government Codes 1-3 Under Mainworld Authority
If the secondary world is under the authority of a-mainworld government and has a Government code-1–3, the world may be subject to the same laws or its-own. Roll 2D minus the mainworld Government code:
- If the result is zero or negative, the Law Level of-the mainworld applies.
- If the result is positive, Roll 1D: on 1–3 the Law-Level of the world is equal to this 1D result; on-a 4–6, the Law Level is rolled again with the-secondary world’s Government code as the DM.

#### Case 3: Other
For all other Government codes, roll normally for-the Law Level based on the Government code. The-Referee may choose to apply a DM-1 to Law Level rolls-for worlds that host a freeport.

```Example
Zed Secundus has a Government code of 5 and is-entirely independent of Zed Prime. For case 3, a 2D-roll of 5 with a DM-1 for the freeport results in 5-7 + 5-- 1 = 2 for an overall Law Level of 2. The Referee can-proceed through details of the justice system if a trip to-Zed Secundus is in the Travellers’ future.
```

## TECHNOLOGY
A world’s Tech Level represents the technology that is-commonly available and representative of the world’s-infrastructure. Depending on local population and-capabilities, it may represent what can be produced on-the world, or it might, especially on lower population-worlds, be more indicative of what technology is-imported and what locals can expect to purchase and-get repaired or replaced if it breaks down.
### TECHNOLOGY TRAITS
#### Availability
From Scarce to Ubiquitous. This trait reflects how easily accessible a given technology is within the society.
#### Integration
From Isolated to Integrated. This indicates how seamlessly technology is incorporated into daily life and various sectors.
#### Complexity
From Simple to Advanced. This measures the level of sophistication and understanding required to use and maintain the technology.
#### Standardization
From Proprietary to Standardized. This trait indicates the degree to which technologies adhere to common standards, affecting interoperability and compatibility.
#### Focus
From Military to Civilian. This shows whether technological development is primarily driven by military needs or civilian applications.
#### Pervasiveness
From Limited to Widespread. This measures the extent to which technology has spread throughout the population and geography.
#### Obsolescence
From Rapid to Slow. This indicates how quickly technology becomes outdated and replaced by newer innovations.
### DETERMINING UWP TECH LEVEL
The UWP or overall Tech Level of a world is determined-by rolling 1D and adding DMs from the Tech Level-Modifiers table.

**Table 82: Tech Level Modifiers**

|Code|Starport|Size|Atmosphere|Hydrographics|Population|Government|
|---|---|---|---|---|---|---|
|0|—|+2|+1|+1|—|+1|
|1|—|+2|+1|—|+1|—|
|2|—|+1|+1|—|+1|—|
|3|—|+1|+1|—|+1|—|
|4|—|+1|—|—|+1|—|
|5|—|—|—|—|+1|+1|
|6|—|—|—|—|—|—|
|7|—|—|—|—|—|+2|
|8|—|—|—|—|+1|—|
|9|—|—|—|+1|+2|—|
|A (10)|+6|—|+1|+2|+4|—|
|B (11)|+4|—|+1|—|+4|—|
|C (12)|+2|—|+1|—|+4|—|
|D (13)|—|—|+1|—|—|-2|
|E (14)|—|—|+1|—|—|-2|
|F (15)|+1|—|+1|—|—|—|
|G (16)|—|—|+1|—|—|—|
|H (17)|—|—|+1|—|—|—|
|Y|—|—|—|—|—|—|
|X|-4|—|—|—|—|—|

The overall Tech Level is a value typical of the area-around the starport and major cities. Some worlds may-have less developed regions, especially if balkanized.-Certain types of technology may be supported better-or worse on a particular world. A detailed Tech Level profile of a world covers subcategories relating to-quality of life, transportation, military and novelty-technologies, the latter being items not common but-occasionally present through imports, prototypes or-artefacts from a different era.

**Table 83: Tech Level Categories: Quality of Life**

|TL|Energy|Electronics|Manufacturing|Medical|Environmental|
|---|---|---|---|---|---|
|0|Muscle|Mind|Hand tools|Herbs|Early settlement|
|1|Waterwheel|Abacus, heliograph|Milling machines|Diagnosis|Bridges, cities|
|2|Windmill|Clockwork, printing|Cottage industry|Anatomy|Land reclamation|
|3|Steam, early battery|Telegraph|Factories|Early surgery|Gas lighting|
|4|Electricity|Telephones|Assembly lines|Anaesthetics|Hydroelectric dams|
|5|Internal combustion|Radio, vacuum tubes|Heavy industry|X-ray diagnosis|Skyscrapers|
|6|Fission|Television, transistors|Basic automation|Tissue bioreactor|Air-conditioning|
|7|Basic solar|Microchips, networks|Cad machines|Organ transplants|High yield crops|
|8|Basic fusion,Basic power cell|Mobile computer,Basic robot brains|Basic fabs,Orbital factories|Basic clones,Early cybernetics, gene editing|Arcologies,Orbital spin cities|
|9|Improved solar|Core computers,Holographic projectors|External fabs|Spare part clones|Underwater cities,early weather control|
|10|Basic fusion+, improved power cell|Advanced robotbrains|Improved fabs,Robotic factories|Hibernation,accelerated clones|Grav cities|
|11|Advanced solar|—|—|Brain transplants|Weather control|
|12|Improved fusion,advanced power cell|Very advanced robotbrains, basic meson comms|—|Full body cyborgs|Early terraforming|
|13|Improved fusion plus|Neural linkintegration|Enhanced fabs,Basic nanobots|Quick clones|Nanobotconstructors|
|14|Collectors|Advanced mesoncomms|—|Reanimation|Mobile grav cities|
|15|Advanced fusion|Self-aware brains|Improvednanobots|Anagathics|Improvedterraforming|
|16|—|Conscious Computers|—|—|

**Table 84: Tech Level Categories: Transportation and Military**

|TL|Land|Sea|Air|Space|Personal Military|Heavy Military|
|---|---|---|---|---|---|---|
|0|Cart|Canoe, Raft|—|—|Club, Spear, Bow|—|
|1|Wagon|Galley|—|—|Blades, Crossbow|Catapult|
|2|Stagecoach|Sailing Ship|—|—|Early Firearm|Early Cannon|
|3|Early Train,Bicycle|EarlySteamship|Balloon|—|Foil, Musket|Cannon|
|4|Train|Steamship|Early Airplane,Dirigible|—|Revolver, Shotgun|Artillery|
|5|Automobile|Submersible|Airplane|—|Rifle, Machinegun|Heavy Artillery, Tank|
|6|AmphibiusVehicle|Hydrofoil,Nuclear Ship|Helicopter,Supersonic Jet|Rocket|Auto Rifle,Rocket Launcher|Missile,Nuclear Weapons|
|7|High Speed Train|Hovercraft|Vtol|Spaceplane|Assault Rifle|Autocannon|
|8|AutonomousCar, Walker|AutonomousShip|AutonomousPlane,Hypersonic Jet,Air/Raft|Early Grav|Stun Weapons|Precision Weapons|
|9|SuperconductingMonorail Train|—|Grav Car|M-Drive,Jump-1|Laser Rifle|Laser Gun, GravTank, Rail Gun|
|10|Merges With Air|Merges WithAir|Universal GravVehicles|Beanstalk|Advanced Rifle|Plasma Gun,Crystaliron|
|11|—|—|—|Jump-2|Combat Armour|—|
|12|—|—|Grav Belt|Jump-3|Gauss Rifle,Plasma Gun|Gauss Cannon|
|13|—|—|—|Jump-4|Battledress|Fusion Gun|
|14|—|—|—|Jump-5|Fusion Gun|BondedSuperdense|
|15|—|—|—|Jump-6|—|Meson Gun,BlackGlobe|
|16|—|—|—|—|

These subcategories have upper and lower-bounds based on the general UWP Tech Level.-Interdependencies prevent too broad a divergence, with-modifiers to the actual Tech Level subcategory value-based on a number of factors, including chance. A-Referee should not feel compelled to create Tech Level-subcategories for every world the Travellers might visit-but it is a useful tool to provide specific detail, allow for-anomalies in local product availability or to explain why-desert nomads are leading their pack animals across a-street crowded with autonomous vehicles and robots.-In the sections below, all fractional Tech Level values-are rounded down.

Common devices and their capabilities (except novelty)-are listed in the tables.

Prototype and early prototype items may be available-up to two Tech Levels lower than listed in the-tables but such objects should be rare, expensive-and unreliable. See page 10 of the Central Supply-Catalogue for prototech rules.

### MINIMAL SUSTAINABLE TECH LEVELS
Many worlds are hostile enough to require-technology to survive. In general, a world cannot-sustain a population unless it meets minimum Tech-Level limits based on environment. In some cases,-the world can survive at one or two Tech Levels-lower than the limits indicated in the Tech Level-and Environment table but use of such prototype or-jury-rigged equipment makes most of these worlds-economically unviable and prone to the dangers-of life support failures. These Tech Level limits-apply more strictly to both the high common and-environment Tech Level subcategories but the low-common Tech Level should be no more than two-below this minimum as well for the world to prosper.

**Table 85: Tech Level and Environment**

| <br><br>Environment     | Minimum<br>Tech<br>Level |
| ----------------------- | :----------------------: |
| Atmosphere 0, 1 or A    |            8             |
| Atmosphere 2, 3, D or E |            5             |
| Atmosphere 4, 7 or 9    |            3             |
| Atmosphere B            |            9             |
| Atmosphere C            |            10            |
| Atmosphere G or H       |            14            |
| Habitability rating 3–7 |            3             |
| Habitability rating 1–2 |            5             |
| Habitability rating 0   |            8             |

Atmosphere F has a minimum requirement of at least TL8, possibly TL10 or more depending on specific conditions. If multiple factors apply to a world, the highest minimum Tech Level applies.

### TECH LEVEL MODIFIERS (TLM)
A Tech Level modifier (TLM) 2D roll applies to each subcategory, randomizing differences between the subcategories. When a Tech Level formula specifies adding a modifier with the notation TLM, determine the modifier using the following table:

**Table 86: Tech Level Modifier (TLM) **

| <br>2D | TL<br>Modifier |
| :----: | :------------: |
|   2    |       -3       |
|   3    |       -2       |
|   4    |       -1       |
|   5    |       0        |
|   6    |       0        |
|   7    |       0        |
|   8    |       0        |
|   9    |       0        |
|   10   |       +1       |
|   11   |       +2       |
|   12   |       +3       |

### TECH LEVEL BOUNDS
Each of the various Tech Level subcategories has defined upper and lower bounds. If any subcategory result is outside these bounds, the subcategory is instead equal to the bound it violated. All bounds are rounded down.

### UPPER AND LOWER TECH LEVELS
Many procedures for determining the upper bounds of Tech Levels for various subcategories of technology allow for these Tech Levels to increase above the listed UWP Tech Level and potentially above the local polity maximums established within a certain universe. For instance, TL15 is the Charted Space maximum for the Third Imperium in 1105. The Imperial wide upper bounds limit for any Tech Level subcategory is one greater than the overall maximum for that polity, e.g., in the Third Imperium in the year 1105, the global upper bounds would be TL16. This Tech Level limit does not apply to the novelty TL upper bounds but the Referee should have some rationale for the existence of rare very high technology items. In Charted Space, these are often Ancient artifacts and subject to government confiscation if discovered, whether they still function or not.

In some universes, certain governments or regions may have a lower bound for Tech Level. This could result from a close-knit community with a broad or long-standing distribution of technology or from a milieu where settlements are mostly new outposts established and supported by a homeworld. In these cases, high technology may be supported by fabricators even on low population or isolated worlds. In general, as a region matures and expands, some societies will fall behind or regress in technology, either by circumstance or choice. Regardless of the DMs for determining Tech Levels, Referees may set and/or override these limits as they see fit.
### HIGH AND LOW COMMON TECH LEVELS
For most items, the highest technology generally available on a world is its high common Tech Level. This is always the same as the overall Tech Level specified in the world’s UWP. Unless specified otherwise, is always the Tech Level used as a basis for Tech Level DMs.

**Formula: High Common Tech Level**
$\text{High Common TL} = \text{UWP TWL}$

The low common Tech Level is the floor Tech Level of current capabilities and equipment. It does not preclude the continued operation of lower tech items but anything newly purchased or assembled would be built at no less than the low common Tech Level standard, unless it was an attempt to make an authentically-produced copy of an antique. The low common Tech Level is equal to:

**Formula: Low Common Tech Level**
$\text{Low Common TL} = \text{UWP TWL}$

Upper bound: High Common TL
Lower bound: High Common TL ÷ 2

**Die Modifiers for Personal Rights Level**
- Population 1–5: DM+1
- Population 9+: DM-1
- Government 0, 6, D or E: DM-1
- Government 5: DM+1
- Government 7: DM-2
- PCR 0-2: DM-1
- PCR 7+: DM+1

### BALKANISED GOVERNMENT TECH LEVELS
If a world has a balkanized government, any particular government on the world could have a high common TL equal to a value between the world’s high and low common values. For all nations except the one hosting or adjacent to the starport:

**Formula: Non-Starport Hosting Nation High Common Tech Level**
$\text{Non-Starport Hosting Nation High Common TL} = \text{World High Common TL}-2 + \text{TLM}+\text{DMs}$

Upper bound: World High Common TL
Lower bound: World Low Common TL

**Die Modifiers for Non-Starport Hosting Nation High Common Tech Level**
- Government 0, 6, D or E: DM-2
- Government 5: DM+2

**Formula: Non-Starport Hosting Nation Low Common Tech Level**
$\text{Non-Starport Hosting Nation Low Common TL} = \text{World Low Common TL}+\text{DMs}$

Upper bound: World High Common TL
Lower bound: World Low Common TL

**Die Modifiers for Non-Starport Hosting Nation High Common Tech Level**
- Government 0, 6, D or E: DM-2
- Government 5: DM+2
- PCR 7+: DM+1

### QUALITY OF LIFE TECH LEVEL SUBCATEGORIES
The five quality of life Tech Level subcategories cover the basics of civilization on a world. The subcategories are energy, electronics, manufacturing, medical and environmental. These are determined separately with the following formulas:
#### Energy Tech Level
This subcategory determines the devices available on a world to produce or store energy.

**Formula: Energy Tech Level**
$\text{Energy TL} = \text{High Common TL}+\text{TLM}+\text{DMs}$

Upper bound: High Common TL × 1.2
Lower bound: High Common TL ÷ 2

**Die Modifiers for Energy Tech Level**
- Population 9+: DM+1
- Industrial: DM+1
#### Electronics Tech Level
This broad subcategory covers available electronic equipment ranging from computers (mechanical at lower Tech Levels), to sensors, to communications devices and robots.

**Formula: Electronics Tech Level**
$\text{Electronics TL} = \text{High Common TL}+\text{TLM}+\text{DMs}$

Upper bound: Energy TL + 1
Lower bound: Energy TL - 3

**Die Modifiers for Energy Tech Level**
- Population 1-5: DM+1
- Population 9+: DM-1
- Industrial: DM+1
#### Manufacturing Tech Level
The industrial and production capabilities of a world are based on this subcategory.

**Formula: Manufacturing Tech Level**
$\text{Manufacturing TL} = \text{High Common TL}+\text{TLM}+\text{DMs}$

Upper bound: greater of Energy TL or Electronics TL
Lower bound: Electronics TL - 2

**Die Modifiers for Manufacturing Tech Level**
- Population 1-6: DM-1
- Population 8+: DM+1
- Industrial: DM+1
#### Medical Tech Level
A world’s medical practices can vary greatly based on the knowledge of biology and access to enabling technology.

**Formula: Medical Tech Level**
$\text{Medical TL} = \text{Electronics TL}+\text{TLM}+\text{DMs}$

Upper bound: Electronics TL
Lower bound: The higher of 0 or the system’s starport class Tech Level DM: 6 for A, 4 for B and 2 for C.

**Die Modifiers for Medical Tech Level**
- Rich: DM+1
- Poor: DM-1
#### Environmental Tech Level
The environmental subcategory covers the living conditions and construction capabilities of a world. The minimal sustainable Tech Level is tied to this subcategory, as are the Unusual City types on page 154. If the world’s habitability rating is not computed, this subcategory can be set to the minimum sustainable level.

**Formula: Environmental Tech Level**
$\text{Environmental TL} = \text{Manufacturing TL}+\text{TLM}+\text{DMs}$

Upper bound: Energy TL
Lower bound: Energy TL - 5

**Die Modifiers for Environmental Tech Level**
- Habitability rating is less than 8 DM = 8-Habitability Rating

### TRANSPORTATION TECH LEVEL SUBCATEGORIES
Transportation can occur by land, sea, air or space. Obviously, a world with no water has no sea transportation and one without a substantial atmosphere will not develop air transportation until the advent of rockets or grav vehicles. Eventually, land, sea and air transportation merges as grav technology becomes ubiquitous at TL10 or 11. Although grav vehicles are technically able to reach orbit, they are rarely capable of interplanetary flight and definitely incapable of interstellar flight, so a distinction between air and space travels persists even at higher Tech Levels.
#### Land Transport Tech Level
Travel over land begins with foot and animal power and continues over roads, rails and terrain until supplanted by grav lifter technology. Even worlds with no land surface may have short-ranged vehicles that travel within their cities.

**Formula: Land Transport Tech Level**
$\text{Land Transport TL} = \text{Energy TL}+\text{TLM}+\text{DMs}$

Upper bound: Energy TL
Lower bound: Energy TL - 5

**Die Modifiers for Environmental Tech Level**
- Hydrographics A (10): DM-1
- PCR 0-2: DM+1
#### Water Transport Tech Level
Water transport is reliant on a navigable liquid somewhere on the world’s surface or in some exotic location such as subterranean oceans under ice or rock.

**Formula: Water Transport Tech Level**
$\text{Water Transport TL} = \text{Energy TL}+\text{TLM}+\text{DMs}$

Upper bound: Energy TL
Lower bound: Electronics TL - 5, or 0 if Hydrographics = 0

**Die Modifiers for Environmental Tech Level**
- Hydrographics 0: DM-2
- Hydrographics 8: DM+1
- Hydrographics 9+: DM+2
- PCR 0-2: DM+1
#### Air Transport Tech Level
At lower Tech Levels air transport is impossible or impractical. Grav vehicles begin to be possible at TL8 and become dominant by TL10 or 11 regardless of atmosphere, although special circumstances such as a highly corrosive atmosphere which requires subterranean rail links between cities may contradict this. The upper bound for air travel is normally the world’s energy TL, although a Referee may allow worlds with dense or very dense atmospheres to use energy TL+1 as an upper bound. The lower bound is generally energy TL - 5, although worlds without a viable atmosphere can only use land or space transportation prior to TL8. For those worlds, the lower bound and actual air transport TL are both 0.

**Formula: Air Transport Tech Level**
$\text{Air Transport TL*} = \text{Energy TL}+\text{TLM}+\text{DMs}$
$\text{*Automatically 0 if Atmosphere 0 and TL 5-}$

Upper bound: Energy TL but see text above
Lower bound: Electronics TL - 5, but see text above

**Die Modifiers for Environmental Tech Level**
- Atmosphere 0–3, or E and TL0–7: DM-2
- Atmosphere 4 or 5, and TL0–7: DM-1
- Atmosphere 4 or 5, and TL0–7: DM+1

#### Space Transport Tech Level
Spaceflight covers surface to orbit, interplanetary and interstellar capabilities. Regardless of Tech Level, at the Referee’s discretion, the world has no access to jump drive technology if its starport is not Class A; this is more likely to be true in more isolated regions. In regions closer to civilisation, a world with TL9+ and a Class B starport (or possibly worse) may be able to build starships at a government or military-owned shipyard not associated with the starport but such ships would not be available for commercial purchase.

**Formula: Space Transport Tech Level**
$\text{Space Transport TL} = \text{Manufacturing TL}+\text{TLM}+\text{DMs}$

Upper bound: lesser of Energy TL or Manufacturing TL
Lower bound: lesser of Energy TL - 3 or Manufacturing TL - 3

**Die Modifiers for Environmental Tech Level**
- Size 0, S, or 1: DM+2
- Population 1–5: DM-1
- Population 9+: DM+1
- Starport Class A: DM+2
- Starport Class B: DM+1

In isolated regions, the Referee may wish to set a minimum space transport TL requirement for a world to have a Class A or Class B starport and to keep associated DMs for its UWP TL. In such a situation, a Class A should have at least TL9 and a Class B at least TL8 or two lower (7 and 6, respectively) if allowing for early prototype designs. If the world cannot meet those limits, the ports can be downgraded and the Tech Levels all recomputed – this may result in a downward spiral with a world’s population relegated to a primitive existence or extinction. For more suggestion on isolation limits, the Referee can reference page 21 of the Sector Construction Guide.

### MILITARY TECH LEVEL SUBCATEGORIES
Military technology is a subset of technologies presented in the quality of life and transportation sections but as with the weapon limitations in the Law Level subcategories, they are worth detailing separately as they may impact a Traveller campaign in more significant ways than the workings of solar farms and industrial facilities. military technology has two subcategories: personal military and heavy military.

#### Personal Military Tech Level
Weapons and armor that can be carried or worn, from knives and discreet cloth armor to fusion guns and battle dress are all covered by personal military technology. These are the items capable of being manufactured or supported locally. Even if the Travellers cannot purchase such things, they may encounter those so equipped.

**Formula: Personal Military Tech Level**
$\text{Personal Military TL} = \text{Manufacturing TL}+\text{TLM}+\text{DMs}$

Upper bound: Electronics TL
Lower bound: 0, or Manufacturing TL if the weapons and armor Law Level = 0

**Die Modifiers for Environmental Tech Level**
- Government 0 or 7: DM+2
- Law Level 0 or D+: DM+2
- Law Level 1-4, or 9–C: DM+1

On a world with Government code of 7, the DM+2 applies to all nations, regardless of their local government, but any Population or Law Level DMs are specific to nations
#### Heavy Military Tech Level
The equipment in the category of heavy military includes armored vehicles and any weapons mounted upon them and larger weapons including artillery, missiles, heavy energy weapons and weapons of mass destruction. These are most likely only available to the armed forces of a world or licensed mercenary units.

**Formula: Heavy Military Tech Level**
$\text{Heavy Military TL} = \text{Manufacturing TL}+\text{TLM}+\text{DMs}$

Upper bound: Manufacturing TL
Lower bound: 0

**Die Modifiers for Environmental Tech Level**
- Population 1-6: DM-1
- Population 8+: DM+1
- Government 7, A, B or F: DM+2
- Law Level D+: DM+2
- Industrial: DM+1

On a world with Government code 7, this government DM applies regardless of individual Government codes but all other DMs including any additional Government code DM are specific to nations.

### NOVELTY TECH LEVEL SUBCATEGORY
Higher Tech Level novelty items sometimes exist on a world, often as a result of imports, local prototyping or some unique circumstances such as the previous existence of a local higher Tech Level culture. Novelty items do not have bounds in a normal sense. They may have availability DM, but since they are not locally manufactured, at least not in bulk, they do not have set limits. Several factors control the setting of the novelty Tech Level including:
- For worlds that do not have a Class X starport and are in or near interstellar civilizations, the Tech Level of novelty items is at least equal to the highest Tech Level of any industrial or rich worlds with Class A starports within the same subsector or six parsecs. 
- Local industry often creates prototypes or early prototypes of ‘cutting edge’ items not available in commercial qualities. The novelty Tech Level for these locally produced items of any subcategory can be equal to the Tech Level of the highest subcategory TL. These items are usually only available at exorbitant prices, are often of questionable reliability and only available up to two Tech Levels above any regional maximum upper bound. 
- A previous fallen culture, either recent or ancient, may have relic technology. These items will become increasingly rare with age and usually do not include an instruction or repair manual, so reliability and usage can become an adventure for the Traveller. 
- A world that otherwise does not have a Tech Level high enough to reach the minimal sustainable Tech Level should have relic technology at least advanced enough to explain its survival, even if it is a prototype developed at two Tech Levels less than normally required. For instance, a vacuum world, which would normally require TL8, should have at least some access to TL6 early prototypes of TL8 equipment, even if their high common Tech Level was only TL2 and the world had no access to imports; the locals might have only rote or ritual understanding of how to keep the ‘Great Machine of the Tunnels’ operating and no method to duplicate it but it would still exist.

**Formula: Novelty Tech Level**
**To summarize:**
**Novelty Tech Level** = Highest of nearby rich or industrial Class A port world, or Highest subcategory Tech Level, or Previous culture Tech Level, or Survivable early prototype tech required to meeting environmental limits

### TECH LEVEL PROFILE

**Tech Level Profile = H-L-QQQQQ-TTTT-MM-N**

```Example
Zed Prime has a UWP TL of 8. Its habitability rating of 7 imposes a requirement of TL3 for its minimum sustainable Tech Level; this is not an issue. The UWP TL becomes the high common TL. The low common TL is bound between 8 and 8 ÷ 2 = 4. The Government code of 7 provides a DM-2 to this roll, which applies to the world as a whole. A 2D roll of 7 on the TLM chart provides no DM, so the low common TL for the world is 8 + 0 - 2 = 6. The various nations of Zed Prime could have a high common TL of 6–8, but the low common is no lower than 6. The rest of this example will proceed using the oligarch nation closest to the starport (faction II, nation I or II.I – it should have a name – the Referee picks ‘Zenobia’ to stick with the ‘Z’ theme), which has a PGL of 636 – but for population Tech Level DMs, it uses world’s Population Code of 7.

For transportation TLs, Land transport TL is bound at 8 and 4 with just the TLM, a 4, providing a DM-1, so land transport TL is also only TL7. Sea transport TL can be between 8 and 4 with a TLM roll of 10 giving +1, but it is still limited by energy to TL8. Air transport TL has no atmosphere-related DMs, so it has a TL just equivalent to its energy TL value with a possible TLM (none) and becomes TL8 – so at least air/rafts are present, even if boats and cars stick to the world’s roads and waterways. Space transport TL is bound by 8 and 5 and is rolled as TL8.

Personal military TL is bound by 9 and 0. The local government benefits from the balkanised status of the world, a DM+2, and a TLM gives it +1, which would be TL11 but it is bound to TL9 maximum. Heavy military gains DM+2 but it is bound by 8 and 0, after the TLM roll of 7, it remains TL8.

Finally, the novelty TL. The Referee rules that a TL12 world exists nearby, and imports do occur. If that world had not been present, the multiple local subcategories of TL9 could produce some TL9 prototypes of other subcategory items. The Referee rules no previous local culture has left functioning higher tech relics for recovery. So, the novelty TL stands at TL12 or C. The Tech Level profile for Zed Prime is 8-6-89897-7888- 98-C. This applies to Zenobia, the nation nearest the starport. Other nations may have a slightly different, often lower, TL profile, although none would have a high common or low common TL outside the range of 6–8. When determined, the profile of the governorship faction’s largest nation – the Referee calls it ‘Zeno’ – is 7-6-77765-7777-77-C, or 7 overall.
```
### SECONDARY WORLD TECH LEVELS
The Tech Level of secondary worlds depends on their ownership and purpose. Those owned by a mainworld or a nation or organization on a mainworld have Tech Levels associated with the owner. An independent secondary world can have an entirely different Tech Level but an overall guideline for all secondary worlds is that they should have at least high enough technology to be survivable. Use of prototype or relic technology may keep a mainworld alive but it will rarely keep a secondary world outpost functional, unless the Referee explicitly allows for it. The Secondary World Tech Level Guidelines table provides parameters for different types of secondary world settlements.

**Table 87: Secondary World Tech Level Guidelines**

| Secondary World | Tech Level Guidelines                                                               |
| --------------- | ----------------------------------------------------------------------------------- |
| Colony          | Higher of mainworld TL-1 or minimal sustainable Tech Level                          |
| Farming         | Higher of mainworld TL-1 or minimal sustainable Tech Level                          |
| Freeport        | Determined independently from mainworld but at least minimal sustainable Tech Level |
| Military Base   | Mainworld TL                                                                        |
| Mining Facility | Higher of mainworld TL or minimal sustainable Tech Level                            |
| Penal Colony    | Higher of mainworld TL-1 or minimal sustainable Tech Level                          |
| Research Base   | Mainworld TL                                                                        |
| All others      | Higher of mainworld TL-1 or minimal sustainable Tech Level                          |

If a secondary world requires a minimal sustainable Tech Level that is greater than the higher of the mainworld’s Tech Level or its environmental TL subcategory, then the secondary world should probably be considered uninhabited, or perhaps the site of a failed or relic outpost ruin. If desired, the Referee can create detailed TL subcategories for any secondary world. Except in the case of freeports, the upper bound for all subcategories should be the mainworld’s subcategory TL value.

```Example
Zed Secundus is a freeport with a UWP of C340552- 9. Its habitability rating is 1 so its minimal sustainable Tech Level is 5. It can follow the standard procedures for determining TL subcategories independently of the mainworld. With bounds and DMs, completing the procedures in the above sections results in a Tech Level profile of 9-9-99879-9797-97-C. The world is relatively lacking in local medical and space transport technology and, not surprisingly, water transport and has a weak industrial base.
```

## CULTURE
In even the most integrated interstellar polity, space travel is an expensive opportunity for the few and information delays between just the nearest stars are measured in weeks. Settlers of a world often come from a subset of a homeworld’s population, whether a specific cultural group or just those predisposed to new challenges. Any world’s culture begins to acquire unique traits, sometimes almost immediately but certainly within decades, both internally and in the way its people interact with outsiders. Unsurprisingly, the homeworlds of different sophont species will have their own unique and sometimes inexplicable cultures but the same can happen among human colonies within just a few generations. The Cultural Differences table on page 254 of the Traveller Core Rulebook provides an overview of ways a culture can become unique and its descriptions are broad enough to allow for countless variations.

The procedures in this section do not supplant or minimize the value of this table but are meant to categories the culture of a world in a manner suitable to the collection and organization of social data from a large number of worlds in a manner that bridges a simple description with specific values. Where relevant, the values of cultural traits in this section will cross-reference potentially relevant cultural characteristics from the Cultural Differences table. The Referee can choose to alter a roll on a trait to match pre-existing cultural attributes, or to use the descriptions provided in the table to portray the culture of a world.

All of the traits below are recorded as eHex- values. Worlds with no population have values of 0 for all cultural traits but inhabited worlds will have a minimum value of 1 for each trait.

### USING CULTURE FOR DMS
The values of the cultural characteristics can be the basis of DMs for certain social interactions, although whether a positive or negative DM applies depends greatly on the situation. When using cultural traits, appropriate DMs are: 

**Die Modifiers for Potential Cultural Trait**
- Trait value 1–2: DM±2
- Trait value 3–5: DM±1
- Trait value 6–8: DM±0
- Trait value 9–B (11): DM±1
- Trait value C–E (12–14): DM±2
- Trait value F–H (15–17): DM±3
- Trait value J+ (18+): DM±4

The following sections describe each cultural trait in greater detail.
### CULTURAL TRAITS
#### Diversity
Some worlds have a single culture or set of beliefs; others value diversity or have come to be diverse through social or physical separation. Regardless of the reason, the diversity trait is a measurement of the degree of diversity, from low to high. To determine a world’s diversity cultural trait:

**Formula: Diversity**
$\text{Diversity} = \text{2D} + \text{DMs}$

**Die Modifiers for Diversity**
- Population 1–5: DM-2
- Population 9+: DM+2
- Government 0–2: DM+1
- Government 7: DM+4
- Government D–F: DM-4
- Law Level 0–4: DM+1
- Law Level A+: DM-1
- PCR 0–3: DM+1
- PCR 7–9: DM-2

Diversity values of 3 or less indicate a monolithic culture while those of C (12) or more indicate diversity to the point where no culture is considered dominant or representative of the whole world.

On balkanized worlds, a result of C (12) or greater indicates divergence among nations and the Referee may decide to develop completely different cultural profiles for each faction or nation based on their individual PGL values. In this case, the Referee should reroll a diversity value for each nation without the modifier for Government code 7. If a single set of cultural values is recorded for a balkanized world, it is assumed to apply to the nation hosting or adjacent to the starport.

**Potentially Relevant Cultural Differences:** Any result may be relevant. Roll diversity ÷ 4 number of times (rounding as desired) for various Cultural Differences of diverse subpopulations.

#### Xenophilia
Some worlds are open to offworld visitors and influences, others are opposed to contact with foreign ideas or people. Acceptance ranges from low (xenophobic) to high (xenophilic) and can vary based on numerous cultural factors, although contact with other worlds through interstellar trade and travel tends to limit the extremes of xenophobia, assuming those relationships are not hostile or disruptive. To determine a world’s xenophilia trait:

**Formula: Xenophilia**
$\text{Xenophilia} = \text{2D} + \text{DMs}$

**Die Modifiers for Xenophilia**
- Population 1–5: DM-1
- Population 9+: DM+2
- Government D or E: DM-2
- Law Level A+: DM-24
- Starport A: DM+2
- Starport B: DM+1
- Starport D: DM-1
- Starport E: DM-2
- Starport X: DM-4
- Diversity 1–3: DM-2
- Diversity C+: DM+1

A value of 9+ equals a welcoming attitude to outside visitors and ideas. A result of 3 or less indicates active xenophobia.

**Potentially Relevant Cultural Differences:** 16: Xenophobic and 23: Liberal map fairly directly to xenophilia. Other related cultural characteristics include 15: Conservative, 25: Influenced, 36: Nexus, 41: Tourist Attraction, 51: Unusual Custom: Offworlders, 52: Unusual Custom: Starport and 65: Unusual Custom: Travel.

#### Uniqueness
As a world’s culture evolves, it may vary from interstellar norms in peculiar ways. A culture with low uniqueness may be almost indistinguishable from other worlds in terms of language, dress, behaviour, coffee shops or other cultural touchpoints. A highly unique culture may diverge from neighbouring worlds or from an encompassing interstellar polity to the point where a visitor will have no cultural touchpoints and has a high probability of being misunderstood or inadvertently violating some tradition or law. To determine uniqueness:

**Formula: Uniqueness**
$\text{Uniqueness} = \text{2D} + \text{DMs}$

**Die Modifiers for Uniqueness**
- Starport A: DM-2
- Starport B: DM-1
- Starport D: DM+1
- Starport E: DM+2
- Starport X: DM+4
- Diversity 1–3: DM+2
- Xenophilia 9–B: DM-1
- Xenophilia C+: DM-2

**Potentially Relevant Cultural Differences:** Any custom especially if caried to extremes can apply to uniqueness with a special emphasis on 21: Taboo and the 51–66 Unusual Customs series.

#### Symbology
Certain symbols may hold cultural importance for a society. These can range from the concrete: statues, flags, colours, clothing, architectural styles, to the abstract: religions, numerology, social groups, secret societies. A low symbology trait value indicates an emphasis on easily discernible concrete symbols of a world’s culture. A high symbology score indicates more abstract and less apparent – although no less important to the cultural adherent – symbols. The symbology trait does not necessarily correlate to the strength of belief or adherence to a symbol but to its appearance. The traits of uniqueness, xenophilia and diversity, in that order, apply to how important these symbols are to a culture and potentially what reaction will result from intentional or inadvertent desecration of such symbols. To determine symbology:

**Formula: Symbology**
$\text{Symbology} = \text{2D} + \text{DMs}$

**Die Modifiers for Symbology**
- Government D or E: DM+2
- TL 0–1: DM-3
- TL 2–3: DM-1
- TL 9–11: DM+2
- TL12+: DM+4
- Uniqueness 9–B: DM+1
- Uniqueness C+: DM+3

**Potentially Relevant Cultural Differences:** Any custom could apply to symbology but especially relevant characteristics include 12: Religious, 14: Ritualized, 21: Taboo, 32: Remnant, 44: Obsessed, 45: Fashion And The 51–66 Unusual Customs Series.

#### Cohesion
Some cultures focus on the individual, others on the group. A culture with low cohesion is an individualistic society, where the person is more important than the group. A culture with high cohesion is a collectivist or communal society, putting the wellbeing of groups, whether familial, social, caste or ethnic ahead of the needs of the individual. To determine cohesion:

**Formula: Cohesion**
$\text{Cohesion} = \text{2D} + \text{DMs}$

**Die Modifiers for Cohesion**
- Government 3: or C DM+2
- Government 5, 6 or 9: DM+1
- Law Level 0–2: DM-2
- Law Level A+: DM+2
- PCR 0–3: DM-2
- PCR 7+: DM+2
- Diversity 1–2: DM+4
- Diversity 3–5: DM+2
- Diversity 9–B: DM-2
- Diversity C+: DM-4

**Potentially Relevant Cultural Differences:** Any custom could relate to cohesion, depending on its value. a low cohesion is particularly applicable to 23: Liberal. A high cohesion can be compatible with 14: Ritualized, 15: Conservative and 56: Unusual Customs: Social Standings.

#### Progressiveness
Some cultures are set in their ways or even decaying, while others are obsessed with forward-looking objectives, looking to improve their societies, economies and technologies. Progressiveness is a measure of this cultural trait. Worlds of progressiveness 3 or less are in moribund decay, those of less than 6 are rather conservative and those of 9 or above are moving forward. A progressiveness value of C (12) or more indicates a society that values change for its own sake and is willing to experiment with new ideas and technology with little concern for what came before. To determine progressiveness:

**Formula: Progressiveness**
$\text{Progressiveness} = \text{2D} + \text{DMs}$

**Die Modifiers for Progressiveness**
- Population 6–8: DM-1
- Population 9+: DM-2
- Government 5: DM+1
- Government B: DM-2
- Government D: or E DM-6
- Law Level 9–B: DM-1
- Law Level C+: DM-4
- Diversity 1–3: DM-2
- Diversity C+: DM+1
- Xenophilia 1–5: DM-1
- Xenophilia 9+: DM+2
- Cohesion 1–5: DM+2
- Cohesion 9+: DM-2

**Potentially Relevant Cultural Differences:** 14: Ritualized, 15: Conservative, 21: Taboo, 23: Liberal, 32: Remnant, 33: Degenerate, 34: Progressive, 36: Nexus, 54: Unusual Custom: Technology, 56: Unusual Custom: Social Standing are most relevant, although others can apply.

#### Expansionism
A culture’s desire to expand itself is expressed in the expansionism trait. This may be a desire to spread a political philosophy or a religion or the aspiration of conquest to grow an empire. A culture with low expansionism values is more likely to be one with high xenophilia that does not have a vested interest in maintaining its current culture, even within its own society. An expansionism value of 9 or more actively promotes its culture through diplomats, missionaries and teachers. An expansionism value of C+ indicates a willingness to use coercion to convert others to their culture. To determine expansionism:

**Formula: Expansionism**
$\text{Expansionism} = \text{2D} + \text{DMs}$

**Die Modifiers for Expansionism**
- Government A or C+: DM+2
- Diversity 1–3: DM+3
- Diversity C+: DM-3
- Xenophilia 1–5: DM+1
- Xenophilia 9+: DM-2

Potentially Relevant Cultural Differences: 16: Xenophobic, 25: Influenced, 26: Fusion, 34: Progressive, 35: Recovering, 36: Nexus and 44: Obsessed, along with any other aspect of a world’s culture.

#### Militancy
The militancy of a culture as a whole can express itself in different ways. It may relate to a propensity for criminal violence and/or police response in the society, a chauvinism towards the culture and against those who oppose it or in literal militancy, both in the form of defensive military preparation and in expansionist behavior. A combination of high expansionism and high militancy can result in a culture bent on conquest but aggression can express itself internally and defensively as well. To determine militancy:

**Formula: Militancy**
$\text{Militancy} = \text{2D} + \text{DMs}$

**Die Modifiers for Militancy**
- Government A+: DM+3
- Law Level 9–B: DM+1
- Law Level C+: DM+2
- Xenophilia 1–5: DM+1
- Xenophilia 9+: DM-2
- Expansionism 1–5: DM-1
- Expansionism 9–B: DM+1
- Expansionism C+: DM+2

Potentially Relevant Cultural Differences: 14: Ritualized, 31: Barbaric, 33: Degenerate, 42: Violent, 43: Peaceful and 46: At War are the most relevant cultural characteristics of an especially aggressive or passive culture.

### CULTURAL PROFILE
The full cultural profile of a world is a string of eHex trait values arranged in the order presented in this section as:

#### T5 CULTURAL EXTENSION CONVERSION
The first four cultural values functionally correspond to the T5 Cultural Extension or Cx codes of HASS (Heterogeneity, Acceptance, Strangeness and Symbols) which are displayed on Travellermap. Note that differing procedures will result in different bounds for some of these values. To convert the values created in this book to T5 equivalents:
- Diversity equals Heterogeneity but is bound by the Population code ±5; values exceeding these bounds should be converted to Population-5 or Population+5, respectively.
- Xenophilia equals Acceptance but Acceptance is bound by Importance + Population code ±5; values exceeding these bounds should be converted to Importance + Population ±5 accordingly.
- Uniqueness translates into a Strangeness value between 0 and A (10); multiply the uniqueness value by ⅔ and round up to the nearest number.
- Symbology equals Symbols but is bounded by TL ±5; values exceeding these bounds should be converted to TL-5 or TL+5, respectively.

In all cases, worlds with Population code 0 have T5 Cultural values of 0 and populated worlds have a value of at least 1.

### CULTURAL SUMMARY
The terms and coding of values for cultural traits can be slightly obscure, partially in a response to trying to be consistent with other cultural rating systems. To help a Referee or Traveller looking at a cultural profile the Cultural Summary Trait Summary table can provide a quick reference to what the low and high values of each trait represent.

**Table 88: Cultural Trait Summary**

| Trait           | Code | Low Value       | High Value     |
| --------------- | ---- | --------------- | -------------- |
| Diversity       | D    | Monolithic      | Mulicultural   |
| Xenophilia      | X    | Xenophobic      | Xenophilic     |
| Uniqueness      | U    | Normal          | Obscure        |
| Symbology       | S    | Concrete        | Abstract       |
| Cohesion        | C    | Individualistic | Collective     |
| Progressiveness | P    | Reactionary     | Radical        |
| Expansionism    | E    | Passive         | Expansionistic |
| Militancy       | M    | Peaceful        | Militant       |
### ZED EXAMPLE

```Example
As Zed Prime is a balkanised world, its culture can be considered as a whole or by faction or nation. A quick way to determine which approach is most appropriate is to roll for the first cultural trait of diversity. Using the population and government of the whole planet and its PCR of 3 results in a +5 DM to the 2D roll of 7, which indicates 12, a very diverse value. Still, the Referee chooses to base the cultures on the two factions: governorships and oligarchies, and since the starport is located adjacent to an oligarch nation, that is the example detailed here.

The oligarchy PGL is 636. Rolling again for diversity – and by choice ignoring the PCR – with a DM of -1 for population, the result is a 6. Next, xenophilia has no DMs for this factional or national culture and the 2D roll is a 9, indicating a fairly welcoming society. Uniqueness has DM-1 for xenophilia and is rolled as a 10 modified to 9, so the culture is distinct from that of interstellar society but not incomprehensible. Symbology receives a DM+1 from uniqueness modifying a roll of 8 to 9, so symbols are more abstract than concrete: not so much colourful local costumes as colourful local customs.

Cohesion has no DMs but a roll of 11 indicates a culture that places most of its emphasis on the group. Progressiveness has a net DM-1 for a 2D roll of 7-1 = 6, indicating a slightly conservative outlook. Expansionism has a DM-2 from xenophilia, resulting in a score of 5, meaning locals are more likely to accept someone’s culture than to try to impose it on outsiders and finally, militancy has a total DM-3, so the 2D roll of 9 becomes a 6. The cultural profile for Zed Primes oligarchies is 6999-B656. The Referee can pick or roll on the Traveller Core Rulebook’s Cultural Differences table but instead both chooses 56: Unusual Customs: Social Standings as a basis of the culture and randomly rolls 15: Conservative, but decides this is inappropriate (or at least slightly redundant) and instead rolls again for 24: Honourable.

Repeating the process for faction I, the non-charismatic dictator governorships of PGL 6BA, the result is 757A-B65C, resulting in a rather cliquish police state with the same underlying collectivist culture. The Referee decides to use the 15: Conservative roll from the other government for this culture and rather than roll, also picks 33: Degenerate to indicate a society ready to challenge its leadership held at bay by increasingly harsh measures.
```
### RELIGION IN *TRAVELLER*
The section on culture does not deal directly with religion. Religion exists in Traveller – two entire government codes are explicitly religious. However religions themselves are not necessarily tied to a specific world. They may be a world religion or a variation of a broader faith and multiple faiths may exist on a world, harmoniously or not. Just as this book does not concern itself directly with star-spanning polities, it does not concern itself directly with star-spanning religions nor with vast interstellar megacorporations. Other books may cover the creation and classification of religions and corporations in detail. The Sector Construction Guide has some coverage of larger polities and sophont species and more detail may follow in some other future publication.

In the meantime, the cultural descriptions and tendencies are literally agnostic to religion. Any cultural value can be the result of a religious belief or practice and the Referee is free to treat them as such if desired.

### SECONDARY WORLD CULTURES
The culture of a secondary world may correspond to that of the mainworld or diverge in one or more aspects. Referees wishing to create separate cultures for secondary worlds should consider the purpose of the settlement. If it is independent, it deserves its own cultural profile. If it is owned and operated by the mainworld it is less likely to be divergent, although a military base by definition may be more aggressive in culture than the civilisation as a whole and a research base may have staff with rather radical ideas that are only tolerated in exceptional people in an isolated environment. The Referee could choose to tweak just one aspect of the culture or roll randomly for all or as many of them as the needs of an adventure require.

#### Zed Example

```Example
As Zed Secundus is entirely independent it gets its own culture based on its UWP of C340552-9. The result of the rolls is 159D-5A97, a monolithic, rather insular, difficult to decipher but individualistic forward-looking culture – perhaps one that plans on expanding to other moons and worlds in the system, someday challenging the status of Zed Prime as the mainworld.
```

## SOCIAL STRUCTURE
Even within the most unified interstellar polity, the societies that settlers build on new worlds diverge in fundamental ways. Isolation, resource scarcity, environmental pressures, and the selective nature of colonization all shape how populations organize themselves. Settlers often bring with them the social hierarchies, institutions, and power structures of their homeworld, yet these arrangements inevitably transform under the pressures of a frontier environment. A mining colony governed by corporate charter, an agricultural settlement organized around family ties, and a freeport populated by the ambitious and dispossessed will each develop distinct patterns of authority, social mobility, and institutional complexity—sometimes within a single generation. The homeworlds of different sophont species exhibit social arrangements that may seem utterly alien to outsiders, but even human worlds separated by mere parsecs can crystallize into wholly different social organizations within a few generations. The procedures in this handbook address Government types and Law Levels as formal structures; what follows addresses the lived arrangements beneath those structures—how power actually concentrates or disperses, how permeable or rigid social boundaries become, and how freely or constrained movement and advancement are within a society.

The procedures in this section do not supplant or minimize the value of government, law level, and cultural procedures found elsewhere in this handbook but are meant to categorize the social structure of a world in a manner suitable to the collection and organization of comparable data from a large number of worlds in a manner that bridges a simple description with specific values. Where relevant, the values of social structure traits in this section will cross-reference potentially relevant characteristics from other sections of this handbook. The Referee can choose to alter a roll on a trait to match pre-existing social attributes, or to use the descriptions provided in the tables to portray the social dynamics of a world.

All of the traits below are recorded as eHex values. Worlds with no population have values of 0 for all social structure traits, but inhabited worlds will have a minimum value of 1 for each trait1.
#### Equality
This trait measures the degree of equality and opportunity within a society. It contrasts societies with rigid hierarchies and limited mobility with those that promote equal opportunities and social leveling.

**Formula: Equality**
$\text{Equality} = \text{2D} + \text{DMs}$
**Die Modifiers for Equality**
- Government 3 (Self-Perpetuating Oligarchy): DM-2
- Government 2 (Participating Democracy): DM+2
- High Inequality Rating: DM-1
- Low Inequality Rating: 
- **Die Modifiers:**1
    - Government Type:
        - Government 3 (Self-Perpetuating Oligarchy): DM -21
        - Government 2 (Participating Democracy): DM +21
    - Economic Factors:
        - High Inequality Rating: DM -11
        - Low Inequality Rating: DM +11
    - Law Level:
        - Law Level 0-4: DM -1 (lack of legal protections)1
        - Law Level A+: DM +1 (legal protections in place)1
- **Value Interpretation:**1
    - Low Values (3 or less): Highly stratified society with limited social mobility1.
    - High Values (C or more): Egalitarian society with ample opportunities for advancement1.

**2. Cultural Tolerance**

Measures the degree to which different cultures, beliefs, and practices are accepted and respected within the society 1.

- **Formula:** Cultural Tolerance=2D+DMsCultural Tolerance=2D+DMs1
- **Die Modifiers:**1
    - Diversity: Higher diversity = higher tolerance.
        - Diversity 1-5: DM -11
        - Diversity 9+: DM +11
    - Government:
        - Government D-F (Religious Dictatorship, Religious Autocracy, Totalitarian Oligarchy): DM -21
        - Government 2 (Participating Democracy): DM +11
    - Xenophilia
        - Xenophilia 1-5: DM -11
        - Xenophilia 9+: DM +11
- **Value Interpretation:**1
    - Low Values: Intolerant society, potential for discrimination and conflict1.
    - High Values: Tolerant society, values diversity and inclusion1.

**3. Information Access**

Reflects how freely information flows within a society 1.

- **Formula:** Information Access=2D+DMsInformation Access=2D+DMs1
- **Die Modifiers:**1
    - Government Type:
        - Government 0 (None), 2 (Participating Democracy): DM +11
        - Government A (Charismatic Dictatorship), B (Non-Charismatic Dictatorship), F (Totalitarian Oligarchy): DM -21
    - Tech Level:
        - TL 0-5: DM -1 (Limited communication tech)1
        - TL A+: DM +1 (Widespread communication)1
    - Law Level:
        - Law Level 9+: DM -1 (Restrictions on speech and media)1
        - Law Level 0-4: DM+11
- **Value Interpretation:**1
    - Low Values: Restricted access to information, potential for censorship and propaganda1.
    - High Values: Open access to information, encourages transparency and informed citizenry1.

**4. Social Organization**

This trait describes the primary organizing principle of the society 1.

- **Formula:** Social Organization=2D+DMsSocial Organization=2D+DMs1
- **Die Modifiers:**
    - Government Type: Certain government types may favor specific social organizations.
        - Government 3 (Self-Perpetuating Oligarchy): DM +2 (likely favors caste or guild systems)
        - Government 0 (None): DM +2 (Likely favors clan or tribal systems)
    - Economic Development: The level of economic development can influence the complexity of social organization.
        - Economic Development 3 or Less: DM -1 (simpler organizations)
        - Economic Development C or More: DM +1 (more complex organizations)
    - Cohesion (From the Culture category): A society's level of cohesion can influence whether it adopts individualistic or collectivist social structures.
        - Cohesion 1-5: DM -1 (less emphasis on larger organizing structures)
        - Cohesion 9+: DM +1 (greater emphasis on larger organizing structures)
- **Value Interpretation:** (This will require a table, as the values will represent different types of social organization)
    
    |eHex Value|Social Structure|
    |---|---|
    |0|Egalitarian/None|
    |1|Family-Based|
    |2|Clan/Tribal|
    |3|Guild-Based|
    |4|Caste-Based|
    |5|Class-Based|
    |6|Corporate|
    |7|Feudal|
    |8|Hybrid (Specify)|
    |9|Anarchy|
    |A|Religious|
    |B|Military|
    |C|Communistic|
    |D|Meritocracy|
    |E|Technocracy|
    |F|Totalitarian|
    

**5. Centralization**

This trait measures the degree to which power is concentrated at the core of the civilization versus distributed among regions or groups 1.

- **Formula:** Centralization=2D+DMsCentralization=2D+DMs
- **Die Modifiers:**
    - Government Type: Certain government types are inherently more centralized or decentralized 1.
        - Government 2 (Participating Democracy): DM -1 (often decentralized) 1
        - Government 3 (Self-Perpetuating Oligarchy): DM +11
        - Government 7 (Balkanization): DM -3 (highly decentralized) 1
        - Government 8 (Civil Service Bureaucracy): DM +2 (often centralized) 1
    - Tech Level: Higher tech levels can enable greater centralization 1.
        - TL 0-5: DM -1 (difficult to exert central control)
        - TL 9+: DM +1 (easier to manage large areas)
    - Infrastructure: Well-developed infrastructure facilitates centralization 1.
        - Infrastructure Factor 3 or less: DM -1
        - Infrastructure Factor 7 or more: DM +1
- **Value Interpretation:**
    - Low Values (3 or less): Highly decentralized society with significant regional autonomy.
    - High Values (C or more): Highly centralized society with most power concentrated at the core.

**6. Stratification Rigidity**

This trait measures how permeable the layers of society are.

- _Formula:_ Stratification Rigidity=2D+DMsStratification Rigidity=2D+DMs
- **Die Modifiers:**
    - Equality: A society that values equality will have less rigid stratification.
        - Equality 3 or less: DM +2
        - Equality 9+: DM -2
    - Social Organization: The type of social organization can influence stratification.
        - Social Organization (Caste-based): DM +3
        - Social Organization (Class-based): DM 0
        - Social Organization (Clan-based): DM -1
    - Law Level: Laws can either reinforce or undermine stratification 1.
        - Law Level 0-4: DM -1 (less enforcement of social hierarchies)
        - Law Level 9+: DM +1 (laws may reinforce existing hierarchies)
- **Value Interpretation:**
    - Low Values (3 or less): Very fluid society with high social mobility.
    - High Values (C or more): Rigidly stratified society with limited social mobility.

**Potential Cultural Trait DMs**

The values of the social characteristics can be the basis of DMs for certain social interactions, although whether a positive or negative DM applies depends greatly on the situation 1. When using social traits, appropriate DMs are:

|Trait value|Possible + DM|
|---|---|
|1–2|2|
|3–5|1|
|6–8|0|
|9–B (11)|1|
|C–E (12–14)|2|
|F–H (15–17)|3|
|J+ (18+)|4|

This structure mirrors the cultural trait descriptions in the document 1 and provides a framework for using these traits in your worldbuilding. Remember to adapt and adjust these traits and modifiers to best fit your specific setting.
## ECONOMICS
A world’s influence and importance are tied directly or indirectly to its wealth. Many factors determine not only a world’s total wealth but how it is distributed among its population and how efficiently all the resources of a world contribute to its status. Some of the characteristics described in this section are directly tied to T5 system description values: Importance, Resource units and the underlying T5 economic extension factors of resources, Labor, Infrastructure and Efficiency, although the derivation of these values differs from T5 methods. Other characteristics such as gross world product, per capita income and inequality rating are basic economic evaluation values to guide a Referee in both describing a world and determining its capabilities.
### ECONOMICS TRAITS
#### Development Level
From Underdeveloped to Developed. This reflects the overall economic advancement of the society.
#### Equality
From Unequal to Equal. This indicates the distribution of wealth within the population.
#### Trade Dependency
From Autarkic to Interdependent. This measures how much the economy relies on trade with other entities.
#### Regulation
From Unregulated to Regulated. This indicates the degree to which the government controls economic activity.
#### Currency
From Barter to Credit-Based. This describes the primary medium of exchange used in the economy.
#### Stability
From Boom to Bust. This trait reflects how prone the economy is to fluctuations and crises.
#### Resource Management
From Depleting to Sustainable. This measures how well the society manages its natural resources.
### TRADE CODES
A world’s trade codes are shorthand for the combination of characteristics that describe a world’s basic nature and are often the basis of factors related to the world’s economic capabilities and general importance. The Trade Codes table is essentially a copy of that found in the *Traveller Core Rulebook on page 260*, with further description on page 156 but it is included below for reference. A world must match all of the conditions across the classification row to qualify for a specific trade code.

**Table 88: Trade Codes**

| Classification   | Code |      Size      | Atmosphere | Hydrographics | Population | Government | Law Level | TL  |
| ---------------- | :--: | :------------: | :--------: | :-----------: | :--------: | :--------: | :-------: | :-: |
| Agricultural     |  Ag  |      4–9       |    4–8     |      5–7      |     —      |     —      |     —     |  —  |
| Asteroid         |  As  |       0        |     0      |       0       |     —      |     —      |     —     |  —  |
| Barren           |  Ba  |       0        |     0      |       0       |     —      |     —      |     —     |  —  |
| Desert           |  De  |      2–9       |     0      |       —       |     —      |     —      |     —     |  —  |
| Fluid Oceans     |  Fl  |    A–C, F+     |     1+     |       —       |     —      |     —      |     —     |  —  |
| Garden           |  Ga  |      6–8       |  5, 6, 8   |      5–7      |     —      |     —      |     —     |  —  |
| High Population  |  Hi  |       —        |     —      |       —       |     9+     |     —      |     —     |  —  |
| High Tech        |  Ht  |       —        |     —      |       —       |     —      |     —      |     —     | C+  |
| Ice-Capped       |  Ic  |      0, 1      |     —      |      1+       |     —      |     —      |     —     |  —  |
| Industrial       |  In  | 0–2, 4, 7, 9–C |     —      |       —       |     9+     |     —      |     —     |  —  |
| Low Population   |  Lo  |       —        |     —      |       —       |    1–3     |     —      |     —     |  —  |
| Low Tech         |  Lt  |       —        |     —      |       —       |     —      |     —      |    1+     | 0–5 |
| Non-Agricultural |  Na  |      0–3       |    0–3     |       —       |     —      |     —      |    6+     |  —  |
| Non-Industrial   |  Ni  |      4–6       |     —      |       —       |     —      |     —      |     —     |  —  |
| Poor             |  Po  |      2–5       |    0–3     |       —       |     —      |     —      |     —     |  —  |
| Rich             |  Ri  |      6, 8      |    6–8     |       —       |    4–9     |     —      |     —     |  —  |
| Vacuum           |  Va  |       0        |     —      |       —       |     —      |     —      |     —     |  —  |
| Waterworld       |  Wa  |   2–9, D, E    |     —      |       A       |     —      |     —      |     —     |  —  |

### IMPORTANCE
Trade codes, starport class and base presence from the Table ##: Starport Facilities are necessary for some importance factors. Some worlds have characteristics which make them more important than others. Importance is a relative value that can act as a DM or an indicator for economic or political activities. In general, it can range from +5 to -3. To determine importance, add the following values:

**Table 88: Importance Modifiers**

| Condition                  | Value |
| -------------------------- | :---: |
| Starport A or B            |  +1   |
| Starport D, E or X         |  -1   |
| Population 0–6             |  -1   |
| Population 9+              |  +1   |
| Tech Level 0–8             |  -1   |
| Tech Level A–F             |  +1   |
| Tech Level G+              |  +2   |
| Agricultural               |  +1   |
| Industrial                 |  +1   |
| Rich                       |  +1   |
| Two or more bases present* |  +1   |
| X-Boat waystation present  |  +1   |

\*The presence of a corsair base does not count as a basis for importance calculations.

### RESOURCE FACTOR
The raw resource rating is determined on page 131. For worlds with native life, this also requires determination of life-related rating characteristics for life. If this determination is not conducted, use an unmodified 2D roll for the initial resource rating. The natural endowment of a world with resources, including minerals, energy sources and biological materials has a direct effect on its potential wealth. However, these resources need to be both extracted and conserved to provide short and long term value to a world’s economy.

The resource rating value determined on page 131 indicates a world’s inherent resource capacity. Worlds that are industrial or agricultural should subtract 1D-1 from their resource rating (to a minimum rating of 2) to account for resource depletion over time. Once a world reaches TL8, space-based resources become available, either through outpost or robotic mining operations. Such worlds add 1 to their resource factor value for each non-mainworld planetoid belt or gas giant in the star system.

**Formula: Resource Factor**
$\text{Resource Factor} = \text{Resource Rating} + \text{DMs}$

**Die Modifiers for Diversity**
- TL8+: DM+Each of the system’s planetoid belts and gas giants
- Industrial: DM+1-1D
- Agricultural: DM+1-1D

If resource depletion reduces the resource factor below 2, treat the value as 2 plus the number of planetoid belts and gas giants.

### LABOR FACTOR
Resources do not add much value sitting in the ground. Even resources left untouched as ecotourist destinations generate no income without tour guides. A world’s labor force provides the ability to use the resources available. Not every person contributes to directly adding value. A world’s population includes dependents, retired workers, the idle rich and people in necessary support roles that enable others to create wealth. As a baseline value, 10% of the world’s population directly contributes to the world’s wealth.

**Formula: Labor Factor**
$\text{Labor Factor} = \text{Population Code} - 1$

This rough number does not correspond to the realities of many disparate situations but varying factors are considered in the efficiency factor of a world’s economy. A world with a Population code of 1 or 0 has a labor factor of 0.

### INFRASTRUCTURE FACTOR
To allow a pool of labor to access the world’s resources and create wealth, it needs sufficient infrastructure. This includes a transportation network, energy production, housing, industry, utilities, hospitals and all the trappings of civilization. The core level of infrastructure is related to a world’s importance, representing the outside investment or initial colonization effort expended in supporting a world’s growth. As the population increases, its infrastructure needs and capabilities increase as well, generated by both internal and external investment and development. 

**Formula: Infrastructure Factor**
$\text{Infrastructure Factor} = \text{Importance} + \text{DMs}$

**Die Modifiers for Infrastructure Factor**
- Population 4–6: DM+1D
- Population 7+: DM+2D

If a world has no population or if the world’s infrastructure factor is less than 0, it has no infrastructure.

### EFFICIENCY FACTOR
Regardless of a world’s wealth, people and infrastructure, their effectiveness depends on a number of factors including how well the infrastructure is maintained, how much wealth is wasted through corruption and poor governance, and factors beyond anyone’s control, such as topography and weather.

Variance in efficiency factors depends on population values and various other modifiers:

$\text{Efficiency Factor (Population 0)} = -5$
$\text{Efficiency Factor (Population 1–6)} = \text{2D-7} + \text{DMs}$
$\text{Efficiency Factor (Population 7+)} = \text{2D3-4} + \text{DMs}$

**Die Modifiers for Efficiency Factor**
- Government 0, 3, 6, 9, B, C or F: DM-1
- Government 1, 2, 4, 5 or 8: DM+1
- Law Level 0–4: DM+1
- Law Level A+: DM-1
- PCR 0–3: DM-1
- PCR 8+: DM+1
- Progressiveness 1–3: DM-1
- Progressiveness 9+: DM+1
- Expansionism 1–3: DM-1
- Expansionism 9+: DM+1

A world’s efficiency factor is limited to a range of +5 to -5 but a factor of 0 is always treated as +1 instead. The world’s efficiency factor can be used as a DM when determining the degree of efficiency in the government or private industry providing services, or in the likelihood of bribery or influence being a more effective method of achieving results than official channels.

### RESOURCE UNITS
Resource units (RU) are a measure of a system’s net contribution to an interstellar polity. Resource unit values, especially when negative, are not useful measures of economic strength for single systems or smaller polities, but for a region larger than a subsector or some 30 or more systems, it is a useful shorthand for determining the economic impact and value of a particular system within the overall economy of the polity or region.

**Formula: Resource Units (RU)**
$\text{RU} = \text{Resource Factor} \times \text{Labour Factor} \times \text{Infrastructure Factor} \times \text{Efficiency Factor}$

If any of these factors is has a value of 0, for the purposes of the RU calculation their value is treated as 1. Only the efficiency factor can be negative. A negative RU is an indication of systems requiring investment or a transfer of payments from a larger polity to maintain the world as a functioning member of an interstellar state. Depending on the nature of the polity, more direct intervention to improve a world’s efficiency factor may be a viable alternative to continually transferring resources to a moribund system.
\*Note: Use minimum of 1 for all the factors, if population greater than 0
### GROSS WORLD PRODUCT 
The most direct measure of a world’s wealth is its gross world product (GWP), the total value of the output of the world’s economy over the course of a standard year. The GWP is computed from the average economic contribution of each member of the world’s population, or the per capita GWP. A base value for the world is modified by a number of factors to arrive at this global value. For balkanized worlds, this value can be computed for each nation, faction, or for the world as a whole.

**Base Value:** The base value of a world’s GWP is a per capita (per person) value related to its infrastructure factor plus the value of its resource factor but only up to the infrastructure factor value. For the purposes of this calculation, if the world has a population greater than 0 each factor is assumed to have a value of at least 1. For instance, if a world had an infrastructure factor of 6 and a resource factor of 7, the base value would be 6 + 6 = 12. If a world had an infrastructure factor of 0 and a resource factor of 2, the base value would still be 1 + 1 = 2, as the resource factor would be limited by the ‘adjusted’ infrastructure factor of 1.

**Formula: GWP Base Value**
$\text{GWP Base Value} = \text{Infrastructure} + \text{Resource Factor}$

$\text{GWP Base Value Upper Bound} = 2 \times \text{Infrastructure Factor}$
$\text{GWP Base Value Lower Bound} = 0$

**GWP Modifiers:** The base value of the per capita GWP is modified by a number of factors including the world’s (or nation or faction) ports, Tech Level, Government code, and trade classifications.

**GWP Tech Level Modifier:** A world’s Tech Level modifier is simply the world’s UWP Tech Level divided by 10. For TL0 worlds, the modifier is 0.05.

$\text{GWP Tech Level Modifier} = \text{Tech Level} \div 10$

$\text{GWP Tech Level Modifier Lower Bound} = 0.05$

**GWP Port Modifier:** The world’s starport or spaceport has a modifier based on the type listed in the Port Modifier table:

**Table 89: GWP Port Modifier**

| Port | Modifier |
| :--: | :------: |
|  A   |   1.5    |
|  B   |   1.2    |
|  C   |   1.0    |
|  D   |   0.8    |
|  E   |   0.5    |
|  F   |   0.9    |
|  G   |   0.7    |
|  H   |   0.4    |
|  Y   |   0.2    |
|  X   |   0.2    |

**GWP Government Modifier:** Each Government code has a modifier listed in the Government Modifier table.

**Table 90: GWP Government Modifier**

| Government | Modifier |
| :--------: | :------: |
|     0      |   1.0    |
|     1      |   1.5    |
|     2      |   1.2    |
|     3      |   0.8    |
|     4      |   1.2    |
|     5      |   1.3    |
|     6      |   0.6    |
|     7*     |   1.0    |
|     8      |   0.9    |
|     9      |   0.8    |
|     A      |   1.0    |
|     B      |   0.7    |
|     C      |   1.0    |
|     D      |   0.6    |
|     E      |   0.5    |
|     F      |   0.8    |

\*For the world as a whole. The Referee may consider computing each faction or nation's contribution to the GWP separately

**GWP Trade Code Modifier:** Certain trade codes can act as GWP modifiers, as indicated in the following table:

**Table 91: GWP Trade Code Modifier**

| Trade Code       | Modifier |
| ---------------- | :------: |
| Agricultural     |   0.9    |
| Asteroid         |   1.2    |
| Garden           |   1.2    |
| Industrial       |   1.1    |
| Non-Agricultural |   0.9    |
| Non-Industrial   |   0.9    |
| Poor             |   0.8    |
| Rich             |   1.2    |
| Default Modifier |   1.0    |
Every trade code relevant to the world is applied as A separate modifier. If no trade code modifiers apply, the default trade code modifier value is 1.0
\*note: Trade Code Modifiers are cumulative if it's a Garden and Agricultural then (0.9+1.2)

**GWP Total Modifiers:** All GWP modifiers are multiplied together to determine the total modifiers:

**Formula: GWP Total Modifiers**
$\text{GWP Total Modifiers} = \text{GWP Tech Level Modifier} \times \text{GWP Port Modifier} \times \text{GWP Government Modifier} \times \text{GWP Trade Code Modifier}$

**Efficiency Factor:** Efficiency has the greatest impact on GWP. It matters whether the world’s efficiency is positive or negative (it cannot be zero):

**Case 1: Positive Efficiency Factor:** Efficiency is a multiplier to GWP:

**Formula: GWP per capita (Cr)**
$\text{GWP per capita (Cr)} = 1000 \times \text{GWP Base Value} \times \text{GWP Total Modifiers} \times \text{Efficiency Factor}$

**Case 2: Negative Efficiency Factor:** Efficiency acts as a divisor to GWP. The efficiency factor minus 1 is used as a negative divisor. For instance, if a world’s efficiency factor was -1, the divisor would be -(-1 - 1) = 2.

**Formula: GWP per capita (Cr)**
$\text{GWP per capita (Cr)} = 1000 \times \frac{\text{GWP Base Value} \times \text{GWP Total Modifiers}}{-(\text{Efficiency Factor}-1)}$

**Total GWP:** The world’s total GWP is simply the GWP per capita multiplied by the world’s total world population, which should at least be known to one digit as P × 10<sup>Population Code</sup>. If total world population has been determined to a greater degree of accuracy, then that value should be used.

**Formula: Total GWP (Cr)**
$\text{Total GWP (Cr)} = \text{GWP per capita} \times \text{Total World Population}$

On balkanized worlds, the actual population of the faction or nation may be the ‘total population’ value used for determining that region’s contribution to the GWP.

**Optional Balkanized World Procedure:** Factions or nations (subunits) of balkanized worlds can potentially have different modifiers for government and Tech Level. If the Referee so chooses, the GWP per capita calculation for these subunits could be computed separately and added up for a world-wide total GWP value. Trade code and starport modifiers should apply world-wide for all subunits and the four factors determining RUs (resource, labor, infrastructure and efficiency) should retain global values. On some worlds and in some campaigns, the Referee could choose to compute all economic factors, including the four that determine RU at a subunit level, but unless it serves a specific need, it is not practical – it would be time-consuming and may not easily create a result similar to that of the world as a whole (e.g., if no nation had a population over one billion, the world could never be high population or industrial, despite at a world-wide level the population exceeded one billion).

### WORLD TRADE NUMBER
Another statistical rating used to determine a world’s economic and propensity for trade is the world trade number (WTN), based on a world’s Tech Level, population and starport class. First, calculate the world’s base WTN:

**Formula: World Trade Number Base Value**
$\text{WTN Base Value} = \text{Population Code} + \text{DMs}$

**World Trade Number Base Value Modifiers**
- TL0–1: DM-1
- TL5–8: DM+1
- TL9–14: DM+2
- TL15+: DM+3

Then, determine the WTN starport modifier:

**Table 92: World Trade Number Starport Modifier**

| Base Value  | Class A | Class B | Class C | Class D | Class E | Class X |
| ----------- | ------- | ------- | ------- | ------- | ------- | ------- |
| 0–1         | +3      | +2      | +2      | +1      | +1      | 0       |
| 2–3         | +2      | +2      | +1      | +1      | 0       | 0       |
| 4–5         | +2      | +1      | +1      | 0       | 0       | -5      |
| 6–7         | +1      | +1      | 0       | 0       | -1      | -6      |
| 8–9         | +1      | 0       | 0       | -1      | -2      | -7      |
| A-B (10–11) | 0       | 0       | -1      | -2      | -3      | -8      |
| C-D (12–13) | 0       | -1      | -2      | -3      | -4      | -9      |
| E+ (14+)    | 0       | -2      | -3      | -4      | -5      | -10     |

These values add to determine the world trade number:

**Formula: World Trade Number**
$\text{WTN} = \text{WTN Base Value} + \text{WTN Starport Modifier}$

If the result is less than 0, it is recorded as 0. The WTN is an eHex index number recorded by the IISS and useful for determining trade routes and volumes of trade between systems. (Note: This WTN is exactly twice the WTN determined using the GURPs Traveller Far Trader supplement). A WTN value influences the level of traffic to starports and can be used as a modifier for obtaining cargos and passengers based on its value as a characteristic, similar to the cultural traits DMs on the Potential Cultural Traits DMs.

### INEQUALITY RATING
A world’s per capita GWP does not mean that each of its people has a standard of living comparable to that amount. All societies have some level of inequality, some more or less than others. A common measure of inequality is to envision a world where everyone has an equal share of wealth; this results in an inequality rating of 0. If instead, all of the world’s wealth is in the hands of one person, the inequality rating is 100. No society is likely to approach either absolute limit with most falling in the range of 25–75, but different factors can influence the rating. To determine a world’s inequality rating begin with a value of 50. The rating is decreased (more equality) by positive efficiency ratings and increased (less equality) by negative values and then modified by a variety of factors:

**Formula: Inequality Rating**
$\text{Inequality Rating} = 50 - \text{Efficiency Rating} \times 5 + (\text{2D-7}) \times 2 + \text{DMs}$ 

**Die Modifiers for Inequality Rating**
- Government 6, B, F: DM+10
- Government 0, 1, 3, 9, C: DM+5
- Government 4, 8: DM-5
- Government 2: DM-10
- Law Level 9+: DM+Law Level-8
- PCR: DM+PCR
- Infrastructure Factor: DM-Infrastructure Factor

**Optional Balkanized World Procedure:** Factions with differing governments may have differing inequality ratings based on both structural and chance factors. To arrive at a global total inequality rating based on factional or national ratings, each of these values should be combined in proportion to the population of each faction or nation to arrive at a world-wide score. Variations to per capita GWP and inequality rating also allow for a separate development score (see below) for each world subunit. The development score for the world should be determined either from world-wide values, or a population-weighted average from each component faction or nation.
### DEVELOPMENT SCORE
The IISS Survey Office began computing a relative development score for use with the second survey. This score correlates somewhat to the perceived wellbeing of people in a technological civilisation but has been criticised as useless or misleading in societies which intentionally eschew higher technology or materialism. The formula for the development score is:

**Formula: Development Score**
$\text{Development Score} = \frac{\text{GWP per Capita}}{1000} \times (1 - \frac{\text{Inequality Rating}}{100})$ 

### TARIFFS
Most worlds make some effort to protect local industry or raise revenue by imposing tariffs on incoming goods. These costs are normally borne by the seller or importer. Tariffs may apply broadly to all imported goods, to goods from certain worlds, and/or to certain categories of trade goods. These apply directly to the gross sale price of speculative goods on a destination world. The Referee can record permanent tariffs to the detail desired, roll for tariffs each time goods are sold, or ignore tariffs entirely, declaring the region a free trade zone. A trader with any Admin or Broker skill is likely to know the tariff rate at a destination world prior to departure, although the Referee may impose a skill check or decide to alter the tariffs literally in flight.

**Table 93: Tariff Rates**

| 2D+DM | Tariff Regimen                                                                                                                                | Percentage |
| :---: | --------------------------------------------------------------------------------------------------------------------------------------------- | :--------: |
|  3-   | Free trade zone, no tariffs                                                                                                                   |     —      |
|   4   | Tariff only on foreign polity goods, roll again for rates*                                                                                    |     —      |
|   5   | Tariff only applies on a class of goods on an 8+, roll again for rates*                                                                       |     —      |
|   6   | Low tariffs apply                                                                                                                             |    1D%     |
|   7   | Moderate tariffs apply                                                                                                                        |    2D%     |
|  8–9  | Varying tariffs apply. Roll separate 1D × 1D% for each trade good type (the D66 on the Trade Goods table) or class (the first D on the table) |  1D × 1D%  |
| 10–11 | High tariffs apply                                                                                                                            |  2D × 5%   |
| 12–13 | Extreme tariffs apply                                                                                                                         |  2D × 10%  |
|  14+  | Prohibitive tariffs                                                                                                                           |  2D × 20%  |

\*Roll again with 1D+5, ignoring the DMs below

**Die Modifiers for Tariff Rates**
- Government 0: DM-7
- Government 2 or 4: DM-4
- Government 9: DM+2
- Law Level 9+: DM+2
- Freeport: DM-7
- Xenophilia 1–3: DM+2
- Xenophilia 9+: DM-2
- WTN: DM-WTN Starport Modifier

See page 181 (positive DM for a negative modifier) Interstellar polity policy DM varies (Third Imperium, DM–6)

A result of 4, meaning a tariff only on foreign polity goods, applies to goods crossing interstellar borders, e.g., between the Darrian Confederation and the Sword Worlds. They could apply to independent worlds outside the polity as well.

The Third Imperium was founded on the principles of free trade and frowns on any tariffs imposed between member worlds, although in response to unfair market conditions or to develop a strategic industry, a world may appeal to Imperial authorities through their noble representative for permission from the minister of commerce to impose a temporary tariff on certain goods. In these cases, the tariff is most often 1D% of the sale value. Trade goods originating from outside the Imperium are not subject to free trade restrictions and tariffs have a standard chance of applying.

### TAXES
Taxes may be inevitable but taking them into account in Traveller is something Referees should consider ignoring for game purposes. The Referee can assume that most worlds raise revenue by a value added tax (VAT) built into the cost of goods. Where starports are extraterritorial, this may result in ‘duty-free’ stores within the starport itself which sell certain items at a discount (or the starport authority may be collecting a VAT for their own operating budgets), or the Referee can assume list prices are the duty-free prices and add a percentage cost to all items purchased on a particular world outside the starport’s boundaries. VATs could range from 1–50% and could be different for different classes of items or buyers; the Referee insisting on this level of detail could use the Tariff Rates table for inspiration.

### ECONOMIC PROFILE
The economic aspects of a world are complex and varying. To maintain consistency with other formats, an economic profile record is as follows:

**Tc, Im, RL+E, RU, pcGWP, WTN, IR, DR**

Where:
- Tc = Trade codes alphabetically and separated by spaces
- Im = Importance
- R = resource factor
- L = labor factor
- I = infrastructure factor
- +E = + efficiency factor
- RU = resource units,
- pcGWP = per capita GWP
- WTN = WTN
- IR = inequality rating
- DR = development rating.

### ZED EXAMPLE
*Zed Prime is a balkanized world. For illustrative purposes, this example will consider the economics of the world as a whole where necessary but will treat each faction separately for per capita GWP, inequality rating and development score. Zed Prime’s trade codes are agricultural and rich. Each of these adds one to the world’s importance but its Tech Level of 8 causes a decrease of one, so its final importance is +1. Its resource factor is initially its resource rating B (11). For agricultural resource depletion it receives +1 minus 1D rolling a 3 for a net loss of 2, but as the world is TL8, it also gets +4 and +2 for gas giants and planetoid belts, respectively, for a final resource factor = 15 or F. Its labor factor is simply population -1 or 7 - 1 = 6 for the entire world. The infrastructure factor is equal to its importance (+1) plus 2D (a 12!) for a population of 7+, which equals 13 or D.*

*Zed Prime’s efficiency factor should not normally receive a penalty for Government 7, despite both faction Government codes 3 and B receiving a DM-1 – the Referee decides to stick with no penalty to simulate competition between the various factions and nations. The PCR of 3 does cause DM-1, the progressiveness and expansionism ratings for both factions is identical and neither warrants another DM, so with a Population of 7, the roll for efficiency factor is 2D3 -4 -1, resulting in a -2 efficiency factor. Not good.*

RU is always a world-wide computation. The RU value for Zed Prime is negative because of its efficiency rating, so its expensive infrastructure and vast resources are actually a big drain on any larger interstellar state’s budget with RU = 15 × 6 × 13 × -2 = -2,340. The Referee has decided that the world is in an independent system in a border region, so this RU does not matter much – the world is on its own to keep things running (and may be failing in that regard).

The Referee decides to compute the economic might of Zed Prime by faction, first determining that the share of population is 54% or 9.72 million for governorships (I) and 46% or 8.28 million for oligarchs (II). First, both factions receive a base value from the infrastructure factor D (13) + resource factor F (15), bounded by the infrastructure factor to 2 × 13 = 26. To this value, various modifiers apply: Tech Level is 8 ÷ 10 = 0.8, the port modifier for a Class C port is just 1.0. Trade codes are agricultural 0.9 and rich 1.2. Tech Level and Government codes differ between factions: I: TL7, Government:B, II: TL8 Government:3. Their respective modifiers are I: 0.7, 0.9, and II: 0.8, 0.8. For each, using the separate modifiers, are governorships (I) 0.7 × 1 × 0.9 × 0.9 × 1.2 = 0.6804, oligarchs 0.8 × 1 × 0.8 × 0.9 × 1.2 = 0.6912.

Since Zed Prime has a negative efficiency factor, its GWP per capita for governorships is 1,000 × 26 × 0.6804 ÷ (-(-2-1)) = Cr5896.8 and for oligarchs 1000 × 26 × 0.6804 ÷ (-(-2-1)) = Cr5990.4. As a weighted average, this is Cr5940 per capita for the world and to the nearest billion, MCr107000 total world GWP.

WTN is always computed for the entire world. It is 7 for population, +1 for Tech Level and +0 from the table for a final value of 8.

Zed Prime’s inequality rating is also determined by faction. The common factors are +10 for Efficiency ( minus a negative value of 2 times 5) +3 for PCR and -13 for infrastructure, leaving a net DM+0. For the governorships, DMs are +10 for government code and +2 for Law Level, or net DM+12. Rolling 8 for (2D-7) × 2 adds another +2, for a final inequality rating of 50 + 14 = 64. For the oligarchs, DMs net +5 and the 2D roll is a 5, resulting in -4, for a net DM+1 or inequality rating of 51. The world population-weighted average score rounds to 58.

The development score for governorships is 5,896.8 ÷ 1,000 × (1 - 64 ÷ 100) = 2.12 to two significant digits, for the oligarchs it is 5,990.4 ÷ 1,000 × (1 - 51 ÷ 100) = 2.94, and using world-wide numbers, the world’s score is 5,940 ÷ 1,000 × (1 - 58 ÷ 100) = 2.49.

Being an independent system, tariffs are determined on a 2D roll, with the Referee deciding to use global government and Law Level values, which provide no DMs, and the roll is a 9, resulting in varying tariffs of 1D × 1D%, which the Referee doesn’t want to become overly prescriptive about and decides it should be a global value based on two 1D rolls multiplied together, or 4 × 3 = 12% across the board for all imported goods.

The economic profile for Zed Prime is Ag Ri, +1, F6D-2, -2,340, 5,940, 8, 58, 2.49.
### SECONDARY WORLDS
The economy of secondary worlds follows the same procedures as mainworlds, except for three factors: 
1. A secondary world can never have a higher importance than the mainworld – if this occurs, lower the importance of the secondary world to that of the mainworld. Or possibly reconsider the choice of mainworld. 
2. A dependent secondary world should not add the resources of the system’s planetoid belts and gas giants to its own. An independent secondary world may add some or all of the resource values from planetoid belts and gas giants at the Referee’s discretion. 
3. A secondary world receives an additional decrease of one to its importance for the purposes of determining ship traffic. This does not apply to a designated freeport.

#### ZED EXAMPLE
*Zed Secundus has desert, non-industrial and poor as its trade codes. Its importance does not suffer from the low Tech Level but losses a point of importance because of its low population and gains no benefit from any other modifiers giving it importance = -1 (which is two less than Zed Prime, so it needs no adjustment). Its base resource rating is 6, and the Referee decides to give it +1 for its gas giant primary planet (yes, this double-counts the gas giant by giving its bonus to both Prime and Secundus, but the Referee is not bothered by this) but nothing for the rest of the system, so its final resource rating is 7. The labor rating is simply 4. Infrastructure is -1 + 1D = 3. Efficiency factor can vary greatly at lower population levels, so the 2D-7 roll with DM+5 (for government, Law Level, PCR, progressiveness, and expansionism) is 9-7 + 5 = 7, but the efficiency rating maxes out at +5.*

*Computing base value, infrastructure is the limiting factor, so it is 2 × 3 = 6. TL modifier is 0.9, Port is 1.0, government is 1.3 and trade codes are 0.9 and 0.8 for a total modifier of 0.8424. With a positive efficiency factor, Zed Secundus has a GWP per capita of 1,000 × 6 × 0.8424 × 5 = Cr25272. So, despite being a poor desert moon with limited infrastructure, its good governance and progressive, expansionist outlook gives it a per capita wealth of more than three times its rich, agricultural, but rather overindulgent and backwards neighbour.*

*Zed Secundus has an inequality rating of 50 - 5 × 5 + 2D-7 × 2 + 8 - 3 = 28. That helps its development score equal 18.20. The freeport’s RU is 7 × 4 × 3 × 5 = 420, respectable but not enough to offset the drain of the ‘rich’ moon of the neighbouring world. The WTN for Zed Secundus is 5 + 2 = 7 + 0 = 7. As a freeport, the DM-7 to the tariff roll results in a negative value, indicating no tariffs.*



## STARPORTS

### STARPORT TRAITS
#### Primary Function
From Commercial to Military to Private. This shows the main purpose of the starport
#### Grade
From Minimal to Optimal. This refers to the operational condition of the starport, regardless of class
#### Resources
From Minimal to Extensive. This trait reflects the overall availability of key services and resources at the starport
#### Capacity
From Limited to Extensive. This trait reflects the overall capacity of the starport to handle various services
#### Traffic
From Minimal to Congested. This reflects the amount of traffic the starport handles
#### Efficiency
From Inefficient to Efficient. This measures how well the starport manages its resources and operations
#### Security
From Lax to Strict. This indicates the level of security measures in place at the starport
### STARPORT CLASSES
A world’s starport is its gateway to the larger universe. It may be anything from a vast city in space capable of producing massive warships and mega-freighters to an open field with an intermittently powered beacon. It may be nothing more than some painted lines in the dirt. On a high technology, high population world, there could be many places where a starship can land, be repaired or even built. By convention in Charted Space, only one facility on the mainworld’s surface and one facility (if any) in orbit is considered the starport of the system.

Within the Third Imperium, a designated starport facility is considered extraterritorial and under the jurisdiction of the Imperial Starport Authority (SPA), originally part of the IISS, but since 422 a part of the Imperial Ministry of Commerce. Regardless of whose authority the facility is under or whether any facility actually exists, a starport classification is recorded for every charted mainworld. To determine the class of starport serving a system, roll 2D with the listed modifiers:

**Table 94: Starport Class**

| <br>2D+DM | Starport<br>Class |
| :-------: | :---------------: |
|    2-     |         X         |
|    3–4    |         E         |
|    5–6    |         D         |
|    7–8    |         C         |
|   9–10    |         B         |
|    11+    |         A         |
**Die Modifiers for Starports**
- Population 0–2: DM-2
- Population 3–4: DM-1
- Population 8–9: DM+1
- Population A+: DM+2

Additionally, if the Population code is 0, a starport is usually no better than Class E, or in unsettled regions it is usually considered Class X. Frontier or backwater regions may have a DM-1 to starport class. Well-travelled main routes or core regions may have a DM+1 to starport class but a roll of 2 might still result in a Class X starport, as it is the indication of a prohibited or interdicted system.

A starport classification implies the existence or the possible existence of certain types of facilities and services.

**Table 95: Starport Facilities**

| Class | Highport? |   Fuel    |  Repair  |  Shipyard   | Naval Base? | Scout Base?* | Military Base? | Corsair Base? |
| :---: | :-------: | :-------: | :------: | :---------: | :---------: | :----------: | :------------: | :-----------: |
|   A   |    6+     |  Refined  | Overhaul |  Starship   |     8+      |     10+      |       8+       |       —       |
|   B   |    8+     |  Refined  | Overhaul | Spacecraft  |     8+      |      9+      |       8+       |       —       |
|   C   |    10+    | Unrefined |  Major   | Small craft |      —      |      9+      |      10+       |       —       |
|   D   |    12+    | Unrefined |  Minor   |      —      |      —      |      8+      |       —        |      12+      |
|   E   |     —     |     —     |    —     |      —      |      —      |      —       |       —        |      10+      |
|   X   |     —     |     —     |    —     |      —      |      —      |      —       |       —        |      10+      |
\*An Imperial Scout base on a major trade route associated with an express boat route has a 1D = 6 chance of being a waystation instead

To determine whether a highport is present use these DMs:

**Die Modifiers for Highport Presence**
- Population 9+: DM+1
- TL9–11: DM+1
- TL12+: DM+2

**Die Modifiers for Corsair Base Presence**
- Law Level 0: DM+2
- Law Level 2+: DM-2

The nearby civilizations and naval presence may alter the odds of a corsair base. Well-patrolled regions receive an additional negative DM of 1 or 2, while frontier or wilderness regions may receive a DM+1. Rarely will a scout and corsair base occupy the same port, although they may both be present within a system.

In addition to the facilities and services available at different starport classifications, the SPA has certain minimum qualifications relating to the specific capabilities and regulated costs for berthing for each class.

**Table 96: Minimum Starport Capabilities and Costs**

| Class | Sensors  | Total Docking Space | Berthing Fees | Refined Fuel per Day | Commercial Zones | Residential Zones |  Shipyard   |
| :---: | :------: | :-----------------: | :-----------: | :------------------: | :--------------: | :---------------: | :---------: |
|   A   | Improved |    100,000 tons     |  1D × Cr1000  |      2,500 tons      |   25,000 tons    |    10,000 tons    | 25,000 tons |
|   B   | Civilian |     50,000 tons     |  1D × Cr500   |      1,000 tons      |    5,000 tons    |    2,500 tons     | 10,000 tons |
|   C   | Civilian |     20,000 tons     |  1D × Cr100   |          —           |     100 tons     |     100 tons      |  200 tons   |
|   D   |  Basic   |      400 tons       |   1D × Cr10   |          —           |     100 tons     |         —         |      —      |
|   E   |    —     |          —          |       —       |          —           |        —         |         —         |      —      |
|   X   |    —     |          —          |       —       |          —           |        —         |         —         |      —      |

Sizing for docking space, commercial and residential zones are applicable for highports but downport-only facilities must have equivalently sized areas dedicated to each function or zone. Shipyard tonnage refers to the total size of downport and highport (if any) shipyards. Actual build capacity is at best half of this level, as some of the shipyard bays are often repurposed for repair and overhaul duties. As a rule of thumb, the largest vessel a starport shipyard can construct is 10% of its listed shipyard tonnage.

In Charted Space, a Class X starport in an inhabited system usually implies the world is under some sort of interdiction. This may be imposed by an external force, such the Imperial Navy or Scout Service, or it may be a choice of the inhabitants, prohibiting interstellar visitors. These worlds are usually marked as Red Zones.

Beyond Imperial borders, unsettled systems may have either a starport class of E or X assigned. Class E implies the world has been charted and some area cleared or designated as a landing zone capable of supporting the footprint of a starship of at least 400 tons. If the world has a vibrant biosphere and lacks visitors for more than a few years or decades, this designated landing spot may become unsuitable and the E classification more a notation in a database than a fact on the ground.

These rules apply in regions where interstellar contact is common. Even worlds without the Tech Level to support the construction of starships might have a Class A port and the imported tools and technicians to build and maintain such ships. In unexplored space, a world of TL7 is unlikely to have a Class A port regardless of the roll, although the Referee could have fun with a prototech ‘clockwork starship’ if desired.

### SPACEPORTS
Every facility in a system capable of handling spacecraft that is not the starport is a spaceport. This is the official policy of the Third Imperium but it does not hold outside its borders and is often more a policy than a reality even within Imperial borders.

Spaceports exist on secondary worlds with a permanent population or at least regular visitors. They may also exist in or near major cities or industrial centres on a mainworld. Spaceports in orbit or free space are considered space stations that may have characteristics which qualify them as spaceports. In general, a port designated as a spaceport is considered a recognised facility with public access. This differentiates them from private ports and freeports. To determine if a secondary world or inhabited space station has a spaceport, roll 1D with the listed modifiers:

**Table 97: Spaceport Class and Facilities**

| 1D+DM | Class |   Fuel    |  Repair  |           Remarks            | Equivalent Starport Class |
| :---: | :---: | :-------: | :------: | :--------------------------: | :-----------------------: |
|  2-   |   Y   |     —     |    —     |         No spaceport         |             X             |
|   3   |   H   |     —     |    —     |    Primitive installation    |             E             |
|  4–5  |   G   | Unrefined |    —     |        Basic facility        |             D             |
|   6   |   F   | Unrefined |  Minor   |        Good facility         |             C             |
|   7   |   F   |  Refined  | Overhaul | Possible spacecraft shipyard |             B             |
|   8   |   F   |  Refined  | Overhaul |  Possible starship shipyard  |             A             |

**Die Modifiers for Spaceport**
- Population 9+: DM+1
- TL9–11: DM+1
- TL12+: DM+2

Spaceport classifications indicate the minimum requirements for the facility. Nations on balkanised worlds and cities on any world may have public spaceports. Referees can use the previous table and DMs to randomly check for a spaceport in a particular mainworld location, if desired.

On the mainworld, many facilities listed as Class F may even approach Class A or B standards, despite the F designator requiring little better than Class D equivalency. If the Referee so elects or if a world is not subject to the SPA, any spaceport can be considered a starport, with its class as indicated in the equivalent starport class column of the table page 195, although these secondary ports are usually of no better Class than the first or official starport.

A Class G facility is not much better than a pad, minimal and possibly automated traffic control and a fuel pump. On some privately owned worlds, those with corporate governments especially, this may be the ‘public’ port but a private corporate port might be substantially better.

A Class H spaceport is the spaceport equivalent of
a class E starport, a cleared landing area deemed safe enough for landing a starship without crashing or causing the ground to collapse.

Class Y is the equivalent of a class X starport without the stigma or restriction. No safe landing zone is identified and anyone setting down on this world is on their own.

### PRIVATE PORTS
A private port is a spaceport that is not open to general traffic. It may be a corporate-owned facility at a mining outpost, transportation hub or shipyard facility or it may be limited to government-operated spacecraft for military, customs control or research purposes. Some wealthy individuals and nobles may own a private port, accessible to outsiders only by invitation.

The Referee may assign a private port as desired or use the Spaceport Class and Facilities table to determine its class. A private port could be the equivalent of a starport of better quality than the official starport but as it is not a public facility, it does not supersede the world or system’s general starport or spaceport rating. Although this superior port may influence effective Tech Levels within its controlling enclave, it does not provide any bonuses to a world’s Tech Level roll.

### FREEPORTS
A freeport is a public or quasi-public port not officially recognized by the SPA or by the local system government. Usually situated outside the effective jurisdiction of the local world’s control, often in orbit around a remote gas giant or above or upon some other distant world, the freeport can be either a spaceport or a starport, corporately run or independent.

The Referee can choose to roll on the Starport Class or the Spaceport Class and Facilities table with DMs for the world’s population to determines the class of starport or spaceport for the freeport. For independent secondary worlds, the any Tech Level DM associated with the classification does potentially provide a bonus to the freeport’s Tech Level roll.

Any spaceport randomly generated on a secondary world that is independent of the mainworld, meaning it is not Government code 6 or subject to the mainworld’s Law Level or worse, may be designated a freeport. Any spaceport generated on a secondary world with a Government code 1 can be a corporate freeport. These categorizations are at the Referee’s decision, independent of the random roll for freeport on the Secondary World Categorization table on page 163.

Corporate freeports tend to be tightly run ports. They can range from austere to luxurious but their main purpose is to earn a profit. Prices will be high and security will at least be good enough to prevent disruption to economic activities.

In general, a freeport will have no affiliation with the local government at all, as in the GeDeCo port at Oghma or the independent freeport at Blue, both in the Trojan Reach.

If a Referee so desires, a freeport does not need to be linked with any world. If treated as a starport and a roll to check for a highport indicates that the freeport is a highport, then no surface installation needs to exist. The Referee could decide to place a downport on a body but the freeport does not need to be near a natural body in the solar system. It may be just a space station in its own orbit around the sun(s). For world recording purposes, the port itself would be considered a Size 0 object.

### PORT CAPACITY
The economics section provides the values for importance, WTN and efficiency required below. The amount of ship traffic a port receives has direct influence on the size of a starport. While some starports might be overbuilt as part of a prestige project and others might be bursting at the seams with ships waiting for days or weeks for an open berth, most starports will tend to gravitate towards a supportable size. Ships tend to stay in port for about a week, maybe two if conducting maintenance, but longer stays mean higher costs and port operators do not want idle ships preventing their more active counterparts from moving people and goods through the port facilities.

A starport should be built at least large enough to handle its average weekly traffic and perhaps some multiple of daily maximum traffic. The latter is especially true for lower volume ports – having only one landing pad is inconvenient and possibly embarrassing when a second ship arrives. A world’s importance is a factor not only in the number of ships that arrive but in their size. A more important and higher population world is much more likely to see a 10,000+ ton mega-freighter arrive than an outpost of a few hundred people which could be supplied by a single free trader.

### STARPORT TRAFFIC
A world’s importance, combined with its location and trading status, is the major factor in the quantity and frequency of starship traffic. To determine the quantity and/or frequency of starship arrivals at a world’s starport consult the Expected Ship Traffic table.

In systems that are major trade hubs (WTN = A+), the effective importance of a world for ship traffic purposes is increased by one. This increase is for traffic, not capacity, as it does not necessarily bring in the massive freighters required by a world of greater inherent importance. For worlds on or beyond a frontier (but not at a border with another interstellar state with which there is trade), or for worlds with a WTN of 4 or less, the effective importance of a world for ship traffic purposes is decreased by one. The expected weekly column is based on a rounded number from daily traffic and a reasonable variance to cover surges.

**Table 98: Expected Ship Traffic**

| Importance | Definition            | Daily Traffic  | Daily Maximum | Expected Weekly |
| :--------: | --------------------- | :------------: | :-----------: | :-------------: |
|     +      | Exceptional Trade Hub | 3D × 20 + 2D-7 |      365      |      2,000      |
|     5      | Very Important        | 3D × 10 + 2D-7 |      185      |      1,000      |
|     4      | Important             |     2D+10      |      22       |       150       |
|     3      | Ordinary              |      2D-5      |       7       |       30        |
|     2      | Ordinary              |      1D-2      |       4       |       20        |
|     1      | Ordinary              |      1D-3      |       3       |       10        |
|     0      | Unimportant           |      1D-4      |       2       |        5        |
|     -1     | Unimportant           |      1D-5      |       1       |        3        |
|     -2     | Very Unimportant      |     2D-11      |       1       |        2        |
|     -3     | Very Unimportant      |     2D-11      |       1       |        1        |
|     —      | Uncharted             |     3D-17      |       1       |        0        |
|     —      | Unexplored            |     4D-23      |       1       |        0        |

A result of 0 or less on the daily traffic roll equals no traffic arriving that day. If the safe jump diameter is far from the starport, as for worlds far inside their star(s) 100D limit, the Referee may wish to determine traffic based on ships exiting jump space rather than when they arrive at port. Ship encounters can be resolved using the Space Encounter table on page 155 of the Traveller Core Rulebook, or some other encounter table relevant to a region such as the Prey Encounter table from page 14 of The Pirates of Drinax Book 1.
Values for uncharted and unexplored are included as reference for explorers of barren worlds beyond the bounds of civilized space.

Starports also have minimum size requirements for various features as detailed in the Minimum Starport Capabilities and Costs table on page 195. This represents a floor for starport certification but many ports far exceed these values or may have multiple port installations to cover all system traffic. A world with an efficient economy has a port generally in line with traffic requirements, while those with lower efficiencies may have ports less aligned to market conditions.
To determine the size and capacity of a port, use the
following formulas for each type of port.

### HIGHPORT TOTAL DOCKING CAPACITY
If a highport is present, total highport docking capacity is based on starport class:

**Formula Highport Total Docking Capacity**
$\text{Class A High Port Docking Capacity} = 100,000 + \text{Importance} \times \text{Expected Weekly} \times 500 \times \text{Population} \times ( 1 + \frac{\text{1D} + \text{Efficiency Factor}}{5})$
$\text{Class B High Port Docking Capacity} = 50,000 + \text{Importance} \times \text{Expected Weekly} \times 500 \times \text{Population} \times ( 1 + \frac{\text{1D} + \text{Efficiency Factor}}{5})$
$\text{Class C High Port Docking Capacity} = 20,000 + \text{Importance} \times \text{Expected Weekly} \times 200 \times \text{Population} \times ( 1 + \frac{\text{1D} + \text{Efficiency Factor}}{5})$
$\text{Class D High Port Docking Capacity} = 500 + \text{Importance} \times \text{Expected Weekly} \times 100 \times \text{Population} \times ( 1 + \frac{\text{1D} + \text{Efficiency Factor}}{5})$

These equations assume the following:
* If the effective importance was adjusted by a high WTN for the purpose of increasing expected traffic, the actual importance is used in these calculations, but if a world’s importance is less than +1, treat it as +1 in these calculations.
* Expected weekly is determined from the Expected Ship Traffic table on page 197.
* Population refers to the population code of the world.
* Round results up to the nearest 100.

Highport internal docking capacity (which requires three times the displacement of the ships it can accommodate) varies greatly, sometimes using spare shipyard capacity to accommodate ships. For most highports, internal docking capacity will be no more than 10% of total docking capacity; a Class D highport rarely has any internal capacity and may be little more than a converted hull with airlocks marked as docking ports.

Repairs, annual maintenance and any other overhaul work requires an internal bay. A highport will generally have one internal bay equal to 10% of its total internal bay capacity (or 1% of its total docking capacity)
but most will be sized to accommodate the most common sizes of ships serviced by the starport. A world of importance 0 or less rarely has any bays accommodating ships larger than 600–800 tons and most bays will be sized for ships of 400 tons or less.

### DOWNPORT TOTAL DOCKING CAPACITY
A downport’s capacity depends on the existence of a highport. On many worlds, a downport supporting a major highport is little more than a transit terminal for passenger and cargo shuttles. On worlds without a highport, the downport must have enough pad capacity to qualify for a starport classification and uses the same calculation as for highport capacity. A Class E downport has the following size calculation:

**Formula Highport Total Docking Capacity**
$\text{Class E High Port Docking Capacity} = 400 + \text{Importance} \times \text{Expected Weekly} \times 100 \times \text{Population} \times ( 1 + \frac{\text{1D} + \text{Efficiency Factor}}{5})$

This is barely different than a Class D but a Class E has no internal bays and no facilities beyond a (possibly) functional beacon and maybe some lighting and a control tower.

Also important for downports is their pad sizes. Few ships larger than 5,000 tons are capable of planetary landing, so only the rare port that expects larger ships has any downport pads exceeding 5,000 tons capacity. The maximum pad size at most downports is 2,000 or 1,000 tons. Most pads intended for starship landings are sized to support ships up to 400 tons but large ports will also have pads dedicated to 200 and 100 ton ships for more efficient space usage. A 1,000 ton pad is normally the largest available at Class C ports.

As with highports, most downports will only have enclosed and pressurized pads available to support 10% of capacity but on inclement worlds, especially those with corrosive or insidious atmospheres, all or at least most pads will be environmentally sealed. This is rarely true for worlds which are only dangerous to people but not to ships; on worlds with vacuum or trace atmospheres a terminal with docking arm extensions serves most vessels in a manner similar to highports’ external docking terminals.

If a highport exists, the Referee may decide to limit the size of the downport to 1D × 10% of the highport capacity or split the capacity that was determined for the highport into downport and highport portions.

### SHIPYARD BUILD CAPACITY
Class A starports and associated facilities have the capacity to build starships. Class B starports have shipyards that can build interplanetary spacecraft. Class C starports can build small craft of 100 tons or less but few ports of this class focus on shipbuilding, except perhaps to support a local mining community.

For certification, a Class A starport must have a shipyard of 25,000 tons but a shipyard requires two tons for every ton of ship built. Minimum yard build capacity for Class A certification is therefore 12,500 tons. For Class B minimum yard build capacity is 5,000 tons. Class C starports are not required to have any yards at all, although they may support the construction of small craft. Actual capacity depends upon the total world population (TWP) and a number of factors:

**Formula: Shipyard Build Capacity**
$\text{Class A Yard Build Capacity} = (\text{Efficiency Factor} + \text{Infrastructure Factor} + \text{1D} + \text{DMs} \times \frac{\text{Total World Population}}{20000})$
$\text{Class B Yard Build Capacity} = (\text{Efficiency Factor} + \text{Infrastructure Factor} + \text{1D} + \text{DMs} \times \frac{\text{Total World Population}}{100000})$
$\text{Class A Yard Build Capacity} = (\text{Efficiency Factor} + \text{Infrastructure Factor} + \text{1D-3} + \text{DMs} \times \frac{\text{Total World Population}}{15000})$

**Die Modifiers for Shipyard Build Capacity**
- TL0–8: DM-4
- TL12–14: DM+2
- TL15+: DM+4
- Non-Industrial: DM-2
- Industrial: DM+2

Round the result up to the nearest 100. If the Class A result is less than 10,000 tons, change the result to 9,000 tons + 1D × 500 tons. This may still represent a shortfall from Class A requirements but indicates a portion of the yard is not available for any number of reasons. Class A shipyards on a world of TL8 or less are either building prototype vessels or using imported jump drive components and tooling to complete its starships. In either case, ships built at these yards will cost at least twice the standard starship price.

If the Class B result is less than 5,000 tons, change the result to 4000 + 2D × 100 tons. At the Referee’s discretion Class B shipyards may be able to complete starships built with imported jump drives, although such drives should cost double, and the local Tech Level must be high enough to support the drive components, i.e., a TL11 Class B port could only use imported jump drives of TL11 or less. As with Class A yards, a Class B yard may be able to build higher TL ships but such ships will cost twice or more standard prices.

If the Class C result is less than 0, then no functional Class C shipyard exists. Even where such yards exist, they may be detached or unaffiliated spacecraft builders. The Referee can rule that no shipyards exist for any particular Class C port. On worlds of less than TL8, such Class C yards rarely exist.

Maximum construction bay size of any shipyard does not normally exceed 10% of total shipyard capacity. Larger ships may be built in segments to be assembled later but this is only possible for orbital shipyards. If no highport exists, this option is limited to Size 0 worlds. Where highports exist, the Referee is free to allocate the total shipyard capacity between the highport and downport.

The construction of some ships, especially larger ships, may tie down yard capacity for years or possibly decades, so a shipyard’s annual output is normally some fraction of its total capacity. For shipyards specializing in smaller starships or small craft, annual output may actually exceed the shipyard’s capacity but for most yards annual output as a percentage of yard capacity will actually decrease as yard size increases. This depends to a large extent on the importance of a world, since more important worlds require larger ships. To determine annual output:

**Formula: Annual Shipyard Output**
$\text{Annual Shipyard Output (for Importance 1+)} = \frac{\text{Shipyard Build Capacity}}{\text{Importance}}$
$\text{Annual Shipyard Output (for Importance 0-)} = \text{Shipyard Build Capacity} \times (1-\text{Importance})$

This factor does not apply to Class C shipyards. As they only produce small craft, their shipyard output is always equal to 10 times their shipyard build capacity.

### ADDITIONAL STARPORT DETAILS
For features related to the idiosyncrasies of various ports, consult the Traveller Companion Starports and Spaceports chapter starting on page 125.
### STARPORT PROFILE
A starport profile is rather limited, including only the class, what sorts of ports (high, or down) exists and the adjusted Importance for determining weekly expected traffic, recorded as:

**C-HX:DX:±#**
Where
- C = class, H = highport
- X = Y(es) or N(o)
- D = downport
- ±# = ± importance# adjusted for traffic volume. Additional port information, such as capacity, shipyards, berthing costs and other information is not included.

### ZED EXAMPLE
*Zed Prime has a previously rolled Class C starport. Delving into details, with a Population of 7 and TL8, there is no DM for a highport and a 2D roll of 6 indicates none exists. Class C starports have no naval bases; the roll for scout base is a 12 – one definitely exists and for military base, 9, none. The Referee makes no roll for a waystation.*

*The Class C starport designation corresponds to one of the nations in the oligarch faction. For other nations, the Referee decides against rolling for all seven but does roll for the biggest of the governorship faction, which has a population of at least 6. A roll of 4 + 2 = 6 and indicates a Class F spaceport, which is potentially effectively a Class C equivalent, or would be if an outside authority recognized it as the primary starport.*

*Zed Prime has an importance of +1 and a WTN of 8, so there is no reason to change the effective importance of the system with regards to ship traffic. Zed Prime can expect to see 1D-3 ships per day, or up to 10 per week as an average. That is also the likely number of ships at the Class C downport at any one time. The capacity of the downport (since there is no highport) is 20,000 + 1 × 10 × 200 × 7 × (1 + (1D + -2) ÷ 5), resulting in 34,000 – enough to qualify for a class C. Note that world population is always used for starport capacity, as this port at least theoretically provides access to the stars for the entire world.*

*The Referee determines that the largest pad is 1,000 tons (and decides there are two) and only 3,400 tons of enclosed landing facility (seven bays supporting 400 tons each and one 600 ton bay) are available. This facility is actually rather overbuilt for the amount of expected traffic, so likely one of the large pads and a large portion of the standard 600 and 400 ton pads (there are a dozen of the larger and three dozen of the smaller, the rest of the space is for small craft) are leased to the scout base for its use. On most weeks, the starport would require less than 4,000 tons of pad space, a fraction of capacity, to operate. Zed Prime’s infrastructure is definitely overbuilt. Berthing fees are rolled as 2 × Cr100 or Cr200 for a standard six day berthing but the Referee decides to make it Cr500 instead, to cover the inefficiency.*

*Zed Prime does not require any shipyard facility but for illustrative purposes, the roll for yard build capacity is (-2 + 13 + 1D-3 - 4) × 18,000,000 ÷ 100,000, resulting in 1,500 tons, Zed Prime’s overbuilt infrastructure provides for a local small craft building industry despite the low tech level. As a Class C shipyard, the annual shipyard output is 10 times the same as its yard capacity. The starport profile for Zed Prime is C-HN:DY:+1.*

*Moving to Zed Secundus, the Referee has previously decided to make this world’s port an independent starport-class freeport, rolled as if it were an independent world and resulting in a Class C starport. The Referee decides the freeport is a downport by default and checks for a highport with DM+1 for TL9-11, rolling a 7 +1 = no, and getting no for scout and military bases as well.*

*The freeport of Zed Secundus has an Importance of -1 and a WTN of 7. Since it is a freeport, its importance is not lowered with regards to ship traffic, so it can expect to see 1D-5 starships arrive per day, meaning only on 1 in 6 days does anyone from outside the system actually avail themselves of the port and three ships is the most it will statistically see in port in any week. The Referee assumes interplanetary traffic keeps the port afloat. Still, it is a Class C downport-only facility, so its capacity becomes 20,000 + 1 × 3 × 200 × 5 × (1 + (1D + 5) ÷ 5), resulting in 27,200 tons of capacity. The Referee decides to make the port rather similar to the one on Zed Prime but allows for 4,000 tons of enclosed bays (two of 600 tons, five of 400 tons, and four of 200 tons) and only two 1,000 ton pads. The rest is a mix of 600, 400, and 200 ton pads and small craft facilities. Berthing is rolled as Cr300, less expensive than the port at Zed Prime and with a lower Law Level and lack of tariffs – all things to entice more traffic.*

*At TL9, Zed Secundus is more likely to have a shipyard than its less advanced neighbor with a capacity of 5 + 3 + 1D-3 + -2) × 140,000 ÷ 100,000 resulting in 9.8 rounded up to 100 tons. Low population size has a major effect on the ability to support a shipbuilding industry but since the ‘minimum’ shipyard for a Class C is 200 tons, the Referee decides to increase capacity to that level. Annual output of the Class C shipyard is 10 times greater, or 2,000 tons. The starport profile for Zed Secundus is C-HN:DY:-1.*

## MILITARY
The economics section provides the values for efficiency and the culture section provides many of the modifiers for branch existence. Detailed Tech Level subcategories can optionally be used to determine modifiers. Most worlds spend a portion of their GWP on a military, or at least on a law enforcement contingent able to act as an armed defense force. The amount of budget spent on armed forces and the nature of those forces can vary greatly among different governments and societies and it will change over time in response to prolonged peace or the threat, or actuality, of war.

**Table 99: Military Branch Descriptions**

| Military Branch | Category       | TL  | Description                                                         |
| --------------- | -------------- | :-: | ------------------------------------------------------------------- |
| Enforcement     | Surface        | 0+  | Armed law enforcement, including paramilitary internal security     |
| Militia         | Surface        | 0+  | Defensive light armed forces, often semi-professional or reservists |
| Army            | Surface        | 0+  | Professional army                                                   |
| Wet Navy        | Surface        | 0+  | Professional wet navy                                               |
| Air Force       | Close Support  | 4+  | Professional air or close orbit forces                              |
| System Defence  | System Support | 7+  | Defensive spacecraft and space weapon platforms                     |
| Navy            | Space Combat   | 8+  | Professional system or interstellar space combat forces             |
| Marines         | Space Assault  | 8+  | Professional offworld assault troops                                |

The Referee can develop a detailed view of a world’s military capabilities. This is only necessary if a large scale naval or mercenary adventure or campaign requires it. Simply determining whether a branch exists and estimating the effective military expenditures is enough work for nearly any other situation. Additional detail on military force strengths and composition is a topic for another sourcebook.
#### MILITARY TRAITS
#### Size
 From Negligible to Overwhelming. This trait reflects the overall size of a military force.
#### Training
From Untrained to Elite. This trait indicates the level of training and expertise within the military.
#### Equipment
From Obsolete to Cutting Edge. This trait represents the quality and technological advancement of the military's equipment.
#### Discipline
From Lax to Rigid. This trait indicates the level of discipline and adherence to orders within the military
#### Aggressiveness
From Passive to Belligerent. This reflects the military's willingness to engage in offensive actions
#### Sense of Duty
From Self-serving to Sacrificing. This reflects the degree to which members of the military prioritize the mission and the nation over personal gain.
#### Sophistication
From Crude to Refined. Signifies the complexity and effectiveness of military tactics and strategies
### BRANCH OVERVIEW
Each function performed by the armed forces of a world has specific capabilities and basic requirements. Depending on Tech Level, a world can have various branches.

Each branch represents a capability, not necessarily a completely different organizational or command structure. What follows are guidelines for a high level overview of a world’s military capabilities. How they are implemented is left to the discretion of the Referee. For modifiers based on Tech Level, the Referee can choose to apply Tech Level subcategories both for military equipment and for transportation associated with different functions (land, sea, air, space) if desired.

If a branch exists, the Referee should record the Effect of the existence check as part of the world’s military summary to determine its relative size or budget. When a branch exists, an Effect of 0 is treated as a 1 and Effects above +18 are treated as 18 (J). For all branches, a nation or faction on a world with Government code 7 receives both its own government DMs (if any) and any for Government code 7.

Militancy DMs apply to all branches:

**Militancy Die Modifiers for Branch Existence**
- Militancy 1–2: DM-4
- Militancy 3–5: DM-1
- Militancy 6–8: DM+1
- Militancy 9–B: DM+2
- Militancy C+: DM+4

In addition to militancy and the DMs listed for each branch below, the following DMs exist when the branch is involved in active or potential warfare:

**Active or Potential Warfare Die Modifiers for Branch Existence**
- Heightened Tensions: DM+1
- Insurgency: DM+2
- War: DM+4
- Total War: DM+8

These conditions can be drawn from the Faction Relationship table on page 161. Insurgency assumes ongoing guerrilla warfare, with some regions possibly under rebel control. War assumes active combat (ground warfare, missile strikes, space battles, and so forth) between belligerents. Total war assumes the continued existence of the government is at risk or weapons of mass destruction are in use or are at high risk of being used. These DMs only apply when relevant to the function of the branch. For instance, a wet navy might receive a DM+4 while its government is involved with a conflict with a neighboring government with which it shares a water border or if both governments are fighting in a world’s seas or oceans, but it would not normally receive that DM if its government was fighting a foe in a different star system or if two governments faced off over a desert border region.

Some branches have a DM for risk. By default risk is defined as potentially hostile systems within 10 parsecs, but the Referee may choose to redefine risk to adhere to local conditions

### ENFORCEMENT BRANCH
Nearly every world will have some form of law enforcement branch, even if it is a Law Level 0 world with a posse raised as necessary. Organization and equipment can range anywhere from unarmed first responders on foot to paramilitary tactical units in armored vehicles, depending on the world’s government and/or Law Level.

**Formula: Enforcement Branch**
$\text{Enforcement Branch Exists by Default:} = 3 + \text{DMs}$

**Die Modifiers for Enforcement Branch**
- Government 0: DM-5
- Government B: DM+2
- Law Level 0: DM-4
- Law Level 1: DM-2
- Law Level 2: DM-1
- Law Level 9–B: DM+2
- Law Level C+: DM+4
- PCR 0-4: DM+2
- Factional Uprisings: DM+2

Any Effect of less than 1 is treated a 1 unless the Referee purposely wishes to create a world without any law enforcement.

### MILITIA BRANCH
Not all worlds have militias. These units are often part-time, retired personnel subject to recall or lightly armed defenders of property with tenuous at best connection to the local government structure. Militias most often exist on low Law Level and generally rural worlds. The militia branch is rarely anything but infantry soldiers with unarmored or lightly armored transportation. A Referee may decide whether a world has militia forces or determine it randomly:

**Formula: Militia Branch**
$\text{Militia Exists on 4+:} = \text{2D} + \text{DMs}$

**Die Modifiers for Militia Branch**
- Government 1: DM-4
- Government 2: DM+2
- Government 6: DM-6
- Law Level: DM-Law Level
- PCR 0–2: DM+2
- PCR 3–4: DM+1
- PCR 6+: DM-1

### ARMY BRANCH
A professional army exists on most balkanized worlds, those with military bases, some where external or internal conflict is potentially likely and others that have treaty obligations to maintain permanent armed forces. An army may not always be called an army, it may be a ‘self-defense force’, ‘protectors of the faith’ or whatever name is politically acceptable but a professional organization of armed individuals whose mandate is applying lethal or destructive force to solve the government’s problems qualifies functionally as an army.

At TL10 and above, as grav vehicles become dominant, the army often absorbs some or all of the functions of the wet navy and air force. A Referee may decide whether a world has an army or determine it randomly:

**Formula: Army Branch**
$\text{Army Exists on 4+:} = \text{2D} + \text{DMs}$

**Die Modifiers for Army Branch**
Militia exists: DM-2
Government 0: DM-6
Government 7: DM+4
Government A+: DM+4
TL0-7: DM+4
TL8+: DM-2
Military Base: DM+6
Risk: DM+2
Factional Uprisings: DM+2

A world with Government code 6 uses the DMs of its owning world and DM+8 if it is, or hosts, a military base or penal colony or is under direct military rule.

### WET NAVY BRANCH
A wet navy only exists on worlds with Hydrographics 1 or above. At TL10+ most duties of a wet navy merge with those of grav-equipped army units. At these higher Tech Levels, the remaining wet navy assets are often deep diving submarines, mostly acting as missile platforms, although these units are sometimes assigned to the system defense branch instead.

Even when theoretically needed, a wet navy only exists on worlds where conflicts fought on water or amphibious operations are likely. This can be true on low and mid-tech balkanized worlds, or high hydrographics worlds with internal unrest. The Referee should consider local conditions when determining the existence or size of the wet navy, but if determined randomly:

**Formula: Wet Navy Branch**
$\text{Wet Navy Exists on 4+:} = \text{2D} + \text{DMs}$

**Die Modifiers for Wet Navy Branch**
- Hydrographics 0: DM-20
- Hydrographics 1–3: DM-5
- Hydrographics 8: DM+2
- Hydrographics 9: DM+4
- Hydrographics A: DM+8
- Government 7: DM+4
- TL0: DM-8
- TL8–9: DM-2
- TL10+: DM-TL

### AIR FORCE BRANCH
In a traditional sense, an air force requires ‘air’. This is true for everything from balloons to hypersonic aircraft but with the advent of grav or lifter technology, flight no longer requires lift, ‘lighter than air’ gases or combustion engines. At TL10+ the distinction between ground and air forces is often little more than a matter of emphasis, with grav vehicles capable of covering all surfaces of a world and reaching orbit. At higher Tech Levels, if the air force remains independent from both army and system defense forces, it is often referred to as the close orbit and airspace control command or COACC.

An air force can theoretically exist as early as TL3, although early balloons and dirigibles are often operated by other branches of the military. With the advent of the first fixed wing aircraft at TL4, independent air forces become a practical consideration. Past TL10 their functions are often
split between ground and system defense forces. To determine randomly if an air force exists:

**Formula: Air Force Branch**
$\text{Air Force Exists on 4+:} = \text{2D} + \text{DMs}$

**Die Modifiers for Air Force Branch**
- Atmosphere 0 or 1 and TL0–8: DM-20
- Atmosphere 2, 3 or E and TL0–8: DM-8
- Atmosphere 4 or 5 and TL0–8: DM-2
- Government 7: DM+4
- TL0–2: DM-20
- TL3: DM-10
- TL10–12: DM-4
- TL13+: DM-6

### SYSTEM DEFENCE BRANCH
System Defense covers a variety of capabilities, from surface emplacements to multi-thousand ton asteroid-hull monitors armed with spinal weapons. The key feature of a system defense force is its ability to fight an opponent in space. This includes planetary defense missiles, advanced guns, laser installations and deeply buried meson emplacements. Defense systems at naval bases are effectively system defense assets, as are fighters, system defense boats and larger spacecraft often termed monitors. Monitors range in size from thousands of tons to multi-hundred thousand ton asteroid or battle-rider class ships whose mission is to defend the homeworld.

A system defense branch can theoretically exist as early as TL6, providing missile defense to a world’s key surface installations and orbital space. At TL8 and above, practical warfighting spacecraft and orbital defense stations can add to system defense capability. Most worlds with this capability have some sort of system defense branch, at least for protection of starports and key facilities but all of these systems are expensive. To randomly determine if a system defense branch exists:

**Formula: System Defense Branch**
$\text{System Defense Exists on 4+:} = \text{2D} + \text{DMs}$

**Die Modifiers for System Defense Branch**
- Population 0–3: DM-6
- Population 4–5: DM-2
- TL0–5: DM-20
- TL6: DM-8
- TL7: DM-6
- TL8: DM-2
- Starport A: DM+4
- Starport B: DM+2
- Starport C: DM+1
- Starport E: DM-2
- Starport X: DM-8
- Highport: DM+2
- Naval Base: DM+4
- Military Base: DM+2
- Risk: DM+2

### NAVY BRANCH
In this context a naval branch is a military force capable of interstellar travel. Not every ship in the naval fleet need be a starship: support vessels, fighters and even battle riders might be part of the navy’s complement of vessels but to differentiate itself from a system defense force, a navy is jump-capable. This requires TL9 or greater technology, although in theory early prototypes at TL7 could function as a crude and expensive jump drive. A single world only requires an interstellar navy if it intends to project force outside its star system, or perhaps to distant corners of its own system where a jump is the most efficient means of travel. For functional purposes, a world with its own exploration service, whether separate or joint, armed or not, is considered part of the navy. To randomly determine if a navy branch exists:

**Formula: Navy Branch**
$\text{Navy Exists on 4+:} = \text{2D} + \text{DMs}$

**Die Modifiers for Navy Branch**
- Population 0–3: DM-6
- Population 4–6: DM-3
- TL0-5: DM-20
- TL6: DM-12
- TL7: DM-8
- TL8: DM-6
- Starport A: DM+4
- Starport B: DM+1
- Starport E: DM-2
- Starport X: DM-8
- Highport: DM+2
- Naval Base: DM+4
- Military Base: DM+2
- Expansionism 1–5: DM-2
- Expansionism 9–B: DM+2
- Expansionism C+: DM+4
- Risk: DM+2

### MARINE BRANCH
A marine branch is defined as a fighting force equipped for space combat. Marines may be called ‘security officers’ or ‘naval infantry’ and might be part of a naval force structure but their function is to fight battles aboard ships or on worlds not their own. Army troops might occupy other worlds but marines are equipped to establish beachheads, conduct raids and act as the vanguard of any spaceborne military force. A marine unit may be attached to either a system defense branch or a navy branch but if neither is present marines can in theory still exist, acting as commando troops and ferried by hired transport or acting as guards on a world’s merchant shipping or foreign embassies. In such cases, the size of the marine branch is likely to be very small, regardless of the Effect. To randomly determine if a marine branch exists:

**Formula: Marine Branch**
$\text{Marine Exists on 4+:} = \text{2D} + \text{DMs}$

**Die Modifiers for Marine Branch**
- Population 0–5: DM-4
- TL0–8: DM-6
- Naval Base: DM+2
- Military Base: DM+2
- No Navy: DM-6
- No System Defense: DM-6
- Expansionism 1–5: DM-4
- Expansionism 9–B: DM+1
- Expansionism C+: DM+2
- Risk: DM+2

### MILITARY BUDGET
Before allocating funds to various military functions, a world must acquire those funds, either through taxation or transfer of payments from an outside party. The basic military budget is equal to 2% of a world’s GWP. On balkanized worlds, the military budget is almost always determined independently for each faction or nation but for expediency a Referee may choose to blend various DMs to determine an overall world budget. The amount computed does not necessarily need to conform to the total percent of GWP spent on military budget items. On some worlds the allocated money is not effectively allocated or may be lost to corruption or other factors. The percent of GWP normally available to a world, faction or nation to spend on useful equipment, personnel, facilities and services is:

**Formula: Military Budget**
$\text{Military Budget (\%)} = 2\% \times (1 + \frac{\text{Efficency Factor}}{10}) \times (1 + \frac{\text{2D-7} + \text{DMs}}{10})$
$\text{Minimum value of (2D-7 + DMs) is -9}$

**Die Modifiers for Military Budget**
- Government 0, 2 or 4: DM-2
- Government 5: DM+1
- Government 9: DM-1
- Government A or F: DM+3
- Government B, C or E: DM+2
- Law Level C+: DM+2
- Military Base: DM+4
- Naval Base: DM+2
- Militancy: DM+Militancy - 5
- Branches: DM-4 + (Total Effect of all branches)÷10 (rounded down)

A world with Government code 6 uses the DMs of its owning world and DM+6 if it is or hosts a military base or penal colony, or is under direct military rule.

The formula assumes a period of general peace for a world that believes defense is a good investment. If a world becomes complacent, either through generations of peace, membership in a large and powerful interstellar polity whose borders extend 10 or more parsecs beyond the world or some other complacency factor, then effective military spending tends to decline. War or the threat of war has the opposite effect. The following multipliers apply to the basic military budget:

**State of Readiness Modifiers**

| State of Readiness                                       | Modifier |
| -------------------------------------------------------- | -------- |
| Complacent peace                                         | 0.50     |
| Low threat level                                         | 0.75     |
| Heightened tensions, threat of war or internal uprisings | 1.00     |
| War or internal insurgency                               | 1.20     |
| Total war: full mobilization                             | 5.00     |

A Referee may adjust or apply other modifiers as desired. The budget modifiers apply to the current standard year’s conditions. If determining a capital budget for existing capital asset composition, the Referee should adjust the budget to reflect an average over the course of the assets’ construction and operational lives.

**Formula: Military Budget**
$\text{Total Military Budget} = \text{GWP} + \text{Basic Military Budget\%}

The number determined as the total military budget is the total pool of money for personnel, equipment and bases and serves as a comparison value to other worlds. Half or more of this amount is likely allocated to personnel costs and overhead, while the remainder may be available for equipment. If a world’s armed forces are primarily robotic, the portion spent on equipment may be higher.

### MILITARY PROFILE
The eight functions of a military can be summarized in an eHex string of the format:

**EMAWF-SNM**

Where the latter three digits (SNM) represent the forces available outside the world’s atmosphere: system defense, navy and marine. This represents a world’s relative ability to fight in these realms of operation but it is a relative strength profile which does not consider actual funding or Tech Level. An optional addition to the profile is the military budget percentage added as : #.##%.

## BASES
A world may have various associated bases including navy, scout and military bases. Their existence is established during the starport determination process based on the Starport Facilities table on page 194 and any associated DMs.

If bases exist, they may be associated with the world itself or a larger interstellar polity. In the latter case, the world has little influence on the sizing or capabilities of the base, although it may prove to be a boon to the local economy. These ‘foreign’ bases may be co-located with the starport or might not even be located near the mainworld but elsewhere in the system. Based on the particulars of the system and region, the Referee determines whether a base facility is associated with a larger polity or the mainworld.

The following base profiling sections concern those bases under the control of the system’s mainworld. In some cases, these may even share facilities or support services with an interstellar polity’s bases. These procedures are only relevant if a base is already indicated for the system and the base is owned and operated by the mainworld.

### NAVAL BASE
A naval base is most often a space-based facility:

**Formula: Naval Base is Space-based**
$\text{Existing Naval Base is Spaced-based on 4+:} = \text{2D} + \text{DMs}$

**Die Modifiers for Naval Base in Space**
- No Highport: DM-2
- TL0–7: DM-8
- TL8: DM-4

A space-based facility can be constructed as a space station using High Guard or can be abstracted based on total tonnage. Abstracted requirements for a naval base typically include:
- Pressurised internal docking tonnage is equal to three times the size of the largest naval ship in the fleet.
- Additional internal docking tonnage equal to 15% of total fleet tonnage (including the largest ship).
- Multiplier for the station’s required functions = 2 × total internal docking space.
- Additional tonnage for any weapons systems specified = 2 × weapon size (turrets, bays and so on).
- Enough external docking capacity for 25% of the fleet based in or out of the base – this is normally accounted for by the tonnage already allocated, as a base can accommodate 200% of its total tonnage in externally docked ships.

Note that for ease of calculation ‘docking tonnage’ means space devoted to internal docking facilities, not actual internal docking capacity, which would be one-third of this value.

### SCOUT BASE
An independent scout base is uncommon, especially as a separate installation. When present, they are often referred to as an exploration base instead. For simplicity, an individual world does not have a separate scout branch but may allocate a portion of its navy or even system defence branch (for in-system-only scouts) spacecraft to a scout base.

As with a naval base, a scout base is likely to be space-based if a highport exists:

**Formula: Scout Base is Space-based**
$\text{Existing Scout Base is Spaced-based on 4+:} = \text{2D} + \text{DMs}$

**Die Modifiers for Scout Base in Space**
- No Highport: DM-4
- TL0–8: DM-4

An IISS waystation is always space-based. A scout base has similar requirements to a naval base but tends to be a leaner facility and is often armed with only a few defensive weapons. This base can be designed using High Guard or abstracted. The abstracted requirements for a scout base are:
- Pressurised internal docking tonnage is equal to three times the size of the largest scout ship in the fleet.
- Additional internal docking tonnage is equal to 10% of total fleet tonnage (including the largest ship).
- Multiplier for the station’s required functions = 2 × total internal docking space.
- Additional tonnage for any weapons systems specified = 2 × weapon size (turrets, bays and so on).
- Enough external docking capacity for 20% of the fleet based in or out of the base.

For scout bases, docking tonnage means space devoted to internal docking facilities, not actual internal docking capacity, at a third of this value.

### MILITARY BASE
A military base is most often a facility owned and operated by the mainworld. Many worlds will have more than one military base, perhaps hundreds or thousands of facilities to support their land, sea and air combat branches. System defence forces can use an existing local navy base for support.

#### Corsair Base
Costs for a corsair base are normally only borne by a government which is sponsoring the corsair base – pirates who occupy an uninhabited region and set up camp are responsible for their own costs. However, the Referee may rule that the mainworld government is being extorted into paying for the corsair base upkeep as ‘protection money’.

There are no standards for corsair bases. The Referee is free to use any of the base sizing procedures above or parts of the procedures as desired.

### ZED EXAMPLE
*Zed Prime is a balkanized world and its military budget should be independently determined for its two factions, if not its seven nations. In the interest of simplicity, this example will split the population into the governorship (I) and oligarch (II) factions. The PGLs, TL and militancy for governorships is 6BA, TL7 and C, and for oligarchies, 636, TL8 and 6. The Referee decides to determine what services exist for each faction, recording the Effect scores to document their profile and then calculate the effective military budget percentage.*

*Starting with the governorships, militancy of C grants an overall DM+4. Despite simmering conflicts, the DMs for insurgency are not in effect but the Referee will allow specific branch DMs for ‘factional uprisings’.*

*First, an enforcement branch automatically exists, with a DM+8 plus the global DM+4 added to the baseline Effect of 3, to be 15 – or F – for enforcement effect.*

*For militia branch existence, the DMs are -10 for Law Level, +1 for PCR 3 and the standing DM+4 for a total DM-5. A roll of 11 on 2D is adjusted to 6, which is more than 4, so a militia branch exists with Effect 2 (6-4=2). It is up to the Referee to determine if these are reserves, self-defense forces, death squads or potential insurrectionists.*

*For the army branch, the DMs are -2 for the militia, +4 for government 7 and +4 for government B, +2 for factional uprisings, for a total DM of +12. A 2D roll of 4 still results in an Effect of 12 or C.*

*For the wet navy, the DM+4 for government 7 applies for a total DM+8. The roll of 5 means a navy exists with Effect 9 (5+8-4 = 9), although the Referee decides this is more a coast guard and riverine patrol force than a ‘blue water’ offensive branch.*

*For an air force branch only the DM +4 for militancy applies and a roll of 6 results in an Effect of 6, less than both army and navy. The Referee considers this also an inward and border-focused force and decides to consolidate both the navy and air force into the army command structure.*

*A system defense branch is unlikely at TL7. The faction does not control the starport so the DM+1 for Class C does not apply. A DM-6 applies for Tech Level and applying another DM-4 for the unnecessariness of the branch (cancelling out militancy), leaves a DM of -6. On a roll of 9 - 6 = 3, the system defense force does not exist.*

*A navy is even more unnecessary than a system defense branch but sometimes dictators and generals buy prestige items, so examining the DMs, population 6 causes DM-3, TL7 causes DM-8, low expansionism causes DM-2 and internal heightened tensions are ignored. This creates a net DM-9, which would never result in a navy, so no space toys for the governor.*

*Finally, a marine branch seems completely superfluous and the Referee could just ignore the roll but instead, examining the DMs, Tech Level causes DM-6, no navy DM-6, low expansionism DM-4 and the Referee allows heightened tensions to provide DM+2 because dropping marines from the sky could help put down an insurrection. With net DM-10 even after militancy, a roll can still not succeed, so no marines exist either.*

*For the aggressive, repressive governorships, the basic military budget percentage is = 2% × (1 – 2 ÷ 10) × (1 + (9-7+2+12-5+4-4) ÷ 10) or 3.36% but with internal unrest present, this becomes 3.04 × 1.2 = 4.032% of the faction’s share of GWP.*

*The final results for the governorships are a strong enforcement branch, a possibly dodgy militia and a strong army with integral sea and air but no space defense capabilities. The string of F2C96-000:4.03% is more than enough to describe the military of this faction. Going into further detail would only be necessary to run a mercenary campaign or wargame.*

*For the less aggressive (6 for a global DM+1), more peaceful (no heightened tensions) oligarchs, the enforcement branch is enlarged because of the disperse population but still only DM+2 and therefore Effect 5. Going on, the results of several rolls are an army (6), navy (3), air force (3) and system defense force (3).The effective military budget percentage is 1.76%. for a string of 50633-300:1.76%. In this case, as with the other faction, the army is the controlling force but the system defense force, having jurisdiction over starport defense, has a few armed cutters for customs and patrols and a squadron of light fighters to patrol the gas giant. The budget likely does not allow for system defense boats.*

## TRAVEL ZONES
Systems are classified as Green, Amber or Red Zones based on their safety and accessibility to Travellers. Only a Red Zone has legal significance, usually indicating interdiction by an external power or prohibition against contact imposed by a system’s inhabitants.
### GREEN ZONE
A Green Zone is not so much a classification as an indication the system has no known hazards. Outside the borders of a polity, this may indicate ignorance of local conditions more than any assurance of safety. Most worlds within the border of a polity that are not subject to natural hazards, anarchy, war or particularly harsh government policies are considered Green Zones.
### AMBER ZONE
An Amber Zone is a warning to Travellers. It may be an official warning from an interstellar polity, the world itself or it may be a classification of a private service such as the Traveller’s Aid Society. Conditions warranting an Amber Zone designation may include natural hazards, such as a corrosive or insidious atmosphere, very high pressures or temperatures, severe geologic activity or high risk of meteoric activity such as in a primordial star system. Human factors, including lack of a government or law enforcement, extremes of either or both, an ongoing war or civil disturbance may prompt an Amber Zone designation. If random determination is desired, the 

Referee can apply Amber Zones with the following results:

**Formula: Amber Zone Exists**
$\text{Amber Zone Exists on 12+:} = \text{2D} \text{DMs}$

**Die Modifier for Amber Zone Exits**
- Primordial System: DM+2
- Atmosphere B, C, F+: DM+2
- Mean temperature above 373K: DM+2
- Mean atmospheric pressure above 50 bar: DM+2
- Seismic stress 100+: DM+2
- Government 0: DM+4
- Government 7: DM+2
- Law Level 0: DM+2
- Government + Law Level > 20: DM+Government + Law Level - 16
- Xenophilia 0–5: DM+6-Xenophilia
- Militancy 9+: DM+Militancy-8
- Factional Uprisings: DM+2
- Ongoing War: DM+4

#### ZED Example
Zed Prime has little reason for an Amber Zone in the oligarchies but the governorships might be an issue. Still, as an off-world reference would be focused on the starport, the Referee chooses to use the DMs for government 7 and factional uprisings, a total DM+4, but not those that would apply only to the governorships, namely the DMs for government + Law Level (+5) or xenophilia (+4) and militancy (+4). A roll of 3 +4 = 7, so no world-wide Amber Zone is randomly indicated. The additional DM+13 for the governorships would result in an automatic Amber Zone for that region. See the Red Zone example to see why this makes the Referee change this decision and impose a worldwide Amber Zone after all.
### RED ZONE
A Red Zone is an interdiction. It may apply to a single world or the entire system. Enforcement depends on the nature of the interdiction and the powers available to police it. If a large interstellar polity such as the Third Imperium imposes a Red Zone on a system within its borders it may be enforced by the Imperial Navy or the Scout Service and the nature of the enforcement could be anything from a squadron of battleships to a few remote observation satellites transmitting a warning message. Especially hazardous natural forces, primitive or hostile natives or the use of the aftermath of the use of weapons of mass destruction (WMD) may be cause for a Red Zone. Sometimes a Red Zone is put in place to guard a secret or an artefact. The placement of a Red Zone should be a deliberate choice by the Referee but as guide, the following procedure can provide insight as to situations which warrant Red Zone placement:

**Formula: Red Zone Exists**
$\text{Red Zone Exists on 12+:} = \text{2D} \text{DMs}$

**Die Modifier for Amber Zone Exits**
- Magnetar system: DM+10
- Pulsar system: DM+8
- Protostar system: DM+6
- Seismic stress 200+: DM+2
- Native sophonts of TL0–3: DM+4
- Xenophilia 1–2: DM+6-Xenophilia
- Militancy C+: DM+Militancy-8
- Factional Uprisings: DM+2
- Ongoing War: DM+4
- Threat or use of WMDs: DM+8

The Referee should never be bound by these results. Any system could become a Red Zone because of an unforeseen situation such as a plague, ongoing nuclear war or impending impact of a civilization-ending asteroid. Likewise, the manner of enforcement can vary from an automated warning to attacks without warning and the penalties for violation can vary from a monetary fine, to confiscation of a starship to summary execution.

Some interdictions apply to an entire system, some to only a specific world, usually the indicated mainworld. In general, unless the threat is system-wide – such as in a protostar system or a war between spacefaring combatants – the interdiction is limited to the mainworld and ships may be able to pass through the system and perform wilderness refueling, possibly under the watchful eye of an interdiction force.
#### Zed Example
Zed Prime is provisionally not designated an Amber Zone but the militancy and unrest of the governorships actually provides a combined DM+6 to the Red Zone roll. The Referee decides to roll to see what travel conditions to this faction would be and rolls a 5. Since 5 + 6 = only 11, a Red Zone does not apply. Still, it is enough for the Referee to reconsider the world’s status and they decide to make the world an Amber Zone after all, since such a designation is an indication of a third-party’s perception of risk and news stories out of the governorships might be rather grim.

## IISS PROCEDURAL
The detailing of a world’s social attributes requires more effort and different skills than those necessary to determine its physical characteristics. For most worlds, the procedures to gather this data are part of a Class IV survey. The Second Survey performed full Class IV surveys on all Imperial and many neighboring systems. A survey team gathers their data into a Class IV Part C data set, sometimes called the census data set but the teams and methodologies for gathering this data vary according to three different operational procedures. These three specific procedures are for surveys of member worlds of the Third Imperium, surveys of contacted worlds outside Imperial borders and surveys of uncontacted worlds.
### INTERNAL BRANCH SURVEYS
The survey office’s internal mapping branch is responsible for surveys of worlds within the Third Imperium. Performing a social survey or a census of an Imperial world is theoretically straightforward. The Scout Service has clear authority to conduct the survey and the world is obligated to provide the required information. However, the IISS cannot simply gather a set of data from the local authorities and move onto the next system. There are a number of reasons for this: the data may be of poor quality, out-of-date, too low Tech Level format to be easily usable (a TL1 world may have records on scrolls or stone tablets) and it may be intentionally misleading.

To ensure the census data is accurate, the survey team has access to local Imperial authorities such as nobles and starport authority personnel, as well as any detached duty scouts residing on or visiting the world. Even properly formatted up-to-date data is checked by random sampling, interviews and orbital scans. If the data is found to be statistically accurate, that helps with demographic information but does not necessarily establish more subtle cultural information. The Scout Service relies on observation, questionnaires and scoring procedures to determine such things as cultural diversity, progressiveness and militancy.

A potential complication specific to internal surveys is the appeals process. After gathering and analyzing the census data, the operational team presents it to both the Scout Service Operations Office and to the local government. If the local government finds the data ‘objectionable’, it can, and often will, appeal the findings through their noble representative and ask for an arbitration by the nobility. These appeals are rarely successful on more concrete factors such as population and GWP statistics but on subtler cultural descriptions, the local nobility sometimes asks the Scout Service to temper some ‘objectionable’ findings of more qualitative measurements. The introduction of the development score during the Second Survey resulted in many appeals but the simplicity of the measure and its tie back to statistically valid efficiency factors from a database of more than 11,000 systems made most of these appeals doomed to failure.

The Second Survey ensured census data was statistically correct as of the time period 995–1065, but that in itself was a 70 year span. More concrete data such as population and GWP is regularly updated but the cultural data for many systems even within the Imperium has not been verified since the Second Survey teams departed the system.
### EXTERNAL BRANCH SURVEYS
Systems near the Imperial borders that have already been contacted and are aware of interstellar society are surveyed by the survey office’s external mapping branch. The level of contact varies from Imperial client states with strong ties to the Third Imperium to systems that have not been officially contacted by the Imperium in centuries. Such distant systems may have regular contact with Imperial citizens – traders, explorers, adventurers, renegades – but the further from the Imperial border and the less significant the system, the less likely the Imperium is to maintain any sort of diplomatic contact. Still, all of the worlds under external mapping branch purview are at least aware that the Third Imperium exists, although they may have little idea of its actual scope and powers.

The job of an external mapping branch census gatherer is theoretically more difficult than that of those who conduct surveys inside the Imperium but the procedures employed are actually more standardized. No data is trusted, so it is more a process of determining the data from direct observation. Statistical sampling methods can determine population and economic output. Outreach teams conduct direct and indirect observation of the local culture and derive information from conditions on the ground. When the local population is friendly, this is generally straightforward but scout teams are careful to look past the view of the world as orchestrated by ‘handlers’ or local officials. If a world’s authorities or population are overtly hostile to the census team, direct contact is limited and the accuracy of the information gathered is ‘best effort’ backed up by statistical models derived from thousands of systems and years of cultural data. If detached duty scouts are in system or have visited recently, their experiences are mined for information. The census team also interviews other Imperial citizens or friendly outsiders to corroborate or correct data gathered by indirect means.

One advantage of an external survey is that it is not subject to appeal. While a client state might attempt to influence findings through diplomatic or economic means, such attempts rarely gain traction and at best allow the objecting system to host and attempt to influence a second scout team usually backed by an Imperial diplomatic representative. Worlds far from the Imperium in distance and influence may never even see the results of the survey, much less contest the data.
### CONTACT AND LIAISON BRANCH SURVEYS
Contact procedures for a new sophont species are the same as those for an existing sophont species that has been long isolated, whether a minor human race or lost colony. It is a cautious process carried out by the exploration office’s contact and liaison branch. As the Imperium grew, it absorbed most regions isolated by the Long Night. The exploration cruiser expeditions sent far beyond Imperial borders were common in the first few centuries of the exploration office’s existence but became infrequent after the civil war. New first contact situations became uncommon and when the Second Survey began, the major focus of the contact and liaison branch had shifted to internal relations between the various species and cultures inside the Imperium. Still, a cadre of dedicated first contact teams operate far beyond Imperial borders and in unexplored rifts and backwaters, making first contact with people who have never heard of the Third Imperium and might not even know they live on a sphere and not on the back of a cosmic turtle.

Whenever possible, first contact begins with covert operations. If the inhabitants of a newly explored system are not spacefaring, this is simply a matter of remaining in space at far orbit and observing. A civilization of TL5 and below has little capability to detect a ship in distant orbit, much less to react with effective hostility. If the uncontacted natives have space travel observation is even more careful, with detection and tracking of local system traffic a priority for active concealment and avoidance procedures.

If the natives are advanced enough to broadcast radio or television signals, the contact team can attempt to learn the local language and some customs through remote reconnaissance. Lower Tech Level worlds require landings in remote regions and surreptitious recon operations on the ground to gather data. The team leaders use this data to determine if an attempt at first contact is warranted or safe, both for the contact team and the local civilization. For a strictly survey operation, especially on a world of TL5 or less, contact is not usually recommended. For more advanced locals, the team must gauge the level of hostility and probable reaction to first contact.

In the early days of the Imperium, the emphasis was on making this first contact, introducing the Imperium to the locals and making a case for Imperial membership. This emphasis had ended by the time of the civil war. By the seventh century, the Imperium was no longer expanding. Contacts with other cultures still occurred, especially where political consideration favored gaining friendly local allies. However such contact decisions usually occurred after a Class IV covert survey report arrived on an Imperial administrator’s desk and a contact mission received approval.

The initial scout contact team retains great latitude in making decisions far from Imperial borders and may proceed with contact after deliberation but as they are far from Imperial support, they must weigh the benefits and risks of their actions. If the local natives have had any known previous interstellar contacts that had good outcomes, the team is likely to recommend proceeding with contact. If known previous contacts ended in hostilities, the team is likely to report back to base without establishing contact and to return only if adequately supported.
### Class IV Part C Form
The standard display form for a Class IV social or census survey assumes the completion of a physical survey and may or may not display the header information related to the Part P form. Some balkanized worlds may have a worldwide Part C, followed by separate Part C forms for each faction or government.

Rather than completing a full Class IV Part C form for a balkanized world’s factions or nations, a shorter profile based listing, the Census Subunit Profile

Form (CSPF), is often provided to summaries these subunits of a world. Often this is the only public information available in the RPSC for anything less than an entire world’s data:

# CHAPTER 8: SPECIAL CIRCUMSTANCES
The star system creation rules work well for main sequence stars in the middle of their life, the most common hosts to habitable worlds. Stars in their infancy, stars technically ‘dead’ and objects with pretensions but not the mass to become stars require specialised rules. Sections in this chapter will detail procedural changes required for these types of objects. These rules are especially important if the special object is the primary or only ‘star’ in the system and others still may appear in hexes otherwise described as ‘empty’.
## EMPTY HEXES
Systems listed on Travellermap are almost all hosted by at least one star, very few have brown dwarf or white dwarf primary stars, despite the former being possibly as numerous as stars and the latter account for perhaps one sixth of all stars. These systems of failed or dead stars and their attendants are present in systems not noted on standard charts. On a commercial subsector or sector map, they occupy ‘empty’ hexes. Even in hexes empty of star-like objects such as these, other large bodies – rogue planets tossed from their systems in their youth by unruly neighbouring worlds – are at least as common as planets within a system. Untold billions of planetoids and comet-like objects pepper the darkness. However a hex is a parsec across, more than 30 cubic light-years and even with a billion rocks, a handful of planets and maybe a failed or dead star or two, any random point in the darkness is effectively empty. The Scout Service has sensors to probe these depths and charts of some of these objects but most remain unexplored and many are undiscovered.

The Scout Service has mapped all of the empty hexes within the Third Imperium to a level of SI 8, detecting most objects down to gas giant size. Their databases of nearby regions are mostly complete to SI 4, detecting all brown dwarfs and some very large or young gas giants. In those neighbouring regions, the coverage from exploration and survey expeditions and from surreptitious finds of smaller objects is variable and not always reliable.
### OBJECT TYPES
A variety of objects can be present in ‘empty’ hexes. The smaller the object the higher the probability and/or quantity of its potential existence.
#### Rogue Neutron Stars and Black Holes
While neutron stars spinning as pulsars and black holes in binary systems are easy to detect from thousands of parsecs away, lone dead stars are a tougher find. A black hole that is not feeding is at best a blank spot on a star field but at only a few kilometres or maybe tens of kilometres across, it is as hard to detect visually as a random rogue planetoid. A neutron star is easier to detect, since it still emits light very brightly in the ultraviolet spectrum to start with but it cools over time and is no larger than tens of kilometres across, making it a difficult object to find. These objects are more prevalent than most people imagine: consider, for every supergiant star currently shining, more than 1,000 neutron star remnants of previous generations of these massive stars are roaming the galaxy. Black holes may be less common by a factor of 19 or more but they too exist in the darkness. See the Dead Stars section for detailed neutron star and black hole generation.

#### White Dwarf Primaries
An otherwise empty hex may be host to a white dwarf primary star system. This is defined as either a lone white dwarf or a system where the other ‘stars’ are only white dwarfs and/or brown dwarfs. Sometimes white dwarfs may exist in the centre of a planetary nebula but most are slowly cooling objects, sometimes surrounded by the debris or survivors of their former planetary systems. See the Dead Stars section (pages 227-228) for detailed white dwarf generation.

#### Brown Dwarf Primaries
A brown dwarf has the same probability of occupying an empty hex as a system has of existing in that region. A single roll at the region’s system density level will determine the existence of a brown dwarf. A brown dwarf primary may be part of a multi-brown dwarf system and/or may host a small planetary system. See the Brown Dwarf section (page 227) for detailed brown dwarf generation.

#### Rogue Gas Giants
A rogue gas giant (or several) may exist within a hex but might be difficult to find without equipment, patience and luck. Each size of gas giant is a separate roll or set of rolls based on stellar density. These worlds can be generated as standard gas giants using the gas giant sizing rules on page 55. Rogue gas giants have a DM-1 per dice on the Significant Moon Count table on page 55.

Rogue Terrestrial Worlds
An empty hex very likely has rogue planet-sized objects floating about. However, finding them can be a challenge. These may be generated as terrestrial planets, with large terrestrials determining size with 1D+9, and small terrestrials determining size by
2D-2, but with 0 treated as 1 and A (10) treated as 9. Their position of origin in a star system is somewhat random, so they have a negative DM of 1D-1 on the Terrestrial Composition table on page 71. Terrestrial worlds larger than Size 2 have a fixed DM-2 on the Significant Moon Count table.

Rogue Small Bodies
Empty space is littered with small bodies. One could be discovered every time their detection threshold for the hex is reached. For each object, roll 1D: on a 6, it is size S, otherwise it is a single Size 0 rock. A further roll of 1D indicates likely composition: on 1–2 it is mostly icy, on 3–5 it has some water content but it requires mining to extract, on a 6 it is bone dry and useless as a fuel source. This composition determination cannot be made remotely with any degree of certainty. Once a ship jumps to this distant spec, on a roll of 9+, the actual composition must be rolled again.

### PROBABILITIES
The likelihood of the presence of objects in empty hexes depends on the star density of the region of space. In standard density regions of space, a system exists in a hex on a roll of 4+ on 1D. When checking for rarer objects in empty hexes, a roll for the possibility of the object’s existence precedes any roll based on the region’s system existence check. For instance, a hex has a one-in-six chance of possibly containing a white dwarf. If this first roll is successful, a second roll for the actual existence of the object follows, based on the density of the region. Brighter and larger objects are easier to detect but finding dimmer objects, such as gas giants or smaller planets requires specialised equipment, time and luck.

For simplicity, except in dense star clusters, an empty hex will have only one system with star-like objects: black holes, neutron stars, white dwarfs or brown dwarfs. For any one hex, the Referee should first roll for neutron stars and black holes, then for white dwarfs and then for brown dwarfs. Rogue planets are more common and can coexist in any hex. If desired, the Referee could even place such rogue planets in hexes already occupied by star systems.

For each ‘empty’ hex, the process is:
1. Determine if a neutron star or black hole might exist. Roll 3D: possible existence on an 18.
	a. If yes, check if a neutron star or black hole actually exists. Roll the region’s system existence check.
2. If yes, roll 2D: on an 11 or 12 the object is a black hole, otherwise it is a neutron star.
	a. If the hex is still empty, determine if a white dwarf might exist. Roll 1D: possible existence on a 6. 
3. If yes, check if a white dwarf exists. Roll the region’s system existence check to place a white dwarf.
	a. If the hex is still empty, determine if a brown dwarf exists. Roll the region’s system existence check to place a brown dwarf system.
4. Even if one of the above star-like objects exists, for any hex:
	a. Determine if a rogue large gas giant exists: roll the region’s system existence check.
	b. Determine if rogue medium gas giants exist: roll the region’s system existence check two times.
	c. Determine if rogue small gas giants exist: roll the region’s system existence check three times.
	d. Determine if large terrestrial worlds exist: roll the region’s system existence check four times.
	e. Determine if small terrestrial worlds exist: roll the regions system existence check 10 times.

A hex will have an effectively unlimited number of smaller objects floating about. The Referee need only check for the existence of one of these objects in a search area immediately prior to the Traveller’s detection check roll. These checks are only necessary if the Travellers are planning to search an empty hex for objects or if they become aware that a certain class of object exists in that hex.

On the Empty Hex Objects Table, the SI column indicates the completeness of surveying and charting necessary to detect these objects. A commercial map will not necessarily chart any of these objects; a scout service publicly available dataset for sectors in Imperial space will include almost all objects to SI 4. Some objects may be redacted for security reasons.

**Table 100: Empty Hex Objects**

| Object Type             | Existence Probability                                                        | SI  | Detection |
| ----------------------- | ---------------------------------------------------------------------------- | :-: | :-------: |
| Neutron star/black hole | 18 on 3D, then equal to system density; 11+ on 2D it is a black hole instead |  7  |    80     |
| White dwarf/Protostar** | 6 on 1D, then equal to system density                                        |  3  | Automatic |
| Brown dwarf             | Equal to system density                                                      |  4  |    20     |
| Large gas giant         | Equal to system density                                                      |  6  |    60     |
| Medium gas giant        | Equal to system density (up to 2*)                                           |  7  |    80     |
| Small gas giant         | Equal to system density (up to 3*)                                           |  8  |    160    |
| Terrestrial world (A+)  | Equal to system density (up to 4*)                                           |  9  |    240    |
| Terrestrial world (1–9) | Equal to system density (up to 10*)                                          | 10  |    480    |
| Small bodies (0, S)     | Equal to system density (unlimited†)                                         | 12  |    480    |
\* The system density check is rolled this number of times, with multiple objects possible.
\*\*White Dwarf is replaced with Protostar for Nebula. See Objects in Nebula section.
† Every time a detection threshold is reached, roll for existence probability.

**SI Column:** Indicates the completeness of surveying and charting necessary to detect these objects.

**Detection Column:** Indicates the number of detection points required to make a detection roll in a single hex for the object type using sensors or observatories from one parsec distant.

A scout service-only map will include all detected and charted objects down to SI 12 but this is not a complete survey of every rogue planet and small body in the Imperium. It is merely a catalogue of all charted objects with known and verified coordinates and vectors. Some of this information may be decades or centuries old, and a slight error in either location or vector could result in the object being lost until rediscovered. Astrogators know not to trust charts if risking a jump to a rogue in empty space, as even a small error could leave the ship fatally stranded.

### DETECTION
The Empty Hex Objects table’s Detection column indicates the number of detection points required to make a detection roll in a single hex for the object type using sensors or observatories from one parsec distant. Once the indicated number of points is accumulated, a sensor operator or astronomer may make a detection check, and if successful the Referee can check the Existence Probability column to see if an object was actually detected. Either sensors of military grade or better or an observatory is necessary to accumulate hourly detection points.

**Table 101: Detectors**

| Detector               |  TL  | Detection Points per hour | Notes                                |
| ---------------------- | :--: | :-----------------------: | ------------------------------------ |
| Military Grade Sensors |  10  |             0             | —                                    |
| Improved Sensors       |  12  |             1             | —                                    |
| Advanced Sensors       |  15  |             2             | —                                    |
| Superior Sensors       |  16  |             3             | —                                    |
| Observatories          | 7–13 |  1–3 × Effect Multiplier  | Depends on size and TL, see DSE p.24 |

**Table 102: Detection Options and Conditions**

| Options and Conditions       | TL  |       DM       | Notes                                                  |
| ---------------------------- | :-: | :------------: | ------------------------------------------------------ |
| Distributed arrays           | 11  |       +1       | HG p.55                                                |
| Extended arrays              | 11  |       +1       | HG p.55                                                |
| Extension nets               | 10  |       +1       | HG p.55                                                |
| Improved signal processing   | 11  |       +1       | HG p.56                                                |
| Enhanced signal processing   | 13  |       +2       | HG p.56                                                |
| Chart room                   |  —  |       +2       | DSE p.21                                               |
| Gravitational analysis suite | 13  |   +2 or +20    | DSE p.22, +20 only for black holes and neutron stars   |
| Operator skill level         |  –  | Skill level -1 | Skill level -2 if using 'opposite' equipment           |
| Expert/1 skill package       | 11  |       +1       | Only in conjunction with a skilled operator            |
| Expert/2 skill package       | 12  |       +0       | Automated search. Also requires Intellect/1 or greater |
| Expert/3 skill package       | 13  |       +1       | Automated search. Also requires Intellect/1 or greater |
| Per parsec beyond 1          |  —  |       -1       | Detection at 2 parsecs has DM-1 and so on              |

- HG p.## refers to the High Guard (2022)
- DSE p.## refers to the Great Rift Book 4: Deep Space Exploration Handbook

**Skill Requirements:** Sensors require the Electronics (sensors) skill to operate and observatories require Science (astronomy). A person with either skill can operate the opposite technology at skill level -1. An automated search requires a computer running Intellect and an Expert/2 software package for the appropriate skill

Sensors require the Electronics (sensors) skill to operate and observatories require Science (astronomy), though a person with either skill can operate the opposite technology at skill level -1. An automated search requires a computer running Intellect and an Expert/2 software package for the appropriate skill. Options and distance will affect the capabilities of these detectors with applicable DMs applied to each hour’s detection points.

Once a sensor scan has accumulated enough detection points, the sensor operator may attempt an Average (8+) Electronics (sensor) check (1 hour, INT or EDU) to detect the object – if it exists – and determine its coordinates. For observatories, the relevant check uses Science (astronomy) skill instead but as with accumulating detection points, these Electronics and Science specialties can be used on ‘opposite’ equipment with a DM-1 to the check.

Ideally, the Referee should make this check hidden from the Traveller and should not tell the Traveller whether an object actually exists, only that the check succeeded for an existing object. If the Traveller has access to charts indicating something should be there, Travellers can make the roll themselves – unless the Referee determines the chart is wrong.

An Effect of 2+ is needed to initially determine a detected object’s vector, without which a jump to its location suffers a DM-8 if it occurs within one month of detection, a further DM-1 for every month thereafter

and a further DM-4 for every parsec distant. Since the object in question is likely at least a large fraction of a parsec distant, the detection of its location is months or years in the past. If the sensor operator wishes to determine the detected object’s vector with greater certainty, a second roll at least one week after initial detection can provide that information and any success, meaning both first and second detection rolls have an Effect of at least 0, indicating a high probability of capturing the correct data.

Detection points are accumulated for all objects in a particular hex. A general scan of a parsec hex will allow the sensor operator to attempt to detect one object of each type once the sensors have accumulated enough points to detect that type of body. For instance, a roll for brown dwarfs occurs after 20 detection points are accumulated. If the detection fails, it will require another 20 points to attempt another detection check for a brown dwarf (assuming one exists). Once 60 points are accumulated, a single attempt at detecting a large gas giant can occur and by that point a third attempt to find the brown dwarf can also occur. If the Referee makes these rolls in secret, it allows the Traveller to hold out dwindling hope that a brown dwarf might exist. At 80 points, the first attempt to detect a medium gas giant can occur – as well as a rare neutron star or black hole. This is also the point of the fourth try to find brown dwarf, if one exists. At 120 points, a second attempt to find a large gas giant occurs and if by this sixth attempt to find a brown dwarf, the Traveller will likely assume that none are present in the hex. Still, detection is entirely independent of existence: the Referee makes the existence rolls first and no amount of detection can find something that is not there.

### JUMPING TO ‘EMPTY’ HEXES
Jumping to hexes not marked as containing star systems is risky. Even if a large gravitational anchor such as a white or brown dwarf is present, a jump is more hazardous than normal. Some jump-space theorists believe this is an effect from the paucity of neutrino emissions from ‘stars’ not fusing hydrogen but regardless of cause, such jumps are inherently riskier.

Jumps to smaller mass targets such as gas giants or terrestrial planets become increasingly risky and less precise as mass decreases. Jumps to the smallest targets add another factor of risk: far from a gravitational anchor, manoeuvre drive thrusters do not have a local gravity well to interact with and will operate at less than 1% efficiency, relying only on their interaction with the galaxy’s overall gravity gradient. Ships designed to operate far from normal stars are either equipped with fuel-hungry reaction drives or a power-hungry deep space manoeuvre system (DSMS – see Deepnight Revelation Campaign Guide (Book 2), page 33) capable of creating a local field to ‘bootstrap’ a standard manoeuvre drive.

If just jumping to deep space to cross a rift or gap in a multi-jump transit, for instance when making two single parsec jumps in a free trader to cross a two-parsec gap, using extra fuel tanks to initiate a second jump from deep space to the destination, the accuracy of the intermediate jump is less important and the additional step below is not necessary.

An accurate jump to an empty hex adds an additional step to the jump task chain. As usual, the process begins with the initial Easy (4+) Astrogation check (1D × 10 minutes, EDU) with DM-1 for each parsec to the destination. The astrogator is aware of the success or failure of this check and may try again on a failure. Once successful, this check provides a task

chain modifier to the Easy (4+) Engineer (j-drive) check (1D × 10 minutes, EDU) with normal DMs and chances for misjump.

The extra step for a jump to a specific location in the ‘empty hex’ requires the astrogator to make an additional instantaneous Astrogation check. This check is normally Easy (4+) but if the astrogator made the first check hurried or carefully, this task becomes Routine (6+) or Simple (2+) respectively. This check uses the same modifiers as the earlier check, but the target destination adds a further DM to this second check:

**Die Modifiers for Astrogation Check: Empty Hex Jump**
- White Dwarf, Brown Dwarf: DM-2
- Neutron Star, Black Hole, Gas Giant: DM-3
- Terrestrial Planet (Size 1+): DM-4
- Asteroid, Comet, Station, Deep Space: DM-6
- Effect of a miss-jump: DM-Effect × 2
- Use of prepared Jump Template: DM+4

This Astrogation check can also benefit from any task chain DM from the initial Astrogation check. A prepared jump template solution to a known deep space location such as a jump bridge, fuel depot or other station may be available for purchase (usually 1D × Cr100) at a Class A or B starport in an adjacent hex. Such solutions ‘degrade’ every full week after generation by DM-1. A ship can generate its own template – only if it knows the precise current coordinates of the target – by running its Jump/x program with 10 extra Bandwidth for 2D hours. The precision required to run this program requires input of astrogation data from a ship that has visited the target within the last month.

The Effect of the Astrogation check determines the precision of arrival at the destination. A destination location is computed as ‘diameters’ if the target is a Size S dwarf planet or larger object. Otherwise, the ‘planned location’ is a point in space near an asteroid, comet or artificial body and distance is in kilometres.

When emerging in an empty hex far from the benefits of a stellar or planetary gravity well, a ship’s m-drive will only achieve a small percentage of its rated thrust as indicated in the table below. Once it reaches the threshold distance of a closer limit column, performance improves as indicated on the nearer column.

**Table 102: M-Drive Efficiency In Deep Space**

|Body Size|1D+|10D+|100D+|1000D+|1,000,000D+|
|---|---|---|---|---|---|
|Star or brown dwarf (0.013 Mass+)|100%|100%|100%|1%|0.1%|
|Planet (Size S+)|100%|100%|100%|0.1%|0.1%|
|Big object (1km+)|100%|1%|0.1%|0.1%|0.1%|
|Medium object (100,000 tons+)|1%|0.1%|0.1%|0.1%|0.1%|
|Small object (Smaller)|0.1%|0.1%|0.1%|0.1%|0.1%|

**Reference Points:**
- 1D from an object is measured from the center of an object and extends to half a diameter above the body's surface
- 1,000D from Sol is about 9.3 AU, nearly the orbit of Saturn
- 1,000,000D from Sol is about 0.0475 or 1/21 parsecs1
Beyond 1,000,000D distance, the galactic background efficiency of 0.1% (one-thousandth of normal thrust) applies throughout all empty hexes. In intergalactic space, drive efficiency is theoretically even smaller but still not zero

When emerging in an empty hex far from the benefits of a stellar or planetary gravity well, a ship's m-drive will only achieve a small percentage of its rated thrust as indicated in the table above. Once the ship reaches the threshold distance of a closer limit column, performance improves as indicated on the nearer column.

For reference, 1D from an object is measured from the centre of an object and extends to half a diameter above the body’s surface. 1,000D from Sol is about 9.3AU, nearly the orbit of Saturn and 1,000,000D from Sol is about 0.0475 or 1/21 parsecs. Beyond this distance, the galactic background efficiency of 0.1% or one-thousandth of normal thrust applies throughout all empty hexes. In intergalactic space, drive efficiency is theoretically even smaller but still not zero.
## PROTOSTAR SYSTEMS
A protostar is a star still in the process of formation. It burns brightly and erratically but its energy is mostly generated from the gravitational collapse. Planets are still in the process of formation, voraciously accreting gas, dust and larger clumps of materials. Protostar systems are hazardous to enter with random changes in stellar luminosity and a high chance of collision with debris. Smaller worlds are subject to shattering collisions and larger worlds are covered in oceans of magma or surrounded by blistering gas.
### STAR TYPE AND MASS
A protostar primary star has its star type determined with a roll on the Star Type table with DM+1. If the primary star is a protostar, any other stars in the system are also protostars. The variance for protostar mass is +50%. The characteristics of the protostar era of a star’s evolution varies with mass. Smaller T Tauri-type stars continue to collapse for about 10 million years. Larger stars massing 2-8? are known as Herbig Ae/Be stars and burn brighter, generally sweeping away their gas disks earlier. Even more massive stars do not undergo a protostar period at all, quickly burning away their gas disks and entering their short main sequence lives almost immediately. For simplicity, this book will assume a duration of 10 million years for the protostar era of all stars of less than 8? mass.
### DIAMETER AND LUMINOSITY
To simulate the random behavior of protostars, treat their type and subtype as similar Class V stars but multiply the diameter of the protostar star by 1 + (2D-2) ÷ 10. Changes in diameter will affect luminosity by a factor of the square of the change in diameter. These changes can occur as often as 1D months from a previous change and are not predictable from interstellar distances.
### JUMP RESTRICTIONS
A jump into a protostar system suffers from considerable risks. The star is inherently unstable, with diameter and luminosity randomly shifting. The quantity of protoplanetary debris can cause numerous random jump shadows and blind spots. Any jump into a protostar system follows the procedures for jumping into an empty hex but with a DM-6 and an additional DM-1D to the Astrogation check. Additionally, jumps both into and out of a protostar system receive DM-4 on the Engineer (j-drive) skill check.
### PLANETARY SYSTEM
The planetary system of a protostar is still forming. Determine the actual age of the system using the Special and Unusual Object Age by Type table on page 22. Then generate a system of orbits and worlds using standard procedures modified by the following conditions:
- All rolls for eccentricity receive a DM+2.
- All orbital slots with a gas giant or terrestrial planet also receive a planetoid belt in the same orbital slot.
- If the system is less than two million years old, only large gas giants have fully formed. Medium gas giants are considered small gas giants. All other orbits are occupied by vast planetoid belts with hundreds of Size S and Size 1 bodies. No significant moons have formed and all existing gas giants have their own vast ring systems. These rings can be treated as extending out to 2D planetary diameters.
- If the system is a least two million years old, most gas giants have formed, although they are still in the process of accretion. Medium gas giants have grown to their full size and small gas giants exist. All gas giants are still surrounded by disks of material but moons have started to form inside these disks.
- The maximum size of a terrestrial planet or moon in a protostar system is equal to the system’s age in million years. If a terrestrial planet of greater size is indicated, additional protoplanetary chunks still exist within the surrounding planetoid belt. For every difference between final size and the current size as indicated by age, roll another planet of Size 1D-1 smaller than the current maximum size and place it in the same orbital slot with spread variance and DM+2 eccentricity.
- Planetary atmospheres are rolled with DM+4 but any result of 2–5 becomes A and any roll of 6–C becomes C. A roll of D–F becomes F, and a roll of G or H becomes H.
- Planetary surfaces begin as covered in magma – liquid rock. This is technically Hydrographics A but could be treated as 0. For planets of Size 2 or greater, the surface cools at a rate where a solid crust can form after (Size - 2)2 + 2 million years.
- The surface temperature of a world with liquid magma oceans is more than 1,500K.
- None of these worlds have recognizable native life.
## PRIMORDIAL SYSTEMS
A primordial system is a star system younger than 100 million years but beyond its protostar stage (if any). In these systems, planets have formed but debris is still widespread and larger bodies are still covered in molten magma oceans heated by radioactivity, gravitational contraction and the occasional massive impact. Stars of greater than 8? mass immediately enter the primordial system stage and spend their entire main sequence lives in this primordial state. Stars of less than this mass enter this state after they exit the protostar phase at an age of 10 million years.

All stars of Class Ia, Ib and II and all O-type stars (except O subdwarf stars) are automatically hosts to primordial systems.
### JUMP RESTRICTIONS
A star system in the primordial state is still filled with debris but constant output from stellar fusion of hydrogen stabilises the star’s energy output and diameter, making the jump safer. A jump into a primordial system imposes a DM-2 to both Astrogation and Engineer (j-drive) checks.
### PLANETARY SYSTEM
By the time a system reaches the age of 10 million years, the stars have ‘cleared’ gas and dust from the system, leaving behind larger particles of debris and still-cooling worlds. Determine the actual age of the system using the Special and Unusual Object Age by Type table on page 22. Then generate a system of orbital slots and worlds using standard procedures modified by the following conditions:
- All rolls for eccentricity receive a DM+1.
- The roll for planetoid belt existence (see page 37) receives a DM+4.
- All planetoid belt spans (see page 72) are double and may overlap other planetary or planetoid belt orbits.
- The maximum size of a terrestrial planet or moon in a primordial system is equal to the system’s age in million years. If a terrestrial planet of greater size is indicated, then additional protoplanetary chunks still exist within the planet’s orbital space. For every difference between final size and the current size as indicated by age, roll another planet of Size 1D smaller than the current maximum size and place it in the same orbital slot with spread variance and DM+2 eccentricity.
- All orbital slots with planets (gas giant or terrestrial) may have an additional planet. Roll 1D and on a 6, a planet of Size 1D exists within the same basic orbit. Roll for the actual Orbit# using a spread variance and add DM+3 to this new planet’s eccentricity roll.
- Planetary atmospheres are rolled with DM+2 but any result of 2–7 becomes A, results of 8–C become C, D–F become F, and G or H become H.
### BROWN DWARF CHARACTERISTICS
Brown dwarf masses generally range between 0.013? and 0.085? but composition details can blur these distinctions, especially at the margins. To determine mass:

**Formula: Brown Dwarf Mass**
$\text{Brown Dwarf Mass} = \frac{\text{1D}}{100} + \frac{\text{4D -1}}{1000}$

Most brown dwarfs have the same diameter as large gas giant (0.1?) but may decrease in diameter by about 20% near 0.06? mass. The Referee can use the same diameter roll as for large gas giants on the Gas Giant Sizing table (2D+6?) with DM-2 for brown dwarfs between 0.05? and 0.07? mass.

The largest brown dwarfs begin life as L-type objects. Brown dwarfs of smaller mass begin or pass through types T and Y, with the smallest and oldest Y-type brown dwarfs being cool enough to host liquid water. The Brown Dwarf Types table summarises brown dwarfs based on mass and temperature at an approximate age of one billion years.

**Table 103:  Brown Dwarf Types**

| Type | Temperature | Mass  | Diameter | Luminosity  |
| ---- | ----------- | ----- | -------- | ----------- |
| L0   | 2,400K      | 0.080 | 0.10     | 0.00029     |
| L5   | 1,850K      | 0.060 | 0.08     | 0.000066    |
| T0   | 1,300K      | 0.050 | 0.09     | 0.000020    |
| Y0   | 550K        | 0.025 | 0.10     | 0.00000081  |
| Y5   | 300K        | 0.013 | 0.10     | 0.000000072 |

Over the course of the lifespan of the universe, a 0.08? mass brown dwarf would cool from L0 to about L9, but smaller mass brown dwarfs would cool faster. More precise luminosity determination can use the Luminosity Formula from page 20. The Referee may model aging brown dwarfs by three different methods, depending on accuracy desired:
a. Use the table as-is based on the approximate mass of the brown dwarf.
b. Interpolate a more precise subtype and temperature based on the mass.
c. Adjust down one or more rows for the temperature and luminosity of an aging brown dwarf.
d. Reduce the effective subclass and therefore temperature of the brown dwarf by one subtype per billion years for brown dwarfs above 0.05? mass and by two subtypes for smaller brown dwarfs.
### JUMP RESTRICTIONS
If a system hosts no ‘normal’ stars, the Empty Hex Jump DMs table affects jumps to brown dwarf systems. If the brown dwarf is a member of a star system that contains at least one normal hydrogen-burning star, no such restrictions apply.
### PLANETARY SYSTEM
A brown dwarf planetary system is determined using standard procedures in the Systems and Worlds chapter, with these exceptions:
- The check to see if a gas giant is absent is 8+ instead of the standard 10+. Alternatively, a gas giant is only present on a roll of 7 or less.
- The minimum available Orbit# (MAO) around a brown dwarf is 0.005.
## DEAD STARS
After spending the majority of their lives in the main sequence, most stars swell to become giant stars and then expel their outer layers and, after a brief moment of existence at the core of a planetary nebula, settle into a boring existence as a slowly cooling white dwarf stellar remanent. Stars of more than 8? mass end their lives in a supernova explosion, leaving behind either a neutron star, black hole or nothing at all. Despite the scorching giant phase and possibly explosive end of life event, planets can exist around these dead stars. In fact, the very first exoplanets discovered orbit around a pulsar star, a young neutron star which rotates extremely fast, casting intense radio waves from its magnetic fields.

Dead stars fall into three categories, white dwarfs, neutron stars (including pulsars and magnetars) and black holes.
## WHITE DWARFS
Stars that mass less than eight times Sol at the end of their giant star phase end their lives by shedding outer layers, briefly forming a planetary nebula around their scorching hot cores and slowly cooling over time.

Different spectral lines indicating surface composition are used to determine subtypes of white dwarfs, usually expressed in additional letters after the ‘D’ designation. Traveller uses a simple D designation for all white dwarfs. A white dwarf star can have a maximum mass of about 1.44?. Above this limit, they will detonate in a Type Ia supernova explosion. To determine actual mass:

**Formula: White Dwarf Mass**
$\text{White Dwarf Mass} = \frac{\text{2D-1}}{10} + \frac{\text{d10}}{100}$

White dwarf diameters follow an inverse mass distribution and have diameters similar to those of terrestrial planets:

**Formula: White Dwarf Diameter**
$\text{White Dwarf Diamtert} = \frac {1}{\text{Mass}} \times 0.01$

White dwarf temperatures decrease as they age, cooling from over 100,000K to about 4,000K. Most observed white dwarf temperatures range from 40,000K to 8,000K, but these are the brightest. A median mass white dwarf (0.6?) may cool to 7,000K after 1.5 billion years and to 6,000K after another 0.7 billion but requires another billion to cool another 500 degrees. Larger mass white dwarfs will take longer to cool. 

The White Dwarf Aging table provides very rough temperature guidelines to allow for interpolation of white dwarf temperatures and resultant luminosity by billions of years since the white dwarf formed. This table is based on a white dwarf of mass 0.6?. To determine the temperature value for different masses multiple the resultant temperature by Mass ÷ 0.6.

**Table 104: White Dwarf Aging (Mass 0.6)**

|Years|Diameter|Temperature|Luminosity|
|---|---|---|---|
|0.000|0.017|100000|2500|
|0.1|0.017|25000|0.20|
|0.5|0.017|10000|0.0025|
|1|0.017|8000|0.0010|
|1.5|0.017|7000|0.00059|
|2.5|0.017|5500|0.00023|
|5|0.017|5000|0.00015|
|10|0.017|4000|0.000063|
|13|0.017|3800|0.000051|
*Note that the table is based on a white dwarf with a mass of 0.6 solar masses. To determine the temperature value for different masses, multiply the resultant temperature by Mass ÷ 0.6*
*More precise luminosity can be calculated with the luminosity formula*
## NEUTRON STARS
Stars massive enough to die in a supernova explosion but not big enough to form a resultant black hole become neutron stars. While most neutron stars are aging and quiescent, newly formed neutron stars may be pulsars or magnetars. The Traveller designation for a neutron star is NS.
### PULSAR
A pulsar is a fast-rotating neutron star emitting strong radio pulses with each sub-second rotation. Most known neutron stars are pulsars, but most pulsars (not all) will slow down and lose theirradio wave emissions after 100 million years, making them harder to detect. Of all the neutron stars in existence since the origin of the universe, likely only one in 100 is a pulsar. The Traveller designation for a pulsar is PSR.
### MAGNETAR
A magnetar is a sub-class of neutron star with an extremely strong magnetic field; it may or may not also be a pulsar. Magnetars are rare. Although 10% of neutron stars may begin life as a magnetar, they are usually only active for about 10,000 years and so over the course of the galaxy’s age, all but one in a million have already shut down to become a more common pulsar or neutron star.
### NEUTRON STAR CHARACTERISTICS
A neutron star’s mass is generally greater than a white dwarf and less than a black hole. Neutron stars more massive than 2.16? will continue to collapse, becoming black holes. To determine mass:

**Formula: Neutron Star Mass**
$\text{Neutron Star Mass} = 1 + \frac{\text{1D†}}{10}$$
$\text{†on a roll of 6 add} \frac{\text{1D-1}}{10}$

Regardless of mass, all neutron stars have a similar diameter of 20–25 kilometres. This can be generated as 19 +1D kilometres, if necessary.

**Formula: Neutron Star Diameter**
$\text{Neutron Star Diameter (km)} = 19 + \text{1D}$

Neutron stars cool not so much from radiating photons (heat) as more normal objects might but, at least initially, primarily by neutrino emissions. From a starting temperature of one million degrees, a neutron star cools very rapidly at first but over time its small radiative surface will slow its rate of cooling. Nevertheless, its very small diameter means that even a very hot neutron star does not provide much heat. For pulsars, radiation and magnetic fields are likely greater hazards to be concerned with, and habitability of any worlds is not an issue for consideration. A neutron star’s temperature profile can be approximated using the White Dwarf Aging table, with appropriate modification to temperature based on the neutron star’s mass. If computing luminosity, a diameter value of 0.000015 corresponds to about 20.87 kilometres.
## BLACK HOLES
A black hole occurs when a massive star explodes in a supernova and its core retains enough mass to continue to contract until its gravity becomes so extreme that light cannot escape. The barrier where this occurs is referred to as the event horizon and is considered the surface of a black hole.
### BLACK HOLE CHARACTERISTICS
Black holes have no theoretical maximum mass, although most heavier than 100? are likely to have formed through mergers or other methods, not stellar collapse. 

To determine a black hole’s mass:
**Formula: Black Hole Mass**
$\text{Black Hole Mass} = 2.1 + \text{1D†-1} + \frac{\text{d10}}{10}$
$\text{†For a 6 and each additional 1D roll of 6, continue to add 1D to mass}$

Black holes smaller than 2.17? may exist but would have formed through some process other than stellar evolution; they may be primordial or artificially created. Primordial black holes with a mass of less than 200 million tons will likely have already evaporated through a process known as Hawking radiation.

**Formula: Black Hole Diameter**
$\text{Black Hole Diameter} = 5.9km \times \text{Mass}$

A black hole by definition does not radiate heat. The accretion disk around it, if any, may generate a great deal of electromagnetic radiation but as with neutron stars temperature is the smallest worry in such a potentially dangerous environment. The Referee is free to set whatever luminosity value is required for the situation, ranging from zero to a torrent of light from the shredded remains of giant stars.
## DEAD STAR SYSTEM CHARACTERISTICS
A dead star generally disrupts its system and the local environment during the process of dying. This affects both travel into the system and what remains after the star’s death.
### JUMP RESTRICTIONS
If a system hosts no ‘normal’ stars, the Empty Hex Jump DMs table affects jumps to these systems. If the dead star is a member of a star system that contains normal hydrogen-burning stars, no such restrictions apply. However, pulsars and black holes cast unusual jump shadows, the former because of its high spin rate and a relativistic phenomenon known as frame dragging, the latter because of its central singularity. All Astrogation and Engineer (j-drive) checks to and from any systems containing a pulsar or black hole suffer DM-4.
### PLANETARY SYSTEM
Planetary systems around dead stars can be of two different origins. They could be survivors of a star’s earlier life, far enough away from the star to avoid being consumed during the star’s giant phase or vaporized in a supernova explosion, or they could be worlds formed in the aftermath of the star’s death, accreted from the remains of a previous generation of planets pulverized as the star expanded and died. In either case, these worlds exist and at least around white dwarfs, could host familiar forms of life.

Most dead stars do not have a planetary system. The death throes of a star either burn up planets or the star’s mass loss from the end of its giant phase loosens the bonds of gravity, causing worlds to spiral outward,
possibly interacting with other objects to become expelled from the planetary system. To check for a planetary system when the primary star is a dead star roll 2D:

**Formula: Dead Star Planetary System Exists**
$\text{Dead Star Planetary System Exists on 8+} = \text{2D} + \text{DMs}$

**Die Modifiers for Dead Star Planetary System**
- Multiple 'dead star' system: DM-2
- Neutron star (or pulsar, magnetar) present: DM-2
- Black hole present: DM-4

Regardless of DMs, a planetary system always exists on a roll of natural 12. If a planetary system exists, the following modifications apply to system:
- The check to see if a gas giant is absent is 6+ instead of the standard 10+. Alternatively, a gas giant is only present on a roll of 9+. The roll to determine the number of gas giants has post-stellar object DMs.
- The check to see if a planetoid belt is present is 6+ instead of the standard 8+. The roll to determine the number of planetoid belts has post-stellar object DMs.
- The minimum available Orbit# (MAO) around a dead star is 0.001.
- All planets in orbit around a pulsar or magnetar have the radioactive taint or irritant at severity and persistence 9 in addition to any other taints or irritants.
## NEBULAE
The term nebula is a broad characterization of a diffuse interstellar cloud composed of gases, ions and/or dust. A nebula may be associated with star birth or death. Protostar systems are often enshrouded in nebulae or have partially burned them away, creating glowing wisps and tendrils of ionized gas. A giant star of moderate size ends its life by expelling layers of gas, creating a short-lived planetary nebula as it settles into slow decline as a white dwarf. Larger stars explode in supernova, often lighting up previously expelled gas or casting off new layers as they collapse into neutron stars or black holes. Vast stretches of space may be filled with dark clouds of dust, waiting for compression or some other disturbance to set them on their way to star creation or for some nearby bright star to slowly evaporate them into nothingness. One thing all nebulae have in common is their relative density; although they appear solid or at least translucent to the eye, they are mostly vacuum with the volume of a planet containing only a few kilograms of diffuse material. Only their vast size makes them appear solid.

For Traveller purposes, nebulae can occur in two ways: they could be the result of a system generation roll or may be a structure placed on a map by the Referee. The former is generally a parsec or less in size and may hold some unknown objects within its borders, the latter is subject to the whims of the Referee and could span whole sectors.

### RANDOM NEBULA GENERATION
A Referee assigning random characteristics to a nebula can use the Random Nebula Type table as a guide.

A planetary nebula should have an associated white dwarf. Planetary nebulae do not last more than a few thousand or tens of thousands of years before fading.

**Table 105: Random Nebula Type**

| 1D  | Type                    | Comments                                                                                                                                                                                               |
|-----|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1   | Planetary nebula        | Roll 1D: on a 1 it is a single hex with a new white dwarf, on 2–6 a ring of six hexes surrounding a young white dwarf.                                                                         |
| 2   | Dark nebula             | Hex of cold dark gas and dust.                                                                                                                                                                       |
| 3–4 | Ionised hydrogen nebula | Hex of glowing gas ionised by nearby star formation.                                                                                                                                                   |
| 5–6 | Supernova remnant       | Hex of diffuse plasma generated by supernova debris.                                                                                                                                                   |

The central white dwarf uses the 0.000 column on the White Dwarf Aging table on page 227 to determine initial temperature and luminosity. The Referee can adjust a subsector or sector map to create a ring of nebula around the central star or declare the nebula to be a single hex with a white dwarf at the center.

A dark nebula is opaque to visual light but infrared light can pass through it. It may span multiple hexes at the Referee’s discretion.

An ionized hydrogen nebula or H II Nebula is generally associated with star formation. Examples of these nebulae include the Orion Nebula and Eagle Nebula. These nebulae may span large regions and are usually ionized by a nearby supergiant star or star cluster. A Referee may choose to place such nebulae near these bright stars or add a bright star to an otherwise empty hex adjacent to such a nebula.

A supernova remnant is the wispy remains of matter expelled by a dying star. Depending on the age of the remnant, it can be quite large. Such remnants may be placed similarly to a planetary nebula or might span whole subsectors as a full or broken ring. The center of this ring may contain a neutron star, a black hole or the remnant object could have been ejected by an uneven explosion, leaving a missing or off-center object.

If the Referee wishes to randomly expand the size of any nebula other than a planetary nebula, assign a probability such as 1 in 6 to surrounding hexes and add a hex of the nebula to any hex with a positive result. Continuing this process around each new hex can create a random multi-hex nebula. Certain directions from the nebular hex can be granted additional modifiers to simulate directionality in the nebula’s expanse, or the Referee may decide, especially in the case of a supernova remanent, to draw a circle around the central remnant and assign a probability of nebula existence to each hex in that circle.
### OBJECTS WITHIN A NEBULA
A one hex nebula can contain any of the objects possible to find in an empty hex as indicated on the Empty Hex Objects table on page 221, with two differences:

First, any nebula except a planetary nebula may contain protostars in early formation. Replace the white dwarf row on the table with the following protostar entry:


|Protostar|6 on 1D, then equal to system density|3|Automatic|

Second, multiply the table’s detection column value by four for all smaller objects.

A multi-hex nebula may engulf incidental systems. The Referee may choose to roll normally for system occurrence and generation for such hexes. The system in question is ‘just passing through’ the region of nebula and while views of the night sky will be affected, the sparse nature of most nebulae are such that little additional effects occur, although the Referee could decide that an especially dark nebula lowers the temperature of worlds by 1D degrees as an inherent temperature modification. Jump restrictions apply to these incidental nebula occupants.
### JUMP RESTRICTIONS
Jumps into or across nebulae are difficult. Despite the low density, they create an overall diffused and lumpy gravitational environment. All jump checks for Astrogation and Engineer (j-drive), including the second Astrogation check, receive a DM-1D. This DM is rolled once and applied to all checks for that particular jump and applies both when the destination is inside the nebula or if the jump crosses or exits the hex containing the nebula. The DM varies over time,and a ship experiencing a DM-1 for a jump on one day may experience a DM-6 on exactly the same jump at a later date or when returning across the same path. Ships jumping from the same source to the same destination in a 24-hour period will experience the same DM but they cannot communicate the severity of the penalty to one another.
## STAR CLUSTERS
A star cluster is a dense conglomeration of stars. These may be open star clusters resulting from recent star formation, with all the stars in a tight grouping recently born out of the same nebula, or they may be older globular clusters bound by gravity for billions of years. In either case, a general characteristic of a star cluster is that the stars within the cluster tend to have the same age. One or more interlopers may have wandered into the cluster through random motion but for all systems (except one if the Referee places an interloper) in any given hex, they will be identical in age.

For settings in the galactic spiral arms, star clusters are almost always open star clusters. If a Referee wishes to limit the cluster to a single hex, it may have 2D+5 star systems associated with it. If a cluster is larger than a single hex, it should be generally circular in shape, 1D+1 hexes across, with each hex from the center having an additional DM-2 to the roll for number of star systems. The age of these open clusters is normally less than one billion years. The Referee may determine the age as 1D × 1D × 50 million years. If the cluster is less than 200 million years old, a DM+1 applies to the Star Type Determination table on page 15 but treat results of 2 as unusual. If the unusual column indicates another star cluster, treat it as a BD (brown dwarf) result instead. A Referee can also choose to treat anomaly results as brown dwarfs.
### GENERATING CLUSTER SYSTEMS
As noted above, all systems in a star cluster have the same age. If a massive star should have aged out of the main sequence by the age of the cluster it is instead considered a merged star created by the collision of two less massive stars. The planetary system of any merged star should have a DM-2 to all rolls for the existence and quantity of planets (this would technically be a DM+2 for the default method of determining gas giant presence) and all orbits will have DM+2 on the eccentricity table.

For each hex within a cluster (except the hex rolled as the cluster hex, if it was a random consequence of star determination) there is a chance equal to the normal stellar density probability of a regular system appearing – in other words, if it ‘spills’ into a mapped region the existing systems can still exist, surrounded by cluster stars.
### JUMP RESTRICTIONS
Jumping into a dense star cluster poses challenges. Unless the jump is to a directly adjacent star within the cluster (Referee’s discretion) or from the outside to a star on the outer edge of the cluster, all jumps suffer a DM-1D to all Astrogation and Engineer (j-drive) checks. Like the nebula modifier above, this DM changes on a daily basis.
## ARTIFICIAL WORLDS
Artificial structures in space range in size from single module space stations to Dyson spheres. The former is possible at TL6, the latter at perhaps TL29. For the simplest of these structures and across their evolution into larger highports and habitats, the existing paradigm of Size 0 is a workable descriptive world format, covering everything from the smallest station to habitats carved out of asteroids. For truly world-sized or larger structures a Referee can use a Size code of X to describe the objects at very high Tech Levels. The objects in the Artificial World Types table are representative of what exists and what may be possible. Some, such as tent worlds, ring moons and tiered worlds have as their basis a naturally created planet and use the host world’s Size code. Others, such as orbitals, ringworlds and Dyson spheres are entirely constructed.

Objects from full-sized orbitals and larger have surface areas that are greater than a full-sized planet. Many variations of these object are possible. A Dyson sphere, or a large set of independently orbiting stations utilising most of the energy of the system’s central star could be possible as early as TL8, given enough industrial capacity and time to completely mine and transform an asteroid belt or disassemble a small planet or moon.

**Table 106: Artificial World Types**

| Object             | TL  | Size Code | Description                                                         |
| ------------------ | :-: | :-------: | ------------------------------------------------------------------- |
| Station Module     |  6  |     0     | Short-term occupancy module                                         |
| Station Complex    |  7  |     0     | Multi-module station                                                |
| Spin Station       |  7  |     0     | Full or partial spin modules for artificial gravity                 |
| Spin Habitat       |  8  |     0     | Large colony-sized rotating habitat                                 |
| Grav Station       | 10  |     0     | Artificial gravity, up to city-sized                                |
| Small Tent World   | 12  |     —     | Paraterraforming or pressurized roof on small (up to Size 2) worlds |
| Tent World         | 13  |     —     | Paraterraforming on terrestrial-sized worlds                        |
| Small Ring Moon    | 14  |     0     | Orbital height ring around small (up to Size 2) worlds              |
| Tiered World       | 14  |     —     | Multiple levels of world-encompassing shells                        |
| Ring Moon          | 16  |     0     | Orbital height ring around terrestrial-sized worlds                 |
| Small Orbital      | 18  |     X     | Free rotating ring up 10,000km diameter (Halo Orbital)              |
| Orbital            | 22  |     X     | Free rotating ring up to 2,000,000km diameter (Banks Orbital)       |
| Rosette            | 24  |     —     | Multiple worlds in single orbit (all of same Size code)             |
| Artificial World   | 26  |     —     | Created planet-sized construct (Size varies)                        |
| Small Ringworld    | 26  |     X     | Sun encompassing ring (red dwarf habitable zone only)               |
| Ringworld          | 27  |     X     | Sun encompassing ring (any main sequence star)                      |
| Small Dyson Sphere | 28  |     X     | Sun encompassing rigid sphere (red dwarf habitable zone only)       |
| Dyson Sphere       | 29  |     X     | Sun encompassing rigid sphere (any main sequence star)              |
## IISS PROCEDURAL
Systems or objects that do not show up on commercial maps are the subject of many of the exploration office’s expeditions, some of which take place in long settled sectors. An ‘empty hex’ that is home to a brown or a white dwarf may have marginally habitable planets. In other empty locations, rogue worlds can act as refueling points or convenient gravity wells on journeys otherwise too far or dangerous to cross in a single jump.

Expeditions to these publicly uncharted locations begin with remote observation, often over the course of months. Ships jumping to locations with uncertain refueling prospects usually carry enough fuel to ensure a return jump if wilderness refueling proves impossible. In some instances when one ship cannot carry enough fuel for the return jump, a pair of ships will jump with enough return fuel for one of them, allowing the crews to consolidate onto a single ship and return without becoming stranded. Drop tanks and external fuel bladders wrapped in jump nets are also options to extend the range of vehicles beyond their rated maximum, especially when crossing rift areas.

The communications office is often involved in provisioning and operating deep space jump bridges, whether fully staffed stations or mere fuel dumps. These ‘shortcuts’ can provide expedited passage around small rifts to isolated worlds, enabling data and package delivery to systems that would otherwise be considerably delayed or not possible by normal means. Such bridge stations rarely have commercial service, a major reason for their absence on the RPSC charts.

Protostar systems are rare and almost always interdicted by the IISS for safety reasons. This interdiction is not enforced but those who violate Red Zone restrictions should not expect rescue and if by happenstance a scout crew encounters a stranded ship, the recovered crew from the stricken vessel can expect fines at best and at worst the confiscation of a salvageable ship and any goods carried. Primordial star systems are more common, accounting for several stars in every sector. Some of these are home to belter communities but most are too hazardous for settlement. The Scout Service may place a base on a protected or distant planetesimal in such systems.

Neutron stars and black holes are rare. Most known exemplars of such objects in Charted Space are either in a star system with at least one ‘regular’ star and may be distant enough for a civilization to thrive in a far corner of the system. The exploration or survey office may place a base in such systems or visit with survey or larger science vessels. The IISS posts an exclusion zone to mark the closest safe approach to these objects but as with protostar systems, the penalties for violation are more the risks of the endeavor and not any active enforcement. Pulsar and magnetar systems, the latter absent from Charted Space, are too hazardous to approach and are Red Zoned by default. As for the known quiescent neutron stars and black holes in ‘empty’ hexes, these are not listed on RPSC charts unless they lie on a direct path between two systems and pose a direct hazard to jump travel. The space within an empty hex is vast and the odds of this occurring are negligible.

Large artificial structures exist in Charted Space. Lower tech objects such as massive space habitats are common. More unusually artefacts, such as a small ring moon, exists at Hliyh in the Trojan Reach and

Antra in Deneb has its Worldroof, as do many smaller ‘tented’ Selenite worlds in the Solomani Confederation. Kaskii in Core is a tiered world.

The Ancients attempted to create greater wonders such as the rosette of seven worlds at Tireen in Knaeleng, the half-competed ringworld at Leenitakot in the Hinterworlds and the rumored Dyson sphere on the far side of Hiver space. Whether the exploration branch has discovered other such wonders is not public knowledge, although rumors of these finds are as old as starflight. As such massive artefacts would be interdicted, the Scout Service is not inclined to publicize any such finds.