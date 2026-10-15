# Relatório de testes — v0.1.0

Data: 15/10/2026.

## Resultado validado
- 21 testes automatizados: **21 aprovados, 0 falhas** (Node 22, GitHub Actions).
- Compilação `assembleDebug`: **aprovada** (Gradle 8.9, JDK 17, Android SDK 35).
- APK Android gerado, validado como arquivo assinado de depuração; inclui os módulos locais.
- Emulador Android 35: **instalação e inicialização aprovadas**.
- Screenshot da tela inicial verificado: jogo na horizontal com menu e controles visíveis.
- Sem `FATAL EXCEPTION` e sem `ANR in br.com.aventuranagalaxia` no logcat da execução aprovada.
- Execução de referência: https://github.com/atshimura/Aventura-na-galaxia/actions/runs/38825459905.

## Correções realizadas
1. Remoção da dependência de pacote Android SDK `tools` obsoleto no pipeline.
2. Troca do motivo HTTP da resposta WebView `Não encontrado` por `Not Found`, exigência de caracteres ASCII.
3. Remoção do modo imersivo que acionava um aviso intrusivo e falhas de resposta no emulador, mantendo o jogo horizontal.
4. Correção dos comandos de shell no job de emulador e verificação de erros `ANR`/`FATAL EXCEPTION`.

## Limitações e próximos testes
- Primeira versão contém apenas **uma fase**. Os demais recursos estão planejados.
- A verificação de emulador cobriu **instalação, abertura e tela inicial**; não equivale a um teste de ponta a ponta de toda a jogabilidade.
- Teste de uso prolongado, entrada por toque, áudio e persistência em aparelho Android real ainda é recomendado.
