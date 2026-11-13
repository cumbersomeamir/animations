// Undo demo for Tensorblue english-13 — an original, minimal model of the documented undo design.
// Apple's UndoManager: for each change the app registers "a closure, method, or invocation to revert its
// state"; undo() reverts "to the state of the last undo operation"; levelsOfUndo caps the history.
// Microsoft Office: "By default Office saves the last 100 undoable actions".
// Gmail: Undo Send has a "Send cancellation period of 5, 10, 20, or 30 seconds".
// This file is OUR model (no real app's code): it produces the board states and entries shown on screen.
//  1. A board: To do [Invoice, Slides], Done [Logo]. The user drags Invoice to Done by mistake.
//  2. The screen moves on (navigation is not a data change, so it is not recorded).
//  3. Undo takes the newest entry and runs its revert -> Invoice is back in To do, position 1.
//  4. Limit: with a cap of 100 entries, 101 changes leave only the last 100 undoable; the oldest is gone.
//  5. A send that has left the app is not in this history; a cancel window (5 s, Gmail's shortest option)
//     is the only chance to stop it. Simulated clock, no network.
// usage: node undo_demo.mjs <out_dir>
import fs from 'node:fs';
import path from 'node:path';

class History {
  constructor(levels) { this.levels = levels; this.stack = []; this.dropped = 0; }
  record(entry) { this.stack.push(entry); if (this.stack.length > this.levels) { this.stack.shift(); this.dropped++; } }
  undo() { const e = this.stack.pop(); if (!e) return null; e.revert(); return e; }
}
const clone = (b) => JSON.parse(JSON.stringify(b));
function moveCard(board, history, card, toCol) {
  const fromCol = Object.keys(board).find((c) => board[c].includes(card));
  const fromIdx = board[fromCol].indexOf(card);
  board[fromCol].splice(fromIdx, 1); board[toCol].push(card);
  const toIdx = board[toCol].length - 1;
  history.record({ card, from: { col: fromCol, pos: fromIdx + 1 }, to: { col: toCol, pos: toIdx + 1 },
    revert: () => { board[toCol].splice(board[toCol].indexOf(card), 1); board[fromCol].splice(fromIdx, 0, card); } });
}
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });

// 1-3: the mistake and the undo
const board = { 'To do': ['Invoice', 'Slides'], Done: ['Logo'] };
const history = new History(100);
const before = clone(board);
moveCard(board, history, 'Invoice', 'Done');
const afterMistake = clone(board);
const screen = 'Calendar';                                   // the user navigates away; history unchanged
const entry = (({ card, from, to }) => ({ card, from, to }))(history.stack.at(-1));
const historyLenBeforeUndo = history.stack.length;
history.undo();
const afterUndo = clone(board);

// 4: the limit (cap 100, 101 changes: cards bounced between columns)
const b2 = { 'To do': ['A'], Done: [] }, h2 = new History(100);
for (let i = 0; i < 101; i++) moveCard(b2, h2, 'A', i % 2 ? 'To do' : 'Done');
let undos = 0; while (h2.undo()) undos++;
const limit = { cap: 100, changes: 101, undos_possible: undos, oldest_dropped: h2.dropped, final_board: clone(b2), first_change_reverted: b2['To do'].includes('A') };

// 5: a send with a cancel window (simulated clock)
function send(windowS, cancelAtS) { return cancelAtS < windowS ? 'cancelled, never sent' : 'sent, cannot be cancelled'; }
const sendWindow = { window_s: 5, cancel_at_3s: send(5, 3), cancel_at_6s: send(5, 6), in_undo_history: false };

const data = { model: 'original minimal undo history (not any app\'s code)', before, after_mistake: afterMistake, screen_after_navigation: screen,
  entry, history_length_before_undo: historyLenBeforeUndo, after_undo: afterUndo, restored: JSON.stringify(afterUndo) === JSON.stringify(before), limit, send_window: sendWindow };
fs.writeFileSync(path.join(out, 'undo-demo.json'), JSON.stringify(data, null, 1));
console.log(JSON.stringify(data, null, 1));
