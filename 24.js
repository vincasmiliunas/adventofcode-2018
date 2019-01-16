const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('24.txt', {encoding: 'utf-8'});
const txt1 = `
Immune System:
17 units each with 5390 hit points (weak to radiation, bludgeoning) with an attack that does 4507 fire damage at initiative 2
989 units each with 1274 hit points (immune to fire; weak to bludgeoning, slashing) with an attack that does 25 slashing damage at initiative 3

Infection:
801 units each with 4706 hit points (weak to radiation) with an attack that does 116 bludgeoning damage at initiative 1
4485 units each with 2961 hit points (immune to radiation; weak to fire, cold) with an attack that does 12 slashing damage at initiative 4
`;

const txt = txt0;
const lines = txt.split("\n").filter(x => x);

/* *** */

const Group = {
    immune: 'immune',
    infection: 'infection',
};
Object.freeze(Group);

const GroupOpponents = {
    [Group.immune]: Group.infection,
    [Group.infection]: Group.immune,
};
Object.freeze(GroupOpponents);

const Damage = {
    bludgeoning: 'bludgeoning',
    slashing: 'slashing',
    radiation: 'radiation',
    fire: 'fire',
    cold: 'cold',
};
Object.freeze(Damage);

/* *** */

let boost = {
    [Group.immune]: 0,//1570,
    [Group.infection]: 0,
};

const units0 = lines.reduce((s,line) => {
    if (line === 'Immune System:') {
        s.key = 'immune';
    } else if (line === 'Infection:') {
        s.key = 'infection';
    } else {
        const m = line.match(/^(?<n>\d+) units each with (?<h>\d+) hit points (?<o>\([^\)]+\) )?with an attack that does (?<d>\d+) (?<dt>[a-z]+) damage at initiative (?<i>\d+)$/);
        if (!m) throw new Error(`Failed to match ${line}`);
        const f = _ => Object.keys(Damage).reduce((s,x) => ({...s, [x]: false}), {});
        const r = {
            id: s[s.key].length+1,
            type: s.key,
            count: parseInt(m.groups.n),
            health: parseInt(m.groups.h),
            damage: parseInt(m.groups.d),
            dtype: m.groups.dt,
            initiative: parseInt(m.groups.i),
            weak: f(),
            immune: f(),
        };
        if (m.groups.o) {
            const re = /(?<k>[a-z]+) to (?<v>[a-z\s,]+)/g;
            let mm;
            while (mm = re.exec(m.groups.o)) {
                for (const x of mm.groups.v.split(', ')) {
                    r[mm.groups.k][x] = true;
                }
            }
        }
        s[s.key].push(r);
    }
    return s;
}, {key: null, immune: [], infection: []});

Object.freeze(units0);

// p(units0);

/* *** */

const effectivePower = (unit) => {
    return unit.count * (unit.damage + boost[unit.type]);
};

const targetSelection = () => {
    const sort = (unitz) => {
        unitz.sort((a,b) => (effectivePower(b) - effectivePower(a)) || (b.initiative - a.initiative));
    };

    const damageOne = (head, tail) => {
        let d = effectivePower(head);
        if (tail.weak[head.dtype]) {
            d *= 2;
        } else if (tail.immune[head.dtype]) {
            d = 0;
        }
        return d;
    }

    const damageAll = (unit) => {
        const ret = [];
        const unitz = units[GroupOpponents[unit.type]];
        for (const u of unitz) {
            const d = damageOne(unit, u);
            ret.push([u, d]);
        }
        return ret;
    };

    const targets = (groupKey) => {
        const unitz = units[groupKey];
        sort(unitz);
        const attacks = [];
        for (const u of unitz) {
            const d = damageAll(u).filter(z => z[1] > 0 && !attacks.some(zz => z[0].id === zz[1].id));
            if (d.length === 0) continue;
            d.sort((a,b) => (b[1] - a[1]) || (effectivePower(b[0]) - effectivePower(a[0])) || (b[0].initiative - a[0].initiative));
            attacks.push([u, ...d[0]]);
        }
        return attacks;
    };

    const im = targets(Group.immune);
    const ie = targets(Group.infection);
    const targetz = [].concat(im).concat(ie);
    targetz.sort((a,b) => b[0].initiative - a[0].initiative);
    for (const [head, tail, dmg] of targetz) {
        const dmg2 = damageOne(head, tail);
        let n = Math.min((dmg2 / tail.health)|0, tail.count);
        tail.count -= n;
    }

    Object.keys(Group).forEach(groupKey => units[groupKey] = units[groupKey].filter(z => z.count > 0));
};

const unitsN = () => {
    return {
        [Group.immune]: units0.immune.map(z => ({...z})),
        [Group.infection]: units0.infection.map(z => ({...z})),
    };
}

let units = null;

const play = () => {
    units = unitsN();

    let printed = JSON.stringify(units);
    while (units.immune.length > 0 && units.infection.length > 0) {
        targetSelection();

        const printed2 = JSON.stringify(units);
        if (printed === printed2) {
            // Deadlock
            return {group: null};
        }
        printed = printed2;
    }

    const ret = (() => {
        if (units.immune.length > 0) {
            return {units: units.immune, group: Group.immune};
        }
        if (units.infection.length > 0) {
            return {units: units.infection, group: Group.infection};
        }
        return {units: [], group: null};
    })();
    const unitCount = ret.units.reduce((s,x) => s + x.count, 0);
    return {...ret, unitCount};
}

/* *** */

p('Part 1', play().unitCount);

boost[Group.immune] = 0;
while (true) {
    boost[Group.immune] += 1;
    // p('Boost', boost[Group.immune]);
    const r = play();
    if (r.group === Group.immune) {
        p('Part 2', r.unitCount);
        break;
    }
}
