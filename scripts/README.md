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

After regenerating legacy XML caches, run
`node scripts/prepare-battle-resources.cjs --write`, followed by
`node scripts/test-startup-contracts.cjs`. The current loading screen requires
a nonempty general group in `TS_LoadTips.xml` and preloads ball 11517 even when
that special weapon is unused. Empty tips and missing preload metadata each
cause Flash error 1009 and a black screen before battle. The preparation step
adds the bundled metadata only when absent, retaining existing server ball
definitions and populated tips. Ball 11517 points to its installed bullet and
blastout assets; it does not enable an unsupported weapon on the server.

`BuffTemplateInfo.xml` is also required during battle loading (loader type 5).
The legacy backend has no extended buff templates; its valid empty result
initializes the client's dictionary and retains `FightBuffInfo`'s existing
translation fallback. Returning 404 prevents the player from finishing loading.
