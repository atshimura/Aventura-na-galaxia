import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const text=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('APK distribuido mantem packageName e avanca codigo da versao',()=>{
 const gradle=text('android/app/build.gradle');
 assert.match(gradle,/applicationId 'br\.com\.aventuranagalaxia'/);
 assert.match(gradle,/versionCode 11/);
 assert.match(gradle,/versionName '0\.6\.5'/);
});
test('assinatura Release usa chave estavel do ambiente, sem chave embutida',()=>{
 const gradle=text('android/app/build.gradle');
 assert.match(gradle,/AVENTURA_SIGNING_KEYSTORE/);
 assert.match(gradle,/AVENTURA_SIGNING_PASSWORD/);
 assert.match(gradle,/keyAlias 'aventura'/);
 assert.match(gradle,/signingConfig signingConfigs\.release/);
 assert.match(gradle,/throw new GradleException/);
 assert.doesNotMatch(gradle,/storePassword\s+['"][^'"]+['"]/);
});
test('workflow de distribuicao so aceita acionamento manual da main',()=>{
 const yml=text('.github/workflows/android-release.yml');
 assert.match(yml,/workflow_dispatch:/);
 assert.match(yml,/github\.ref == 'refs\/heads\/main'/);
 assert.doesNotMatch(yml,/pull_request:/);
 assert.match(yml,/contents: read/);
});
test('workflow recusa assinatura desconhecida e APK sem validacao',()=>{
 const yml=text('.github/workflows/android-release.yml');
 for(const word of ['secrets.AVENTURA_KEYSTORE_BASE64','secrets.AVENTURA_SIGNING_PASSWORD','vars.AVENTURA_CERT_SHA256','assembleRelease','apksigner','aapt','base64 --decode','android-emulator-runner','upload-artifact'])assert.ok(yml.includes(word),word);
 assert.match(yml,/NORMAL_ACTUAL.*NORMAL_EXPECTED/);
 assert.match(yml,/versionCode.*greater|VersionCode deve ser maior/);
 const publish=yml.indexOf('Publicar APK assinado verificado');
 assert.ok(publish>yml.indexOf('Testar instalacao e reinstalacao'));
 assert.ok(!yml.includes('echo "$KEYSTORE_BASE64"'));
});
test('documentacao distingue debug/release e ressalva migracao dos dados',()=>{
 const docs=text('docs/ASSINATURA-ATUALIZACOES.md');
 assert.match(docs,/AVENTURA_CERT_SHA256/);
 assert.match(docs,/localStorage/);
 assert.match(docs,/0\.6\.4/);
 assert.match(docs,/Não desinstalar/);
 assert.match(docs,/keytool -genkeypair/);
});
test('teste de PR assina Release somente com chave efemera, sem publicar esse APK',()=>{
 const workflow=text('.github/workflows/android-apk.yml');
 assert.match(workflow,/DESCARTAVEL/);
 assert.match(workflow,/openssl rand/);
 assert.match(workflow,/assembleRelease/);
 assert.match(workflow,/app-debug\.apk/);
 assert.match(workflow,/apksigner/);
 assert.doesNotMatch(workflow,/secrets\.AVENTURA_KEYSTORE_BASE64/);
});
