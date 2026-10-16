import {test} from 'node:test';
import assert from 'node:assert/strict';
import {musicNotesAt,TEMPO_SECONDS,SpaceAudio} from '../web/music.mjs';
test('trilha de fundo contém notas válidas e andamento',()=>{for(let i=0;i<64;i++){const n=musicNotesAt(i);assert.ok(n.lead>0&&n.bass>0&&n.harmony>0);}assert.ok(TEMPO_SECONDS>.2&&TEMPO_SECONDS<.5);});
test('tema harmônico se repete a cada quatro acordes',()=>{assert.deepEqual(musicNotesAt(0),musicNotesAt(32));assert.notEqual(musicNotesAt(0).bass,musicNotesAt(8).bass);});
test('sem API de áudio não há exceção e mudo funciona',()=>{const a=new SpaceAudio({});a.unlock();assert.equal(a.ctx,null);a.setEnabled(false);assert.equal(a.enabled,false);a.setEnabled(true);a.tick(true);assert.equal(a.enabled,true);});
