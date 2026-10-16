# 🚀 Aventura na Galáxia

Jogo de exploração espacial para Android, em português, com visual de desenho animado. **Versão 0.4.0: campanha com planetas visitáveis, biomas próprios e novos perigos**, não o jogo completo de 20 fases.

## O que já funciona
- Tela horizontal, voo para a direita, comando por arrastar o dedo.
- 3 vidas e colisões com asteroides, satélites e naves (sem armas); imunidade breve após dano.
- Moedas douradas que valem 1 ponto e 1 moeda na carteira; recorde e carteira persistidos.
- Dificuldades Fácil, Normal e Difícil.
- Caixas-surpresa com escudo, coração ou invencibilidade.
- Música procedural de exploração e efeitos sonoros, com opção de desligar.
- Pausa e retomada; pausa automática ao perder foco.
- Fase 1 com chegada à estação espacial, conserto de 1 coração por 25 moedas.
- Salvamento local no aparelho (WebView/localStorage), sem internet, sem permissões de rede.

## Como testar no computador
Requer Python 3 e navegador moderno.

```sh
python3 -m http.server 8765 --directory web
```

Abra `http://localhost:8765` e coloque o navegador em modo horizontal. O teste de interface pode ser feito com mouse ou toque.

## Testes automatizados (Node 22)

```sh
npm test
```

## Como compilar o APK
Na raiz deste repositório, o workflow `.github/workflows/android-apk.yml` executa testes de regras, compila `app-debug.apk` e tenta um teste de inicialização no emulador Android em push/PR ou manualmente em **Actions → Testes e APK Android → Run workflow**. Na execução concluída, baixe o artefato **aventura-na-galaxia-debug-apk** e extraia o APK.

Também é possível abrir a pasta `android` no Android Studio com SDK 35/JDK 17/Gradle 8.9 e executar `assembleDebug`. O APK é de depuração, destinado a testes e não a publicação na Play Store.

## Próximas etapas planejadas
- 20 fases principais progressivas e 10 fases da Galáxia das Maravilhas.
- Estações, loja de foguetes, melhorias de motores/escudos/radar e vários modelos.
- Planetas de fantasia nomeáveis, exploração livre, passagens secretas e tesouros.
- Alienígenas amigos/adversários, diálogos com escolhas e missões secretas.
- Testes em emulador Android e testes em celulares reais.

Veja [`docs/PLANO.md`](docs/PLANO.md) para os requisitos completos.
## Situação da validação

- **21 testes automatizados aprovados** (regras e estrutura).
- **APK de depuração compilado** e publicado como artefato pelo GitHub Actions.
- **Teste de inicialização Android 35 aprovado no emulador**, com captura de tela, sem FATAL EXCEPTION ou ANR no processo do jogo.
- Execução aprovada: [GitHub Actions #38825459905](https://github.com/atshimura/Aventura-na-galaxia/actions/runs/38825459905).
- Validação manual da jogabilidade em aparelho real ainda recomendada.

## Novidades da versão 0.2.0
- Trilha musical instrumental e efeitos feitos com Web Audio e gerados localmente (sem acesso à internet). A reprodução começa após tocar em **JOGAR**; o menu permite desligá-la.
- **Controle analógico virtual no canto inferior direito**, com área central neutra e movimentação em todas as direções. O controle antigo de arrastar e setas do teclado também continuam disponíveis.
- Naves alienígenas e satélites com gradientes metálicos, painéis solares, antenas e luzes.
- Nos últimos oito segundos, a estação espacial entra progressivamente no cenário e o foguete realiza automaticamente uma manobra de estacionamento antes de concluir a fase.
- Testes da música, do joystick, do ciclo de vida, da aproximação e da acoplagem.

A fase 1 continua sendo um protótipo; futuros mundos e missões não estão implementados.

## Novidades da v0.3.0 — campanha principal de 20 fases
- **20 regiões nomeadas** com paletas de cores próprias, planetas e fundos variáveis.
- Menu de seleção de fase, apenas fases desbloqueadas; após chegar à estação, a próxima é liberada.
- Níveis com dificuldade crescente: mais obstáculos e velocidade, com novos padrões de movimento dos obstáculos introduzidos progressivamente.
- Duração por fase varia de 48 a 68 segundos, incluindo a manobra final de estacionamento.
- Corações restantes passam para a próxima fase, com reparo na estação a 25 moedas por coração; após perder todas as vidas, a mesma fase pode ser repetida com três corações.
- Pontuação por fase registrada localmente, compatível com salvamentos anteriores.
- Ao vencer a fase 20, registra-se a descoberta da **Galáxia das Maravilhas**. A exploração livre e suas dez fases permanecem para uma etapa futura.

Para desenvolver: loja, missões, diálogos e conteúdo especial da galáxia secreta ainda não integram esta versão.

## Versão 0.4.0 — novas fases visualmente distintas e planetas exploráveis
- Cada fase tem um **planeta próprio** e paisagem associada (gelo, florestas luminosas, cristais, lava, oceanos, desertos, ruínas, cidades, tempestades etc.).
- Durante o voo, um planeta entra em cena. Ao tocar em **🪐 EXPLORAR PLANETA**, o tempo da fase fica suspenso e o foguete começa uma incursão de cerca de 16 segundos, com novos perigos do bioma e **cristais que valem 3 moedas**.
- Ao concluir a incursão, o jogador pode **escolher e salvar um nome para o planeta**, retornando à mesma fase. Os planetas descobertos e seus nomes são preservados no armazenamento local.
- **Novos perigos cumulativos** aparecem nas fases avançadas: destroços (4), cometas (5), minas (7), plasma (9), drones (12), cristais perigosos (15) e vórtices (18). Asteroides, satélites e naves das fases anteriores continuam aparecendo.
- O menu indica quais planetas já foram explorados. Música, joystick, caixas-surpresa e acoplagem à estação permanecem.
- A incursão ao planeta é opcional; ainda não implementa exploração totalmente livre, diálogos alienígenas nem missões secundárias. Esses recursos permanecem no planejamento.

**Instalação:** APK de desenvolvimento (assinatura de debug). Faça cópia das informações importantes antes de desinstalar versões anteriores.
