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
