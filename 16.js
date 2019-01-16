const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt1 = Fs.readFileSync('16.txt', {encoding: 'utf-8'});
const [txt1a, txt1b] = txt1.split("\n\n\n");

const txt2 = `
Before: [3, 2, 1, 1]
9 2 1 2
After:  [3, 2, 2, 1]
`;

const parseExamples = (input) => {
    const ret = [];
    const re = /Before: \[(\d+), (\d+), (\d+), (\d+)\]\s(\d+) (\d+) (\d+) (\d+)\sAfter:  \[(\d+), (\d+), (\d+), (\d+)\]/g;
    let m;
    while (m = re.exec(input)) {
        const before = m.slice(1, 1+4).map(x => parseInt(x));
        const op = m.slice(5, 5+4).map(x => parseInt(x));
        const after = m.slice(9, 9+4).map(x => parseInt(x));
        const r = {before, op, after};
        ret.push(r);
    }
    return ret;
};

const examples = parseExamples(txt1a);

const program = ((input) => {
    const ret = [];
    const re = /^(\d+) (\d+) (\d+) (\d+)$/;
    for (const line of input.split("\n").filter(x => x)) {
        const m = line.match(re);
        const op = m.slice(1, 1+4).map(x => parseInt(x));
        ret.push(op);
    }
    return ret;
})(txt1b);

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

const exec = (op, regs, a, b) => {
    const f = execMap[op];
    if (f) {
        return f(regs, a, b);
    } else {
        throw new Error(`Invalid op ${op}`);
    }
};

const identifyEx = (input) => {
    return identify(input.before, input.after, ...input.op.slice(1));
};

const identify = (input, output, a, b, c) => {
    return Object.values(Op).filter(op => exec(op, input, a, b) === output[c]);
};

const part1 = examples.map(x => identifyEx(x)).filter(z => z.length >= 3).length;
p('Part 1', part1);

/* *** */

const grouped = examples.reduce((s,x) => {
    if (s[x.op[0]]) {
        s[x.op[0]].push(x);
    } else {
        s[x.op[0]] = [x];
    }
    return s;
}, {});

// p(Object.values(grouped).map(x => x.length));

const byOp = y => {
    return Object.values(Op).reduce((s,op) => ({...s, [op]: y.every(z => z.indexOf(op) !== -1)}), {});
};

const countTrue = y => Object.values(y).filter(x => x).length;

const identified = Object.entries(grouped).reduce((s,x) => ({...s, [x[0]]: byOp(x[1].map(z => identifyEx(z)))}), {});

const Nr2Op = {};
while (Object.keys(Nr2Op).length < numOps) {
    const zs = Object.entries(identified).filter(x => countTrue(x[1]) === 1);
    // p('zs#', zs.length);
    if (zs.length === 0) {
        break;
    }
    for (const z of zs) {
        const opnr = z[0];
        const op = Object.entries(z[1]).find(q => q[1])[0];
        // console.log(`${opnr} => ${op}`);
        Nr2Op[opnr] = op;
        for (let i = 0; i < numOps; i += 1) {
            identified[i][op] = false;
        }
    }
}

// p(Nr2Op);

const regs = [0, 0, 0, 0];

for (const instr of program) {
    const [a, b, c] = instr.slice(1);
    regs[c] = exec(Nr2Op[instr[0]], regs, a, b);
}

// p(regs);
p('Part 2', regs[0]);
