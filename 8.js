const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('8.txt', {encoding: 'utf-8'});
const txt1 = `
2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2
A----------------------------------
    B----------- C-----------
                     D-----
`;
const txt = txt0;

const lines = txt.split("\n").filter(x => x.length);

let header0 = lines[0];
let letter = 'A';
const fetch = () => {
    if (header0.length === 0) {
        return null;
    }
    const m = header0.match(/^(?<s>\s*)(?<n>\d+) (?<m>\d+)(\s|$)/);
    if (!m) {
        throw new Error(`No match: ${header0}`);
    }
    header0 = header0.slice(m.groups.s.length + m.groups.n.length + 1 + m.groups.m.length);
    const b = {letter, nChild: parseInt(m.groups.n), nMeta: parseInt(m.groups.m), children: [], metas: []};
    letter = String.fromCharCode(letter.charCodeAt(0) + 1);
    for (let i = 0; i < b.nChild; i += 1) {
        const r = fetch();
        b.children.push(r);
    }
    for (let i = 0; i < b.nMeta; i += 1) {
        const m = header0.match(/^(?<s>\s*)(?<m>\d+)(\s|$)/);
        header0 = header0.slice(m.groups.s.length + m.groups.m.length)
        const mm = parseInt(m.groups.m);
        b.metas.push(mm);
    }
    return b;
};

const tree = fetch();
// p(tree);

const product1 = (root) => {
    const a = root.metas.reduce((s,x) => s+x, 0);
    const b = root.children.reduce((s,x) => s+product1(x), 0);
    return a + b;
};
p('Part 1', product1(tree));

const product2 = (root) => {
    if (root.children.length > 0) {
        return root.metas.reduce((s,meta) => s + (meta > root.children.length ? 0 : product2(root.children[meta - 1])), 0);
    } else {
        return root.metas.reduce((s,x) => s+x, 0);
    }
};
p('Part 2', product2(tree));
