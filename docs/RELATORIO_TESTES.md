# Relatório de validação — Aventura na Galáxia v0.6.0

Data: 17/10/2026.

## Integração e referência
- Pull request: https://github.com/atshimura/Aventura-na-galaxia/pull/5 (integrado).
- Commit da versão: `2ea67b6c0656c446188bf47cafa5d06a1dbef01f`.
- Execução final na main: https://github.com/atshimura/Aventura-na-galaxia/actions/runs/39039983762.
- Versão de Android: `versionCode 6`, `versionName 0.6.0`; APK de depuração para testes.

## Resultados efetivos
- **111 testes automatizados aprovados**, sem falhas, incluindo 14 testes novos para plataforma, controles, música, pouso, gravidade, salvamento e embarque.
- Compilação `assembleDebug`: **sucesso**.
- Instalação e abertura no emulador Android API 35: **sucesso**.
- APK verificado como ZIP válido; contém `core.mjs`, `music-v2.mjs`, `platformer.mjs`, `platformer-render.mjs`, HTML/CSS e demais módulos.

## Funcionalidades entregues
1. Trilha instrumental sintetizada mais rica e de maior intensidade, com compressor e controle de volume para música e efeitos.
2. Joystick sem a perseguição lenta de alvo: movimento direto no quadro, mantendo controle por arrasto.
3. Transição de pouso, escotilha, caminhada lateral com gravidade e saltos, terreno com buracos e ameaças específicas.
4. Checkpoints, três corações, recuperação após acidente, coleta de cristais.
5. Exploração sem limite de tempo, retorno físico ao foguete e decolagem antes da nomeação do planeta.
6. Progressão de 20 fases, lasers, garagem e Modo Infinito preservados.

## Limitações
- Teste de emulador cobre **instalação e abertura**, não uma simulação completa de uso com os dedos.
- O novo modo terrestre é uma base jogável: faltam plataformas elevadas, animações adicionais, IA mais elaborada e sistemas de proteção/interação com animais.
- A qualidade musical percebida, o volume e a precisão do joystick precisam de avaliação num aparelho real.
- Checkpoints ativos são preservados durante a visita, mas não restaurados após fechar completamente o aplicativo no meio da exploração.
- O APK tem assinatura de debug, que pode diferir da versão anterior; instalar por cima pode falhar e a desinstalação pode eliminar dados locais.

Nenhuma validação de navegador externo foi contabilizada nesta execução porque a navegação foi bloqueada pelo ambiente de teste; os testes Node e Android foram os que passaram.

## v0.6.1 — joystick para caminhada e controles de dois dedos

