const regs = [0,0,0,0,0,0];
let c = 0;
loop:
while (true) {
  switch (regs[3]) {
  case 0:
    regs[3] = 1 + 0 + 16;
    c += 1;
    break;
  case 1:
    regs[1] = 1;
    regs[3] = 2;
    c += 1;
    break;
  case 2:
    regs[5] = 1;
    regs[3] = 3;
    c += 1;
    break;
  case 3:
    regs[4] = regs[1] * regs[5];
    regs[3] = 4;
    c += 1;
    break;
  case 4:
    regs[4] = regs[4] == regs[2] ? 1 : 0;
    regs[3] = 5;
    c += 1;
    break;
  case 5:
    regs[3] = 1 + regs[4] + 5;
    c += 1;
    break;
  case 6:
    regs[3] = 1 + 6 + 1;
    c += 1;
    break;
  case 7:
    console.log(regs[1]);
    regs[0] = regs[1] + regs[0];
    regs[3] = 8;
    c += 1;
    break;
  case 8:
    regs[5] = regs[5] + 1;
    regs[3] = 9;
    c += 1;
    break;
  case 9:
    regs[4] = regs[5] > regs[2] ? 1 : 0;
    regs[3] = 10;
    c += 1;
    break;
  case 10:
    regs[3] = 1 + 10 + regs[4];
    c += 1;
    break;
  case 11:
    regs[3] = 1 + 2;
    c += 1;
    break;
  case 12:
    regs[1] = regs[1] + 1;
    regs[3] = 13;
    c += 1;
    break;
  case 13:
    regs[4] = regs[1] > regs[2] ? 1 : 0;
    regs[3] = 14;
    c += 1;
    break;
  case 14:
    regs[3] = 1 + regs[4] + 14;
    c += 1;
    break;
  case 15:
    regs[3] = 1 + 1;
    c += 1;
    break;
  case 16:
    regs[3] = 1 + 16 * 16;
    c += 1;
    break;
  case 17:
    regs[2] = regs[2] + 2;
    regs[3] = 18;
    c += 1;
    break;
  case 18:
    regs[2] = regs[2] * regs[2];
    regs[3] = 19;
    c += 1;
    break;
  case 19:
    regs[2] = 19 * regs[2];
    regs[3] = 20;
    c += 1;
    break;
  case 20:
    regs[2] = regs[2] * 11;
    regs[3] = 21;
    c += 1;
    break;
  case 21:
    regs[4] = regs[4] + 2;
    regs[3] = 22;
    c += 1;
    break;
  case 22:
    regs[4] = regs[4] * 22;
    regs[3] = 23;
    c += 1;
    break;
  case 23:
    regs[4] = regs[4] + 2;
    regs[3] = 24;
    c += 1;
    break;
  case 24:
    regs[2] = regs[2] + regs[4];
    regs[3] = 25;
    c += 1;
    break;
  case 25:
    regs[3] = 1 + 25 + regs[0];
    c += 1;
    break;
  case 26:
    regs[3] = 1 + 0;
    c += 1;
    break;
  case 27:
    regs[4] = 27;
    regs[3] = 28;
    c += 1;
    break;
  case 28:
    regs[4] = regs[4] * 28;
    regs[3] = 29;
    c += 1;
    break;
  case 29:
    regs[4] = 29 + regs[4];
    regs[3] = 30;
    c += 1;
    break;
  case 30:
    regs[4] = 30 * regs[4];
    regs[3] = 31;
    c += 1;
    break;
  case 31:
    regs[4] = regs[4] * 14;
    regs[3] = 32;
    c += 1;
    break;
  case 32:
    regs[4] = regs[4] * 32;
    regs[3] = 33;
    c += 1;
    break;
  case 33:
    regs[2] = regs[2] + regs[4];
    regs[3] = 34;
    c += 1;
    break;
  case 34:
    regs[0] = 0;
    regs[3] = 35;
    c += 1;
    break;
  case 35:
    regs[3] = 1 + 0;
    c += 1;
    break;
  default:
    if (regs[3] < 36) { throw new Error(`MISSING INSTRUCTION AT ${regs[3]}`); }
    break loop;
  }
}
console.log('regs', regs);