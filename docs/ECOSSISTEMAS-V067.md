# v0.6.7 — Fauna e obstáculos dos 20 planetas

## Contrato funcional aprovado

- 20 ecossistemas fixos; cada um tem 3 espécies próprias (60 no total), identificadas por `p<fase>-s<indice>`.
- Cada mundo tem 2 ou 3 elementos ambientais próprios (58 entradas de catálogo, entre decoração, riscos e recursos).
- Auréola (fase 1) é totalmente segura; Pedraluz (fase 2) tem obstáculos, mas nenhum predador.
- Fases 3–10 têm uma espécie hostil; fases 11–20 têm duas espécies hostis. O número de indivíduos hostis presentes no nível continua limitado.
- Alienígenas hostis causam dano exclusivamente por contato físico; não existem ataques ou projéteis de fauna planetária.
- Grupos de dois ou três podem ser pacíficos; espécies hostis respeitam território local.
- Criaturas reagem à aproximação e ao deslocamento do astronauta, sem diálogos nem botões extras.
- Todo obstáculo temporizado possui estado de aviso e de atividade; correntes e poças impulsionadoras não causam dano.
- Terreno, precipícios, checkpoints, gemas e posição de pouso não sofreram alterações de regra.
- O APK distribuído para testes é **Debug provisório**; não solicitar o workflow de Release permanente.

## Arquitetura

`web/planet-ecology.mjs` é a fonte dos nomes, formas, comportamentos, hostilidade e perigos de cada planeta.

`web/platformer.mjs` cria populações determinísticas, posiciona obstáculos afastados de precipícios e executa movimentos em torno da base da criatura (IA não pode sair do território nem entrar em buracos). Reações contemplam esconderijo, espanto, fuga, perseguição, patrulhamento, rolamento, voo, flutuação e saltos.

`web/planet-ecology-render.mjs` utiliza Canvas vetorial, sem sprites externos, para representar as espécies com silhuetas, olhos, antenas, asas e detalhes adaptados à espécie. Também desenha os obstáculos e o aviso visual dos perigos temporizados.

`web/platformer-render.mjs` aplica esses dois renderizadores à cena em solo. `web/core.mjs` mantém os mecanismos anteriores de vida, imunidade após dano, checkpoints e retorno ao foguete, acrescidos dos efeitos de obstáculos benéficos.

## Balanceamento e critérios de aceitação

- Máximo de 3 espécies e grupos pequenos por planeta, evitando criação ilimitada de entidades.
- A IA usa tempo já transcorrido, sem rede, sem intervalos assíncronos e sem RNG a cada frame.
- Inimigos camuflados ganham breve período de alerta antes de causar dano por contato.
- O desafio crescente vem de composição e temporização, não de projéteis ou ataques invisíveis.
- Testes automatizados cobrem as 60 espécies, 58 elementos de catálogo, identidade por planeta, trajetória dentro de território, grupos, reações, perigos inofensivos/temporizados, colisão e integridade de desenhos.
- O GitHub Actions compila o APK Debug, executa testes automatizados e inicia o jogo no emulador Android.

## Controle de versão

- Android `versionCode=13`, `versionName=0.6.7`.
- ID Android preservado: `br.com.aventuranagalaxia`.
- Nenhuma migração de dados de builds Debug antigos é exigida. O formato de salvamento existente permanece inalterado.
