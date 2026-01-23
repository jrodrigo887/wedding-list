# 💍 Lista de Casamento - Vue.js 3

Sistema moderno e profissional de lista de casamento desenvolvido com Vue.js 3, Composition API e Pinia.

## 🎯 Funcionalidades

- **Contribuição via PIX**
  - Exibição de chave PIX
  - Botão copiar com feedback
  - Seção dedicada responsiva

- **Sistema de Notificações**
  - Toasts animados
  - 4 tipos (success, error, warning, info)
  - Auto-dismiss configurável

## 🚀 Tecnologias

### Core

- **Vue.js 3.4** - Framework progressivo
- **Composition API** - API moderna e reativa
- **Pinia 2.1** - State management oficial
- **Axios 1.6** - Cliente HTTP
- **Vite 5** - Build tool ultrarrápido

### Padrões Aplicados

- ✅ Composition API (setup script)
- ✅ Composables para lógica reutilizável
- ✅ Single File Components (.vue)
- ✅ Props & Emits tipados
- ✅ Reactive State com ref/reactive
- ✅ Computed Properties
- ✅ Watchers
- ✅ Teleport para modais
- ✅ Transitions para animações
- ✅ Scoped Styles

## 📦 Estrutura do Projeto

```
wedding-gift-list/
├── src/
│   ├── components/
│   │   ├── common/              # Componentes reutilizáveis
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseInput.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   └── NotificationContainer.vue
│   │   ├── gift/                # Componentes de presentes
│   │   │   ├── CategoryFilter.vue
│   │   │   ├── GiftCard.vue
│   │   │   └── GiftsGrid.vue
│   │   ├── layout/              # Layout
│   │   │   └── AppHeader.vue
│   │   ├── modal/               # Modais
│   │   │   └── ReserveModal.vue
│   │   └── pix/                 # Seção PIX
│   │       └── PixSection.vue
│   ├── composables/             # Lógica reutilizável
│   │   ├── useModal.js
│   │   └── useNotification.js
│   ├── services/                # Serviços de API
│   │   └── api.service.js
│   ├── stores/                  # State Management
│   │   └── gift.store.js
│   ├── utils/                   # Utilitários
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── assets/
│   │   └── styles/
│   │       └── global.css
│   ├── App.vue
│   └── main.js
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>

# Entre na pasta
cd wedding-gift-list

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🎨 Personalização

### Configurações Básicas

Edite o arquivo `src/utils/constants.js`:

```javascript
export const APP_CONFIG = {
  APP_NAME: "Lista de Casamento",
  BRIDE_NAME: "Gabi",
  GROOM_NAME: "João",
  WEDDING_DATE: "2025-06-15",
  PIX_KEY: "11999999999",
  // ...
};
```

### Cores e Estilos

Edite as variáveis CSS em `src/assets/styles/global.css`:

```css
:root {
  --color-primary: #ff6b9d;
  --color-primary-dark: #c44569;
  /* ... */
}
```

## 🔌 API

### Mock Service (Desenvolvimento)

O projeto vem com um mock service para desenvolvimento local. Os dados estão em `src/services/api.service.js`.

### API Real (Produção)

Para usar uma API real, configure o `VITE_API_BASE_URL` no `.env` e implemente os endpoints:

```
GET    /gifts           - Lista todos os presentes
GET    /gifts/:id       - Busca presente por ID
POST   /gifts/:id/reserve - Reserva um presente
GET    /categories     - Lista categorias
```

## 📱 Responsividade

O projeto é totalmente responsivo com breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎯 Funcionalidades Avançadas

### Composables

```javascript
// useModal.js - Gerenciamento de modais
const modal = useModal();
modal.open(data);
modal.close();

// useNotification.js - Sistema de notificações
const { success, error } = useNotification();
success("Operação concluída!");
```

### Pinia Store

```javascript
const giftStore = useGiftStore();

// State
giftStore.gifts;
giftStore.loading;

// Getters
giftStore.filteredGifts;
giftStore.stats;

// Actions
await giftStore.loadGifts();
await giftStore.reserveGift(id, data);
```

### Helpers

```javascript
import { formatCurrency, copyToClipboard } from "@/utils/helpers";

formatCurrency(150.5); // R$ 150,50
await copyToClipboard("texto");
```

## 🔒 Segurança

- ✅ Sanitização de inputs
- ✅ Validação de formulários
- ✅ Proteção contra XSS
- ✅ HTTPS recomendado para produção

## 🚀 Deploy

### Vercel

```bash
npm run build
# Upload da pasta dist/
```

### Netlify

```bash
npm run build
# Upload da pasta dist/
```

## 📄 Licença

MIT License - Sinta-se livre para usar este projeto!

## 👨‍💻 Autor

Desenvolvido com 💕 para casais que querem uma lista de casamento moderna e elegante.

---

**Nota**: Este é um projeto profissional pronto para produção. Personalize conforme necessário!
