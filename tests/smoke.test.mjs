import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const page=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const js=page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
test('pacote inclui HTML offline e script independente',()=>{
  assert.match(page,/lang="pt-BR"/);
  assert.ok(js&&js.length>1000,'script deve estar embutido para uso offline');
  assert.doesNotMatch(page,/<script[^>]*src=/);
});
test('JavaScript do jogo sem erro sintático',()=>assert.doesNotThrow(()=>new vm.Script(js)));
test('tela com tres vidas, moedas e dificuldades',()=>{
  for(const id of ['hearts','wallet','difficulty','score','pause','start','result'])assert.ok(page.includes('id="'+id+'"'),id);
  for(const d of ['facil','normal','dificil'])assert.ok(page.includes('value="'+d+'"'),d);
});
test('tela horizontal e jogo sem rede',()=>{
  const manifest=readFileSync(new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url),'utf8');
  assert.match(manifest,/screenOrientation="landscape"/);
  assert.doesNotMatch(manifest,/android.permission.INTERNET/);
});
test('codigo nativo usa assets locais e armazenamento offline',()=>{
  const native=readFileSync(new URL('../android/app/src/main/java/br/com/aventuranagalaxia/MainActivity.java',import.meta.url),'utf8');
  assert.match(native,/getAssets\(\)\.open\(name/);
  assert.match(native,/setDomStorageEnabled\(true\)/);
});
