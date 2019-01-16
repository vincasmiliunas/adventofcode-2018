const data = {};
const regs = [0,0,0,0,0,0];
let c = 0;
loop:
while (true) {
  switch (regs[4]) {
  case 0:
    regs[2] = 123;
    regs[4] = 1;
    c += 1;
    break;
  case 1:
    regs[2] = regs[2] & 456;
    regs[4] = 2;
    c += 1;
    break;
  case 2:
    regs[2] = regs[2] == 72 ? 1 : 0;
    regs[4] = 3;
    c += 1;
    break;
  case 3:
    regs[4] = 1 + regs[2] + 3;
    c += 1;
    break;
  case 4:
    regs[4] = 1 + 0;
    c += 1;
    break;
  case 5:
    regs[2] = 0;
    regs[4] = 6;
    c += 1;
    break;
  case 6:
    regs[5] = regs[2] | 65536;
    regs[4] = 7;
    c += 1;
    break;
  case 7:
    regs[2] = 5234604;
    regs[4] = 8;
    c += 1;
    break;
  case 8:
    regs[3] = regs[5] & 255;
    regs[4] = 9;
    c += 1;
    break;
  case 9:
    regs[2] = regs[2] + regs[3];
    regs[4] = 10;
    c += 1;
    break;
  case 10:
    regs[2] = regs[2] & 16777215;
    regs[4] = 11;
    c += 1;
    break;
  case 11:
    regs[2] = regs[2] * 65899;
    regs[4] = 12;
    c += 1;
    break;
  case 12:
    regs[2] = regs[2] & 16777215;
    regs[4] = 13;
    c += 1;
    break;
  case 13:
    regs[3] = 256 > regs[5] ? 1 : 0;
    regs[4] = 14;
    c += 1;
    break;
  case 14:
    regs[4] = 1 + regs[3] + 14;
    c += 1;
    break;
  case 15:
    regs[4] = 1 + 15 + 1;
    c += 1;
    break;
  case 16:
    regs[4] = 1 + 27;
    c += 1;
    break;
  case 17:
    regs[3] = 0;
    regs[4] = 18;
    c += 1;
    break;
  case 18:
    regs[1] = regs[3] + 1;
    regs[4] = 19;
    c += 1;
    break;
  case 19:
    regs[1] = regs[1] * 256;
    regs[4] = 20;
    c += 1;
    break;
  case 20:
    regs[1] = regs[1] > regs[5] ? 1 : 0;
    regs[4] = 21;
    c += 1;
    break;
  case 21:
    regs[4] = 1 + regs[1] + 21;
    c += 1;
    break;
  case 22:
    regs[4] = 1 + 22 + 1;
    c += 1;
    break;
  case 23:
    regs[4] = 1 + 25;
    c += 1;
    break;
  case 24:
    regs[3] = regs[3] + 1;
    regs[4] = 25;
    c += 1;
    break;
  case 25:
    regs[4] = 1 + 17;
    c += 1;
    break;
  case 26:
    regs[5] = regs[3];
    regs[4] = 27;
    c += 1;
    break;
  case 27:
    regs[4] = 1 + 7;
    c += 1;
    break;
  case 28:
    if (data[regs[2]]) {
      const sorted = Object.entries(data).sort((a,b) => a[1] - b[1]);
      const fewest = sorted[0][0];
      const most = sorted[sorted.length - 1][0];
      console.log('Part 1', fewest);
      console.log('Part 2', most);
      break loop;
    } else {
      data[regs[2]] = c + 2;
    }
    regs[3] = regs[2] == regs[0] ? 1 : 0;
    regs[4] = 29;
    c += 1;
    break;
  case 29:
    regs[4] = 1 + regs[3] + 29;
    c += 1;
    break;
  case 30:
    regs[4] = 1 + 5;
    c += 1;
    break;
  default:
    if (regs[4] < 31) { throw new Error(`MISSING INSTRUCTION AT ${regs[4]}`); }
    break loop;
  }
}
console.log('regs', regs);