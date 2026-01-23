# Configuracao do Supabase

Guia para configurar o Supabase como backend da lista de presentes.

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Preencha os dados do projeto e aguarde a criacao

## 2. Configurar Banco de Dados

1. No painel do Supabase, va em **SQL Editor**
2. Clique em "New Query"
3. Cole o conteudo do arquivo `schema.sql`
4. Execute o script

## 3. Obter Credenciais

1. Va em **Settings > API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 4. Configurar Variaveis de Ambiente

No arquivo `.env` do projeto:

```env
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. Edge Function (Envio de Email)

### Prerequisitos

- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado
- Conta no [Resend](https://resend.com) (servico de email)

### Deploy da Funcao

```bash
# Login no Supabase
supabase login

# Linkar projeto
supabase link --project-ref seu-projeto-ref

# Configurar secrets
supabase secrets set RESEND_API_KEY=re_xxxxxx
supabase secrets set FROM_EMAIL=noreply@seudominio.com
supabase secrets set WEDDING_COUPLE="Rodrigo e Elisa"

# Deploy
supabase functions deploy send-qrcode-email
```

### Testando Localmente

```bash
supabase start
supabase functions serve send-qrcode-email --env-file .env.local
```

## Estrutura das Tabelas

### presentes
| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | SERIAL | ID unico |
| nome | VARCHAR | Nome do presente |
| categoria | VARCHAR | Categoria (Cozinha, Quarto, etc) |
| descricao | TEXT | Descricao do item |
| preco | DECIMAL | Valor sugerido |
| reservado | BOOLEAN | Se foi reservado |
| reservado_por | VARCHAR | Nome de quem reservou |
| pago | BOOLEAN | Se foi pago |
| tipo | VARCHAR | Casamento ou Cha de Casa Nova |

### convidados
| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | SERIAL | ID unico |
| codigo | VARCHAR | Codigo unico do convidado (ex: CASAM001) |
| nome | VARCHAR | Nome do convidado |
| parceiro | VARCHAR | Nome do acompanhante (se houver) |
| acompanhantes | INTEGER | Numero de acompanhantes extras |
| confirmado | BOOLEAN | Se confirmou presenca |
| checkin | BOOLEAN | Se fez check-in no evento |
| horario_entrada | TIMESTAMP | Horario do check-in |

### reservas
| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | SERIAL | ID unico |
| presente_id | INTEGER | FK para presentes |
| nome_convidado | VARCHAR | Nome de quem reservou |
| email | VARCHAR | Email do convidado |
| telefone | VARCHAR | Telefone |
| mensagem | TEXT | Mensagem opcional |
| pago | BOOLEAN | Se foi pago |
| transaction_id | VARCHAR | ID da transacao de pagamento |

## Importar Dados Existentes

Se voce ja tem dados no Google Sheets, pode exportar como CSV e importar no Supabase:

1. Exporte a planilha como CSV
2. No Supabase, va em **Table Editor > Import data from CSV**
3. Selecione a tabela de destino
4. Faca o upload do CSV

## Solucao de Problemas

### Erro de CORS
Verifique se as politicas RLS estao corretas no `schema.sql`.

### Email nao enviado
1. Verifique se o `RESEND_API_KEY` esta configurado
2. Verifique os logs: `supabase functions logs send-qrcode-email`

### Dados nao aparecem
Certifique-se de que `VITE_USE_SUPABASE=true` no `.env`.
