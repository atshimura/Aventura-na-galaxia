# Relatório de validação — Aventura na Galáxia v0.2.0

## Execução de referência
GitHub Actions (commit de código `1cce32e1d6b5f86579e50d90dc13f85e61a84685`):
https://github.com/atshimura/Aventura-na-galaxia/actions/runs/38977266884

PR integrado: https://github.com/atshimura/Aventura-na-galaxia/pull/1

## Resultado
- Testes automatizados Node: **43 aprovados, 0 reprovados**.
- Compilação Android Gradle `assembleDebug`: **sucesso**. APK `versionName=0.2.0`, `versionCode=2`.
- Instalação e inicialização do APK no emulador Android (API 35): **sucesso**.
- Inspeção do arquivo APK: módulo `music.mjs`, jogo, `main.mjs`, `core.mjs`, CSS e HTML incluídos em `assets/`.
- Teste interativo no Chromium com os assets extraídos **do APK compilado**, feito adicionalmente:
  - Áudio inicializado após clicar em JOGAR: `AudioContext.state=running` e agendamento de notas (etapa 4 após ~800 ms).
  - Controle virtual à direita: deslocou alvo do foguete do X=153 para X≈358.
  - Ao chegar ao tempo restante de oito segundos: estado `docking`, estação visível, controle suspenso.
  - Passados mais oito segundos: estado `victory`, foguete parado junto ao porto da estação.
  - **Nenhuma exceção JavaScript** durante o teste de interface.

## Mudanças
1. Música instrumental em Web Audio iniciada por gesto, com controle liga/desliga e sem baixar áudio externo.
2. Satélites e naves redesenhados com detalhamento técnico e efeito de profundidade em 2D.
3. Entrada gradual da estação e manobra automática de acoplagem antes da vitória.
4. Joystick analógico no canto inferior direito, mantendo arrasto e setas/WASD.

## Observações e testes futuros
- A música foi validada tecnicamente (contexto ativo e notas agendadas); a qualidade e volume no alto-falante do aparelho requerem escuta humana.
- A primeira fase continua sendo o protótipo atual; as demais fases estão planejadas.
- Recomenda-se testar com os dedos em telas Android reais de diferentes dimensões, incluindo conforto da velocidade e posição do joystick.
- O APK é **debug**, destinado a testes; uma distribuição final exigirá assinatura e publicação apropriadas.
