const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('10.txt', {encoding: 'utf-8'});
const txt1 = Fs.readFileSync('10e.txt', {encoding: 'utf-8'});
const txt = txt0;

const points0 = txt.split("\n").filter(x => x).map(line => {
    const m = line.match(/^position=<\s*(?<px>-?\d+),\s*(?<py>-?\d+)> velocity=<\s*(?<vx>-?\d+),\s*(?<vy>-?\d+)>$/)
    const r = ['px', 'py', 'vx', 'vy'].reduce((s,x) => ({...s, [x]: parseInt(m.groups[x])}), {});
    return {
        position: {x: r.px, y: r.py},
        velocity: {x: r.vx, y: r.vy},
    };
});

const getSize = (lines) => {
    const xs = lines.map(x => x.position.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const ys = lines.map(x => x.position.y);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = (maxX-minX+1), height = (maxY-minY+1);    
    return {width, height, minX, maxX, minY, maxY};
};

const move = (z) => ({position: {x: z.position.x + z.velocity.x, y: z.position.y + z.velocity.y}, velocity: z.velocity});

const draw = lines => {
    const {width, height, minX, minY} = getSize(lines);
    const board = new Array(width*height).fill('.');
    for (const line of lines) {
        const t = (line.position.y - minY)*width + (line.position.x - minX);
        board[t] = '#';
    }
    return new Array(height).fill(null).map((_,i) => board.slice(i*width, (i+1)*width).join('')).join("\n");
};

let points = points0;
let size = Number.MAX_SAFE_INTEGER;
for (let second = 0; second < 100000; second += 1) {
    const points2 = points.map(move);
    const {width, height} = getSize(points2);
    const size2 = width*height;
    if (size2 > size) {
        p("Part 1");
        p(draw(points));
        p('Part 2', second);
        break;
    }
    points = points2;
    size = size2;
}
