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
