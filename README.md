# 🚀 Aventura na Galáxia

Jogo de exploração espacial para Android, em português, com visual de desenho animado. **Versão 0.1.0: primeiro protótipo jogável**, não o jogo completo de 20 fases.

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