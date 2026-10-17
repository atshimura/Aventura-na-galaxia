# Planejamento — Aventura na Galáxia

## Escolhas confirmadas
- Android, celular na horizontal; foguete voa à direita e acompanha o arrastar do dedo.
- Três corações, sem armas; obstáculos estáticos inicialmente e móveis nas fases avançadas.
- Modo Aventura: 20 fases, dificuldades Fácil/Normal/Difícil, chegada à estação espacial a cada fase.
- Modo Infinito e recordes; ao perder 3 vidas, reiniciar a mesma fase.
- Moedas douradas dão pontos e compram foguetes, radar, melhorias e consertos de 25 moedas/coração.
- Foguetes personalizáveis, motores, controle, escudos, poderes e radar aprimoráveis.
- Caixas-surpresa com poderes; música de aventura espacial.
- Galáxia de fantasia com planetas nomeáveis pelo jogador e ambientes diferentes.
- Alienígenas amigos com diálogos e escolhas; adversários que colocam obstáculos.
- Exploração com o foguete, baús, passagens secretas, missões de busca e pilotagem.
- Final da fase 20: Estação Espacial Lendária desbloqueia a Galáxia das Maravilhas.
- Galáxia das Maravilhas: 10 fases adicionais, exploração livre entre planetas e suas regiões.
- Salvamento local automático.

## Etapas de implementação
1. **v0.1.0 (concluída):** primeira fase, obstáculos, moedas, vidas, dificuldades, caixas-surpresa, pausa, áudio, estação e conserto; APK compilado e abertura verificada no emulador.
2. **v0.2.0 (concluída):** música instrumental offline, joystick virtual no canto direito, satélites e naves mais detalhados, aproximação e estacionamento animados; 43 testes automatizados, APK e emulador aprovados.\n3. **v0.3.0 (concluída):** 20 fases principais com temas, duração e padrões de obstáculos progressivos; seleção/desbloqueio e salvamento de pontuação por fase. Modo Infinito fica para a próxima versão.
4. **Economia:** loja de foguetes, melhorias e radar, custos equilibrados e progressão persistente.
5. **Exploração:** planetas, nomes, regiões secretas, missões, diálogos e personagens.
6. **Conteúdo final:** estação lendária, Galáxia das Maravilhas, 10 fases extras e testes ampliados.

4. **v0.4.0 (concluída):** biomas e planos de fundo distintos para 20 planetas; novos perigos liberados progressivamente sem remover os anteriores; incursão pilotável de 16 segundos por planeta, cristais, nomeação e salvamento local. Testes automatizados e emulador Android aprovados.

## Testes futuros
Ampliar testes de jogabilidade automatizados no Android e validar toque, áudio, colisões, desempenho e persistência em celulares reais.

## Entrega v0.5.0
- Cenários ampliados com árvores e criaturas por bioma; visual detalhado, sem integração externa.
- Astronauta pode sair e voltar ao foguete durante a exploração de um planeta, com joystick.
- Garagem com quatro foguetes, compras por moedas e habilidades diferentes, salvas localmente.
- Modo Infinito com ondas de dificuldade e recorde separado.
- Naves alienígenas disparam lasers nas fases avançadas.
- Próximos trabalhos: inimigos com padrões de tiro ainda mais variados, novas missões e regiões maiores para caminhar.

## v0.6.0 — Entrega e decisões consolidadas
- **Sem nova rodada de perguntas:** desenvolver progressivamente com testes e refinamentos.
- Escolha de movimento do astronauta: **A** — caminhar, correr e saltar (plataforma lateral 2D).
- Exploração livre, sem cronômetro ou missão obrigatória, com volta voluntária ao foguete.
- Fauna variada, com criaturas amigáveis e perigosas; equipamentos e interações mais complexas permanecem para versões posteriores.
- Terrenos naturais e mecânicos por planeta, com trechos sólidos, precipícios e perigos próprios.
- Três corações e checkpoints: ao zerar, o astronauta volta ao último dispositivo ativado com os corações recuperados.
- A versão 0.6.0 implementa **primeiro ciclo jogável de plataforma** com animação de pouso, desembarque, corrida, gravidade, salto, cristais, perigos, checkpoints, embarque e decolagem.
- O joystick do foguete atua diretamente no quadro, reduzindo a latência percebida; novo arranjo instrumental e reguladores de volume individuais.
- Refinamentos futuros: mais terrenos por planeta, colisão em plataformas elevadas, criaturas com comportamentos variados e ajustes finos do controle baseados em testes reais.

## Revisão da progressão terrestre — v0.6.2
- A primeira visita deve funcionar como tutorial acessível, com terreno plano, nenhum precipício e nenhuma ameaça nociva.
- Os perigos aparecem de maneira cumulativa; primeiro obstáculo na fase 2, primeiro buraco curto na fase 3, outros nas fases 5, 7 e 9 e alargamento gradual, verificando alcance máximo do salto.
- A cada planeta, preservar identidade específica do cenário, da flora/fauna e dos obstáculos. Diferenciar inclusive planetas com o mesmo bioma.
- Manter exploração livre, checkpoints, garagem e progressão de voos.


