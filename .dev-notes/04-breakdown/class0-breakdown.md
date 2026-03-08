# Class 0 - Sector Survey (Long Range Scan)

**Purpose:** Remote scanning to identify star systems across a sector or subsector

**UI Components:**

- Scope Selector: Sector (4x4 Subsectors) or Subsector (8x10 Hex)
- Sector Name Input: [Random Name Generator (Possible could develop a Random Sector Name Generator. This could allow for better control of name outputs)] or User Input overide
- Density Selector: I like the idea of the density being based on the type of galaxy the sector is in and where the sector is located in reference to the galaxy to determine star density. spiral, barred spiral, elliptical, and irregular. Maybe it would be possible to map out the sector density and size in sectors of the galaxy then assign a density to each sector.
- Generate Button
- Results Grid: Either a Sector or Subsector display of the result

**Generated Data**

{  
 "systemId": "0803",  
 "coordinates": {"hex": "0803"},  
 "primaryStar": {  
 "spectralType": "A",  
 "spectralDecimal": "7",  
 "spectralClass": "V",  
 "spectralDesignation": "A7V"  
 },  
 "secodnaryStars": [
{
"type": "Close",
"spectralType": "F",
"spectralDecimal": "2",
"spectralClass": "V"
"spectralDesignation": "F2V"
}
],
"companionStars": [
{
"type": "Close",
"spectralType": "F",
"spectralDecimal": "2",
"size": "V"
}
],
}
