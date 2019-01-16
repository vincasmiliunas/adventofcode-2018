const Fs = require('fs');
const p = (...x) => console.log(...x);

const input0 = 607331;
const input = input0;

const recipe1 = {
    score: 3,
    prev: null,
    next: null,
};
const recipe2 = {
    score: 7,
    prev: recipe1,
    next: recipe1,
};
recipe1.prev = recipe2;
recipe1.next = recipe2;

let head = recipe1, tail = recipe2, numRecipes = 2;
let foundHead = null, foundTail = null, foundIndex = 0;

const elfs = [recipe1, recipe2];

const combine = (a, b) => {
    return `${a+b}`.split('').map(x => parseInt(x));
};

const print = () => {
    let root = head;
    const ret = [];
    while (true) {
        const i = elfs.findIndex(z => z === root);
        const m = {[-1]: z => `${z}`, 0: z => `(${z})`, 1: z => `[${z}]`}
        const r = m[i](root.score);
        ret.push(r);
        root = root.next;
        if (root === head) break;
    }
    return ret.join(' ');
};

const add = () => {
    const recipes = combine(elfs[0].score, elfs[1].score);
    for (const x of recipes) {
        const node = {
            score: x,
            prev: tail,
            next: head,
        };
        head.prev = node;
        tail.next = node;
        tail = node;
        numRecipes += 1;

        if (!foundHead && x === looking[0]) {
            foundHead = foundTail = node;
            foundIndex = 1;
        } else if (foundHead && foundIndex !== looking.length && x !== looking[foundIndex]) {
            foundHead = foundTail = null;
            foundIndex = 0;
        } else if (foundHead && foundIndex !== looking.length && x === looking[foundIndex]) {
            foundTail = node;
            foundIndex += 1;
        }
    }
};

const pick = () => {
    for (const j in elfs) {
        let elf = elfs[j];
        const score = elf.score;
        for (let i = 0; i < 1 + score; i += 1) {
            elf = elf.next;
        }
        elfs[j] = elf;
    }
};

const tick = () => {
    add();
    pick();
};

const take = (skip, n) => {
    let root = head;
    for (let i = 0; i < skip; i += 1) {
        root = root.next;
    }
    const ret = [];
    for (let i = 0; i < n; i += 1) {
        ret.push(root.score);
        root = root.next;
    }
    return ret;
};

const looking = input.toString().split('').map(x => parseInt(x));

// p(print());

while (numRecipes < input + 10) {
    tick();
}
p('Part 1', take(input, 10).join(''));

while (foundIndex !== looking.length) {
    tick();
}

const countRecipes = (root) => {
    let ret = 0;
    while (true) {
        if (root === head) {
            return ret;
        }
        root = root.prev;
        ret += 1;
    }
};
p('Part 2', countRecipes(foundHead));
