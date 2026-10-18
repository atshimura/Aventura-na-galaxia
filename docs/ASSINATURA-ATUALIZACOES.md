# Assinatura permanente e atualizacoes Android

## Objetivo
A partir da v0.6.5, os APKs destinados ao usuario devem ser montados pelo workflow **APK Android assinado para atualizacoes**.
O APK **Debug** gerado por `.github/workflows/android-apk.yml` e destinado somente a testes, podendo ter certificado diferente a cada GitHub Actions. **Nunca distribuir Debug como atualizacao sobre um Release assinado.**

A instalacao por cima exige:
1. mesmo `applicationId`: `br.com.aventuranagalaxia`;
2. certificado de assinatura compativel em ambas as versoes;
3. `versionCode` superior na nova versao;
4. instalacao Android normal sem desinstalar. Atualizacao nao e download automatico.

## Passo humano necessario (executar no proprio computador, nunca enviar senhas a um chat)

**Uma unica vez.** Gerar a chave com Java/JDK 17 ou Android Studio. No PowerShell, por exemplo:

```powershell
keytool -genkeypair -v -keystore "$env:USERPROFILE\Documents\aventura-release.p12" -storetype PKCS12 -alias aventura -keyalg RSA -keysize 3072 -validity 12000
```

Escolher uma senha forte e guardá-la em um gerenciador de senhas. A chave e a senha devem ter cópias de segurança fora do repositório e ser mantidas por muitos anos; perder a chave pode impedir futuras atualizações fora da Play Store.

Obter o SHA-256 **público** do certificado:

```powershell
keytool -list -v -keystore "$env:USERPROFILE\Documents\aventura-release.p12" -alias aventura
```

Copiar somente o SHA256 da chave de assinatura (não a chave privada) para a variável do GitHub `AVENTURA_CERT_SHA256`.

Gerar o conteúdo Base64 da chave **localmente** e copiar diretamente para o GitHub (não colar em issues, PRs, chat, docs, nem logs):

```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("$env:USERPROFILE\Documents\aventura-release.p12")) | Set-Clipboard
```

Em **Settings → Secrets and variables → Actions** do repositório, criar:
- **Repository secret** `AVENTURA_KEYSTORE_BASE64`: conteúdo Base64 copiado;
- **Repository secret** `AVENTURA_SIGNING_PASSWORD`: senha da chave PKCS12;
- **Repository variable** `AVENTURA_CERT_SHA256`: impressão digital SHA-256 pública do certificado.

Nunca incluir um arquivo `.p12`, `.jks`, senhas ou Base64 da chave no Git.
O workflow recupera a chave apenas no executor temporário, valida o alias fixo `aventura`, compila `:app:assembleRelease`, confere criptograficamente o certificado e valida a identidade do pacote. O APK assinado só é publicado após testes, compilação e instalação no emulador.

Depois, abrir **Actions → APK Android assinado para atualizacoes → Run workflow**, selecionar `main` e executar. Baixar o artefato `aventura-na-galaxia-APK-ASSINADO-ATUALIZAVEL` (ZIP com o `app-release.apk`).

### Publicacoes seguintes
- Atualizar `versionCode` para número **maior** do que o último Release, e `versionName` para a nova versão visível.
- Não trocar o `applicationId`, o alias `aventura` ou a chave.
- Executar o mesmo workflow manual na `main`; somente o artefato Release assinado por esse fluxo serve como atualizador.
- Guardar ao menos dois APKs Release consecutivos e testar uma instalação vN → vN+1 com `adb install -r` e verificação de dados salvos.

### ATENÇÃO: migração da 0.6.4 (Debug) para a primeira versão assinada
O fluxo anterior do GitHub Actions gerou APKs **Debug com certificados distintos**. A chave privada deles não está disponível neste repositório, e o sistema Android não permite atualizar uma instalação com certificado incompatível.
**Não desinstalar o APK anterior até planejar e verificar a preservação dos dados.**

O app atualmente armazena moedas, progresso, recordes e foguetes comprados no `localStorage` de uma WebView. `android:allowBackup="true"` está ativo no Manifest, porém o Backup automático depende da configuração do dispositivo, da versão Android e da restauração da plataforma; não há garantia de recuperar todos os dados após desinstalação.

A transição exige uma estratégia de migração verificada no aparelho (por exemplo, extração assistida dos dados do APK Debug instalado e importação na nova versão por meio de um recurso de restauração a ser desenvolvido/testado). Não afirmar que o novo APK preservará os dados instalados da 0.6.4 até validar a transição no dispositivo real.

## Estados de seguranca
- Faltam segredos/variável ou senha inválida → job de assinatura falha; **não publica Release**.
- Certificado diferente do SHA-256 cadastrado → job falha; **não publica Release**.
- `applicationId` incorreto, assinatura inválida ou `versionCode <= 10` → job falha; **não publica Release**.
- Pull request ou branch diferente de `main` → não recebe capacidade de assinar o APK de distribuição.
- O workflow Debug de testes continua independente dos segredos e não deve ser oferecido como APK atualizável.

## Acionamento pela assistente via arquivo de solicitacao (sem permissao Actions write)

O conector GitHub disponivel no ChatGPT consegue criar commits na branch principal, mas nao dispoe de um comando direto para o endpoint REST `workflow_dispatch`. Para permitir o acionamento autonomo com o **escopo de acesso existente**, o workflow de distribuicao tambem aceita um evento `push` que modifica exclusivamente `ops/android-release-request.txt` na `main`.

Procedimento:
1. Verificar que o codigo em `main` esta aprovado e que a chave permanente e variavel SHA256 ja foram configuradas.
2. Criar ou atualizar o arquivo `ops/android-release-request.txt` em um commit **isolado** (sem outros arquivos modificados) com o conteúdo `versionCode=N`, correspondente ao Gradle; acrescentar uma nota com ID de solicitação, se necessário.
3. O GitHub Actions reconhece a alteracao e executa `APK Android assinado para atualizacoes` na `main`.
4. Antes de acessar os segredos de assinatura, o workflow verifica que **somente** o arquivo de controle mudou no intervalo do push e que o `versionCode` solicitado coincide com o Gradle.
5. A assinatura e validada pelo SHA256 pinado, a instalacao é verificada no emulador e, **apenas se tudo passar**, o artefato Release assinado e publicado.

O gatilho `workflow_dispatch` manual permanece disponivel. A conexao do GitHub no ChatGPT **nao precisa receber permissao adicional** de Actions nem visualizar os segredos. A configuracao de projeto e a posse da chave permanecem com o proprietario.

Importante: o gatilho nao deve ser acionado para um codigo que ainda nao passou na revisao e nos testes. Assim como a acao manual, ele executa codigo de `main` com acesso temporario aos segredos do trabalho de assinatura. Nunca tornar esse workflow executavel em `pull_request` nem em branches nao confiaveis.

A primeira geracao de APK assinada nao substitui, por si so, a instalacao Debug 0.6.4 que tenha certificado incompativel. A preservacao do `localStorage` nessa migracao segue como tarefa separada.
