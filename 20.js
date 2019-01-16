const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('20.txt', {encoding: 'utf-8'});
const txt1 = `^WNE$`; // 3
const txt2 = `^ENWWW(NEEE|SSE(EE|N))$`; // 10
const txt3 = `^ENNWSWW(NEWS|)SSSEEN(WNSE|)EE(SWEN|)NNN$`; // 18
const txt4 = `^ESSWWN(E|NNENN(EESS(WNSE|)SSS|WWWSSSSE(SW|NNNE)))$`; // 23
const txt5 = `^WSSEESWWWNW(S|NENNEEEENN(ESSSSW(NWSW|SSEN)|WSWWN(E|WWS(E|SS))))$`; // 31
const txt = txt0.split('');

/* *** */

const Cell = {
    Wall: '#',
    Room: '.',
    Door: 'D',
    You: 'X',
};
Object.freeze(Cell);

const Token = {
    Start: '^',
    End: '$',
    Or: '|',
    Head: '(',
    Tail: ')',
    South: 'S',
    North: 'N',
    West: 'W',
    East: 'E',
};
Object.freeze(Token);

const TokenEnd = {
    [Token.Start]: Token.End,
    [Token.Head]: Token.Tail,
};
Object.freeze(TokenEnd);

const Orientation = {
    Horizontal: 'Horizontal',
    Vertical: 'Vertical',
};
Object.freeze(Orientation);

const DoorSymbol = {
    [Orientation.Horizontal]: '-',
    [Orientation.Vertical]: '|',
};
Object.freeze(DoorSymbol);

const DoorOrientation = {
    [Token.North]: Orientation.Horizontal,
    [Token.South]: Orientation.Horizontal,
    [Token.West]: Orientation.Vertical,
    [Token.East]: Orientation.Vertical,
};
Object.freeze(DoorOrientation);

const Direction = {
    [Token.North]: {x: 0, y: -1},
    [Token.South]: {x: 0, y: 1},
    [Token.West]: {x: -1, y: 0},
    [Token.East]: {x: 1, y: 0},
};
Object.freeze(Direction);

/* *** */

const parse = (input, endToken) => {
    const result = [[]];
    let last = null;
    while (input.length > 0) {
        const c = input[0];
        input = input.slice(1);
        switch (c) {
            case Token.Tail:
            case Token.End:
                if (endToken !== c) {
                    throw new Error(`Invalid endToken: ${c}`);
                }
                return [result, input];
            case Token.Head:
            case Token.Start:
                const r = parse(input, TokenEnd[c])
                result[result.length - 1].push(r[0]);
                input = r[1];
                break;
            case Token.South:
            case Token.North:
            case Token.West:
            case Token.East:
                result[result.length - 1].push(c);
                break;
            case Token.Or:
                result.push([]);
                break;
            default:
                throw new Error(`Unknown token: ${c}`);
        }
        last = c;
    }
    return [result, []];
};

const tokenz = parse(txt);
const tokens = tokenz[0][0][0];

/* *** */

const addVector = (a, b) => ({x: a.x + b.x, y: a.y + b.y});
const eqPoints = (a, b) => a.x === b.x && a.y === b.y;

/* *** */

const board0 = [];

const start = {x: 0, y: 0, type: Cell.You, symbol: Cell.You};
board0.push(start);

const walk = (point0, input, len0) => {
    let point = point0;
    if (Array.isArray(input)) {
        let len = len0;
        for (const node of input) {
            const r = walk(point, node, len);
            point = r[0];
            len = r[1]
        }
        return [point0, len0];
    } else {
        point = addVector(point, Direction[input]);
        const door = {...point, type: Cell.Door, symbol: DoorSymbol[DoorOrientation[input]]};
        board0.push(door);
        point = addVector(point, Direction[input]);
        const room = {...point, type: Cell.Room, symbol: '.'};
        board0.push(room);
        return [point, len0+1];
    }
};
walk(start, tokens, 0);

const distinct = (b) => {
    const map = {};
    for (const z of b) {
        const k = `${z.x}x${z.y}`;
        if (map[k] && map[k].type !== z.type) {
            throw new Error(`Different: ${map[k]} ${z}`);
        }
        map[k] = z;
    }
    return Object.values(map);
};

const board = distinct(board0);

const xs = board.map(x => x.x);
const ys = board.map(x => x.y);
const minX = Math.min(...xs)-1;
const maxX = Math.max(...xs)+1;
const minY = Math.min(...ys)-1;
const maxY = Math.max(...ys)+1;
const width = maxX - minX + 1;
const height = maxY - minY + 1;

// p(`Board: ${minX}x${minY} => ${maxX}x${maxY} ${width}:${height}`);

/* *** */

const boardN = z => new Array(height).fill(null).map(_ => new Array(width).fill(null).map(z));
const boardG = (b, p) => (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) ? b[p.y-minY][p.x-minX] : {...p, type: Cell.Wall};
const boardS = (b, p, v) => b[p.y-minY][p.x-minX] = v;

const boardMap = boardN(_ => null);

for (const z of board) {
    boardS(boardMap, z, z);
}

/* *** */

const print = (points0) => {
    const points = points0 || [];
    const plane = boardN(_ => '#');
    for (const z of board) {
        const b = points.some(zz => eqPoints(z, zz));
        const c = b ? '%' : z.symbol;
        boardS(plane, z, c);
    }
    return plane.map((line,y) => line.join('')).join("\n");
};

// p(print());

const around = [{x: 0, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}];

const shortest = (head, tails) => {
    const queue = [head];
    const prev = boardN(_ => null);
    const visited = boardN(_ => false);

    while (queue.length > 0) {
        const node = queue.shift();
        boardS(visited, node, true);

        const notVisited = z => !boardG(visited, z);
        const notQueued = z => !queue.some(zz => eqPoints(z, zz));
        const isDoor = z => boardG(boardMap, z) && boardG(boardMap, z).type === Cell.Door;
        const isRoom = z => boardG(boardMap, z) && boardG(boardMap, z).type === Cell.Room;
        
        const ns1 = around.map(z => [addVector(node, z), z]).filter(z => isDoor(z[0]));
        const ns = ns1.map(z => addVector(z[0], z[1])).filter(z => isRoom(z) && notVisited(z) && notQueued(z));
        queue.push(...ns);
        ns.forEach(z => boardS(prev, z, node));
    };

    const resolve = tail => {
        const path = [];
        for (at = tail; at !== null; at = boardG(prev, at)) {
            path.push(at);
        }
        path.reverse();
        return path.length && eqPoints(path[0], head) ? path : [];
    };

    return tails.map(x => resolve(x));
};

const rooms = board.filter(z => z.type === Cell.Room);

const paths = shortest(start, rooms);
// paths.forEach(z => p(print(z)));

const lens = paths.map(z => (z.length-1))
p('Part 1', Math.max(...lens));

const lens2 = paths.filter(z => (z.length-1) >= 1000);
p('Part 2', lens2.length);
