# 🚀 Aventura na Galáxia

Jogo de exploração espacial para Android, em português, com visual de desenho animado. **Versão 0.4.0: campanha com planetas visitáveis, biomas próprios e novos perigos**, não o jogo completo de 20 fases.

## O que já funciona
- Tela horizontal, voo para a direita, comando por arrastar o dedo.
- 3 vidas e colisões com asteroides, satélites e naves (sem armas); imunidade breve após dano.
- Moedas douradas que valem 1 ponto e 1 moeda na carteira; recorde e carteira persistidos.
- Dificuldades Fácil, Normal e Difícil.
- Caixas-surpresa com seis prêmios úteis: escudo, coração, ímã de moedas, tesouro espacial, congelamento e raio de limpeza.
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

## Novidades v0.5.0
- **Planetas vivos** com árvores, cactos, florestas bioluminescentes, algas, peixes, criaturas alienígenas, robôs e fauna adaptada aos diferentes biomas. Ilustrações são geradas no Canvas e não exigem internet.
- **Astronauta desembarca**: durante a exploração planetária, botão *SAIR DO FOGUETE*, movimento pelo joystick e *VOLTAR AO FOGUETE*. Cristais podem ser coletados caminhando.
- **Garagem e desbloqueio de foguetes**: Aurora (grátis), Cometa Azul (60 moedas), Flor Estelar (120) e Guardião Solar (200). O foguete selecionado fica salvo, muda de aparência e possui diferenças de controle/proteção.
- **Modo Infinito** com ondas progressivas, dificuldades crescentes e recorde de moedas salvo em separado. Duração ilimitada até perder os três corações.
- **Lasers inimigos**: a partir da fase 3, naves alienígenas disparam projéteis horizontais que podem ser desviados ou bloqueados pelo escudo.
- Mantém as 20 fases, visita de planetas, música, joystick e histórico de moedas.

## Novidades v0.6.0
- Trilha instrumental sintetizada mais rica (baixo, melodia, contraponto, arpejos e percussão), com reforço de volume e compressor para evitar distorção.
- Controles individuais de volume da música e dos efeitos. Joystick move a nave sem demora acumulada e fica disponível também na caminhada.
- **Exploração terrestre reconstruída:** aproximação e pouso na superfície, escotilha, desembarque, caminhada lateral/corrida com animação, salto com gravidade e botão próprio, terreno contínuo e câmera que acompanha o astronauta.
- Obstáculos terrestres, precipícios, fauna amiga e perigosa, cristais coletáveis e pontos de salvamento. Ao perder três corações, o astronauta reaparece no último ponto salvo, restaurado.
- Sem limite de tempo para explorar. Para retornar, é preciso voltar ao foguete e embarcar; a decolagem leva ao registro/nomeação do planeta.
- A campanha espacial, a garagem e o Modo Infinito continuam disponíveis.

## Correção v0.6.1 — controles da caminhada
- O foguete continua usando o joystick no canto direito durante o voo.
- Ao desembarcar, surge um **joystick verde à esquerda**, com indicações ◀ e ▶ e área de toque ampliada. Ele move o astronauta horizontalmente e permite caminhar devagar ou correr.
- O botão **PULAR fica à direita** e pode ser pressionado ao mesmo tempo que o joystick (multitoque).
- Joystick terrestre e espacial usam capturas de ponteiro independentes; ao soltar o polegar, trocar de estado, pausar ou perder foco, os comandos são zerados para evitar movimento involuntário.
- O teclado também permite esquerda/direita (A/D ou setas) e salto (Espaço/seta para cima).
- Ajuste da velocidade do astronauta proporcional à inclinação do joystick, preservando gravidade e saltos.

