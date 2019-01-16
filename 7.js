const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('7.txt', {encoding: 'utf-8'});
const spec0 = {txt: txt0, numWorkers: 5, taskDuration: 60};
const txt1 = `
Step C must be finished before step A can begin.
Step C must be finished before step F can begin.
Step A must be finished before step B can begin.
Step A must be finished before step D can begin.
Step B must be finished before step E can begin.
Step D must be finished before step E can begin.
Step F must be finished before step E can begin.
`;
const spec1 = {txt: txt1, numWorkers: 2, taskDuration: 1};
const {txt, numWorkers, taskDuration} = spec0;

const lines = txt.split("\n").filter(x => x).map(line => {
    const m = line.match(/^Step (?<lhs>\S+) must be finished before step (?<rhs>\S+) can begin\.$/);
    return ['lhs', 'rhs'].reduce((s,x) => ({...s, [x]: (m.groups[x])}), {});
});

const nodes = Object.keys(lines.reduce((s,x) => ({...s, [x.lhs]: true, [x.rhs]: true}), {}));
// p(`nodes`, nodes);

const receivers = {};
const senders = {};
for (const node of nodes) {
    receivers[node] = lines.filter(x => x.rhs === node).map(x => x.lhs);
    senders[node] = lines.filter(x => x.lhs === node).map(x => x.rhs);
}
// p('senders', senders);
// p('receivers', receivers);

const starts = Object.entries(receivers).filter(x => x[1].length === 0).map(x => x[0]);
const ends = Object.entries(senders).filter(x => x[1].length === 0).map(x => x[0]);
// p('starts', starts);
// p('ends', ends);

/* *** */

const product1 = [];
const done1 = x => product1.some(z => z === x);
let heads = starts;
while (heads.length > 0) {
    for (const head of heads.sort()) {
        if (receivers[head].every(done1)) {
            product1.push(head);
            heads = [].concat(heads).concat(senders[head]).filter(x => x !== head && !done1(x));
            heads = Array.from(new Set(heads));
            break;
        }
    }
}
p('Part 1', product1.join(''));

/* *** */

const product2 = [];
const done2 = x => product2.some(z => z === x);
const workers = new Array(numWorkers).fill(null).map(x => ({time: 0, node: null}));
const duration = node => (node.charCodeAt(0) - 'A'.charCodeAt(0)) + 1 + taskDuration;
let time = -1;

const stepTime = () => {
    const d = [];
    for (const w of workers) {
        w.time -= 1;
        if (w.time <= 0 && w.node && !done2(w.node)) {
            d.push(w);
        }
    }
    product2.push(...d.map(x => x.node).sort());
    for (const x of d) {
        x.node = null;
    }
    time += 1;
};

heads = starts;
loop:
while (heads.length > 0) {
    stepTime();

loop2:
    while (true) {
        for (const head of heads.sort()) {
            if (receivers[head].every(x => done2(x))) {
                const worker = workers.findIndex(x => x.time <= 0 && x.node === null);
                if (worker === -1) {
                    continue loop;
                }
                workers[worker] = {time: duration(head), node: head};

                heads = [].concat(heads).concat(senders[head]).filter(x => x !== head && !done2(x));
                heads = Array.from(new Set(heads));
                continue loop2;
            }
        }
        break;
    }
}

while (!workers.every(x => x.time <= 0)) {
    stepTime();
}

p('Part 2', time);
