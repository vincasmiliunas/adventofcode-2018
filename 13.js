const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('13.txt', {encoding: 'utf-8'});
const txt1 = `
/->-\\        
|   |  /----\\
| /-+--+-\\  |
| | |  | v  |
\\-+-/  \\-+--/
  \\------/   
`;
const txt2 = `
/>-<\\  
|   |  
| /<+-\\
| | | v
\\>+</ |
  |   ^
  \\<->/
`;
const txt = txt0;

const lines = txt.split("\n").filter(x => x).map(x => x.split(''));

/* *** */

const Direction = {
    None: 0,
    East: 'East',
    West: 'West',
    North: 'North',
    South: 'South',
};
Object.freeze(Direction);

const Turn = {
    Left: 0,
    Straight: 1,
    Right: 2,
};
Object.freeze(Turn);
const numTurns = Object.keys(Turn).length;

const directCarts = {'>': Direction.East, '<': Direction.West, 'v': Direction.South, '^': Direction.North};
const orientCarts = {[Direction.East]: '>', [Direction.West]: '<', [Direction.South]: 'v', [Direction.North]: '^'};
const removeCarts = {'>': '-', '<': '-', 'v': '|', '^': '|'};
const tickCarts = {[Direction.East]: {x: 1, y: 0}, [Direction.West]: {x: -1, y: 0}, [Direction.South]: {x: 0, y: 1}, [Direction.North]: {x: 0, y: -1}};

/* *** */

const addVector = (a, b) => ({x: a.x + b.x, y: a.y + b.y});
const eqPoints = (a, b) => a.x === b.x && a.y === b.y;

/* *** */

const carts0 = lines.map((line,y) => {
    return line.map((z,x) => ({x, y, dir: directCarts[z], turn: Turn.Left, crashed: false})).filter(z => z.dir);
}).reduce((s,x) => s.concat(x), []);
// p(carts0);

const board = lines.map(line => line.map(x => removeCarts[x] ? removeCarts[x] : x));
// p(board);

const print = (carts) => {
    const b = board.map(x => x.slice(0));
    for (const cart of carts) {
        if (cart.crashed) {
            continue;
        }
        b[cart.y][cart.x] = cart.crashed ? 'X' : orientCarts[cart.dir];
    }
    return b.map(x => x.join('')).join("\n");
};

const tick = (carts0) => {
    const carts = carts0.map(x => ({...x})).sort((a,b) => (a.y - b.y) || (a.x - b.x));
    for (const cart of carts) {
        if (cart.crashed) {
            continue;
        }
        const p = addVector(cart, tickCarts[cart.dir]);
        const crashed = carts.filter(z => !z.crashed && eqPoints(z, p));
        Object.assign(cart, p);
        if (crashed.length) {
            cart.crashed = true;
            for (const c of crashed) {
                c.crashed = true;
            }
            continue;
        }

        const t = board[p.y][p.x];
        switch (true) {
            case t === '\\': {
                const m = {[Direction.East]: Direction.South, [Direction.North]: Direction.West, [Direction.West]: Direction.North, [Direction.South]: Direction.East};
                cart.dir = m[cart.dir];
                break;
            }
            case t === '/': {
                const m = {[Direction.East]: Direction.North, [Direction.North]: Direction.East, [Direction.West]: Direction.South, [Direction.South]: Direction.West};
                cart.dir = m[cart.dir];
                break;
            }
            case t === '+': {
                switch (true) {
                    case cart.turn == Turn.Left: {
                        const m = {[Direction.East]: Direction.North, [Direction.West]: Direction.South, [Direction.South]: Direction.East, [Direction.North]: Direction.West};
                        cart.dir = m[cart.dir];
                        break;
                    }
                    case cart.turn == Turn.Right: {
                        const m = {[Direction.East]: Direction.South, [Direction.West]: Direction.North, [Direction.South]: Direction.West, [Direction.North]: Direction.East};
                        cart.dir = m[cart.dir];
                        break;
                    }
                    case cart.turn == Turn.Straight: {
                        break;
                    }
                }
                cart.turn = (cart.turn + 1) % numTurns;
                break;
            }
        }
    }

    return carts;
};

let crashed = null;
let carts = carts0;
// p(print(carts));

while (true) {
    carts = tick(carts);

    if (!crashed) {
        crashed = carts.find(x => x.crashed);
        if (crashed) {
            // p(print(carts));
            p('Part 1', `${crashed.x},${crashed.y}`);
        }
    }

    const alive = carts.filter(x => !x.crashed);
    if (!alive.length) {
        break;
    } else if (alive.length === 1) {
        // p(print(carts));
        p('Part 2', `${alive[0].x},${alive[0].y}`);
        break;
    }
}
