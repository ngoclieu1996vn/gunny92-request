# Compressed Flash XML resources

The current client uses `CompressTextLoader` (loader type 5) for the static XML
files in `compressed-xml-files.json`. Their bytes must be zlib compressed:
Flash calls `ByteArray.uncompress()` before reading the XML. HTTP gzip does not
replace this format.

Run `node scripts/prepare-compressed-xml.cjs --check` from the Request repository
to validate these resources. After replacing a listed file with updated plain
XML, run `node scripts/prepare-compressed-xml.cjs --write` to pack it again.
Already compressed files are left unchanged. Keep the manifest aligned with
the client loader definitions when upgrading the Flash client.

Returning plain XML still produces HTTP 200, but stops the loading queue at
that resource. For `serverconfig.xml`, this caused UI 1/3 to stop at 57%.
