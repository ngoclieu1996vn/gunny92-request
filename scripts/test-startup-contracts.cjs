const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const read = file => zlib.inflateSync(fs.readFileSync(path.join(root, file))).toString('utf8');
const quest = read('QuestList.xml');
const rates = [...quest.matchAll(/<Rate\b([^>]*)\/?\s*>/g)];
assert.equal(rates.length, 1, 'QuestListAnalyzer.improveXml requires exactly one Rate node');
for (const name of ['BindMoneyRate', 'ExpRate', 'GoldRate', 'ExploitRate', 'CanOneKeyFinishTime']) {
  const attribute = rates[0][1].match(new RegExp(`\\b${name}="([^"]+)"`));
  assert.ok(attribute, `TaskManager.getImproveArray requires ${name}`);
  assert.ok(attribute[1].split('|').every(value => Number.isFinite(Number(value))), `${name} must contain numeric rates`);
}
assert.ok(/<Item\b/.test(quest), 'Quest definitions must remain present');
for (const item of quest.matchAll(/<Item\b[^>]*>/g)) {
  assert.ok(/\bRewardBindMoney="\d+"/.test(item[0]), 'New clients require the bound-money quest reward');
}
for (const reward of quest.matchAll(/<Item_Good\b[^>]*>/g)) {
  const count = reward[0].match(/\bRewardItemCount="(\d+)"/);
  assert.ok(count, 'Backend reward count must be present');
  for (let level = 1; level <= 5; level++) {
    assert.ok(reward[0].includes(`RewardItemCount${level}="${count[1]}"`),
      `Client level ${level} must show the reward actually granted by this backend`);
  }
}
console.log('PASS: compressed quest list contains the rate metadata required by the current Flash client.');

// RoomLoadingTipsItem.addItems dereferences group 1 without a null check,
// then random() dereferences an entry filtered by the player's grade.
const tips = [...read('TS_LoadTips.xml').matchAll(/<Item\b[^>]*>/g)].map(match => {
  const attr = name => match[0].match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
  const grades = attr('Grades')?.match(/^(\d+)-(\d+)$/);
  assert.ok(grades, 'Loading tip Grades must be an inclusive min-max range');
  assert.ok(attr('Tips')?.trim(), 'Loading tips must contain text');
  return {type: Number(attr('LoadType')), min: Number(grades[1]), max: Number(grades[2])};
});
for (const grade of [1, 10, 30, 70, 100]) {
  assert.ok(tips.some(tip => tip.type === 1 && tip.min <= grade && tip.max >= grade),
    `RoomLoadingTipsItem requires a general loading tip for grade ${grade}`);
}
console.log('PASS: loading tips contain the nonempty grade-filtered general group required to enter battle.');

const balls = new Set([...read('BallList.xml').matchAll(/<Item\b[^>]*\bID="(\d+)"/g)].map(match => Number(match[1])));
// Actual LoadBombManager.SpecialAllBomb and SceneEffectBomb in the shipped client.
for (const id of [1,3,4,64,59,97,98,120,189,10619,121,298,299,11409,11517,107,130,147,149]) {
  assert.ok(balls.has(id), `LoadBombManager requires preload ball ${id} before entering any battle`);
}
console.log('PASS: every mandatory special and scene-effect bomb has client metadata.');

assert.ok(fs.existsSync(path.join(root, 'BuffTemplateInfo.xml')),
  'Battle loading requires the BuffTemplateInfo.xml resource');
const buffTemplates = read('BuffTemplateInfo.xml');
assert.ok(/<Result\b[^>]*\bvalue="true"/.test(buffTemplates),
  'GameBuffAnalyzer requires a successful buff template result, even when legacy buffs use client translations');
assert.ok(require('./compressed-xml-files.json').includes('BuffTemplateInfo.xml'),
  'BuffTemplateInfo uses loader type 5 and must stay in the compressed XML manifest');
console.log('PASS: the game buff extension table loads and allows legacy buff fallback.');
