// project file!;

"use strict";

const { 
   Engine, 
   Render, 
   Runner, 
   World, 
   Bodies,
   Body,
   Events
} = Matter;

const cellsHorizontal = 4;
const cellsVertical = 3;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
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
   Bodies.rectangle(width / 2, 0, width, 2, {
      isStatic: true,
   }),
   Bodies.rectangle(width / 2, height, width, 2, { 
      isStatic: true
   }),
   Bodies.rectangle(0, height / 2, 2, height, {
      isStatic: true
   }), 
   Bodies.rectangle(width, height / 2, 2, height, {
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
            label: "wall",
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
         unitLength, 
         {
            label: "wall",
            isStatic: true,
         }
      );

      World.add(world, wall);
   });
});

// target;

const target = Bodies.rectangle(
   width - unitLength / 2,
   height - unitLength / 2, 
   unitLength * 0.5,
   unitLength * 0.5, 
   {
      label: "target", 
      isStatic: true,
      render: {
         fillStyle: "green",
      }
   }
);

World.add(world, target); 

// player;

const player = Bodies.circle(
   unitLength / 2,
   unitLength / 2,
   unitLength / 4,
   {
      label: "player",
      isStatic: false,
      render: {
         fillStyle: "green",
      }
   }
);

World.add(world, player);

document.addEventListener("keydown", event => {
   const { x, y } = player.velocity;

   if (event.keyCode === 38) {
      Body.setVelocity(player, { x, y: y - 5 });
   } else if (event.keyCode ===  39) {
      Body.setVelocity(player, { x: x + 5, y });
   } else if (event.keyCode === 40) {
      Body.setVelocity(player, { x, y: y + 5 });
   } else if (event.keyCode === 37) {
      Body.setVelocity(player, { x: x - 5, y });
   }
});

// Win Condition;

Events.on(engine, "collisionStart", event => {
   event.pairs.forEach(collision => {
      const { bodyA, bodyB } = collision;
      const label = ["player", "target"];

      if (label.includes(bodyA.label) && label.includes(bodyB.label)) {
         world.gravity.y = 1;

         world.bodies.forEach(body => {
            if (body.label === "wall") {
               Body.setStatic(body, false);
            }
         });
      }
   });
});