const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt1 = Fs.readFileSync('17.txt', {encoding: 'utf-8'});
const txt2 = `
x=495, y=2..7
y=7, x=495..501
x=501, y=3..7
x=498, y=2..4
x=506, y=1..2
x=498, y=10..13
x=504, y=10..13
y=13, x=498..504
`;
const txt = txt1;

/* *** */

const Line = {
    Horizontal: 'Horizontal',
    Vertical: 'Vertical',
};
Object.freeze(Line);

const Water = {
    Spring: 'Spring',
    Running: 'Running',
    Resting: 'Resting',
};
Object.freeze(Water);

const WaterSymbol = {
    [Water.Spring]: '+',
    [Water.Running]: '|',
    [Water.Resting]: '~',
};
Object.freeze(WaterSymbol);

/* *** */

const lines = txt.split("\n").filter(x => x).map(line => {
    const m1 = line.match(/^x=(\d+), y=(\d+)\.\.(\d+)$/);
    if (m1) {
        const [x, y1, y2] = m1.slice(1).map(x => parseInt(x));
        return {x, y: [y1, y2], type: Line.Vertical};
    }
    const m2 = line.match(/^y=(\d+), x=(\d+)\.\.(\d+)$/);
    if (m2) {
        const [y, x1, x2] = m2.slice(1).map(x => parseInt(x));
        return {x: [x1, x2], y, type: Line.Horizontal};
    }
    throw new Error(`Failed to match: ${line}`);
});

const xs = lines.map(z => {
    switch (z.type) {
        case Line.Vertical:
            return [z.x];
        case Line.Horizontal:
            return z.x;
    };
}).reduce((s,x) => s.concat(x), []);
const ys = lines.map(z => {
    switch (z.type) {
        case Line.Vertical:
            return z.y;
        case Line.Horizontal:
            return [z.y];
    };
}).reduce((s,x) => s.concat(x), []);

const minX = Math.min(...xs)-1;
const maxX = Math.max(...xs)+1;
const minY = Math.min(...ys);
const maxY = Math.max(...ys);

const width = maxX - minX + 1;
const height = maxY - minY + 1;

// p(`Board: ${minX}x${minY} => ${maxX}x${maxY} ${width}:${height}`);

/* *** */

const mdistance = (a, b) => Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
const addVector = (a, b) => ({x: a.x + b.x, y: a.y + b.y});
const addX = (p, x) => addVector(p, {x, y: 0});
const addLeft = p => addX(p, -1);
const addRight = p => addX(p, 1);
const addY = (p, y) => addVector(p, {x: 0, y});
const addTop = p => addY(p, -1);
const addBottom = p => addY(p, 1);
const eqPoints = (a, b) => a.x === b.x && a.y === b.y;

/* *** */

const board = new Array(height).fill(null).map(_ => new Array(width).fill('.'));

const boardG = (p) => (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) ? board[p.y - minY][p.x - minX] : '.';
const boardS = (p, v) => board[p.y - minY][p.x - minX] = v;

/* *** */

const minX2 = minX;
const maxX2 = maxX;
const minY2 = 0;
const maxY2 = maxY;

const width2 = maxX2 - minX2 + 1;
const height2 = maxY2 - minY2 + 1;

// p(`Water: ${minX2}x${minY2} => ${maxX2}x${maxY2} ${width2}:${height2}`);

const waters = [];
const waterz = new Array(height2).fill(null).map(_ => new Array(width2).fill(null));

const waterG = (p) => (p.x >= minX2 && p.x <= maxX2 && p.y >= minY2 && p.y <= maxY2) ? waterz[p.y - minY2][p.x - minX2] : null;
const waterS = (p) => {
    if (waterz[p.y - minY2][p.x - minX2]) {
        throw new Error(`Water dup: ${p.x}x${p.y}`);
    }
    waters.push(p);
    waterz[p.y - minY2][p.x - minX2] = p;
};

const spring = {x: 500, y: 0, type: Water.Spring};
waterS(spring);

/* *** */

