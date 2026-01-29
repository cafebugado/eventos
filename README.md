# EventFlow - Plataforma Minimalista de Eventos

Uma plataforma moderna e minimalista para descobrir e participar dos melhores eventos, com design limpo, dark mode e animações suaves.

## ✨ Funcionalidades

- 🎨 **Design Minimalista** - Interface limpa com paleta azul, branco e preto
- 🌓 **Dark/Light Mode** - Alternância suave entre temas
- ⚡ **Animações Fluidas** - Transições suaves entre seções
- 📱 **Responsivo** - Funciona perfeitamente em todos os dispositivos
- 🔄 **Tempo Real** - Sincronização automática com Google Sheets
- 🎯 **Curadoria** - Eventos selecionados e verificados

## 🚀 Tecnologias Utilizadas

- **React** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool moderno e rápido
- **CSS Variables** - Sistema de temas dinâmico
- **PapaCSV** - Parser para dados CSV do Google Sheets
- **Intersection Observer** - Animações baseadas em scroll

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/eventflow.git
cd eventflow
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com a URL do seu Google Sheets:
```env
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/SEU_ID/export?format=csv&gid=0
```

5. Execute o projeto:
```bash
npm run dev
# ou
pnpm dev
```

## 🗂️ Configuração do Google Sheets

Para que a aplicação funcione, você precisa de um Google Sheets público com as seguintes colunas:

| Nome do evento | Data do evento | Horario do evento | Dia da Semana | Periodo | Link do evento | Imagem do evento |
|----------------|----------------|-------------------|---------------|---------|----------------|------------------|
| Workshop React | 15/03/2025 | 19:00 | Sábado | Noturno | https://link.com | https://imagem.jpg |

### Passos para configurar:

1. Crie um Google Sheets com as colunas acima
2. Vá em "Arquivo" → "Compartilhar" → "Publicar na web"
3. Selecione "Valores separados por vírgula (.csv)"
4. Copie a URL gerada e cole no arquivo `.env`

## 🎨 Personalização

### Cores do Tema

As cores estão definidas como CSS custom properties em `:root`:

```css
:root {
  --primary-blue: #2563eb;
  --dark-blue: #1d4ed8;
  --light-blue: #3b82f6;
  --background: #ffffff;
  --surface: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
}
```

### Dark Mode

O tema escuro é ativado através do atributo `data-theme="dark"` no elemento raiz:

```css
[data-theme="dark"] {
  --primary-blue: #3b82f6;
  --background: #0f172a;
  --surface: #1e293b;
  --text-primary: #f1f5f9;
  /* ... */
}
```

## 🎭 Animações

O sistema de animações é baseado no `Intersection Observer`:

- **Fade In Up** - Seções aparecem suavemente ao entrar na viewport
- **Slide Up** - Cards de eventos aparecem em sequência
- **Hover Effects** - Interações suaves nos elementos clicáveis
- **Theme Toggle** - Transição suave entre temas

## 📱 Responsividade

O design é mobile-first com breakpoints:

- **Desktop**: >= 768px
- **Tablet**: 481px - 767px  
- **Mobile**: <= 480px

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

## 📊 Estrutura do Projeto

```
src/
├── App.jsx          # Componente principal
├── App.css          # Estilos principais
├── main.jsx         # Ponto de entrada
└── assets/          # Assets estáticos

public/
├── eventos.png      # Imagem padrão para eventos
└── vite.svg         # Favicon

```

## 🌟 Funcionalidades Detalhadas

### Dark Mode
- Toggle no header para alternar temas
- Preferência salva no localStorage
- Transições suaves entre temas
- Cores otimizadas para ambos os modos

### Animações
- Seções animam ao entrar na tela
- Cards de eventos aparecem em sequência
- Hover effects nos elementos interativos
- Transições suaves nos botões

### Navegação
- Scroll suave entre seções
- Indicador visual da seção ativa
- Menu fixo com backdrop blur
- Navegação por teclado acessível

### Responsividade
- Layout grid adaptativo
- Imagens responsivas
- Tipografia escalável
- Touch-friendly em mobile

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Dario Reis** - *Desenvolvedor Front-end* - [@darioreisjr](https://github.com/darioreisjr)

## 🙏 Agradecimentos

- Design inspirado nas melhores práticas de UX/UI
- Cores baseadas na paleta Tailwind CSS
- Animações inspiradas no Framer Motion
- Ícones emoji para manter a simplicidade
