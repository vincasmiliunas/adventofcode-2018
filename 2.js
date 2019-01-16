const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt = Fs.readFileSync('2.txt', {encoding: 'utf-8'});
// const txt = "abcdef\nbababc\nabbcde\nabcccd\naabcdd\nabcdee\nababab";
const lines = txt.split("\n").map(x => x.trim()).filter(x => x);

let exactly2 = 0, exactly3 = 0;

for (const line of lines) {
    const letters = {};
    for (letter of line.split('')) {
        letters[letter] = (letters[letter]||0)+1;
    }
    const counts = Object.values(letters);
    exactly2 += counts.filter(x => x === 2).length ? 1 : 0;
    exactly3 += counts.filter(x => x === 3).length ? 1 : 0;
}

const checksum = exactly2*exactly3;
p('Part 1', `${checksum}`);

const diff = (a, b) => {
    let r = 0;
    for (let i = 0; i < a.length; i += 1) {
        r += a[i] === b[i] ? 0 : 1;
    }
    return r;
};

const diffs = [];

for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
        const d = diff(lines[i], lines[j]);
        diffs.push([d,i,j]);
    }
}

diffs.sort((a,b) => a[0] - b[0]);

const lhs = lines[diffs[0][1]];
const rhs = lines[diffs[0][2]];

const ret = [];
for (let i = 0; i < lhs.length; i += 1) {
    ret.push(lhs[i] === rhs[i] ? lhs[i] : '');
}
p('Part 2', ret.join(''));
