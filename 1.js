const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt = Fs.readFileSync('1.txt', {encoding: 'utf-8'});
const lines = txt.split("\n").filter(x => x).map(x => parseInt(x, 10));

const part1 = lines.reduce((s,x) => s + x, 0);
p('Part 1', part1);

const state = {sum: 0, sums: []};

loop:
while (true) {
    for (const line of lines) {
        state.sums.push(state.sum);
        state.sum += line;
        if (state.sums.indexOf(state.sum) !== -1) {
            break loop;
        }
    }
}
p('Part 2', state.sum);
