// project file!;

"use strict";

const { 
   Engine, 
   Render, 
   Runner, 
   World, 
   Bodies
} = Matter;

const cells = 3;
const width = 660;
const height = 660;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
   element: document.body,
   engine: engine,
   options: {
      wireframes: true,
      width,
      height
   }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// walls;

const walls = [
   Bodies.rectangle(width / 2, 0, width, 40, {
      isStatic: true,
   }),
   Bodies.rectangle(width / 2, height, width, 40, { 
      isStatic: true
   }),
   Bodies.rectangle(0, height / 2, 40, height, {
      isStatic: true
   }), 
   Bodies.rectangle(width, height / 2, 40, height, {
      isStatic: true
   })
];

World.add(world, walls);

// maze generation;
 
const grid = Array(cells)
   .fill(null)
   .map(() => Array(cells).fill(false));

const verticals = Array(cells)
   .fill(null)
   .map(() => Array(cells - 1).fill(false));
 
const horizontals = Array(cells - 1)
   .fill(null)
   .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startCol = Math.floor(Math.random() * cells);

const itrCells = (row, column) => {
   // cell [row, column] is vsisted, the return;
   if (grid[row][column]) {
      return;
   }

   // mark this cell as vsisted;
   grid[row][column] = true;

   // assemble randomly ordered list of neightbors;
   const neighbors = [
      [row - 1, column],
      [row, column + 1],
      [row + 1, column],
      [row, column - 1]
   ]

   // for each neightbor ...

   // see if the neighbor is out of bounds;

   // if we have visted that neighbor, continue with the next neighbor;

   // remove a wall from either the verticals or the horizontals;

   // visit that next cell;
};

itrCells(startRow, startCol);
console.log(grid);