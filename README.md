# DevFlow - Clone do Trello

DevFlow é um clone do Trello desenvolvido com Next.js, permitindo gestão de tarefas em boards colaborativos com sincronização em tempo real.

## Funcionalidades

### Boards
- Criar boards personalizados
- Convite de membros para boards (papel de OWNER ou MEMBER)
- Remoção de membros da board

### Listas
- Criar listas dentro de boards
- Editar título das listas
- Excluir listas
- Reordenar listas via drag and drop (tempo real)

### Cards
- Criar cards com título e descrição
- Editar cards
- Excluir cards
- Mover cards entre listas (tempo real)
- Reordenar cards dentro da lista (tempo real)

### Tempo Real
- Todas as alterações são sincronizadas instantaneamente entre os usuários conectados à mesma board via Pusher
- Quando um membro é removido, ele é notificado e redirecionado automaticamente para o dashboard

## Stack

- **Framework:** Next.js 16 (App Router)
- **Banco de Dados:** PostgreSQL + Prisma ORM
- **Autenticação:** NextAuth.js (Google Provider)
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Tempo Real:** Pusher (pusher-js + pusher)
- **Estilização:** Tailwind CSS
- **Validação:** React Hook Form + Zod
- **Toasts:** Sonner
- **Ícones:** React Icons (FiIcons)


## Estrutura do Projeto

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── boards/       # Endpoints de boards
│   │   ├── cards/        # Endpoints de cards
│   │   ├── lists/        # Endpoints de listas
│   │   └── users/        # Endpoints de usuários
│   ├── dashboard/        # Páginas autenticadas
│   └── page.tsx          # Página inicial
├── components/           # Componentes React
├── lib/                  # Bibliotecas e utilitários
│   ├── auth.ts          # Configuração NextAuth
│   ├── prisma.ts        # Cliente Prisma
│   └── pusher.ts        # Configuração Pusher
└── public/              # Arquivos estáticos
```

## Licença

MIT
