galaxyId: I don't think we will be generating many galaxies but just incase someone wants to incorporate multiple galaxies in one we can just make the index an incrementing number. If an import function is developed later on to import already existing galaxies, there will need to be a function that renumbers the galaxyId to next available and then change all galaxyId in the old system to the new before importing.

galaxyCoordiantes: I think using a simple xy grid will be sufficient. I'm thinking this will be the XY coordinates for the center of the galaxy. Again if this is a user created it should start at x:0 y:0 for their galaxy. Put if importing an existing galaxy, I will have to create something for the user to calculate where in the universe their galaxy is in comparison to others.

galaxyName: Allows for adding additional names used by different languages

galaxyType:

Maybe add a way to determine the size of the galaxy based on x and y sectors or something. Not sure what else can go here. Definitely could put a count of stars and worlds and other statistical information.

```json
galaxy:[
{
"galaxyId": "001",
"galaxyCoordinates": {
"x": "000",
"y": "000"
},
"galaxyName": [
{
"name": "Milky Way",
"default": true
}
{
"name": "Baby Ruth",
"lang": "zh"
}
],
"galaxyType": "Spiral, Barred Spiral, Elliptical, or Irregular"
},
]
```
