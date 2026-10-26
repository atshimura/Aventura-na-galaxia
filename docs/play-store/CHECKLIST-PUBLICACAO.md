# Checklist de publicação — Aventura na Galáxia

## Passos técnicos automatizados no GitHub

- [x] Preservar identificador `br.com.aventuranagalaxia`.
- [x] Atualizar `targetSdk` e `compileSdk` para API 36.
- [x] Atualizar Android Gradle Plugin e Gradle do CI.
- [x] Avançar número e nome de versão para 15 / 0.6.9.
- [x] Adicionar workflow separado para `bundleRelease` com assinatura permanente em segredo e conferência do certificado SHA-256.
- [x] Preparar documento público de privacidade e página interna no jogo.
- [ ] Aprovar PR e validar testes/compilação/emulador na `main`.
- [ ] Acionar `ops/google-play-aab-request.txt` em commit exclusivo na `main`, para gerar AAB assinada.
- [ ] Baixar e verificar o artefato `aventura-na-galaxia-google-play-aab`.

## Ações no Play Console (não são executadas automaticamente por este projeto)

1. Acesse https://play.google.com/console e abra **Conta de desenvolvedor > Sobre você**. A seção **Tipo de conta** informa Pessoal ou Organização. Se não souber a data de criação, procure o e-mail de boas-vindas/recibo original; a obrigação especial também costuma constar no painel do aplicativo.
2. Em **Criar app**, cadastrar `Aventura na Galáxia`, jogo, português (Brasil). Confirmar se gratuito e sem anúncios.
3. Optar pela **Assinatura de apps do Google Play**. O AAB do GitHub já é assinado com a chave existente, que pode ser configurada como **chave de upload**, conforme o fluxo que o Console apresentar. **Nunca enviar `.p12`, senhas ou segredos a terceiros ou em conversas.**
4. Enviar AAB na faixa de **Teste interno**. Validar instalação da própria Play, abertura do WebView, áudio, evolução das fases, salvamento, compra de foguetes com moedas virtuais e controle horizontal em aparelhos reais.
5. Usar textos de `docs/play-store/FICHA-LOJA.md` e a política de privacidade pública. Subir ícone PNG (512 × 512), banner (1024 × 500) e capturas reais do jogo.
6. Preencher **Segurança dos dados**, público-alvo, conteúdo do app, classificação indicativa, disponibilidade e e-mail público de suporte com informações verdadeiras. No código atual, o jogo não solicita internet nem inclui anúncios/SDK de analytics; conferir novamente antes de declarar.
7. **Se conta pessoal criada após 13/11/2023**, cumprir teste fechado de pelo menos 12 participantes inscritos por 14 dias consecutivos para solicitar acesso à produção. Teste interno não substitui esse requisito.
8. Só depois dos testes e da aprovação, enviar a versão à produção e decidir os países de distribuição.

## Regras de segurança

- Não utilizar APK Debug para Play Console; usar exclusivamente `.aab` assinado.
- Nunca adicionar keystore, senhas, JSON de conta de serviço ou tokens ao repositório.
- Não conceder à automação permissões de publicação automática enquanto não houver uma etapa específica de aprovação.
- Atestar que não foram adicionados SDKs com rastreamento ou permissões sensíveis sem revisão da política.
- Não inventar screenshots, classificações indicativas, dados de contato ou a modalidade de conta.
- Para apps direcionados à API 36, avaliar compatibilidade de tamanhos de página de memória de 16 KB; o código Android do projeto é Java/WebView e não inclui bibliotecas NDK no código-fonte.

## Referências oficiais

- API de destino: https://support.google.com/googleplay/android-developer/answer/11926878?hl=pt-BR
- Testes para novas contas pessoais: https://support.google.com/googleplay/android-developer/answer/14151465?hl=pt-br
- Política de dados: https://support.google.com/googleplay/android-developer/answer/10144311
- Recursos de loja: https://support.google.com/googleplay/android-developer/answer/9866151?hl=pt-BR