- Correção integrada na branch `main` pelo [PR #6](https://github.com/atshimura/Aventura-na-galaxia/pull/6).
- Joystick de voo permanece à direita; na exploração o astronauta recebe joystick próprio **à esquerda**, com controle horizontal e indicação de direção, enquanto o botão **PULAR** fica à direita.
- Os controles de voo e caminhada têm ponteiros/capturas independentes; o astronauta pode andar e saltar simultaneamente usando dois dedos.
- Velocidade de caminhada/corrida varia conforme a intensidade do analógico; soltar o dedo cancela imediatamente o movimento.
- Uma verificação de integração simula toque em joystick, caminhada, salto por outro dedo, continuação do deslocamento durante o salto, parada e inversão da direção.
- **117 testes Node passaram**, sem falhas, no PR e na versão integrada. Compilação Android `assembleDebug` aprovada, `versionCode=7`, `versionName=0.6.1`.
- Abertura no emulador é verificada automaticamente, mas os controles físicos deverão ser experimentados no celular real.
- Execução na main: https://github.com/atshimura/Aventura-na-galaxia/actions/runs/39042415926

## Versão v0.6.2 — dificuldade crescente e planetas individualizados (17/10/2026)

- **PR #7**: https://github.com/atshimura/Aventura-na-galaxia/pull/7, integrado na `main`.
- Commit da integração: `c84b32e0f6e4e38e514c78b624f37827893e0256`.
- Execução final do GitHub Actions na `main`: https://github.com/atshimura/Aventura-na-galaxia/actions/runs/39047979708.
- **128 testes Node aprovados, zero falhas**, incluindo progressão de dificuldade, caminhada por todo o planeta 1 sem dano, buracos de fases posteriores, alcance do salto, fauna e renderização dos 20 planetas.
- Compilação Android debug **aprovada**: `versionCode=8`, `versionName=0.6.2`.
- Teste de instalação e abertura no emulador Android **aprovado**.
- Inspeção visual complementar: todos os vinte cenários foram renderizados em Chromium (Canvas) sem erros JS, comparados em montagem 4 × 5.
- Primeira fase sem precipícios, armadilhas ou criaturas hostis; primeiro obstáculo na fase 2, primeiro buraco na fase 3, buracos adicionais a partir das fases 5, 7 e 9.
- Cenários próprios por planeta: auroras, crateras, geleiras, florestas gigantes, portais, lava, cristais, desertos, oceanos, cidades, jardins suspensos, ruínas, cânions, cachoeiras, corais, anéis, tempestades, luas duplas, pontes estelares e templos.
- **Limitação**: abertura do app no emulador não equivale a percorrer todas as fases tocando na tela. A dificuldade percebida e desempenho gráfico ainda exigem testes em celular real.

## v0.6.3 — Mapa da Galáxia e menu com fundo dinâmico (17/10/2026)

- **PR #8 integrado em `main`:** https://github.com/atshimura/Aventura-na-galaxia/pull/8
- **Commit de integração:** `cb3c6d9266ec1ed3b13dce9bbfadf33a1518ddf3`
- **CI de integração:** https://github.com/atshimura/Aventura-na-galaxia/actions/runs/39056751073 — **testes, compilação Android e instalação/abertura no emulador todos aprovados.**
- **136 testes Node passaram (zero falhas)**, incluindo novo módulo de testes para o mapa e o menu; cobrem uma rota com 20 destinos não simétricos, progresso e exploração independentes, cálculo de rolagem inicial, renderização Canvas das ilustrações, seletor original e mudança de prévia, abertura do mapa, ficha de planeta bloqueado, ficha desbloqueada, nomes personalizados, fechamento sem perder posição e início da fase pela ficha.
- Android debug: `versionCode 9`, `versionName 0.6.3`.
- Menu mantém seleção por fase existente e usa o cenário planetário jogável como fundo, com transição discreta; mapa é adicional ao seletor e funciona offline.
- Rota horizontal única com os vinte planetas, ilustrações únicas, névoa para destinos bloqueados, ficha ilustrada com informações e JOGAR se liberado, registros distintos de fase concluída (✓) e planeta explorado (👣), foco na fase atual (🚀).
- **Limitação:** a inspeção gráfica interativa no navegador não foi possível porque a navegação local do navegador automatizado foi bloqueada pelo ambiente. O teste de emulador confirma instalação e abertura; os fluxos do mapa foram verificados na simulação automatizada de eventos de interface, **não em uma sessão completa de toque humano no dispositivo**. Conferir legibilidade e gesto de rolagem em aparelhos reais.
- Artefato compilado na GitHub Actions a partir da branch `main`, exportado como `Aventura-na-Galaxia-v0.6.3.apk`. O APK é debug para testes.

## v0.6.4 — Caixinha de surpresas com seis prêmios úteis (17/10/2026)

- **PR #9 integrado na `main`:** https://github.com/atshimura/Aventura-na-galaxia/pull/9
- **Commit de integração:** `dc2248de87364020e35faa7d986d07b8f30527ef`
- **CI final na `main`:** https://github.com/atshimura/Aventura-na-galaxia/actions/runs/39064646331 — **154 testes aprovados, compilação Android e instalação/abertura no emulador aprovadas**.
- Android debug de teste: `versionCode 10`, `versionName 0.6.4`. APK distribuído como `Aventura-na-Galaxia-v0.6.4.apk`.
- Mantidos escudo e coração recuperado. **Retirada a invencibilidade de cinco segundos apenas do sorteio de caixas**; proteção breve após dano permanece para evitar impactos consecutivos injustos.
- Novos prêmios: **ímã de moedas** por 8 segundos, **tesouro espacial** de 8 a 15 moedas, **congelamento espacial** por 6 segundos com perigos (incluindo projéteis) a 30% da velocidade original e **raio de limpeza** instantâneo que remove perigos próximos e à frente, sem destruir moedas, cristais e caixas.
- Probabilidades-base: escudo 20%, coração 18%, ímã 19%, tesouro 20%, congelamento 13%, raio 10%. Escolha reponderada apenas entre prêmios úteis: não sortear escudo já ativo, coração com vidas cheias ou raio sem perigos ao alcance; ímã/congelamento renovam sua duração sem acumular.
- HUD com indicadores para poderes temporários, animações de energia e reaproveitamento do som já existente para caixas. Prêmios de tesouro atualizam moeda na carteira e pontuação/recorde.
- **Cobertura adicional:** 18 testes específicos com casos de pesos e distribuição proporcional, renovação dos poderes, preservação de progressos, magnetismo de moedas próximas, velocidades durante congelamento, alvos do raio, colisões simultâneas e integridade do conteúdo Android.
- **Limitação:** o teste no emulador verifica instalação e abertura; o balanço dos prêmios, tempo percebido de congelamento e elementos visuais do HUD ainda devem ser experimentados no celular real. Não foi realizada uma sessão humana completa tocando todos os prêmios no aparelho.
