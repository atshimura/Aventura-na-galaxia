# Relatório de validação — Aventura na Galáxia v0.4.0

## Entrega
- Pull request integrado: https://github.com/atshimura/Aventura-na-galaxia/pull/3
- Commit da main: `1fdcf91b320008dc0fa44188e9f0301d90a694dd`
- GitHub Actions main: https://github.com/atshimura/Aventura-na-galaxia/actions/runs/38984060191
- Android `versionCode 4`, `versionName 0.4.0`; APK de debug.

## Validação concluída
- **71 testes Node aprovados (0 falhas).** Incluem progressão, tipos cumulativos de obstáculos, vinte planetas, salvamento e compatibilidade com dados antigos, colisões, controles, cristal com recompensa, relógio pausado ao explorar, nomeação e retorno à estação.
- **Compilação assembleDebug aprovada** com Gradle e Android SDK pelo GitHub Actions.
- **Teste de instalação e abertura no emulador Android 35 aprovado** na branch do PR e na main. Captura de tela e logcat armazenados como artefatos.
- O APK gerado contém os arquivos `world.mjs`, `world-render.mjs`, `core.mjs`, `main.mjs`, `music.mjs`, CSS e HTML.

## Funcionalidade nova
- Vinte planetas próprios com paisagens de gelo, floresta, lava, deserto, oceano, cristais, cidades, ruínas, portais etc.
- Planeta opcional surge durante a travessia da fase e pode ser visitado usando botão dedicado.
- Na visita, o tempo orbital congela; o foguete explora um trecho lateral de ~16s com obstáculos do bioma e cristais que rendem 3 moedas.
- A visita permite nomear o planeta (opcional). Registro do planeta descoberto e seu nome persistem localmente.
- Obstáculos cumulativos: asteroides, satélites, naves, destroços, cometas, minas, plasma, drones, cristais perigosos e vórtices.

## Limites de validação
- O emulador confirma instalação e abertura, mas **não testou manualmente cada uma das 20 fases em tela real**.
- Os testes do fluxo jogável são simulações automatizadas de interface e lógica, não uma sessão com toque e áudio em aparelho físico.
- A exploração de planetas é uma primeira incursão lateral opcional; **livre circulação entre planetas, conversas com alienígenas, missões secundárias e Galáxia das Maravilhas não estão implementadas nesta versão**.
- O APK usa assinatura de depuração que pode diferir de versões anteriores. Se a atualização exigir desinstalação, os dados locais poderão ser perdidos.

## Próximos testes recomendados
Jogar em um aparelho Android: experimentar botão EXPLORAR PLANETA, tempo de incursão, joystick, coleta e nomeação; verificar dificuldade e legibilidade em telas pequenas.
