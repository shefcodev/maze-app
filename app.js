// project file!;

"use strict";

const { 
   Engine, 
   Render, 
   Runner, 
   World, 
   Bodies
} = Matter;

const cells = 20;
const width = 660;
const height = 660;
const unitLength = width / cells;

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
   Bodies.rectangle(width / 2, 0, width, 1, {
      isStatic: true,
   }),
   Bodies.rectangle(width / 2, height, width, 1, { 
      isStatic: true
   }),
   Bodies.rectangle(0, height / 2, 1, height, {
      isStatic: true
   }), 
   Bodies.rectangle(width, height / 2, 1, height, {
      isStatic: true
   })
];

World.add(world, walls);

// maze generation;

const shuffle = arr => {
   let counter = arr.length;

   while (counter > 0) {
      let index = Math.floor(Math.random() * counter);
      counter--;

      const rev = arr[counter];
      arr[counter] = arr[index];
      arr[index] = rev;
   }
   return arr;
}
 
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
   const neighbors = shuffle([
      [row - 1, column, "up"],
      [row, column + 1, "right"],
      [row + 1, column, "down"],
      [row, column - 1, "left"]
   ]);

   // for each neightbor ...

   for (let neighbor of neighbors) {
      const [nextRow, nextCol, direction] = neighbor;

      // see if the neighbor is out of bounds;
      if (nextRow < 0 || 
         nextRow >= cells || 
         nextCol < 0 || 
         nextCol >= cells
      ){
         continue;
      }

      // if we have visted that neighbor, continue with the next neighbor;
      if (grid[nextRow][nextCol]) {
         continue;
      }

      // remove a wall from either verticals or horizontals;
      if (direction === "left") {
         verticals[row][column - 1] = true;
      } else if (direction === "right") {
         verticals[row][column] = true;
      } else  if (direction === "up") {
         horizontals[row - 1][column] = true;
      } else if (direction === "down") {
         horizontals[row][column] = true;
      }

      // visit that next cell;
      itrCells(nextRow, nextCol);
   }

};

itrCells(startRow, startCol); 

horizontals.forEach((row, rowIndex) => {
   row.forEach((open, columnIndex) => {
      if (open) {
         return;
      }

      const wall = Bodies.rectangle(
         columnIndex * unitLength + unitLength / 2,
         rowIndex * unitLength + unitLength,
         unitLength,
         5,
         {
            isStatic: true,
         }
      );

      World.add(world, wall);
   });
});

verticals.forEach((row, rowIndex) => {
   row.forEach((open, columnIndex) => {
      if (open) {
         return;
      }

      const wall = Bodies.rectangle(
         columnIndex * unitLength + unitLength,
         rowIndex * unitLength + unitLength / 2,
         5,
         unitLength, {
            isStatic: true,
         }
      );

      World.add(world, wall);
   });
});

const goal = Bodies.rectangle(
   width - unitLength / 2,
   height - unitLength / 2, 
   unitLength * 0.5,
   unitLength * 0.5, 
   {
      isStatic: true,
      render: {
         fillStyle: "green",
      }
   }
);

World.add(world, goal); 