import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const main=readFileSync(new URL('../web/main.mjs',import.meta.url),'utf8');
const css=readFileSync(new URL('../web/style.css',import.meta.url),'utf8');
test('menu tem seletor e cada fase só inicia se estiver liberada',()=>{
 assert.match(html,/id="stage-select"/);assert.match(main,/canPlayStage\(game\.save,stage\)/);
 assert.match(main,/configureStageSelect/);assert.match(main,/disabled/);
});
test('HUD exibe fase e progresso proporcional à sua duração',()=>{
 assert.match(html,/id="stage-hud"/);assert.match(main,/game\.elapsed\/game\.duration/);
});
test('botão de próxima fase e opção de repetir estão presentes',()=>{
 assert.match(html,/id="next-stage"/);assert.match(html,/id="retry"/);
 assert.match(main,/begin\(game\.stage\.number\+1\)/);
});
test('cenários usam cores da fase e as telas continuam responsivas',()=>{
 assert.match(main,/theme\.nebula/);assert.match(main,/theme\.glow/);
 assert.match(css,/stage-info/);
});
