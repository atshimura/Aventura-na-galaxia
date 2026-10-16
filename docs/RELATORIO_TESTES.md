# Validação — v0.3.0 · Campanha de 20 fases

## Resultado final
- **57 testes automatizados passaram, sem falhas**, na branch e na `main`.
- `assembleDebug` via GitHub Actions (Android SDK 35, Gradle 8.9, Java 17): **aprovado**.
- **Instalação e abertura no emulador Android 35**: aprovada na execução oficial da `main`, com processo vivo, captura de tela limpa e sem erro fatal nem ANR específico do aplicativo.
- APK `versionName=0.3.0`, `versionCode=3`, build de debug.
- Captura de tela verificada: seletor de fase, título, botão de jogar, dificuldade e indicadores visíveis.
- Execução CI final: https://github.com/atshimura/Aventura-na-galaxia/actions/runs/38980977195.
- Código integrado pelo [PR #2](https://github.com/atshimura/Aventura-na-galaxia/pull/2).

## Funcionalidades implementadas
1. Aventura com 20 fases nomeadas: dificuldade e duração progressivas.
2. Obstáculos com cinco padrões de movimento introduzidos em níveis progressivos.
3. Paletas e aparência de cenário por fase, com variação dos planetas.
4. Seleção de fases desbloqueadas, avanço após o acoplamento e repetição da fase.
5. Salvamento automático de progresso, recordes, moedas e corações entre estações, com conserto de 25 moedas por coração.
6. Descoberta da Galáxia das Maravilhas registrada após a fase 20. O conteúdo secreto será implementado futuramente.
7. Música e joystick da v0.2.0 preservados.

## Testes pendentes
- Jogabilidade real com toque no celular: velocidade/precisão do joystick, colisões e alternância entre fases.
- Testes de longa duração e desempenho com muitas moedas/obstáculos.
- Balanceamento de dificuldade com jogadores, principalmente nos níveis avançados.
- Modo Infinito, novas missões, exploração livre e fases secretas ainda não implementados.

**Observação:** as fases desta versão variam em cores, parâmetros de desafio e trajetórias dos obstáculos; não são vinte níveis ilustrados manualmente com personagens e histórias próprios. Essas experiências serão expandidas em futuras versões.
