# GeoChat — Claude Code Instructions

## Что это за проект
Интерактивная карта Москвы с AI-ассистентом. Пользователь кликает на маркер локации —
справа появляется floating glassmorphism чат-панель, где Claude API отвечает про выбранную
локацию в режиме стриминга (SSE). Проект делается для портфолио/собеседований.

## Стек
| Слой | Технология |
|---|---|
| UI | React 19, TypeScript 5.7+ |
| Сборка | Vite 6 |
| Стили | Tailwind CSS 4 |
| Состояние | Redux Toolkit 2.9 + React-Redux 9 |
| Карта | Mapbox GL JS 3 + react-map-gl 8 |
| Кластеры | Supercluster 8 |
| AI | groq-sdk (Groq API, Llama 3.3 70B, SSE streaming) |
| Бэкенд | Vercel API Functions (вместо отдельного Express сервера) |
| БД | Neon (PostgreSQL, free tier) |
| ORM | Prisma |
| Микрофронтенды | @module-federation/vite (этап 4, добавляется последним) |
| Тесты | Vitest 3 + @testing-library/react |
| Деплой | Vercel (фронт + API), Neon (БД) |
| Локальная разработка | docker-compose (опционально) |

## Структура монорепо
```
geochat/
├── host-app/        # Хост (точка входа, собирает всё)
│   └── api/         # Vercel API Functions (chat/stream, locations)
├── map-module/      # Карта, маркеры, кластеры
├── chat-module/     # AI-чат, SSE, сообщения
├── prisma/          # Схема БД, миграции
├── CLAUDE.md
└── docker-compose.yml  # Только для локальной разработки
```

На этапах 1–3 всё в одном Vite-приложении (монолит). Module Federation — только Этап 4.

## Дизайн-система

### Концепция
- Карта на весь экран (Mapbox dark-v11)
- Floating glassmorphism чат-панель поверх карты справа (ширина 360px)
- Мокап дизайна: `mockup.html` в корне проекта

### Цвета
```css
/* Основной акцент */
--accent: rgba(99, 179, 237, 0.8);    /* синий */
--accent-soft: rgba(99, 179, 237, 0.2);

/* Фон панелей */
--glass-bg: rgba(13, 17, 23, 0.65);
--glass-border: rgba(255, 255, 255, 0.08);

/* Текст */
--text-primary: #e2e8f0;
--text-muted: rgba(255, 255, 255, 0.4);

/* Категории маркеров */
--cat-cafe:   #ed8936;
--cat-park:   #48bb78;
--cat-museum: #9f7aea;
--cat-bar:    #fc8181;
--cat-shop:   #63b3ed;
```

### Glassmorphism-класс (Tailwind + CSS)
```css
backdrop-filter: blur(24px) saturate(180%);
background: rgba(13, 17, 23, 0.65);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 1rem;
```

## Правила кода

### Компоненты
- Именование: `PascalCase` для компонентов, `camelCase` для хуков (`useStreamingChat`)
- Каждый компонент в своём файле, без barrel-экспортов если не нужно
- Props-интерфейс прямо в файле компонента (не выносить в отдельный types.ts без причины)
- Не использовать `any` — только `unknown` или конкретные типы

### Redux
- Вся бизнес-логика в слайсах и thunks, не в компонентах
- Selectors выносить отдельно от слайса если используются в 2+ местах
- SSE-стриминг обрабатывается через `appendToLastMessage` action (мутация последнего сообщения)

### Стили
- Только Tailwind CSS — никаких inline-стилей кроме динамических значений
- Glassmorphism-панели через утилитарный класс `.glass` в global CSS
- Анимации: предпочитать CSS (keyframes) над JS-анимациями

### Бэкенд (Vercel API Functions)
- Переменные окружения только через `.env`, никогда не хардкодить ключи
- SSE endpoint: `POST /api/chat/stream` — возвращает `text/event-stream`
- Файлы API: `api/chat.ts`, `api/locations.ts` — Vercel автоматически превращает их в serverless functions
- Лимит выполнения Vercel Functions: 60 сек (Pro) / 10 сек (Free) — для стриминга достаточно
- Groq отвечает очень быстро (~200 мс до первого токена), укладывается в лимиты Vercel Free

### База данных (Neon + Prisma)
- Локации хранятся в PostgreSQL (Neon), не в GeoJSON-файле
- Схема Prisma в `prisma/schema.prisma`
- Подключение через `DATABASE_URL` из переменных окружения
- Neon free tier: 0.5 GB, одна база — достаточно для проекта

## Переменные окружения
```env
# .env (корень проекта — используется и фронтом и Vercel Functions)
VITE_MAPBOX_TOKEN=pk.your_token_here
GROQ_API_KEY=gsk_your_key_here
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
```

В Vercel переменные прописываются в Settings → Environment Variables (те же имена).

## Порядок этапов реализации
1. **Этап 1** — карта + маркеры + Redux (монолит)
2. **Этап 2** — кластеризация (Supercluster)
3. **Этап 3** — AI-чат + SSE (Vercel API Functions) + Neon БД + Prisma
4. **Этап 4** — разбивка на микрофронтенды (Module Federation)
5. **Этап 5** — деплой на Vercel + Neon (prod)
6. **Этап 6** — тесты

## Инфраструктура (всё бесплатно)
| Сервис | Назначение | Тариф |
|---|---|---|
| Vercel | Фронтенд + API Functions | Hobby (бесплатно) |
| Neon | PostgreSQL база данных | Free tier (бесплатно) |
| Mapbox | Карта и тайлы | Free (до 50к загрузок/мес) |
| Groq | LLM API (Llama 3.3 70B) | Free tier (бесплатно) |

## Что НЕ делать
- Не добавлять фичи сверх плана (нет auth, нет юзер-аккаунтов)
- Не использовать CSS-модули или styled-components — только Tailwind
- Не создавать лишних абстракций ради абстракций
- Не использовать `useEffect` там, где можно обойтись derived state или selector
- Не разворачивать отдельный Express сервер — только Vercel API Functions
