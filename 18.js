const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt1 = Fs.readFileSync('18.txt', {encoding: 'utf-8'});
const txt2 = `
.#.#...|#.
.....#|##|
.|..|...#.
..|#.....#
#.#|||#|#|
...#.||...
.|....|...
||...#|.#|
|.||||..|.
...#.|..|.
`;
const txt = txt1;

/* *** */

const Cell = {
    Open: '.',
    Tree: '|',
    Lumber: '#',
};
Object.freeze(Cell);

/* *** */

const board0 = txt.split("\n").filter(x => x).map(x => x.split(''));

const width = board0[0].length;
const height = board0.length;

const boardN = _ => new Array(height).fill(null).map(_ => new Array(width).fill(Cell.Open));
const boardG = (b, p) => (p.x >= 0 && p.x < width && p.y >= 0 && p.y < height) ? b[p.y][p.x] : '.';
const boardS = (b, p, v) => b[p.y][p.x] = v;

/* *** */

const addVector = (a, b) => ({x: a.x + b.x, y: a.y + b.y});
const eqPoints = (a, b) => a.x === b.x && a.y === b.y;

const around = [
    {x: -1, y: -1},
    {x: 0, y: -1},
    {x: 1, y: -1},
    {x: -1, y: 0},
    {x: 1, y: 0},
    {x: -1, y: 1},
    {x: 0, y: 1},
    {x: 1, y: 1},
];

/* *** */

const tick = (input, output) => {
    for (let y = 0; y < width; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const point = {x, y};
            const adjacent = around.map(z => addVector(point, z)).map(z => boardG(input, z));
            const counts = [Cell.Tree, Cell.Lumber].reduce((s, cell) => {
                const count = adjacent.reduce((ss,xx) => ss + (xx === cell ? 1 : 0), 0);
                return ({...s, [cell]: count});
            }, {});
            const acre = boardG(input, point);

            switch (acre) {
                case Cell.Open:
                    if (counts[Cell.Tree] >= 3) {
                        boardS(output, point, Cell.Tree);
                    } else {
                        boardS(output, point, Cell.Open);
                    }
                    break;
                case Cell.Tree:
                    if (counts[Cell.Lumber] >= 3) {
                        boardS(output, point, Cell.Lumber);
                    } else {
                        boardS(output, point, Cell.Tree);
                    }
                    break;
                case Cell.Lumber:
                    if (counts[Cell.Lumber] >= 1 && counts[Cell.Tree] >= 1) {
                        boardS(output, point, Cell.Lumber);
                    } else {
                        boardS(output, point, Cell.Open);
                    }
                    break;
                default:
                    throw new Error(`Invalid cell: ${acre}`);
            }
        }
    }
};

const print = (board) => {
    return board.map(line => line.join('')).join("\n");
};

const sum = (b,z) => b.reduce((s,line) => s + line.reduce((ss,xx) => ss + (xx === z ? 1 : 0), 0), 0);

const play = (target) => {
    const prints = {};
    let target2 = null;
    let board = board0;
    let round = 0;
    // p(print(board));

    while (target !== round && target2 !== round) {
        round += 1;
        const board2 = boardN();
        tick(board, board2);
        board = board2;

        const printed = print(board);
        if (target2 === null && prints[printed]) {
            // p(`LOOP: ${prints[printed]} => ${round}`);
            const interval = round - prints[printed];
            const left = (target - prints[printed]) % interval;
            target2 = round + left;
            // p(`left:${left} target2:${target2}`);
        }
        prints[printed] = round;
    }

    const trees = sum(board, Cell.Tree);
    const lumbers = sum(board, Cell.Lumber);
    return trees*lumbers;
};

p('Part 1', play(10));
p('Part 2', play(1000000000));