## Decisão confirmada — fundo dinâmico da tela principal (pendente de implementação)
- **Usar o seletor de fases que já existe no menu principal; não criar outro seletor ou reestruturar o menu.**
- Ao selecionar uma fase existente, a imagem de fundo da própria tela principal deve mudar para mostrar o cenário correspondente ao planeta daquela fase. Exemplos: fase 1, Auréola; fase 3, Safira; fase 4, Florália.
- A prévia usa, preferencialmente, os mesmos cenários dos 20 planetas que já existem no jogo, para representar fielmente o que o jogador encontrará.
- Trocar o fundo assim que a seleção mudar, com transição visual discreta, preservando contraste e legibilidade dos botões e textos.
- Ao retornar ao menu, o fundo deve refletir a fase selecionada naquele momento.
- **Apenas decisão de produto registrada; implementação expressamente adiada até nova autorização do usuário.**

## Mapa de progresso das fases — decisões de design em andamento (não implementar ainda)
- Analisar um mapa estelar com 20 destinos, ligados por rota visual, indicando fase concluída, fase atual/desbloqueada e destinos ainda bloqueados.
- Manter conceitualmente separados os estados `fase concluída` e `planeta explorado`, porque o jogo registra ambos independentemente.
- Reaproveitar progresso já salvo por fase, pontuações e nomes dos planetas. Não presumir critérios adicionais de pontuação/estrelas antes da definição.
- Uma proposta é abrir o mapa a partir de um botão próprio na tela principal, mantendo o seletor de fase atual, e permitir selecionar pelo mapa fases já liberadas.
- A apresentação, posição do acesso ao mapa, interação e demais detalhes precisam de decisão do usuário. Não há implementação autorizada.


### Decisões adicionais confirmadas — Mapa da Galáxia (design, NÃO implementar ainda)
- O mapa será uma **tela adicional**, acessível a partir do menu principal. **Manter o seletor de fases atual**, sem substituí-lo.
- O mapa será **horizontal**, com navegação por deslocamento lateral, seguindo uma viagem espacial da esquerda para a direita.
- **Todos os 20 planetas estarão em um único mapa contínuo**, não dividido em regiões ou telas separadas.
- A rota será **irregular, sinuosa e orgânica**, com curvas, alturas e espaçamentos variados; **evitar grades, linhas retas e organização simétrica**.
- Cada fase será representada por **uma ilustração própria do planeta correspondente**, aproveitando as identidades visuais dos 20 planetas já existentes; não usar círculos genéricos numerados como principal representação.
- Os elementos de progresso (concluída, atual/disponível, bloqueada, explorada) devem ser definidos visualmente sem confundir a conclusão espacial da fase com a exploração de seu planeta.
- A interação ao tocar um planeta já foi definida em seção posterior; detalhes finos de desenho e navegação continuam em discussão. **Nenhuma implementação autorizada.**


### Decisão confirmada — interação com os planetas no mapa
- **Opção A confirmada:** tocar em um planeta no Mapa da Galáxia abre uma **ficha do planeta**, e não inicia imediatamente a fase.
- A ficha apresentará **ilustração ampliada própria do planeta**, nome, número da fase, **melhor pontuação**, indicador de fase concluída e indicador separado de **planeta já explorado**.
- Para planetas desbloqueados haverá botão **JOGAR**, que inicia a fase escolhida a partir da ficha.
- O tratamento de planetas bloqueados e a apresentação visual detalhada da rota ainda serão definidos nas próximas decisões.
- **Somente especificação de produto registrada. Não implementar o mapa ou alterar o aplicativo até nova autorização expressa.**


### Decisão confirmada — caminho misterioso e névoa espacial no mapa
- **Opção B escolhida pelo usuário:** a representação do progresso no Mapa da Galáxia terá um **caminho misterioso**. A parte percorrida da rota estará iluminada; as regiões ainda não alcançadas ficarão envolvidas em névoas espaciais, com planetas futuros **parcialmente encobertos**.
- O mapa continua **adicional ao seletor existente**, horizontal, de rolagem contínua, com os 20 planetas ilustrados individualmente em uma trilha sinuosa e assimétrica.
- O jogador poderá tocar em cada planeta para abrir uma ficha ilustrada; fases desbloqueadas oferecem a ação JOGAR. Os detalhes de informação apresentados para planetas bloqueados ainda estão em discussão.
- **Opção A confirmada:** a névoa espacial que encobre um planeta se dissipa quando a fase correspondente é **desbloqueada**, mesmo que o astronauta ainda não tenha pousado ou explorado esse planeta. O planeta desbloqueado aparece claramente ilustrado. As fases ainda bloqueadas permanecem parcial e visualmente encobertas.
- A exploração do planeta **não é requisito** para dissipar a névoa e continua sendo indicada separadamente na ficha/mapa.
- **Somente registro da decisão de design; não implementar a funcionalidade ou alterar o código do aplicativo.**

### Ponto pendente — informações sobre planetas bloqueados
- A definir com o usuário: ao tocar em um planeta bloqueado, sua ficha mostra somente nome/número e condição para desbloqueio, ou revela informações adicionais. A resposta não altera a regra confirmada da névoa no próprio mapa.
- Não implementar até autorização expressa.