## Versão 0.6.2 — Mundos distintos e aprendizagem progressiva
- **Planeta da fase 1 (Auréola) é totalmente seguro para aprender:** solo plano e contínuo, **sem buracos, obstáculos nocivos ou criaturas hostis**; cristais, criaturas amigas e pontos de salvamento continuam disponíveis.
- Etapa 2 apresenta o primeiro perigo terrestre simples; a partir da fase 3 aparece um pequeno precipício. Outros buracos estreiam nas fases **5, 7 e 9**, e suas larguras aumentam gradualmente nas fases posteriores sem exigir saltos impossíveis.
- Quantidade de obstáculos e criaturas hostis progride com a fase; cada bioma possui perigos característicos.
- **20 cenários visualmente diferenciados** por paisagens próprias: cortinas de aurora, crateras de asteroides, pináculos gelados, árvores gigantes, portais, vulcões, vales de cristais, dunas, ilhas oceânicas, cidades iluminadas, jardins suspensos, ruínas, cânions, cachoeiras, corais, grandes anéis, tempestades elétricas, luas gêmeas, pontes de estrelas e templos dourados.
- Mundos do mesmo bioma têm cenários diferentes, como florestas gigantes versus jardins suspensos, oceanos flutuantes versus cachoeiras e cidades tecnológicas versus templos.
- Mantêm-se os controles v0.6.1: joystick terrestre à esquerda, salto à direita e exploração sem limite de tempo.

## Versão 0.6.3 — Mapa da Galáxia e cenário do menu
- O seletor original permanece no menu; quando o jogador muda a fase, a tela principal passa a desenhar o **próprio cenário do planeta selecionado**, com transição suave de 430 ms.
- Novo botão **MAPA DA GALÁXIA**, adicional à seleção existente.
- Mapa horizontal com os 20 planetas ilustrados individualmente e conectados por um caminho irregular. O deslocamento é feito por toque e rolagem lateral nativa; abre centralizado na fase mais avançada desbloqueada.
- A névoa cobre fases bloqueadas e desaparece assim que cada fase é desbloqueada, independentemente da exploração.
- Fase concluída (✓) e planeta explorado (👣) recebem símbolos diferentes; foguete (🚀) destaca a fase atual.
- Ao tocar num planeta, uma ficha se abre sobre o mapa. Planetas desbloqueados exibem ilustração ampliada, nome, descrição, recorde e botão JOGAR; bloqueados preservam nome e ilustração ocultos, mostrando apenas silhueta, número e regra de desbloqueio.
- Fechar a ficha mantém a posição de rolagem do mapa. Navegação por teclado: setas para deslocar e Escape para fechar ficha ou mapa.
- Tudo funciona offline; sem novas bibliotecas ou servidores. Progresso e nomes aproveitam o salvamento local anterior.

## v0.6.4 — Caixinha de surpresas ampliada
- Seis prêmios: escudo, recuperação de coração, ímã de moedas (8 s), tesouro espacial (+8 a +15 moedas), congelamento (6 s, perigos com 30% da velocidade), e raio de limpeza (elimina perigos próximos e à frente).
- Pesos-base: escudo 20%, coração 18%, ímã 19%, tesouro 20%, congelamento 13%, raio 10%. Apenas opções úteis entram no sorteio, e os pesos restantes são renormalizados.
- Coração não é sorteado com 3 vidas; escudo não é sorteado se já houver um ativo; limpeza somente quando há perigo no alcance. Ímã e congelamento podem ser sorteados novamente e **reiniciam** seus respectivos temporizadores, sem acumular duração.
- Tesouro espacial incrementa carteira, pontos e recordes. A coleta de moedas por ímã funciona durante o voo; os perigos (incluindo projéteis) são reduzidos a 30% da velocidade normal durante congelamento, sem desacelerar a nave.
- Ícones com contagem regressiva, feedback sonoro existente e sinais visuais para poderes ativos.
- A invencibilidade longa deixa de ser um prêmio. A proteção curta após dano, colisão com escudo e mudanças de modo permanece, prevenindo dano repetido.
- Durações de poderes contadas durante o voo ativo, sem gastar tempo durante pausa ou exploração no planeta.
