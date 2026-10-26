import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Play beta mantém identidade, versão monotônica e API 36',()=>{
 const gradle=read('android/app/build.gradle'),build=read('android/build.gradle');
 assert.match(gradle,/applicationId 'br\.com\.aventuranagalaxia'/);
 assert.match(gradle,/minSdk 24/);
 assert.match(gradle,/targetSdk 36/);
 assert.match(gradle,/compileSdk 36/);
 assert.match(gradle,/versionCode 15/);
 assert.match(gradle,/versionName '0\.6\.9'/);
 assert.match(build,/version '8\.10\.1'/);
});
test('geração AAB é isolada dos pull requests e publica apenas pacote verificado',()=>{
 const yaml=read('.github/workflows/google-play-aab.yml');
 for(const v of ['workflow_dispatch:','branches: [main]','ops/google-play-aab-request.txt',
  "if: github.ref == 'refs/heads/main'",'secrets.AVENTURA_KEYSTORE_BASE64',
  'secrets.AVENTURA_SIGNING_PASSWORD','vars.AVENTURA_CERT_SHA256',
  'bundleRelease','jarsigner -verify','keytool -printcert -jarfile',
  'NORMAL_ACTUAL','NORM_EXPECTED','if-no-files-found: error','upload-artifact@v4']){
  assert.ok(yaml.includes(v),'Esperado no workflow: '+v);
 }
 assert.doesNotMatch(yaml,/pull_request:/);
 assert.ok(yaml.indexOf('Publicar artefato AAB')>yaml.indexOf('Verificar AAB assinado'));
 assert.doesNotMatch(yaml,/echo\s+"\$KEYSTORE_BASE64"/);
 assert.doesNotMatch(yaml,/AVENTURA_SIGNING_PASSWORD: ['"][^$]/);
});
test('teste Debug continua separado da assinatura da Play',()=>{
 const yaml=read('.github/workflows/android-apk.yml');
 assert.match(yaml,/assembleDebug/);
 assert.match(yaml,/DESCARTAVEL/);
 assert.match(yaml,/api-level: 36/);
 assert.match(yaml,/gradle-version: '8\.11\.1'/);
 assert.doesNotMatch(yaml,/secrets\.AVENTURA_KEYSTORE_BASE64/);
});
test('privacidade disponível dentro do jogo e documentada publicamente',()=>{
 const html=read('web/index.html'),js=read('web/main.mjs'),policy=read('docs/play-store/POLITICA-PRIVACIDADE.md');
 for(const id of ['privacy','privacy-open','privacy-close'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(js,/panels\('privacy'\)/);
 assert.match(js,/privacy-close/);
 assert.match(policy,/armazenamento local|localStorage/i);
 assert.match(policy,/desinstal/i);
 assert.match(policy,/GitHub/);
});
test('pacote Android não inclui permissão de internet nem rastreadores',()=>{
 const xml=read('android/app/src/main/AndroidManifest.xml');
 const java=read('android/app/src/main/java/br/com/aventuranagalaxia/MainActivity.java');
 assert.doesNotMatch(xml,/android\.permission\.INTERNET|AD_ID|ACCESS_FINE_LOCATION/);
 assert.match(java,/setDomStorageEnabled\(true\)/);
 assert.match(java,/ORIGIN = "appassets\.androidplatform\.net"/);
 assert.match(java,/MIXED_CONTENT_NEVER_ALLOW/);
});
test('documentação explicita partes pendentes de revisão humana',()=>{
 const doc=read('docs/play-store/CHECKLIST-PUBLICACAO.md');
 const listing=read('docs/play-store/FICHA-LOJA.md');
 assert.match(doc,/12 participantes|12 testadores/);
 assert.match(doc,/14 dias/);
 assert.match(doc,/Teste interno/);
 assert.match(doc,/não|Não/);
 assert.match(listing,/20 regiões planetárias/);
 assert.match(listing,/512 × 512/);
});
