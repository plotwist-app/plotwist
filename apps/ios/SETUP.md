# 🚀 Setup do Projeto iOS - Plotwist

Este guia explica como criar o projeto Xcode para o app Plotwist iOS.

## 📋 Pré-requisitos

- macOS 13.0 ou superior
- Xcode 15.0 ou superior
- iOS 16.0+ como target mínimo

## 🛠️ Criando o Projeto Xcode

### Passo 1: Abrir o Xcode

1. Abra o **Xcode**
2. Selecione **"Create a new Xcode project"** ou vá em **File > New > Project**

### Passo 2: Escolher o Template

1. Selecione a plataforma **iOS**
2. Escolha o template **App**
3. Clique em **Next**

### Passo 3: Configurar o Projeto

Preencha os campos conforme abaixo:

- **Product Name**: `Plotwist`
- **Team**: (Selecione seu time/conta de desenvolvedor)
- **Organization Identifier**: `app.plotwist` (ou seu identificador)
- **Bundle Identifier**: Será `app.plotwist.Plotwist` automaticamente
- **Interface**: **SwiftUI**
- **Language**: **Swift**
- **Storage**: Não marque "Use Core Data"
- **Include Tests**: Não marque esta opção

### Passo 4: Salvar o Projeto

1. Clique em **Next**
2. **IMPORTANTE**: Navegue até `/Users/henrique/dev/plotwist/apps/`
3. **ATENÇÃO**: Quando salvar, DESMARQUE "Create Git repository on my Mac"
4. Nomeie como `ios-temp` (vamos mover os arquivos depois)
5. Clique em **Create**

### Passo 5: Substituir os Arquivos

Agora vamos substituir os arquivos gerados pelo Xcode com nossos arquivos customizados:

1. **Feche o Xcode**

2. No Terminal, execute:

```bash
cd /Users/henrique/dev/plotwist/apps

# Copiar o arquivo .xcodeproj
cp -R ios-temp/Plotwist.xcodeproj ios/

# Copiar o arquivo .xcworkspace se existir
if [ -d "ios-temp/Plotwist.xcworkspace" ]; then
    cp -R ios-temp/Plotwist.xcworkspace ios/
fi

# Remover o projeto temporário
rm -rf ios-temp
```

3. **Abra o projeto**:

```bash
cd ios
open Plotwist.xcodeproj
```

### Passo 6: Ajustar Referências no Xcode

Com o projeto aberto no Xcode:

1. **Remover referências antigas** (se houver arquivos duplicados):

   - No Project Navigator (⌘+1), selecione arquivos duplicados
   - Clique com botão direito > Delete
   - Escolha "Remove Reference" (NÃO "Move to Trash")

2. **Adicionar arquivos ao projeto**:

   - Clique com botão direito na pasta "Plotwist" no Project Navigator
   - Selecione "Add Files to 'Plotwist'..."
   - Navegue até a pasta `Plotwist/` com todo o código
   - **Marque**: "Copy items if needed" (DESMARQUE esta opção)
   - **Marque**: "Create groups"
   - **Marque**: "Add to targets: Plotwist"
   - Clique em "Add"

3. **Verificar o Info.plist**:

   - Selecione o target "Plotwist" no Project Navigator
   - Vá em "Build Settings"
   - Busque por "Info.plist"
   - Certifique-se que aponta para `Plotwist/Info.plist`

4. **Configurar Assets**:
   - Vá em "Build Settings"
   - Busque por "Asset Catalog"
   - Certifique-se que aponta para `Plotwist/Resources/Assets.xcassets`

### Passo 7: Configurar Build Settings

1. Selecione o projeto "Plotwist" no Project Navigator
2. Selecione o target "Plotwist"
3. Vá em **"Build Settings"**
4. Busque por "iOS Deployment Target"
5. Configure para **iOS 16.0**

### Passo 8: Configurar Capabilities (Opcional)

Se você for usar recursos específicos:

1. Selecione o target "Plotwist"
2. Vá em **"Signing & Capabilities"**
3. Adicione capabilities conforme necessário:
   - **Keychain Sharing** (para armazenamento seguro)
   - **Push Notifications** (para notificações futuras)

### Passo 9: Build e Run

1. Selecione um simulador (iPhone 15, por exemplo)
2. Pressione **⌘+B** para compilar
3. Se tudo estiver OK, pressione **⌘+R** para rodar

## 🎯 Estrutura Final

Depois de configurado, a estrutura deve estar assim:

```
ios/
├── Plotwist.xcodeproj/
├── Plotwist.xcworkspace/ (se usar CocoaPods/Carthage)
├── Plotwist/
│   ├── App/
│   ├── Core/
│   ├── Models/
│   ├── ViewModels/
│   ├── Views/
│   ├── Services/
│   ├── Utils/
│   ├── Configuration/
│   ├── Resources/
│   └── Info.plist
├── README.md
├── SETUP.md
└── .gitignore
```

## 🐛 Troubleshooting

### Erro: "No such module 'Plotwist'"

1. Verifique se todos os arquivos estão no target correto
2. Limpe o build: **Product > Clean Build Folder** (⌘+Shift+K)
3. Feche e reabra o Xcode

### Erro: "Signing for 'Plotwist' requires a development team"

1. Vá em **Signing & Capabilities**
2. Selecione seu time ou use "Automatically manage signing"
3. Faça login com sua Apple ID em **Xcode > Settings > Accounts**

### Arquivos não aparecem no Project Navigator

1. Certifique-se que adicionou como "Create groups" e não "Create folder references"
2. Verifique se os arquivos estão fisicamente na pasta correta

## ✅ Próximos Passos

Após configurar o projeto:

1. Adicione sua TMDB API Key em `Configuration.swift`
2. Configure o Bundle ID correto
3. Adicione ícones do app em `Assets.xcassets/AppIcon.appiconset/`
4. Comece a desenvolver as features seguindo o `IOS_TASKS.md`

## 📚 Recursos

- [Documentação Swift](https://docs.swift.org)
- [SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

_Última atualização: Janeiro 2026_
