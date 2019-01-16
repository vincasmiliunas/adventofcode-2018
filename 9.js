const Fs = require('fs');
const assert = require('assert');
const p = (...x) => console.log(...x);

const txt0 = Fs.readFileSync('9.txt', {encoding: 'utf-8'});
const txt1 = `
9 players; last marble is worth 25 points: high score is 32
10 players; last marble is worth 1618 points: high score is 8317
17 players; last marble is worth 1104 points: high score is 2764
21 players; last marble is worth 6111 points: high score is 54718
30 players; last marble is worth 5807 points: high score is 37305
13 players; last marble is worth 7999 points: high score is 146373
`;

const play = (line, factor = 1) => {
  const m = line.match(/^(?<p>\d+) players; last marble is worth (?<m>\d+) points(: high score is (?<t>\d+))?$/);
  const players = parseInt(m.groups.p);
  const marbleMax = parseInt(m.groups.m)*factor;

  // p(`players:${players} marbleMax:${marbleMax}`);

  const scores = new Array(players).fill(0);
  const board = new Array(marbleMax).fill(null).map(_ => ({value: 0, prev: null, next: null}));

  let player = 0;
  let boardPoint = 0;

  let pointer = board[boardPoint++];
  pointer.prev = pointer;
  pointer.next = pointer;

  for (let marble = 1; marble <= marbleMax; marble += 1) {
      player = (player % players) + 1;
      if (marble % 23 === 0) {
          const node = pointer.prev.prev.prev.prev.prev.prev.prev;
          node.next.prev = node.prev;
          node.prev.next = node.next;
          pointer = node.next;
          scores[player - 1] += marble + node.value;
      } else {
          const node = pointer.next.next;
          pointer = board[boardPoint++];
          pointer.value = marble;
          pointer.prev = node.prev;
          pointer.next = node;
          node.prev.next = pointer;
          node.prev = pointer;
      }
  }

  const maxScore = Math.max(...scores);
  if (m.groups.t) {
    assert.equal(maxScore, parseInt(m.groups.t));
  }
  return maxScore;
}

/* *** */

txt1.split("\n").filter(x => x).forEach(line => play(line));

p('Part 1', play(txt0, 1));
p('Part 2', play(txt0, 100));
