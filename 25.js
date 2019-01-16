const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('25.txt', {encoding: 'utf-8'});
// 2
const txt1 = `
 0,0,0,0
 3,0,0,0
 0,3,0,0
 0,0,3,0
 0,0,0,3
 0,0,0,6
 9,0,0,0
12,0,0,0
`;
// 4
const txt2 = `
-1,2,2,0
0,0,2,-2
0,0,0,-2
-1,2,0,0
-2,-2,-2,2
3,0,2,-1
-1,3,2,2
-1,0,-1,0
0,2,1,-2
3,0,0,0
`;
// 3
const txt3 = `
1,-1,0,1
2,0,-1,0
3,2,-1,0
0,0,3,1
0,0,-1,-1
2,3,-2,0
-2,2,0,0
2,-2,0,-1
1,-1,0,-1
3,2,0,2
`;
// 8
const txt4 = `
1,-1,-1,-2
-2,-2,0,1
0,2,1,3
-2,3,-2,1
0,2,3,-2
-1,-1,1,-2
0,-2,-1,0
-2,2,3,-1
1,2,2,0
-1,-2,0,-2
`;

const txt = txt0;
const lines = txt.split("\n").filter(x => x);

const points = lines.map(line => {
    const m = line.match(/^\s*(-?\d+),(-?\d+),(-?\d+),(-?\d+)$/);
    const [x,y,z,t] = m.slice(1).map(z => parseInt(z));
    return {x,y,z,t};
});
Object.freeze(points);

/* *** */

const mdistance = (a, b) => Math.abs(b.x - a.x) + Math.abs(b.y - a.y) + Math.abs(b.z - a.z) + Math.abs(b.t - a.t);
const addVector = (a, b) => ({x: a.x + b.x, y: a.y + b.y, z: a.z + b.z, t: a.t + b.t});
const eqPoints = (a, b) => a.x === b.x && a.y === b.y && a.z === b.z && a.t === b.t;

/* *** */

let constellations = [];
for (const point of points) {
    const found = constellations.filter(q => q.some(qq => mdistance(qq, point) <= 3));
    if (found.length === 0) {
        constellations.push([point]);
    } else {
        const old = found.slice(1);
        const r = old.reduce((s,x) => [...s, ...x], []);
        found[0].push(point, ...r);
        constellations = constellations.filter(q => old.indexOf(q) === -1);
    }
}

console.log('Part 1', constellations.length);
