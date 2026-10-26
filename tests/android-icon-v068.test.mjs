import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url));
test('icone colorido aprovado existe como WebP Android valido',()=>{
 const bytes=read('android/app/src/main/res/drawable-nodpi/icon_galaxia.webp');
 assert.ok(bytes.length>4000,'imagem real deve existir no repositório');
 assert.equal(bytes.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(bytes.subarray(8,12).toString('ascii'),'WEBP');
 assert.equal(bytes.subarray(12,16).toString('ascii'),'VP8 ');
 assert.equal(bytes.readUInt16LE(26)&0x3fff,128);
 assert.equal(bytes.readUInt16LE(28)&0x3fff,128);
});
test('Android usa a nova ilustração, inclusive no icone redondo',()=>{
 const xml=read('android/app/src/main/AndroidManifest.xml').toString('utf8');
 assert.match(xml,/android:icon="@drawable\/icon_galaxia"/);
 assert.match(xml,/android:roundIcon="@drawable\/icon_galaxia"/);
 assert.doesNotMatch(xml,/@android:drawable\/ic_menu_compass/);
 assert.match(xml,/android:label="Aventura na Galáxia"/);
});
test('novo APK avança versao sem alterar identidade ou assinatura provisoria',()=>{
 const gradle=read('android/app/build.gradle').toString('utf8');
 const workflow=read('.github/workflows/android-apk.yml').toString('utf8');
 assert.match(gradle,/applicationId 'br\.com\.aventuranagalaxia'/);
 assert.match(gradle,/versionCode 15/);
 assert.match(gradle,/versionName '0\.6\.9'/);
 assert.match(workflow,/assembleDebug/);
 assert.match(workflow,/aventura-na-galaxia-debug-apk/);
});
