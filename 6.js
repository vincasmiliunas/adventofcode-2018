const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('6.txt', {encoding: 'utf-8'});
const txt1 = `
1, 1
1, 6
8, 3
3, 4
5, 5
8, 9
`;
const txt = txt0;

const lines = txt.split("\n").filter(x => x).map(line => {
    const m = line.match(/^(?<x>\d+), (?<y>\d+)$/);
    return ['x', 'y'].reduce((s,x) => ({...s, [x]: parseInt(m.groups[x])}), {});
});
// p(lines);

const xs = lines.map(x => x.x);
const minX = Math.min(...xs);
const maxX = Math.max(...xs);
const ys = lines.map(x => x.y);
const minY = Math.min(...ys);
const maxY = Math.max(...ys);

// p(`${minX}x${minY} => ${maxX}x${maxY}`);

const mdistance = (a,b) => Math.abs(b.x - a.x) + Math.abs(b.y - a.y);

const board = [];
for (let x = minX-1; x <= maxX+1; x += 1) {
    for (let y = minY-1; y <= maxY+1; y += 1) {
        const r = lines.map((z,i) => [i,mdistance({x,y}, z)]).sort((a,b) => a[1] - b[1]);
        const area = r[0][1] < r[1][1] ? r[0][0] : null;

        const distances = lines.map((z,i) => mdistance({x,y}, z));
        const sum = distances.reduce((s,x) => s+x, 0);

        const infinite = x < minX || x > maxX || y < minY || y > maxY;
        board.push({x, y, area, infinite, sum});
    }
}
// p(board);

const areas = {};
for (const cell of board) {
    if (!areas[cell.area]) {
        areas[cell.area] = {};
    }
    areas[cell.area].infinite = areas[cell.area].infinite||cell.infinite;
    areas[cell.area].count = (areas[cell.area].count||0) + 1;
}
// p(areas);

const largest = Object.entries(areas).filter(x => !x[1].infinite).sort((a,b) => b[1].count - a[1].count);
p('Part 1', largest[0][1].count);

const region = board.filter(x => x.sum < 10000);
p('Part 2', region.length);