for (const line of lines) {
    switch (line.type) {
        case Line.Vertical:
            for (let i = line.y[0]; i <= line.y[1]; i += 1) {
                boardS({x: line.x, y: i}, '#');
            }
            break;
        case Line.Horizontal:
            for (let i = line.x[0]; i <= line.x[1]; i += 1) {
                boardS({x: i, y: line.y}, '#');
            }
            break;
    };
}

const print = (points0) => {
    const points = points0 || [];
    return board.map((line,y) => line.map((c,x) => {
        const b = waterG({x: x+minX, y: y+minY});
        return b ? WaterSymbol[b.type] : c;
    }).join('')).join("\n");
};

const print2 = (p, l, points0) => {
    const points = points0 || [];
    return board.slice(p.y, p.y+l.y).map((line,y) => line.slice(p.x, p.x+l.x).map((c,x) => {
        const z = {x: x+minX+p.x, y: y+minY+p.y};
        const bb = points.some(zz => eqPoints(z, zz));
        if (bb) return '%';
        const b = waterG(z);
        return b ? WaterSymbol[b.type] : c;
    }).join('')).join("\n");
};

const tick = () => {
    const stillBelow = (p) => {
        const pb = addBottom(p);
        const wb = waterG(pb);
        return boardG(p) === '.' && (boardG(pb) === '#' || (wb && wb.type === Water.Resting));
    };

    for (const w of waters) {
        if (w.type === Water.Resting) continue;

        const pl = addVector(w, {x: -1, y: 0});
        const pr = addVector(w, {x: 1, y: 0});
        const pb = addVector(w, {x: 0, y: 1});
        const bl = boardG(pl), br = boardG(pr), bb = boardG(pb);
        const wl = waterG(pl), wr = waterG(pr), wb = waterG(pb);

        (() => {
            const b = [Water.Spring, Water.Running].indexOf(w.type) !== -1 && bb === '.' && !wb && pb.y <= maxY;
            if (!b) return;
            waterS({...pb, type: Water.Running});
        })();

        (() => {
            if (!(w.type === Water.Running && bb === '#' && bl === '.' && br === '.' && wl && !wr && wl.type === Water.Running)) return;
            waterS({...pr, type: Water.Running});
        })();

        (() => {
            if (!(w.type === Water.Running && bb === '#' && bl === '.' && br === '.' && !wl && wr && wr.type === Water.Running)) return;
            waterS({...pl, type: Water.Running});
        })();

        (() => {
            if (!(w.type === Water.Running && bb === '#' && bl === '.' && br === '.' && !wl && !wr)) return;
            waterS({...pl, type: Water.Running});
            waterS({...pr, type: Water.Running});
        })();

        (() => {
            if (!(w.type === Water.Running && stillBelow(w))) return;

            const f = (d) => {
                let p = w;
                while (true) {
                    p = addVector(p, d);

                    if (!(!waterG(p) && stillBelow(p))) break;
                    waterS({...p, type: Water.Running});
                }
            };

            f({x: -1, y: 0});
            f({x: 1, y: 0});
        })();

        (() => {
            if (!(w.type === Water.Running && stillBelow(w))) return;

            let head = w, tail = w;
            while (true) {
                const p = addLeft(head);
                if (!waterG(p) || !stillBelow(p)) {
                    break;
                }
                head = p;
            }
            while (true) {
                const p = addRight(tail);
                if (!waterG(p) || !stillBelow(p)) {
                    break;
                }
                tail = p;
            }
            if (boardG(addLeft(head)) !== '#' || boardG(addRight(tail)) !== '#') {
                return;
            }
            {
                let p = head;
                while (p.x <= tail.x) {
                    waterG(p).type = Water.Resting;
                    p = addRight(p);
                }
            }
        })();
    }
};

let ticks = 0;
let printed = print();

while (true) {
    ticks += 1;
    // p(`ticks:${ticks}`);
    tick();
    const printed2 = print();
    // p(printed2);
    if (printed === printed2) {
        break;
    }
    printed = printed2;
}

p('Part 1', waters.filter(z => z.y >= minY && z.y <= maxY).length);

p('Part 2', waters.filter(z => z.y >= minY && z.y <= maxY && z.type == Water.Resting).length);
