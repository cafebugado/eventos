# Configuração do Supabase para EventFlow

Este guia explica como configurar o Supabase para o projeto EventFlow.

## 1. Criar Conta e Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project" e faça login (pode usar GitHub, Google, etc.)
3. Clique em "New Project"
4. Preencha:
   - **Name**: EventFlow (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte (guarde-a!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project" e aguarde a criação

## 2. Criar a Tabela de Eventos

Após o projeto ser criado, vá em **SQL Editor** no menu lateral e execute o seguinte SQL:

```sql
-- Criar tabela de eventos
CREATE TABLE eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  data_evento TEXT NOT NULL,
  horario TEXT NOT NULL,
  dia_semana TEXT NOT NULL,
  periodo TEXT NOT NULL CHECK (periodo IN ('Matinal', 'Diurno', 'Vespertino', 'Noturno')),
  link TEXT NOT NULL,
  imagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para ordenação por data
CREATE INDEX idx_eventos_data ON eventos(data_evento);

-- Habilitar Row Level Security (RLS)
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (qualquer um pode ver eventos)
CREATE POLICY "Eventos são públicos para leitura" ON eventos
  FOR SELECT
  USING (true);

-- Política para permitir inserção apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem criar eventos" ON eventos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar eventos" ON eventos
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política para permitir exclusão apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar eventos" ON eventos
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

Clique em **Run** para executar o SQL.

## 3. Criar Bucket de Storage para Imagens

Vá em **Storage** no menu lateral e:

1. Clique em **New Bucket**
2. Preencha:
   - **Name**: `imagens`
   - Marque **Public bucket** (para imagens públicas)
3. Clique em **Create bucket**

Depois, configure as políticas do bucket. Vá em **Policies** dentro do bucket `imagens` e adicione:

### Política de Leitura Pública

```sql
-- No SQL Editor, execute:
CREATE POLICY "Imagens são públicas" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'imagens');
```

### Política de Upload para Usuários Autenticados

```sql
CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'imagens' AND auth.role() = 'authenticated');
```

### Política de Deleção para Usuários Autenticados

```sql
CREATE POLICY "Usuários autenticados podem deletar imagens" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'imagens' AND auth.role() = 'authenticated');
```

**OU** configure via interface:

1. Vá em Storage > imagens > Policies
2. Clique em "New Policy"
3. Selecione "For full customization"
4. Configure cada política conforme necessário

## 4. Criar Usuário Administrador

Vá em **Authentication** > **Users** no menu lateral e clique em **Add User**:

1. Preencha:
   - **Email**: seu-email@exemplo.com
   - **Password**: sua-senha-segura
2. Marque a opção **Auto Confirm User**
3. Clique em **Create User**

## 5. Obter as Credenciais da API

Vá em **Settings** > **API** no menu lateral:

1. Copie a **Project URL** (ex: `https://abc123.supabase.co`)
2. Copie a **anon public** key (em Project API keys)

## 6. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

**IMPORTANTE**: Nunca commite o arquivo `.env` no Git! Ele já está no `.gitignore`.

## 7. Testar a Aplicação

1. Inicie o servidor de desenvolvimento:

   ```bash
   pnpm dev
   ```

2. Acesse `http://localhost:5173` para ver a página pública

3. Acesse `http://localhost:5173/admin` para fazer login com o usuário criado

## 8. Inserir Dados de Teste (Opcional)

No **SQL Editor** do Supabase, execute:

```sql
INSERT INTO eventos (nome, descricao, data_evento, horario, dia_semana, periodo, link, imagem) VALUES
  ('Workshop de React', 'Aprenda React do zero ao avançado com projetos práticos.', '15/02/2025', '19:00', 'Sábado', 'Noturno', 'https://exemplo.com/react', NULL),
  ('Meetup de JavaScript', 'Encontro da comunidade JS para networking e palestras.', '20/02/2025', '18:30', 'Quinta-feira', 'Vespertino', 'https://exemplo.com/js', NULL),
  ('Conferência de Tech', 'O maior evento de tecnologia do ano com palestrantes internacionais.', '01/03/2025', '09:00', 'Sábado', 'Matinal', 'https://exemplo.com/tech', NULL);
```

## Estrutura da Tabela

| Campo       | Tipo      | Descrição                                    |
| ----------- | --------- | -------------------------------------------- |
| id          | UUID      | Identificador único (gerado automaticamente) |
| nome        | TEXT      | Nome do evento                               |
| descricao   | TEXT      | Descrição detalhada do evento (opcional)     |
| data_evento | TEXT      | Data no formato "DD/MM/YYYY"                 |
| horario     | TEXT      | Horário no formato "HH:MM"                   |
| dia_semana  | TEXT      | Dia da semana por extenso                    |
| periodo     | TEXT      | Matinal, Diurno, Vespertino ou Noturno       |
| link        | TEXT      | URL para participação/inscrição              |
| imagem      | TEXT      | URL da imagem do evento (opcional)           |
| created_at  | TIMESTAMP | Data de criação (automático)                 |
| updated_at  | TIMESTAMP | Data de atualização (automático)             |

## Storage de Imagens

O bucket `imagens` armazena as imagens dos eventos:

- **Limite**: 5MB por arquivo
- **Formatos**: PNG, JPG, JPEG, GIF, WebP
- **Acesso**: Público para leitura
- **Upload/Delete**: Apenas usuários autenticados

As imagens são salvas com nome único gerado automaticamente para evitar conflitos.

## Segurança (Row Level Security)

As políticas de segurança configuradas garantem que:

- **Leitura**: Qualquer pessoa pode ver os eventos (público)
- **Criação/Edição/Exclusão**: Apenas usuários autenticados (admins)
- **Imagens**: Públicas para visualização, upload/delete apenas por admins

## Arquivos Criados/Modificados

```
src/
├── lib/
│   └── supabase.js          # Cliente Supabase
├── services/
│   ├── authService.js       # Serviço de autenticação
│   └── eventService.js      # Serviço de eventos (CRUD + Upload)
├── admin/
│   ├── Login.jsx            # Login com Supabase Auth
│   ├── Dashboard.jsx        # Dashboard com CRUD e Upload
│   └── Admin.css            # Estilos do admin
└── App.jsx                  # App público com Supabase
```

## Funcionalidades

- **Upload de Imagem**: Arraste ou clique para fazer upload direto no Supabase Storage
- **URL de Imagem**: Também pode colar URL externa de imagem
- **Descrição**: Campo de texto para descrever o evento
- **Preview**: Visualização da imagem antes de salvar

## Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Iniciar desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview do build
pnpm preview
```

## Suporte

Para mais informações sobre o Supabase:

- [Documentação oficial](https://supabase.com/docs)
- [Guia de autenticação](https://supabase.com/docs/guides/auth)
- [Guia de banco de dados](https://supabase.com/docs/guides/database)
- [Guia de Storage](https://supabase.com/docs/guides/storage)
