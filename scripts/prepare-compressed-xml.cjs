const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

// Loader type 5 in the Flash client calls ByteArray.uncompress() before parsing XML.
// HTTP Content-Encoding is separate: these files must contain a zlib payload.
const root = path.resolve(__dirname, '..');
const files = require('./compressed-xml-files.json');
const write = process.argv.includes('--write');
const failures = [];
let converted = 0;
for (const name of files) {
  const filename = path.join(root, name);
  const bytes = fs.readFileSync(filename);
  let xml;
  try {
    xml = zlib.inflateSync(bytes).toString('utf8');
  } catch {
    xml = bytes.toString('utf8');
    if (!/^\s*(?:\uFEFF)?\s*</u.test(xml)) {
      failures.push(`${name}: neither zlib nor XML`);
      continue;
    }
    if (!write) {
      failures.push(`${name}: plain XML; Flash requires zlib`);
      continue;
    }
    const packed = zlib.deflateSync(bytes);
    if (!zlib.inflateSync(packed).equals(bytes)) throw new Error(`Round trip failed: ${name}`);
    fs.writeFileSync(filename, packed);
    converted++;
  }
  if (!xml.trimStart().replace(/^\uFEFF/u, '').startsWith('<')) {
    failures.push(`${name}: decompressed payload is not XML`);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`FAIL: ${failures.length}/${files.length} compressed XML resources are invalid.`);
  process.exitCode = 1;
} else {
  console.log(`PASS: ${files.length} zlib XML resources verified; ${converted} converted.`);
}
