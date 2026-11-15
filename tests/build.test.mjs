import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('published HTML is self-contained and carries a visible build identity',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.doesNotMatch(html,/<script[^>]+src=/i);
 assert.doesNotMatch(html,/<link[^>]+(?:stylesheet|preload)/i);
 for(const marker of ['__VERSION__','__BUILD__','/*__CSS__*/','/*__JS__*/'])assert.equal(html.includes(marker),false);
 assert.match(html,/BUILD [a-f0-9]{8}/);
 assert.match(html,/Three.js license/);
});
