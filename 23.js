const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('23.txt', {encoding: 'utf-8'});
const txt1 = `
pos=<0,0,0>, r=4
pos=<1,0,0>, r=1
pos=<4,0,0>, r=3
pos=<0,2,0>, r=1
pos=<0,5,0>, r=3
pos=<0,0,3>, r=1
pos=<1,1,1>, r=1
pos=<1,1,2>, r=1
pos=<1,3,1>, r=1
`;
const txt = txt0;

const lines = txt.split("\n").filter(x => x);

const bots = lines.map(line => {
    const m = line.match(/^pos=<(-?\d+),(-?\d+),(-?\d+)>, r=(\d+)$/);
    const [x,y,z,r] = m.slice(1).map(x => parseInt(x));
    return {x,y,z,r};
});

// p(bots);

/* *** */

const mdistance = (a,b) => Math.abs(b.x - a.x) + Math.abs(b.y - a.y) + Math.abs(b.z - a.z);
const addVector = (a, b) => ({x: a.x + b.x, y: a.y + b.y, z: a.z + b.z});
const eqPoints = (a, b) => a.x === b.x && a.y === b.y && a.z === b.z;

/* *** */

bots.sort((a,b) => (b.r - a.r));
const strongest = bots[0];

const near = bots.filter(z => mdistance(strongest, z) <= strongest.r);
p('Part 1', near.length);

/* *** */

const getMinMax = key => {
    const items = bots.map(bot => {
        return [bot[key]-bot.r, bot[key]+bot.r];
    }).reduce((s,x) => s.concat(x), []);
    return [Math.min(...items), Math.max(...items)];
};

const [minX, maxX] = getMinMax('x');
const [minY, maxY] = getMinMax('y');
const [minZ, maxZ] = getMinMax('z');

const keys = ['x', 'y', 'z'];
const center = {x:0, y:0, z:0};

const pMinMax = (min, max) => ({min, max});
const whole = {x: pMinMax(minX, maxX), y: pMinMax(minY, maxY), z: pMinMax(minZ, maxZ)};

/* *** */

const makeOctree = (input) => {
    const f = (key) => {
        const q = input[key];
        const d = q.max - q.min;
        if (d === 0) {
            return [{min: q.min, max: q.max}];
        } else if (d === 1) {
            return [{min: q.min, max: q.min}, {min: q.max, max: q.max}];
        } else {
            const c = ((q.min + q.max) / 2)|0;
            return [{min: q.min, max: c}, {min: c+1, max: q.max}];
        }
    };
    const choices = keys.reduce((s,x,i) => ({...s, [x]: f(x)}), {});
    const result = [];
    for (const x of choices.x) {
        for (const y of choices.y) {
            for (const z of choices.z) {
                const cube = {x,y,z};
                result.push(cube);
            }
        }
    }
    return result;
};

const distance2cube = (point, cube) => {
    const f = (key) => {
        if (point[key] > cube[key].max) {
            return cube[key].max;
        } else if (point[key] < cube[key].min) {
            return cube[key].min;
        } else {
            return point[key];
        }
    };
    const point2 = keys.reduce((s,x) => ({...s, [x]: f(x)}), {});
    return mdistance(point, point2);
};

/* *** */

const queue = [whole];
while (queue.length > 0) {
    const space = queue.shift();

    if (space.x.min === space.x.max && space.y.min === space.y.max && space.z.min === space.z.max) {
        const point = {x: space.x.min, y: space.y.min, z: space.z.min};
        p('Part 2', mdistance(center, point));
        break;
    }

    const octrees = makeOctree(space);
    const r = octrees.map(octree => [octree, bots.reduce((s,bot) => s + (distance2cube(bot, octree) <= bot.r ? 1 : 0), 0)]);
    r.sort((a,b) => b[1] - a[1]);
    const ns = r.filter(q => q[1] > 0 && q[1] === r[0][1]).map(q => q[0]);
    queue.unshift(...ns);
}
