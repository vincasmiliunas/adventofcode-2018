const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('22.txt', {encoding: 'utf-8'});

const goal0 = (() => {
    const m1 = txt0.match(/depth: (\d+)/);
    const m2 = txt0.match(/target: (\d+),(\d+)/);
    const f = x => parseInt(x);
    return {x: f(m2[1]), y: f(m2[2]), depth: f(m1[1])};
})();

const goal1 = {x: 10, y: 10, depth: 510};

/* *** */

const Tool = {
    Neither: 'Neither',
    Torch: 'Torch',
    Climbing: 'Climbing',
};
Object.freeze(Tool);

const Region = {
    Rocky: '.',
    Wet: '=',
    Narrow: '|',
};
Object.freeze(Region);

const Risk = {
    [Region.Rocky]: 0,
    [Region.Wet]: 1,
    [Region.Narrow]: 2,
};
Object.freeze(Risk);

const RegionTools = {
    [Region.Rocky]: [Tool.Torch, Tool.Climbing],
    [Region.Wet]: [Tool.Neither, Tool.Climbing],
    [Region.Narrow]: [Tool.Neither, Tool.Torch],
};
Object.freeze(RegionTools);

const ToolSwitch = {
    [Tool.Neither]: [Tool.Torch, Tool.Climbing],
    [Tool.Torch]: [Tool.Neither, Tool.Climbing],
    [Tool.Climbing]: [Tool.Torch, Tool.Neither],
};
Object.freeze(ToolSwitch);

const ToolIndex = {
    [Tool.Neither]: 0,
    [Tool.Torch]: 1,
    [Tool.Climbing]: 2,
};
Object.freeze(ToolIndex);

/* *** */

const start = {x: 0, y: 0, tool: Tool.Torch};
const goal = {...goal0, tool: Tool.Torch};

/* *** */

const addVector = (a, b) => ({x: a.x + b.x, y: a.y + b.y});
const eqPoints = (a, b) => a.x === b.x && a.y === b.y;
const eqPointsTool = (a, b) => a.x === b.x && a.y === b.y && a.tool === b.tool;

/* *** */

const memoizeData = {
    'geologic': {},
    'erosion': {},
    'region': {},
};

const memoize = (type, point, f) => {
    const key = `${point.x}x${point.y}`;
    const group = memoizeData[type];
    if (group[key]) {
        return group[key];
    } else {
        const r = f(point);
        group[key] = r;
        return r;
    }
};

/* *** */

const geologic = (point) => {
    return memoize('geologic', point, geologicEx);
};

const geologicEx = (point) => {
    if (eqPoints(point, start) || eqPoints(point, goal)) {
        return 0;
    } else if (point.y === 0) {
        return point.x * 16807;
    } else if (point.x === 0) {
        return point.y * 48271;
    } else {
        return erosion(addVector(point, {x: -1, y: 0})) * erosion(addVector(point, {x: 0, y: -1}));
    }
};

const erosion = (point) => {
    return memoize('erosion', point, erosionEx);
};

const erosionEx = (point) => {
    return (geologic(point) + goal.depth) % 20183;
};

const region = (point) => {
    return memoize('region', point, regionEx);
};

const regionEx = (point) => {
    const r = erosion(point);
    const m = [Region.Rocky, Region.Wet, Region.Narrow];
    return m[r % 3];
};

/* *** */

const minX = 0;
const minY = 0;
const maxX = goal.x+50;
const maxY = goal.y+100;
// const maxX = 15;
// const maxY = 15;

const width = maxX - minX + 1;
const height = maxY - minY + 1;

/* *** */

const boardN = f => new Array(height).fill(null).map((_,y) => new Array(width).fill(null).map((_,x) => f({x, y})));
const boardIn = p => (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY);
const boardG = (b, p) => boardIn(p) ? b[p.y - minY][p.x - minX] : null;
const boardS = (b, p, v) => b[p.y - minY][p.x - minX] = v;

const print = (points = []) => {
    const b = boardN(_ => null);
    for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
            const point = {x, y};
            const r = region(point);
            boardS(b, point, r);
        }
    }

    boardS(b, start, 'M');
    boardS(b, goal, 'T');
    for (const point of points) {
        boardS(b, point, '%');
    }
    return b.map(line => line.join('')).join("\n");
};

const board = boardN(region);
const risk = new Array(goal.y+1).fill(null).map((_,y) => new Array(goal.x+1).fill(null).map((_,x) => Risk[boardG(board, {x, y})]).reduce((s,x) => s + x, 0)).reduce((s,x) => s + x, 0);

// p(print());
p('Part 1', risk);

/* *** */

const around = [{x: 0, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}];

const numTools = Object.keys(ToolIndex).length;
const boardNew = z => boardN(_ => new Array(numTools).fill(null).map(z));
const boardSet = (b, p, v) => b[p.y - minY][p.x - minX][ToolIndex[p.tool]] = v;
const boardGet = (b, p) => boardIn(p) ? boardG(b, p)[ToolIndex[p.tool]] : null;

const shortest = (head, tail) => {
    const queue = [];
    const prev = boardNew(_ => null);
    const dist = boardNew(_ => Number.MAX_SAFE_INTEGER);

    queue.push(head);
    boardSet(dist, head, 0);

    while (queue.length > 0) {
        queue.sort((a,b) => boardGet(dist, a) - boardGet(dist, b));
        const node = queue.shift();

        const neighbors1 = ToolSwitch[node.tool].filter(tool => RegionTools[region(node)].indexOf(tool) !== -1).map(tool => ({...node, tool, cost: 7}));
        const tools = z => eqPoints(node, tail) ? [Tool.Torch] : RegionTools[region(z)];
        const neighbors2a = around.map(z => addVector(node, z)).filter(z => boardIn(z));
        const neighbors2 = neighbors2a.map(z => tools(z).filter(tool => tool === node.tool).map(tool => ({...z, tool, cost: 1}))).reduce((s,x) => s.concat(x), []);
        const neighbors = [].concat(neighbors2).concat(neighbors1);

        for (const next of neighbors) {
            const cost = boardGet(dist, node) + next.cost;
            if (cost >= boardGet(dist, next)) {
                continue;
            }

            boardSet(dist, next, cost);
            boardSet(prev, next, node);

            if (!queue.some(z => eqPointsTool(z, next))) {
                queue.push(next);
            }
        }
    };

    return {dist, prev}
};

const resolve = (prev, head, tail) => {
    const path = [];
    for (at = tail; at !== null; at = boardGet(prev, at)) {
        path.push(at);
    }
    path.reverse();
    return path.length && eqPointsTool(path[0], head) ? path : [];
}

const travel = shortest(start, goal);

// p(print(resolve(travel.prev, start, goal)));
p('Part 2', boardGet(travel.dist, goal));
