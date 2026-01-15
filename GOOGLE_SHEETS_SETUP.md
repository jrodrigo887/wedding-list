# 📊 Integração com Google Sheets

Este guia explica como configurar a integração do projeto com Google Sheets para gerenciar a lista de presentes.

## 🎯 Vantagens da Integração

- ✅ **Grátis**: Sem custos de hospedagem de banco de dados
- ✅ **Simples**: Gerenciamento direto pela planilha
- ✅ **Tempo Real**: Atualizações instantâneas
- ✅ **Colaborativo**: Vários editores podem gerenciar
- ✅ **Backup Automático**: Google faz backup automaticamente
- ✅ **Visualização Fácil**: Veja reservas em tabela organizada

## 📋 Passo a Passo Completo

### 1. Criar a Planilha no Google Sheets

1. Acesse [Google Sheets](https://sheets.google.com)
2. Clique em **"+ Novo"** para criar uma nova planilha
3. Nomeie a planilha como: **"Lista de Casamento - Elisa & Rodrigo"**

### 2. Configurar o Google Apps Script

1. Na planilha, vá em: **Extensões > Apps Script**
2. Delete o código padrão que aparece
3. Copie TODO o conteúdo do arquivo `google-apps-script.js` deste projeto
4. Cole no editor do Apps Script
5. Clique em **"Salvar projeto"** (ícone de disquete)
6. Nomeie o projeto como: **"API Lista de Casamento"**

### 3. Executar a Configuração Inicial

1. No Apps Script, selecione a função `setupSheets` no menu dropdown (topo da página)
2. Clique no botão **"Executar"** (ícone de play ▶)
3. **IMPORTANTE**: Na primeira execução, você verá uma tela de permissões:
   - Clique em **"Revisar permissões"**
   - Selecione sua conta Google
   - Clique em **"Avançado"**
   - Clique em **"Ir para [nome do projeto] (não seguro)"**
   - Clique em **"Permitir"**
4. Aguarde a mensagem: **"Planilhas configuradas com sucesso!"**
5. Volte para a planilha e veja que foram criadas 2 abas:
   - **Presentes**: Lista de presentes disponíveis
   - **Reservas**: Registro de todas as reservas

### 4. Publicar como Web App

1. No Apps Script, clique em **"Implantar"** (topo direito)
2. Selecione **"Nova implantação"**
3. Clique no ícone de **engrenagem ⚙** e selecione **"Web app"**
4. Configure:
   - **Descrição**: "API Lista de Casamento v1"
   - **Executar como**: "Eu" (sua conta)
   - **Quem tem acesso**: "Qualquer pessoa"
5. Clique em **"Implantar"**
6. **IMPORTANTE**: Clique em **"Autorizar acesso"**
   - Repita o processo de permissões (se solicitado)
7. **COPIE A URL** que aparece (algo como: `https://script.google.com/macros/s/XXXXXX/exec`)

### 5. Configurar o Projeto Vue.js

1. Na raiz do projeto, copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Abra o arquivo `.env` e configure:
   ```env
   # Cole a URL copiada no passo 4
   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXXXX/exec

   # Ative o uso do Google Sheets
   VITE_USE_GOOGLE_SHEETS=true
   ```

3. Salve o arquivo

### 6. Testar a Integração

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Abra o navegador em `http://localhost:3000`

3. Você deve ver os presentes de exemplo carregados da planilha

4. Teste fazer uma reserva:
   - Clique em um presente
   - Preencha os dados
   - Confirme a reserva
   - Volte para a planilha e veja a reserva registrada!

## 📊 Estrutura das Planilhas

### Aba "Presentes"

| Coluna | Nome | Descrição | Exemplo |
|--------|------|-----------|---------|
| A | ID | Identificador único | 1, 2, 3... |
| B | Nome | Nome do presente | Jogo de Panelas |
| C | Categoria | Categoria do presente | Cozinha |
| D | Descrição | Descrição detalhada | Conjunto completo... |
| E | Ícone | Emoji ou URL da imagem | 🍳 |
| F | Reservado | Status (SIM/NÃO) | NÃO |
| G | Reservado Por | Nome de quem reservou | João Silva |

### Aba "Reservas"

| Coluna | Nome | Descrição |
|--------|------|-----------|
| A | Data/Hora | Timestamp da reserva |
| B | ID Presente | ID do presente reservado |
| C | Nome Presente | Nome do presente |
| D | Nome Convidado | Quem reservou |
| E | E-mail | Email do convidado |
| F | Mensagem | Mensagem opcional |

## ✏️ Gerenciando Presentes

### Adicionar Novo Presente

1. Abra a planilha Google Sheets
2. Vá para a aba **"Presentes"**
3. Adicione uma nova linha com:
   - ID único (próximo número disponível)
   - Nome do presente
   - Categoria
   - Descrição
   - Ícone (emoji ou URL)
   - Reservado: **NÃO**
   - Reservado Por: (deixe vazio)

### Editar Presente

1. Localize o presente na aba "Presentes"
2. Edite as células desejadas
3. As mudanças aparecem automaticamente no site

### Remover Presente

1. Localize o presente na aba "Presentes"
2. Delete a linha inteira
3. **IMPORTANTE**: Não delete presentes já reservados

### Liberar Presente Reservado

1. Localize o presente na aba "Presentes"
2. Mude a coluna F (Reservado) para **NÃO**
3. Limpe a coluna G (Reservado Por)

## 🔄 Atualizando o Script

Se houver mudanças no arquivo `google-apps-script.js`:

1. Copie o novo código
2. Abra o Apps Script da planilha
3. Cole o novo código (substituindo o antigo)
4. Salve
5. Clique em **"Implantar > Gerenciar implantações"**
6. Clique no ícone de **lápis** da implantação ativa
7. Em "Versão", selecione **"Nova versão"**
8. Clique em **"Implantar"**

## 🐛 Solução de Problemas

### Erro: "URL do Google Apps Script não configurada"
- Verifique se adicionou `VITE_GOOGLE_SCRIPT_URL` no arquivo `.env`
- Verifique se a URL está correta (deve terminar com `/exec`)

### Erro: "Script function not found"
- Verifique se colou TODO o código no Apps Script
- Verifique se salvou o script
- Tente executar `setupSheets` novamente

### Presentes não aparecem
- Abra o Console do navegador (F12)
- Verifique se há erros
- Verifique se a URL do script está correta
- Verifique se `VITE_USE_GOOGLE_SHEETS=true`

### Erro de CORS
- Certifique-se que configurou "Quem tem acesso" como "Qualquer pessoa"
- Reimplante o Web App
- Limpe o cache do navegador

### Reserva não funciona
- Verifique se a aba "Reservas" existe
- Verifique se o presente não está já reservado
- Veja os logs no Apps Script (Ver > Registros de execução)

## 🔒 Segurança

### Dados Sensíveis
- O Google Apps Script é público, mas requer autenticação
- Não armazene informações sensíveis na planilha
- Os dados são visíveis para quem tem acesso à planilha

### Compartilhamento
- Compartilhe a planilha apenas com pessoas confiáveis
- Use "Pode ver" para visualização apenas
- Use "Pode editar" apenas para administradores

## 📱 Monitoramento

### Ver Reservas em Tempo Real
1. Abra a planilha Google Sheets
2. Vá para a aba "Reservas"
3. As reservas aparecem automaticamente quando alguém reserva

### Exportar Reservas
1. Na aba "Reservas", selecione todas as células
2. Arquivo > Download > CSV
3. Abra no Excel ou Google Sheets

## 🎨 Personalização

### Mudar Cores da Planilha
1. Selecione as células de cabeçalho
2. Use cores que combinem com o tema do casamento:
   - Marsala: `#8B3A3A`
   - Bege: `#D4A574`
   - Turquesa: `#40E0D0`

### Adicionar Validação de Dados
1. Selecione a coluna "Categoria"
2. Dados > Validação de dados
3. Critérios: Lista de itens
4. Itens: Cozinha, Quarto, Sala, Banheiro, Eletrodomésticos

## 🚀 Modo Produção

Quando for colocar o site no ar:

1. Certifique-se que a planilha está funcionando
2. Configure o `.env` de produção com a URL do Google Script
3. Deploy do projeto Vue.js (Vercel, Netlify, etc)
4. Teste todas as funcionalidades
5. Compartilhe o link do site!

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do Apps Script
2. Verifique o console do navegador (F12)
3. Revise este guia novamente
4. Verifique se seguiu todos os passos

---

**Pronto!** Sua lista de casamento está integrada com Google Sheets! 🎉
