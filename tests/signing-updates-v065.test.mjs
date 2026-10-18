import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const text=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('APK distribuido mantem packageName e avanca codigo da versao',()=>{
 const gradle=text('android/app/build.gradle');
 assert.match(gradle,/applicationId 'br\.com\.aventuranagalaxia'/);
 assert.match(gradle,/versionCode 13/);
 assert.match(gradle,/versionName '0\.6\.7'/);
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
test('workflow de distribuicao aceita acionamento manual e gatilho controlado na main',()=>{
 const yml=text('.github/workflows/android-release.yml');
 assert.match(yml,/workflow_dispatch:/);
 assert.match(yml,/github\.ref == 'refs\/heads\/main'/);
 assert.doesNotMatch(yml,/pull_request:/);
 assert.match(yml,/contents: read/);
});
test('workflow recusa assinatura desconhecida e APK sem validacao',()=>{
 const yml=text('.github/workflows/android-release.yml');
 for(const word of ['secrets.AVENTURA_KEYSTORE_BASE64','secrets.AVENTURA_SIGNING_PASSWORD','vars.AVENTURA_CERT_SHA256','assembleRelease','apksigner','apkanalyzer','base64 --decode','android-emulator-runner','upload-artifact'])assert.ok(yml.includes(word),word);
 assert.match(yml,/NORMAL_ACTUAL.*NORMAL_EXPECTED/);
 assert.match(yml,/manifest application-id/);
 assert.match(yml,/manifest version-code/);
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

test('workflow de distribuicao pode ser solicitado apenas por arquivo de controle',()=>{
 const yml=text('.github/workflows/android-release.yml');
 assert.match(yml,/push:[\s\S]*branches: \[main\]/);
 assert.match(yml,/paths:[\s\S]*'ops\/android-release-request\.txt'/);
 assert.match(yml,/if: github\.event_name == 'push'/);
 assert.match(yml,/git diff --name-only/);
 assert.match(yml,/FILES.*ops\/android-release-request\.txt/);
 assert.match(yml,/REQUESTED_CODE/);
 assert.match(yml,/CURRENT_CODE/);
 assert.match(yml,/fetch-depth: 0/);
 assert.doesNotMatch(yml,/pull_request:/);
});

test('versao solicitada por push e parseada sem erro de escape',()=>{
 const yml=text('.github/workflows/android-release.yml');
 assert.match(yml,/REQUESTED_CODE="\$\(awk -F= /);
 assert.match(yml,/CURRENT_CODE="\$\(awk '\$1=="versionCode"/);
 assert.doesNotMatch(yml,/REQUESTED_CODE="\$\(sed -n/);
});
