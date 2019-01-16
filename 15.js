const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt1 = Fs.readFileSync('15.txt', {encoding: 'utf-8'});
const txt2 = `
#########
#G..G..G#
#.......#
#.......#
#G..E..G#
#.......#
#.......#
#G..G..G#
#########
`;
const txt3 = `
#######
#E..G.#
#...#.#
#.G.#G#
#######
`;
const txt4 = `
######
#GG.E#
######
`;
// 37 * 982 = 36334
const txt5 = `
#######
#G..#E#
#E#E.E#
#G.##.#
#...#E#
#...E.#
#######
`;
//46 * 859 = 39514
const txt7 = `
#######
#E..EG#
#.#G.E#
#E.##E#
#G..#.#
#..E#.#
#######
`;
// 35 * 793 = 27755
const txt8 = `
#######
#E.G#.#
#.#G..#
#G.#.G#
#G..#.#
#...E.#
#######
`;
// 54 * 536 = 28944
const txt9 = `
#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######
`;
// 20 * 937 = 18740
const txt10 = `
#########
#G......#
#.E.#...#
#..##..G#
#...##..#
#...#...#
#.G...G.#
#.....G.#
#########
`;
const txt6 = `
#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######
`;
const txt = txt1;

const board = txt.split("\n").filter(x => x).map(x => x.split(''));

/* *** */

const dHealth = 200;

const Unit = {
    Elf: 'E',
    Goblin: 'G',
};
Object.freeze(Unit);

const UnitEnemy = {
    [Unit.Elf]: Unit.Goblin,
    [Unit.Goblin]: Unit.Elf,
};
Object.freeze(UnitEnemy);

const UnitAttack = {
    [Unit.Elf]: 3,
    [Unit.Goblin]: 3,
};

/* *** */

let unitId = 0;
const units0 = board.map((line,y) => {
    return line.map((c,x) => {
        const m = {'E': Unit.Elf, 'G': Unit.Goblin};
        const type = m[c];
        return type ? {x, y, type, id: ++unitId, health: dHealth} : null;
    }).filter(x => x);
}).reduce((s,x) => s.concat(x), []);
Object.freeze(units0);
// p(units0);

let units = null;

for (const unit of units0) {
    board[unit.y][unit.x] = '.';
}

const print = (points0) => {
    const points = points0 || [];
    return board.map((line,y) => line.map((c,x) => {
        const point = points.find(z => z.x === x && z.y === y);
        if (point) return '%';
        const unit = units.find(z => z.x === x && z.y === y && z.health > 0);
        return unit ? unit.type : c;
    }).join('')).join("\n");
};

/* *** */

const mdistance = (a, b) => Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
const addVector = (a, b) => ({x: a.x + b.x, y: a.y + b.y});
const eqPoints = (a, b) => a.x === b.x && a.y === b.y;
const readingOrder = (a, b) => (a.y - b.y) || (a.x - b.x);

/* *** */

const around = [{x: 0, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}];

const shortest = (head, tail) => {
    const queue = [head];
    const boardN = z => board.map(line => line.map(_ => z));
    const visited = boardN(false);
    const prev = boardN(null);
    const unitz = boardN(false);
    units.filter(z => z.health > 0).forEach(z => unitz[z.y][z.x] = true);

    while (queue.length > 0) {
        const node = queue.shift();
        visited[node.y][node.x] = true;

        const f = z => board[z.y][z.x] === '.' && !visited[z.y][z.x] && !unitz[z.y][z.x] && !queue.some(zz => eqPoints(z, zz));
        const ns = around.map(y => addVector(node, y)).filter(f);
        queue.push(...ns);
        ns.forEach(z => prev[z.y][z.x] = node);
    };

    const path = [];
    for (at = tail; at !== null; at = prev[at.y][at.x]) {
        path.push(at);
    }
    path.reverse();
    return path.length && eqPoints(path[0], head) ? path : [];
};

const tick = () => {
    units.sort(readingOrder);
    for (const unit of units) {
        if (unit.health <= 0) {
            continue;
        }

        const attack = () => {
            const enemies = around.map(z => addVector(unit, z)).map(z => units.find(zz => zz.type === UnitEnemy[unit.type] && zz.health > 0 && eqPoints(z, zz))).filter(x => x);
            enemies.sort((a,b) => (a.health - b.health) || readingOrder(a, b));
            if (enemies.length > 0) {
                enemies[0].health -= UnitAttack[unit.type];
                return true;
            }
            return false;
        };

        if (attack()) {
            continue;
        }

        const enemies = units.filter(x => x.health > 0 && x.type === UnitEnemy[unit.type]);
        const points1 = enemies.reduce((s,x) => s.concat(around.map(y => addVector(x, y))), []);
        const unitz = units.filter(zz => zz.health > 0);
        const points = points1.filter(z => board[z.y][z.x] === '.' && !unitz.some(zz => eqPoints(z, zz)));

        const targets = points.map(z => shortest(unit, z)).filter(x => x.length).sort((a,b) => (a.length - b.length) || readingOrder(a[1], b[1]));
        if (targets.length > 0) {
            Object.assign(unit, targets[0][1])
        }

        attack();
    }
};

const partOne = () => {
    units = units0.map(x => ({...x}));
    let round = -1;
    // p(print());

    while (true) {
        round += 1;
        // p(`round:${round}`);
        tick();
        // p(print());

        const elfs = units.filter(x => x.health > 0 && x.type === Unit.Elf);
        const goblins = units.filter(x => x.health > 0 && x.type === Unit.Goblin);
        const [winners, name] = (elfs.length === 0) ? [goblins, 'Goblins'] : (goblins.length === 0) ? [elfs, 'Elfs'] : [null, null];
        if (winners) {
            const health = winners.reduce((s,x) => s + x.health, 0);
            p('Part 1', round*health);
            break;
        }
    }
};

partOne();

const partTwo = () => {
    const target = units0.filter(x => x.health > 0 && x.type === Unit.Elf);
    UnitAttack[Unit.Elf] = 13;

    while (true) {
        units = units0.map(x => ({...x}));
        UnitAttack[Unit.Elf] += 1;
        p('ElfAttack', UnitAttack[Unit.Elf]);
        let round = -1;

        while (true) {
            round += 1;
            // p(`round:${round}`);
            tick();
            // p(print());

            const elfs = units.filter(x => x.health > 0 && x.type === Unit.Elf);
            const goblins = units.filter(x => x.health > 0 && x.type === Unit.Goblin);
            if (goblins.length === 0 && elfs.length === target.length) {
                const health = elfs.reduce((s,x) => s + x.health, 0);
                p('Part 2', round*health);
                return;
            } else if (goblins.length === 0 || elfs.length === 0) {
                break;
            }
        }
    }
    
};

partTwo();
