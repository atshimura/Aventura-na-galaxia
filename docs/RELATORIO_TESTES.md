# Validação — Aventura na Galáxia v0.5.0

## Entrega e histórico

- Código integrado na branch `main` pelo [PR #4](https://github.com/atshimura/Aventura-na-galaxia/pull/4).
- Commit de integração: `d0fea8e21e98d47e928490f2300c1732bce8e525`.
- Execução final na main: https://github.com/atshimura/Aventura-na-galaxia/actions/runs/39026841168.
- APK Android: `versionCode=5`, `versionName=0.5.0`, assinado como **debug**, indicado para testes.

## Testes executados

- **97 testes automatizados aprovados**, zero falhas: regras da campanha, navegação planetária, loja, compra e equipagem, modos, escudos, lasers, astronauta, persistência e verificação da interface estática.
- `assembleDebug` do Gradle: **sucesso**, com os módulos e recursos dentro do APK.
- Emulador Android API 35: **instalação e inicialização aprovadas**, com artefatos de screenshot e logcat.
- Captura verificada mostra os comandos Modo Infinito, Loja de Foguetes, escolha de fase e dificuldade no menu Android.
- Versão de navegador de arquivo único montada com os assets extraídos do APK final; JavaScript verificado com `node --check`.

## Funcionalidades novas

1. Fauna e flora procedurais de biomas: árvores, cactos, algas, peixes, animais terrestres, criaturas suspensas, robôs e ruínas.
2. Astronauta pode sair do foguete no planeta, caminhar com joystick, coletar cristais e retornar à nave.
3. Garagem com Aurora (gratuito), Cometa Azul (60 moedas), Flor Estelar (120) e Guardião Solar (200), com diferenças de controle, aparência e proteção.
4. Modo Infinito: dificuldade aumenta a cada onda e recorde salvo separado da campanha.
5. Naves alienígenas (da fase 3 em diante) disparam lasers que provocam dano e podem ser bloqueados pelo escudo.

## Limitações e próximas validações

- O teste automatizado no emulador verifica **abertura e ausência de falhas fatais**; não é um teste completo de toque, compra, caminhada e combate no Android.
- A escuta da música, precisão do joystick e conforto dos menus em diferentes celulares devem ser avaliados manualmente.
- A exploração a pé é um primeiro modo dentro da região planetária, não um mundo aberto completo.
- O APK possui assinatura de debug gerada pelo CI; pode ser necessário desinstalar uma versão anterior, com perda do progresso local, para instalar.
