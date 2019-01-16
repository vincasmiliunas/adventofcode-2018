const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt1 = Fs.readFileSync('19.txt', {encoding: 'utf-8'});
const txt2 = `
#ip 0
seti 5 0 1
seti 6 0 2
addi 0 1 0
addr 1 2 3
setr 1 0 0
seti 8 0 4
seti 9 0 5
`;

const txt = txt1;
const lines = txt.split("\n").filter(x => x);

/* *** */

const Op = {
    addr: 'addr',
    addi: 'addi',
    mulr: 'mulr',
    muli: 'muli',
    banr: 'banr',
    bani: 'bani',
    borr: 'borr',
    bori: 'bori',
    setr: 'setr',
    seti: 'seti',
    gtir: 'gtir',
    gtri: 'gtri',
    gtrr: 'gtrr',
    eqir: 'eqir',
    eqri: 'eqri',
    eqrr: 'eqrr',
};
Object.freeze(Op);
const numOps = Object.keys(Op).length;

/* *** */

const execMap = {
    [Op.addr]: (regs, a, b) => regs[a] + regs[b],
    [Op.addi]: (regs, a, b) => regs[a] + b,
    [Op.mulr]: (regs, a, b) => regs[a] * regs[b],
    [Op.muli]: (regs, a, b) => regs[a] * b,
    [Op.banr]: (regs, a, b) => regs[a] & regs[b],
    [Op.bani]: (regs, a, b) => regs[a] & b,
    [Op.borr]: (regs, a, b) => regs[a] | regs[b],
    [Op.bori]: (regs, a, b) => regs[a] | b,
    [Op.setr]: (regs, a, b) => regs[a],
    [Op.seti]: (regs, a, b) => a,
    [Op.gtir]: (regs, a, b) => a > regs[b] ? 1 : 0,
    [Op.gtri]: (regs, a, b) => regs[a] > b ? 1 : 0,
    [Op.gtrr]: (regs, a, b) => regs[a] > regs[b] ? 1 : 0,
    [Op.eqir]: (regs, a, b) => a === regs[b] ? 1 : 0,
    [Op.eqri]: (regs, a, b) => regs[a] === b ? 1 : 0,
    [Op.eqrr]: (regs, a, b) => regs[a] === regs[b] ? 1 : 0,
};


/* *** */

const ipIndex = lines[0].match(/^#ip (\d+)$/).reduce((s,x,i) => i === 1 ? parseInt(x) : s, null);
const ops = lines.slice(1).map(line => {
    const m = line.match(/^([a-z]{4}) (\d+) (\d+) (\d+)$/)
    const [a, b, c] = Uint32Array.from(m.slice(2).map(x => parseInt(x)));
    const exec = execMap[m[1]];
    return {name: m[1], line, exec, a, b, c};
});

const codeMap = {
    [Op.addr]: (a, b, c) => `regs[${c}]= regs[${a}] + regs[${b}];`,
    [Op.addi]: (a, b, c) => `regs[${c}]= regs[${a}] + ${b};`,
    [Op.mulr]: (a, b, c) => `regs[${c}]= regs[${a}] * regs[${b}];`,
    [Op.muli]: (a, b, c) => `regs[${c}]= regs[${a}] * ${b};`,
    [Op.banr]: (a, b, c) => `regs[${c}]= regs[${a}] & regs[${b}];`,
    [Op.bani]: (a, b, c) => `regs[${c}]= regs[${a}] & ${b};`,
    [Op.borr]: (a, b, c) => `regs[${c}]= regs[${a}] | regs[${b}];`,
    [Op.bori]: (a, b, c) => `regs[${c}]= regs[${a}] | ${b};`,
    [Op.setr]: (a, b, c) => `regs[${c}]= regs[${a}];`,
    [Op.seti]: (a, b, c) => `regs[${c}]= ${a};`,
    [Op.gtir]: (a, b, c) => `regs[${c}]= ${a} > regs[${b}] ? 1 : 0;`,
    [Op.gtri]: (a, b, c) => `regs[${c}]= regs[${a}] > ${b} ? 1 : 0;`,
    [Op.gtrr]: (a, b, c) => `regs[${c}]= regs[${a}] > regs[${b}] ? 1 : 0;`,
    [Op.eqir]: (a, b, c) => `regs[${c}]= ${a} == regs[${b}] ? 1 : 0;`,
    [Op.eqri]: (a, b, c) => `regs[${c}]= regs[${a}] == ${b} ? 1 : 0;`,
    [Op.eqrr]: (a, b, c) => `regs[${c}]= regs[${a}] == regs[${b}] ? 1 : 0;`,
};

const re = new RegExp(`regs\\[${ipIndex}\\]([^=])`, 'g');
const ops2 = ops.map((op,i) => codeMap[op.name](op.a, op.b, op.c).replace(re, (_, x) => `${i}${x}`).replace(/]=/, '] ='));
const ret = [];
const pad = [0,1,2,3,4].map(z => '  '.repeat(z));
ret.push(`${pad[0]}const regs = [0,0,0,0,0,0];`);
ret.push(`${pad[0]}let c = 0;`);
ret.push(`${pad[0]}loop:`);
ret.push(`${pad[0]}while (true) {`);
ret.push(`${pad[1]}switch (regs[${ipIndex}]) {`);
ops2.forEach((op, i) => {
    ret.push(`${pad[1]}case ${i}:`);
    const ree = new RegExp(`regs\\[${ipIndex}\\] = `);
    if (op.match(ree)) {
        const r = op.replace(ree, (x) => `${x}1 + `);
        ret.push(`${pad[2]}${r}`);
    } else {
        ret.push(`${pad[2]}${op}`);
        ret.push(`${pad[2]}regs[${ipIndex}] = ${i+1};`);
    }
    ret.push(`${pad[2]}c += 1;`);
    ret.push(`${pad[2]}break;`);
});
ret.push(`${pad[1]}default:`);
ret.push(`${pad[2]}if (regs[${ipIndex}] < ${ops.length}) { throw new Error(\`MISSING INSTRUCTION AT \${regs[${ipIndex}]}\`); }`);
ret.push(`${pad[2]}break loop;`);
ret.push(`${pad[1]}}`);
ret.push(`${pad[0]}}`);
ret.push(`${pad[0]}console.log('regs', regs);`);

const code = ret.join("\n");
// Fs.writeFileSync('19gen.js', code);
p(code);

/* *** */

// We figure out that the generated code is factoring numbers

const factor = (input) => {
    const ret = [1];
    const half = (input / 2)|0;
    let [i, j] = input % 2 === 0 ? [2, 1] : [3, 2];
    for (; i <= half; i += j) {
        if (input % i === 0) {
            ret.push(i);
        }
    }
    ret.push(input);
    return ret;
}

const product = z => factor(z).reduce((s,x) => s+x, 0);

p('Part 1', product(882));
p('Part 2', product(882+10550400));
