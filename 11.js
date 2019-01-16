const Fs = require('fs');
const assert = require('assert');
const p = (...x) => console.log(...x);

const serial0 = 1133;

const minX = 1;
const maxX = 300;
const minY = 1;
const maxY = 300;
const width = maxX - minX + 1, height = maxX - minX + 1;

const boardN = (v) => new Array(height).fill(null).map(_ => new Array(width).fill(null).map(v));
const boardS = (b, p, v) => b[p.y - minY][p.x - minX] = v;
const boardG = (b, p) => b[p.y - minY][p.x - minX];

const makeLevel = (serial, {x, y}) => {
    const rack = x+10;
    const r1 = (serial + rack * y) * rack;
    const r2 = (r1 / 100)|0;
    const r3 = r2 % 10;
    return r3 - 5;
};

const makeBoard = (serial) => {
    const board = boardN(_ => null);
    for (let y = 1; y <= width; y += 1) {
        for (let x = 1; x <= height; x += 1) {
            const point = {x, y};
            const cell = {...point, level: makeLevel(serial, point)};
            boardS(board, point, cell);
        }
    }
    return board;
};

/* *** */

assert.equal(makeLevel(8, {x: 3, y: 5}), 4);
assert.equal(makeLevel(57, {x: 122, y: 79}), -5);
assert.equal(makeLevel(39, {x: 217, y: 196}), 0);
assert.equal(makeLevel(71, {x: 101, y: 153}), 4);
assert.equal(makeLevel(18, {x: 33, y: 45}), 4);
assert.equal(makeLevel(42, {x: 21, y: 61}), 4);

/* *** */

const board = makeBoard(serial0);

const calcPower = (b, p, s) => {
    let power = 0;
    for (let y = p.y; y <= p.y + s.y - 1; y += 1) {
        for (let x = p.x; x <= p.x + s.x - 1; x += 1) {
            const point = {x, y};
            power += boardG(b, point).level;
        }
    }
    return power;
};

const result = [];
const size3x3 = {x: 3, y: 3};
for (let y = 1; y <= height-size3x3.y+1; y += 1) {
    for (let x = 1; x <= width-size3x3.x+1; x += 1) {
        const point = {x, y};
        const power = calcPower(board, point, size3x3);
        result.push({...point, power});
    }
}

const largest = result.sort((a,b) => b.power - a.power);
p('Part 1', `${largest[0].x},${largest[0].y}`);

/* *** */

const table = boardN(_ => 0);

for (let y = 1; y <= height; y += 1) {
    for (let x = 1; x <= width; x += 1) {
        const a = boardG(board, {x, y}).level;
        const b = x > 1 ? boardG(table, {x: x - 1, y}) : 0;
        const c = y > 1 ? boardG(table, {x, y: y - 1}) : 0;
        const d = (x > 1 && y > 1) ? boardG(table, {x: x - 1, y: y - 1}) : 0;
        const sum = a + b + c - d;
        boardS(table, {x, y}, sum);
    }
}

const state = {power: 0, x: 0, y: 0, size: 0};
for (let size = 1; size <= width; size += 1) {
    for (let y = 1; y <= height-size+1; y += 1) {
        for (let x = 1; x <= width-size+1; x += 1) {
            const a = boardG(table, {x: x + size - 1, y: y + size - 1});
            const b = x > 1 ? boardG(table, {x: x - 1, y: y + size - 1}) : 0;
            const c = y > 1 ? boardG(table, {x: x + size - 1, y: y - 1}) : 0;
            const d = (x > 1 && y > 1) ? boardG(table, {x: x - 1, y: y - 1}) : 0;
            const power = a - b - c + d;
            if (power > state.power) {
                Object.assign(state, {power, x, y, size})
            }
        }
    }
}
p('Part 2', `${state.x},${state.y},${state.size}`);
