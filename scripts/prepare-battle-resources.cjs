const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const write = process.argv.includes('--write');
let needed = 0;
function update(name, transform) {
  const filename = path.join(root, name);
  const original = fs.existsSync(filename) ? zlib.inflateSync(fs.readFileSync(filename)).toString('utf8') : null;
  const updated = transform(original);
  if (original === updated) return;
  needed++;
  if (write) fs.writeFileSync(filename, zlib.deflateSync(Buffer.from(updated, 'utf8')));
  else console.error(`${name}: required client battle metadata is missing`);
}
update('TS_LoadTips.xml', xml => xml && /<Item\b/.test(xml) ? xml :
  fs.readFileSync(path.join(__dirname, 'client-data/TS_LoadTips.xml'), 'utf8'));
update('BallList.xml', xml => {
  if (!xml) throw new Error('BallList.xml must be generated from the server database first.');
  const definitions = fs.readFileSync(path.join(__dirname, 'client-data/preload-balls.xml'), 'utf8');
  for (const match of definitions.matchAll(/<Item\b[^>]*\bID="(\d+)"[^>]*\/>/g)) {
    if (!new RegExp(`<Item\\b[^>]*\\bID="${match[1]}"`).test(xml)) {
      if (!xml.includes('</Result>')) throw new Error('Invalid BallList root; refusing to modify it.');
      xml = xml.replace('</Result>', `  ${match[0]}\n</Result>`);
    }
  }
  return xml;
});
update('BuffTemplateInfo.xml', xml => xml ??
  fs.readFileSync(path.join(__dirname, 'client-data/BuffTemplateInfo.xml'), 'utf8'));
if (needed && !write) process.exitCode = 1;
else console.log(`PASS: battle resource compatibility; ${write ? needed : 0} resources updated.`);
