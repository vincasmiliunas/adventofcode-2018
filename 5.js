const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('5.txt', {encoding: 'utf-8'}).trim();
const txt1 = 'dabAcCaCBAcCcaDA';
const txt = txt0;

const range = new Array(26).fill(0).map((x,i) => i);
const alpha = chars => range.map(x => `${String.fromCharCode(chars[0].charCodeAt(0) + x)}${String.fromCharCode(chars[1].charCodeAt(0) + x)}`);
const re = new RegExp(`(${alpha('aA').concat(alpha('Aa')).join('|')})`, 'g');

const product = root0 => {
    let root = root0;
    while (true) {
        const tmp = root.replace(re, '');
        if (tmp.length === root.length) {
            return root;
        }
        root = tmp;
    }
};

const root = product(txt);
p('Part 1', root.length);

const polymers = alpha('aA').map(x => {
    const re = new RegExp(`[${x}]`, 'g');
    return [x, product(txt.replace(re, ''))];
}).sort((a,b) => a[1].length - b[1].length);

p('Part 2', polymers[0][1].length);
