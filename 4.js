const Fs = require('fs');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('4.txt', {encoding: 'utf-8'});
const txt1 = `
#1 @ 1,3: 4x4
#2 @ 3,1: 4x4
#3 @ 5,5: 2x2
`;
const txt = txt0;

/* *** */

const Action = {
    NONE: 'NONE',
    WAKE: 'WAKE',
    FALL: 'FALL',
    BEGIN: 'BEGIN',
};
Object.freeze(Action);

/* *** */

const lines = txt.split("\n").filter(x => x).map(line => {
    const m = line.match(/^\[(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2}) (?<hour>\d{2}):(?<min>\d{2})\] (?<rest>[\s\S]+)$/);
    if (!m) {
        throw new Error(`Match failed: ${line}`);
    }
    const r = ['year', 'month', 'day', 'hour', 'min'].reduce((s,x) => ({...s, [x]: parseInt(m.groups[x])}), {});

    const days = {'January': 31, 'February': 28, 'March': 31, 'April': 30, 'May': 31, 'June': 30, 'July': 31, 'August': 31, 'September': 31, 'October': 31, 'November': 30, 'December': 31,};
    r.minutes = r.min + (r.hour*60) + (r.day*24*60) + Object.values(days).slice(0, r.month-1).reduce((s,x) => s+x, 0)*24*60;

    let mm;
    switch (true) {
        case !!(mm = m.groups.rest.match(/^wakes up$/)): {
            r.action = Action.WAKE;
            break;
        }
        case !!(mm = m.groups.rest.match(/^falls asleep$/)): {
            r.action = Action.FALL;
            break;
        }
        case !!(mm = m.groups.rest.match(/^Guard #(?<v>\d+) begins shift$/)): {
            r.action = Action.BEGIN;
            r.id = parseInt(mm.groups.v);
            break;
        }
        default: {
            throw new Error(`Match failed: ${m.groups.rest}`);
        }
    }
    return r;
});

lines.sort((a,b) => ['year', 'month', 'day', 'hour', 'min'].reduce((s,x) => s ? s : (a[x] - b[x]), 0));

const sleep = {};
const minutes = new Array(60).fill(null).map(x => ({}));
let id = null, head = null;
for (const line of lines) {
    switch (line.action) {
        case Action.BEGIN:
            id = line.id;
            break;
        case Action.FALL:
            head = line.minutes;
            break;
        case Action.WAKE:
            sleep[id] = (sleep[id]||0) + line.minutes - head;
            for (let i = head; i < line.minutes; i += 1) {
                const j = i % 60;
                minutes[j][id] = (minutes[j][id]||0) + 1;
            }
            break;
        default:
            throw new Error();
    }
}
const mostAsleep = Object.entries(sleep).sort((a,b) => b[1] - a[1]);
const mostAsleepId = parseInt(mostAsleep[0]);
const mostMinutes = minutes.map((x, minute) => ({minute, times: x[mostAsleepId]})).filter(x => x.times).sort((a,b) => b.times - a.times);
const mostMinute = mostMinutes[0].minute;
p('Part 1', mostAsleepId * mostMinute);

const mostOnMinute = minutes.map((x,minute) => Object.entries(x).map(x => ({minute, id: parseInt(x[0]), times: x[1]})).sort((a,b) => b.times - a.times)).filter(x => x.length).sort((a,b) => b[0].times - a[0].times);
p('Part 2', mostOnMinute[0][0].id * mostOnMinute[0][0].minute);
