# Guia de Instalação e Configuração do Docker

Guia completo para instalar o Docker e configurar o ambiente do projeto **Eventos - Comunidade Café Bugado**.

---

## Sumário

- [O que é Docker?](#o-que-é-docker)
- [Instalação no Windows](#instalação-no-windows)
- [Instalação no macOS](#instalação-no-macos)
- [Instalação no Linux (Ubuntu/Debian)](#instalação-no-linux-ubuntudebian)
- [Instalação no Linux (Fedora/CentOS)](#instalação-no-linux-fedoracentos)
- [Verificando a Instalação](#verificando-a-instalação)
- [Configurando o Projeto](#configurando-o-projeto)
- [Comandos Essenciais](#comandos-essenciais)
- [Solução de Problemas](#solução-de-problemas)

---

## O que é Docker?

Docker é uma plataforma que permite empacotar aplicações em containers, garantindo que o ambiente de desenvolvimento seja idêntico para todos. Com Docker, você **não precisa instalar Node.js, pnpm ou qualquer dependência** diretamente na sua máquina.

### Docker Desktop vs Docker Engine (Terminal)

| Característica   | Docker Desktop (GUI)      | Docker Engine (Terminal)    |
| ---------------- | ------------------------- | --------------------------- |
| Interface        | Visual com dashboards     | Apenas linha de comando     |
| Sistemas         | Windows, macOS, Linux     | Apenas Linux                |
| Recursos         | UI + terminal + extensões | Apenas terminal             |
| Consumo          | Mais pesado (~2GB RAM)    | Mais leve                   |
| Recomendado para | Iniciantes e Windows/Mac  | Servidores e usuários Linux |

---

## Instalação no Windows

### Opção 1: Docker Desktop (Recomendado)

#### Pré-requisitos

- Windows 10 (build 19041+) ou Windows 11
- WSL 2 habilitado
- Virtualização habilitada na BIOS

#### Passo 1: Habilitar o WSL 2

Abra o **PowerShell como Administrador** e execute:

```powershell
wsl --install
```

Reinicie o computador após a instalação.

Verifique se o WSL 2 está ativo:

```powershell
wsl --list --verbose
```

#### Passo 2: Baixar o Docker Desktop

1. Acesse o site oficial: **https://www.docker.com/products/docker-desktop/**
2. Clique em **"Download for Windows"**
3. Execute o instalador `Docker Desktop Installer.exe`

#### Passo 3: Instalar

1. Na tela de instalação, marque a opção **"Use WSL 2 instead of Hyper-V"**
2. Clique em **"Ok"** e aguarde a instalação
3. Reinicie o computador quando solicitado

#### Passo 4: Configurar o Docker Desktop

1. Abra o **Docker Desktop**
2. Aceite os termos de uso
3. Vá em **Settings (engrenagem)** > **General**:
   - Marque **"Start Docker Desktop when you sign in to Windows"** (opcional)
   - Marque **"Use the WSL 2 based engine"**
4. Vá em **Settings** > **Resources** > **WSL Integration**:
   - Habilite a integração com sua distribuição WSL
5. Clique em **"Apply & Restart"**

#### Passo 5: Verificar

Abra o **Terminal** ou **PowerShell**:

```powershell
docker --version
docker compose version
```

---

### Opção 2: Via Terminal (WSL 2 + Docker Engine)

Se preferir instalar o Docker apenas via terminal dentro do WSL 2:

```bash
# 1. Atualize os pacotes
sudo apt update && sudo apt upgrade -y

# 2. Instale dependências
sudo apt install -y ca-certificates curl gnupg lsb-release

# 3. Adicione a chave GPG do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Adicione o repositório Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Instale o Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 6. Adicione seu usuário ao grupo docker (evita usar sudo)
sudo usermod -aG docker $USER

# 7. Reinicie o terminal ou execute:
newgrp docker
```

---

## Instalação no macOS

### Opção 1: Docker Desktop (Recomendado)

#### Passo 1: Baixar

1. Acesse: **https://www.docker.com/products/docker-desktop/**
2. Clique em **"Download for Mac"**
   - Escolha **Apple Silicon** (M1, M2, M3, M4) ou **Intel** conforme seu Mac

#### Passo 2: Instalar

1. Abra o arquivo `.dmg` baixado
2. Arraste o **Docker** para a pasta **Applications**
3. Abra o **Docker** pela pasta Applications
4. Autorize a instalação com sua senha do Mac

#### Passo 3: Configurar

1. Clique no ícone do Docker na barra de menus (baleia)
2. Vá em **Settings** > **Resources**:
   - **CPUs**: Mínimo 2 (recomendado 4)
   - **Memory**: Mínimo 4GB (recomendado 6GB)
3. Clique em **"Apply & Restart"**

#### Passo 4: Verificar

```bash
docker --version
docker compose version
```

### Opção 2: Via Terminal (Homebrew)

```bash
# 1. Instale o Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Instale o Docker via Homebrew
brew install --cask docker

# 3. Abra o Docker Desktop
open /Applications/Docker.app

# 4. Verifique
docker --version
docker compose version
```

---

## Instalação no Linux (Ubuntu/Debian)

### Opção 1: Via Terminal (Recomendado)

```bash
# 1. Remova versões antigas (se existirem)
sudo apt remove -y docker docker-engine docker.io containerd runc

# 2. Atualize os pacotes
sudo apt update

# 3. Instale dependências
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 4. Adicione a chave GPG oficial do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 5. Configure o repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 6. Instale o Docker Engine + Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 7. Adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER

# 8. Aplique as mudanças de grupo (ou faça logout/login)
newgrp docker

# 9. Habilite o Docker para iniciar com o sistema
sudo systemctl enable docker
sudo systemctl start docker
```

### Opção 2: Docker Desktop para Linux

```bash
# 1. Baixe o pacote .deb
# Acesse: https://www.docker.com/products/docker-desktop/
# Baixe a versão .deb para sua arquitetura

# 2. Instale o pacote
sudo apt install -y ./docker-desktop-<versao>-<arch>.deb

# 3. Abra o Docker Desktop
systemctl --user start docker-desktop
```

---

## Instalação no Linux (Fedora/CentOS)

### Via Terminal

```bash
# 1. Remova versões antigas
sudo dnf remove -y docker docker-client docker-client-latest \
    docker-common docker-latest docker-latest-logrotate \
    docker-logrotate docker-engine

# 2. Instale o plugin de repositório
sudo dnf install -y dnf-plugins-core

# 3. Adicione o repositório Docker
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo

# 4. Instale o Docker
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 5. Inicie e habilite o Docker
sudo systemctl start docker
sudo systemctl enable docker

# 6. Adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

---

## Verificando a Instalação

Após instalar, execute estes comandos para confirmar que tudo está funcionando:

```bash
# Verifica a versão do Docker
docker --version
# Esperado: Docker version 27.x.x

# Verifica a versão do Docker Compose
docker compose version
# Esperado: Docker Compose version v2.x.x

# Testa com um container de exemplo
docker run hello-world
# Esperado: mensagem "Hello from Docker!"
```

Se o `docker run hello-world` exibir a mensagem de boas-vindas, a instalação está correta.

---

## Configurando o Projeto

### Para quem está clonando pela primeira vez

```bash
# 1. Clone o repositório
git clone https://github.com/cafebugado/agendas_eventos.git
cd agendas_eventos

# 2. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Edite o .env com suas credenciais do Supabase
# Use seu editor favorito: code .env / nano .env / vim .env

# 4. Inicie o projeto
docker compose up app-dev

# 5. Acesse no navegador
# http://localhost:5173
```

### Para quem já tem o projeto clonado

```bash
# 1. Atualize o repositório
git pull origin developer

# 2. Verifique se o .env existe
# Se não existir:
cp .env.example .env
# Configure as credenciais do Supabase

# 3. Inicie com Docker
docker compose up app-dev

# 4. Acesse no navegador
# http://localhost:5173
```

### Build de Produção

```bash
# Build e inicia o container de produção
docker compose --profile production up app-prod

# Em segundo plano
docker compose --profile production up app-prod -d

# Acesse: http://localhost
```

---

## Comandos Essenciais

### Gerenciamento de Containers

```bash
# Iniciar ambiente de desenvolvimento
docker compose up app-dev

# Iniciar em segundo plano (detached)
docker compose up app-dev -d

# Parar os containers
docker compose down

# Parar e remover volumes
docker compose down -v

# Reiniciar
docker compose restart app-dev
```

### Build e Rebuild

```bash
# Rebuild após mudanças no Dockerfile
docker compose up app-dev --build

# Rebuild sem cache (instalação limpa)
docker compose build --no-cache

# Rebuild apenas um serviço
docker compose build app-dev
```

### Logs e Monitoramento

```bash
# Ver logs em tempo real
docker compose logs -f app-dev

# Ver últimas 50 linhas de log
docker compose logs --tail 50 app-dev

# Ver containers em execução
docker compose ps

# Ver uso de recursos (CPU, RAM)
docker stats
```

### Executar Comandos no Container

```bash
# Abrir terminal dentro do container
docker compose exec app-dev sh

# Rodar testes
docker compose exec app-dev pnpm test

# Rodar linting
docker compose exec app-dev pnpm lint

# Instalar nova dependência
docker compose exec app-dev pnpm add <pacote>
```

### Limpeza

```bash
# Remover containers parados
docker container prune

# Remover imagens não utilizadas
docker image prune

# Remover tudo (containers, imagens, volumes, networks)
docker system prune -a

# Ver espaço em disco usado pelo Docker
docker system df
```

---

## Solução de Problemas

### "Docker daemon is not running"

**Windows:**

- Abra o Docker Desktop pelo menu Iniciar
- Aguarde o ícone da baleia ficar estável na bandeja do sistema

**Linux:**

```bash
sudo systemctl start docker
sudo systemctl status docker
```

**macOS:**

- Abra o Docker Desktop pela pasta Applications

---

### "Permission denied" ao rodar docker

**Linux:**

```bash
# Adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplique sem reiniciar
newgrp docker

# Se não funcionar, faça logout e login novamente
```

---

### "Port 5173 already in use"

Algum processo já está usando a porta. Pare o processo ou mude a porta:

```bash
# Descubra o que está usando a porta
# Windows:
netstat -ano | findstr :5173

# Linux/Mac:
lsof -i :5173

# Ou altere a porta no docker-compose.yml:
# ports:
#   - '3000:5173'  # Acesse em http://localhost:3000
```

---

### "WSL 2 installation is incomplete" (Windows)

```powershell
# Execute no PowerShell como Administrador
wsl --install
wsl --set-default-version 2

# Reinicie o computador
```

---

### Container não reflete mudanças no código

```bash
# Certifique-se de que os volumes estão montados
docker compose down
docker compose up app-dev --build
```

---

### Build muito lento ou sem espaço

```bash
# Limpe cache do Docker
docker system prune -a

# Verifique espaço usado
docker system df
```

---

### "node_modules" conflitando entre local e Docker

```bash
# Remova o node_modules local
rm -rf node_modules

# Reinicie o container
docker compose down -v
docker compose up app-dev --build
```

---

### Variáveis de ambiente não sendo carregadas

```bash
# Verifique se o .env existe na raiz do projeto
ls -la .env

# Verifique se o docker-compose.yml referencia o .env
# O arquivo deve conter: env_file: - .env

# Rebuild o container após alterar o .env
docker compose up app-dev --build
```

---

## Dicas

1. **Docker Desktop** facilita a visualização de containers, logs e imagens de forma gráfica
2. Use `docker compose up -d` para rodar em segundo plano e liberar o terminal
3. O **hot reload** funciona normalmente com Docker graças ao volume montado
4. Se estiver no **Windows**, prefira clonar o projeto dentro do WSL 2 para melhor performance
5. O container de **produção** usa Nginx e gera uma imagem final de apenas ~25MB
