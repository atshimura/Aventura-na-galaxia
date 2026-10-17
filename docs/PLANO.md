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
