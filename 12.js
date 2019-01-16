const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('12.txt', {encoding: 'utf-8'});
const txt1 = `
initial state: #..#.#..##......###...###

...## => #
..#.. => #
.#... => #
.#.#. => #
.#.## => #
.##.. => #
.#### => #
#.#.# => #
#.### => #
##.#. => #
##.## => #
###.. => #
###.# => #
####. => #
`;
const txt = txt0;

const pLength = 5;

const lines = txt.split("\n").filter(x => x.length > 0);
const m = lines[0].match(/^initial state: (?<v>[#\.]+)$/);
const line0 = m.groups.v.split('');
const state = {array: new Uint8Array(line0.length).fill(0).map((_,i) => line0[i] === '#' ? 1 : 0), offset: 0};

const rules = lines.slice(1).map(line => {
    const m = line.match(/^(?<lhs>[#\.]{5}) => (?<rhs>[#\.])$/);
    const pattern = new Uint8Array(m.groups.lhs.length).fill(0).map((_,i) => m.groups.lhs[i] === '#' ? 1 : 0);
    const result = m.groups.rhs === '#' ? 1 : 0;
    return {pattern, result};
});

// p(state);
// p(rules);

const progress = (state) => {
    const result = new Uint8Array(state.array.length + pLength-1);
    let j = 0, left = 0, right = 0;

    const f = (pattern) => {
        const rule = rules.find(x => x.pattern.every((y,i) => y === pattern[i]));
        const r = rule ? rule.result : 0;
        result[j] = r;
        if (!left && r) left = j;
        if (r) right = j;
        j += 1;
    };

    const arr1 = new Uint8Array(pLength-1+pLength-1).fill(0);
    arr1.set(state.array.slice(0, pLength-1), pLength-1);
    for (let i = 0; i < pLength-1; i += 1) {
        const arr = arr1.slice(i, i+pLength);
        f(arr);
    }
    for (let i = 0; i <= state.array.length-pLength; i += 1) {
        const arr = state.array.slice(i, i+pLength);
        f(arr);
    }
    const arr2 = new Uint8Array(pLength-1+pLength-1).fill(0);
    arr2.set(state.array.slice(state.array.length-pLength+1), 0);
    for (let i = 0; i < pLength-1; i += 1) {
        const arr = arr2.slice(i, i+pLength);
        f(arr);
    }

    return {array: result.slice(left, right+1), offset: state.offset - 2 + left};
};

const print = (input) => {
    return input.reduce((s,x) => s + (x ? '#' : '.'), '');
};

const calcSum = (state) => {
    return state.array.reduce((s,x,i) => s + (x ? i + state.offset : 0), 0);
};

const play = (target) => {
    let state1 = state;
    let state1S = print(state1.array);
    let gen = 0;
    while (true) {
        const state2 = progress(state1);
        const state2S = print(state2.array);
        gen += 1;
        if (state2S === state1S || gen === target) {
            const sum1 = calcSum(state1);
            const sum2 = calcSum(state2);
            return sum2 + (target - gen) * (sum2 - sum1);
        }
        state1 = state2;
        state1S = state2S;
    }
}

p('Part 1', play(20));
p('Part 2', play(50000000000));
