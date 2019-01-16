const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('3.txt', {encoding: 'utf-8'});
const txt1 = `
#1 @ 1,3: 4x4
#2 @ 3,1: 4x4
#3 @ 5,5: 2x2
`;
const txt = txt0;

const lines = txt.split("\n").map(x => x.trim()).filter(x => x).map(x => {
    const m = x.match(/^#(?<id>\d+) @ (?<x>\d+),(?<y>\d+): (?<w>\d+)x(?<h>\d+)$/);
    return ['id', 'x', 'y', 'w', 'h'].reduce((s,x) => ({...s, [x]: parseInt(m.groups[x])}), {});
});

const board = {};
for (const line of lines) {
    for (let x = line.x; x < line.x + line.w; x += 1) {
        for (let y = line.y; y < line.y + line.h; y += 1) {
            const key = `${x}x${y}`;
            if (board[key]) {
                board[key].push(line.id);
            } else {
                board[key] = [(line.id)];
            }
        }
    }
}
const r = Object.values(board).filter(x => x.length >= 2);
p('Part 1', r.length);

const multi2 = {};
for (const x of r) {
    for (const y of x) {
        multi2[y] = true;
    }
}
const nonOverlapId = lines.filter(x => !multi2[x.id]).reduce((s,x) => s ? s : x.id, null);
p('Part 2', nonOverlapId);
