# API de Email - Vercel Serverless

API para envio de emails com QR Code usando SMTP da Hostinger, hospedada na Vercel.

## Deploy na Vercel

### 1. Conectar repositório

1. Acesse [vercel.com](https://vercel.com)
2. Importe seu repositório do GitHub
3. A Vercel detecta automaticamente a pasta `/api`

### 2. Configurar variáveis de ambiente

No painel da Vercel, vá em **Settings > Environment Variables** e adicione:

| Variável | Valor |
|----------|-------|
| `SMTP_USER` | `no-reply@notificacoes.rodrigoelisa.com.br` |
| `SMTP_PASS` | Senha do email criado na Hostinger |
| `API_KEY` | Uma chave secreta (ex: `minha-chave-123`) |

### 3. Deploy

Faça push para o GitHub e a Vercel fará o deploy automaticamente.

## URL da API

Após o deploy, a URL será:
```
https://seu-projeto.vercel.app/api/send-email
```

## Configurar no Frontend

No arquivo `.env` do projeto Vue:

```env
VITE_EMAIL_API_URL=https://seu-projeto.vercel.app/api/send-email
VITE_EMAIL_API_KEY=minha-chave-123
```

## Testar a API

```bash
curl -X POST https://seu-projeto.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TESTE001",
    "email": "seu@email.com",
    "name": "Seu Nome",
    "apiKey": "minha-chave-123"
  }'
```

## Resposta

**Sucesso:**
```json
{
  "success": true,
  "message": "Email enviado com sucesso!",
  "messageId": "<abc123@smtp.hostinger.com>"
}
```

**Erro:**
```json
{
  "error": "Erro ao enviar email",
  "details": "Mensagem de erro"
}
```