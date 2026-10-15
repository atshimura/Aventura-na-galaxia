import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
test('HTML inclui módulos offline e CSS local',()=>{
  assert.match(page,/lang="pt-BR"/);
  assert.match(page,/src="main.mjs"/);
  assert.match(page,/href="style.css"/);
  assert.doesNotMatch(page,/https?:\/\//);
});
test('HUD inclui corações, moedas e os três níveis',()=>{
  for(const id of ['hearts','wallet','difficulty','score','pause','start','result'])assert.ok(page.includes('id="'+id+'"'),id);
  for(const d of ['facil','normal','dificil'])assert.ok(page.includes('value="'+d+'"'),d);
});
test('modo horizontal sem permissão de internet',()=>{
  const manifest=readFileSync(new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url),'utf8');
  assert.match(manifest,/screenOrientation="landscape"/);
  assert.doesNotMatch(manifest,/android.permission.INTERNET/);
});
test('origem segura de assets e armazenamento persistente',()=>{
  const native=readFileSync(new URL('../android/app/src/main/java/br/com/aventuranagalaxia/MainActivity.java',import.meta.url),'utf8');
  assert.match(native,/getAssets\(\)\.open\(name/);
  assert.match(native,/setDomStorageEnabled\(true\)/);
});
test('todos os módulos necessários existem e usam importação local',()=>{
  const m=readFileSync(new URL('../web/main.mjs',import.meta.url),'utf8');
  assert.match(m,/from '\.\/core.mjs'/);
  assert.match(m,/requestAnimationFrame\(loop\)/);
});
