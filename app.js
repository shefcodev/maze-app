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

const cellsHorizontal = 15;
const cellsVertical = 13;
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
      wireframes: false,
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
 
const grid = Array(cellsVertical)
   .fill(null)
   .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
   .fill(null)
   .map(() => Array(cellsHorizontal - 1).fill(false));
 
const horizontals = Array(cellsVertical - 1)
   .fill(null)
   .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startCol = Math.floor(Math.random() * cellsHorizontal);

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
         nextRow >= cellsVertical || 
         nextCol < 0 || 
         nextCol >= cellsHorizontal
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
         columnIndex * unitLengthX + unitLengthX / 2,
         rowIndex * unitLengthY + unitLengthY,
         unitLengthX,
         5,
         {
            label: "wall",
            isStatic: true,
            render: {
               fillStyle: "grey"
            }
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
         columnIndex * unitLengthX + unitLengthX,
         rowIndex * unitLengthY + unitLengthY / 2,
         5,
         unitLengthY, 
         {
            label: "wall",
            isStatic: true,
            render: {
               fillStyle: "grey"
            }
         }
      );

      World.add(world, wall);
   });
});

// target;

const target = Bodies.rectangle(
   width - unitLengthX / 2,
   height - unitLengthY / 2, 
   unitLengthX * 0.5,
   unitLengthY * 0.5, 
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

const playerRadius = Math.min(unitLengthX, unitLengthY) / 4;
const player = Bodies.circle(
   unitLengthX / 2,
   unitLengthY / 2,
   playerRadius,
   {
      label: "player",
      isStatic: false,
      render: {
         fillStyle: "grey",
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