# GeoChat — План реализации проекта

> AI-ассистент для анализа локаций: интерактивная карта + чат с AI-агентом на потоковых ответах

---

## Стек технологий (актуальные версии, апрель 2026)

| Технология | Версия | Назначение |
|---|---|---|
| React | 19.x | UI-фреймворк |
| TypeScript | 5.7+ | Типизация |
| Vite | 6.x | Сборщик |
| Redux Toolkit | 2.9.x | Управление состоянием |
| React-Redux | 9.x | Интеграция Redux с React |
| Mapbox GL JS | 3.x | Карта и векторные тайлы |
| react-map-gl | 8.x | React-обёртка для Mapbox |
| Supercluster | 8.x | Кластеризация маркеров |
| Anthropic SDK / OpenAI SDK | latest | LLM API |
| Express | 5.x | Node.js бэкенд |
| @module-federation/vite | 1.x | Микрофронтенды |
| Tailwind CSS | 4.x | Стилизация |
| Docker | - | Контейнеризация |
| Vitest | 3.x | Тестирование |

---

## Архитектура проекта

```
geochat/
├── host-app/                  # Хост-приложение (микрофронтенд)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── store/             # Redux store хоста
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
│
├── map-module/                # Удалённый модуль: карта
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapView.tsx
│   │   │   ├── MarkerLayer.tsx
│   │   │   └── ClusterLayer.tsx
│   │   ├── store/
│   │   │   └── mapSlice.ts
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
│
├── chat-module/               # Удалённый модуль: AI-чат
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   └── StreamingMessage.tsx
│   │   ├── store/
│   │   │   └── chatSlice.ts
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                   # Node.js / Express бэкенд
│   ├── src/
│   │   ├── routes/
│   │   │   ├── chat.ts        # Проксирование к LLM API (SSE)
│   │   │   └── locations.ts   # Геоданные
│   │   ├── data/
│   │   │   └── locations.geojson
│   │   └── index.ts
│   └── package.json
│
└── docker-compose.yml
```

---

## Этап 1 — Базовая карта с маркерами

**Цель:** React-приложение с Mapbox GL JS, маркерами и состоянием в Redux

### 1.1 Инициализация проекта

```bash
# Создаём проект
npm create vite@latest geochat -- --template react-ts
cd geochat
npm install

# Карта
npm install mapbox-gl react-map-gl@8
npm install -D @types/mapbox-gl

# Redux
npm install @reduxjs/toolkit react-redux

# Стили
npm install tailwindcss @tailwindcss/vite
```

### 1.2 Настройка Mapbox

Получить токен на [mapbox.com](https://mapbox.com) → создать `.env`:

```env
VITE_MAPBOX_TOKEN=pk.your_token_here
```

### 1.3 Базовый компонент карты

```tsx
// src/components/MapView.tsx
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const MapView = () => {
  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: 37.6173,
        latitude: 55.7558,
        zoom: 11
      }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      <NavigationControl position="top-right" />
    </Map>
  );
};
```

### 1.4 Redux store — слайс карты

```typescript
// src/store/mapSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  id: string;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  category: string;
}

interface MapState {
  locations: Location[];
  selectedLocation: Location | null;
  viewport: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

const initialState: MapState = {
  locations: [],
  selectedLocation: null,
  viewport: { longitude: 37.6173, latitude: 55.7558, zoom: 11 }
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setLocations: (state, action: PayloadAction<Location[]>) => {
      state.locations = action.payload;
    },
    selectLocation: (state, action: PayloadAction<Location | null>) => {
      state.selectedLocation = action.payload;
    },
    setViewport: (state, action: PayloadAction<MapState['viewport']>) => {
      state.viewport = action.payload;
    }
  }
});
```

### 1.5 Тестовые геоданные (GeoJSON)

```json
// src/data/locations.json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "1",
        "name": "Кофейня на Арбате",
        "description": "Уютная кофейня с Wi-Fi",
        "category": "cafe"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [37.5957, 55.7522]
      }
    }
  ]
}
```

**✅ Результат этапа:** карта Москвы с маркерами, клик выбирает локацию, состояние в Redux.

---

## Этап 2 — Кластеризация и оптимизация рендеринга

**Цель:** корректная работа с большим количеством точек на карте

### 2.1 Установка Supercluster

```bash
npm install supercluster @types/supercluster
```

### 2.2 Компонент кластеризации

```tsx
// src/components/ClusterLayer.tsx
import { useMap } from 'react-map-gl/mapbox';
import Supercluster from 'supercluster';
import { useMemo, useState, useCallback } from 'react';

interface Props {
  locations: GeoJSON.Feature[];
  onLocationClick: (location: GeoJSON.Feature) => void;
}

export const ClusterLayer = ({ locations, onLocationClick }: Props) => {
  const { current: map } = useMap();
  const [zoom, setZoom] = useState(11);
  const [bounds, setBounds] = useState<[number, number, number, number]>(
    [37.3, 55.5, 38.0, 56.0]
  );

  // Инициализация суперкластера
  const cluster = useMemo(() => {
    const sc = new Supercluster({ radius: 60, maxZoom: 16 });
    sc.load(locations as GeoJSON.Feature<GeoJSON.Point>[]);
    return sc;
  }, [locations]);

  // Получение точек для текущего вьюпорта
  const points = useMemo(
    () => cluster.getClusters(bounds, Math.floor(zoom)),
    [cluster, bounds, zoom]
  );

  // Обновление при движении карты
  const handleMapMove = useCallback(() => {
    if (!map) return;
    const b = map.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    setZoom(map.getZoom());
  }, [map]);

  // ... рендер маркеров и кластеров
};
```

### 2.3 Векторные тайлы вместо маркеров (для 1000+ точек)

```tsx
// Для больших датасетов используем Source + Layer вместо компонентных маркеров
import { Source, Layer } from 'react-map-gl/mapbox';

const clusterLayer = {
  id: 'clusters',
  type: 'circle' as const,
  source: 'locations',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
  }
};

// Компонент
<Source
  id="locations"
  type="geojson"
  data={geojsonData}
  cluster={true}
  clusterMaxZoom={14}
  clusterRadius={50}
>
  <Layer {...clusterLayer} />
  <Layer {...unclusteredPointLayer} />
</Source>
```

**✅ Результат этапа:** карта работает с 1000+ точками без лагов, кластеры раскрываются при зуме.

---

## Этап 3 — AI-чат с потоковыми ответами (SSE)

**Цель:** чат-панель рядом с картой, AI отвечает про выбранную локацию, текст появляется постепенно

### 3.1 Node.js бэкенд — проксирование к Claude API

```bash
cd backend
npm init -y
npm install express cors @anthropic-ai/sdk
npm install -D typescript @types/express @types/node ts-node nodemon
```

```typescript
// backend/src/routes/chat.ts
import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/stream', async (req: Request, res: Response) => {
  const { message, locationContext } = req.body;

  // Заголовки для Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const systemPrompt = locationContext
    ? `Ты AI-ассистент для анализа городских локаций. 
       Сейчас выбрана локация: ${locationContext.name}. 
       Описание: ${locationContext.description}. 
       Отвечай кратко и по делу.`
    : 'Ты AI-ассистент для анализа городских локаций на карте Москвы.';

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });

    // Передаём чанки клиенту по мере поступления
    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: 'Ошибка API' })}\n\n`);
    res.end();
  }
});

export default router;
```

### 3.2 Redux — слайс чата

```typescript
// src/store/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    // Дописываем текст в последнее сообщение ассистента (стриминг)
    appendToLastMessage: (state, action: PayloadAction<string>) => {
      const last = state.messages[state.messages.length - 1];
      if (last && last.role === 'assistant') {
        last.content += action.payload;
      }
    },
    finishStreaming: (state) => {
      const last = state.messages[state.messages.length - 1];
      if (last) last.isStreaming = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    }
  }
});
```

### 3.3 Хук для работы с SSE

```typescript
// src/hooks/useStreamingChat.ts
import { useDispatch } from 'react-redux';
import { chatSlice } from '../store/chatSlice';

export const useStreamingChat = () => {
  const dispatch = useDispatch();

  const sendMessage = async (message: string, locationContext?: object) => {
    // Добавляем сообщение пользователя
    dispatch(chatSlice.actions.addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: Date.now()
    }));

    // Создаём пустое сообщение ассистента (будем дополнять)
    dispatch(chatSlice.actions.addMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: Date.now()
    }));

    dispatch(chatSlice.actions.setLoading(true));

    try {
      const response = await fetch('http://localhost:3001/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, locationContext })
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              dispatch(chatSlice.actions.finishStreaming());
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                dispatch(chatSlice.actions.appendToLastMessage(parsed.text));
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      dispatch(chatSlice.actions.setError('Ошибка соединения'));
      dispatch(chatSlice.actions.finishStreaming());
    }
  };

  return { sendMessage };
};
```

### 3.4 Компонент стримингового сообщения

```tsx
// src/components/StreamingMessage.tsx
import { useEffect, useRef } from 'react';

interface Props {
  content: string;
  isStreaming: boolean;
}

export const StreamingMessage = ({ content, isStreaming }: Props) => {
  const cursorRef = useRef<HTMLSpanElement>(null);

  return (
    <div className="message assistant">
      <p>{content}</p>
      {/* Мигающий курсор во время стриминга */}
      {isStreaming && (
        <span ref={cursorRef} className="streaming-cursor">▊</span>
      )}
    </div>
  );
};
```

**✅ Результат этапа:** текст ответа AI появляется постепенно как в ChatGPT, контекст локации передаётся в промпт.

---

## Этап 4 — Микрофронтенды через Module Federation

**Цель:** разбить приложение на независимые модули, научиться коммуникации между ними

### 4.1 Структура монорепозитория

```bash
mkdir geochat && cd geochat
npm init -y

# Создаём три Vite-приложения
npm create vite@latest host-app -- --template react-ts
npm create vite@latest map-module -- --template react-ts
npm create vite@latest chat-module -- --template react-ts
```

### 4.2 Настройка удалённого модуля (map-module)

```typescript
// map-module/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mapModule',
      filename: 'remoteEntry.js',
      exposes: {
        './MapView': './src/components/MapView',
        './mapStore': './src/store/mapSlice'
      },
      shared: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux']
    })
  ],
  server: { port: 5001, strictPort: true },
  build: { target: 'chrome89' }
});
```

### 4.3 Настройка удалённого модуля (chat-module)

```typescript
// chat-module/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'chatModule',
      filename: 'remoteEntry.js',
      exposes: {
        './ChatPanel': './src/components/ChatPanel',
        './chatStore': './src/store/chatSlice'
      },
      shared: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux']
    })
  ],
  server: { port: 5002, strictPort: true },
  build: { target: 'chrome89' }
});
```

### 4.4 Настройка хост-приложения

```typescript
// host-app/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'hostApp',
      remotes: {
        mapModule: {
          type: 'module',
          name: 'mapModule',
          entry: 'http://localhost:5001/remoteEntry.js'
        },
        chatModule: {
          type: 'module',
          name: 'chatModule',
          entry: 'http://localhost:5002/remoteEntry.js'
        }
      },
      shared: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux']
    })
  ],
  server: { port: 3000 }
});
```

### 4.5 Коммуникация между модулями через общий Redux store

```typescript
// host-app/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
// Импортируем слайсы из удалённых модулей
import { mapSlice } from 'mapModule/mapStore';
import { chatSlice } from 'chatModule/chatStore';

export const store = configureStore({
  reducer: {
    map: mapSlice.reducer,
    chat: chatSlice.reducer
  }
});

// Когда пользователь кликает на локацию в map-module,
// chat-module читает selectedLocation из store и передаёт в промпт
```

### 4.6 Ленивая загрузка удалённых модулей

```tsx
// host-app/src/App.tsx
import { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

const MapView = lazy(() => import('mapModule/MapView'));
const ChatPanel = lazy(() => import('chatModule/ChatPanel'));

export const App = () => (
  <Provider store={store}>
    <div className="flex h-screen">
      <Suspense fallback={<div>Загрузка карты...</div>}>
        <MapView />
      </Suspense>
      <Suspense fallback={<div>Загрузка чата...</div>}>
        <ChatPanel />
      </Suspense>
    </div>
  </Provider>
);
```

**✅ Результат этапа:** три независимых приложения работают вместе, модули общаются через Redux, каждый можно деплоить отдельно.

---

## Этап 5 — Docker и деплой

**Цель:** завернуть всё в контейнеры, запускать одной командой

### 5.1 Dockerfile для бэкенда

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### 5.2 Dockerfile для фронтенд-модулей

```dockerfile
# Универсальный Dockerfile для всех Vite-приложений
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### 5.3 docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    restart: unless-stopped

  map-module:
    build: ./map-module
    ports:
      - "5001:80"
    restart: unless-stopped

  chat-module:
    build: ./chat-module
    ports:
      - "5002:80"
    restart: unless-stopped

  host-app:
    build: ./host-app
    ports:
      - "3000:80"
    depends_on:
      - backend
      - map-module
      - chat-module
    restart: unless-stopped
```

```bash
# Запуск всего проекта одной командой
docker-compose up --build
```

**✅ Результат этапа:** проект запускается в Docker, готов к деплою на любой сервер.

---

## Этап 6 — Тесты

**Цель:** базовое покрытие тестами для ключевых компонентов

### 6.1 Установка

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

### 6.2 Пример теста Redux слайса

```typescript
// src/store/chatSlice.test.ts
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { chatSlice } from './chatSlice';

describe('chatSlice', () => {
  const store = configureStore({ reducer: { chat: chatSlice.reducer } });

  it('добавляет сообщение', () => {
    store.dispatch(chatSlice.actions.addMessage({
      id: '1',
      role: 'user',
      content: 'Привет',
      timestamp: Date.now()
    }));

    const state = store.getState().chat;
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].content).toBe('Привет');
  });

  it('дописывает текст в стриминговое сообщение', () => {
    store.dispatch(chatSlice.actions.addMessage({
      id: '2',
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: Date.now()
    }));

    store.dispatch(chatSlice.actions.appendToLastMessage('Привет'));
    store.dispatch(chatSlice.actions.appendToLastMessage(', мир!'));

    const state = store.getState().chat;
    const last = state.messages[state.messages.length - 1];
    expect(last.content).toBe('Привет, мир!');
  });
});
```

### 6.3 Пример теста компонента

```tsx
// src/components/StreamingMessage.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StreamingMessage } from './StreamingMessage';

describe('StreamingMessage', () => {
  it('показывает курсор во время стриминга', () => {
    render(<StreamingMessage content="Текст" isStreaming={true} />);
    expect(screen.getByText('▊')).toBeInTheDocument();
  });

  it('скрывает курсор после завершения', () => {
    render(<StreamingMessage content="Текст" isStreaming={false} />);
    expect(screen.queryByText('▊')).not.toBeInTheDocument();
  });
});
```

---

## Порядок реализации

| Этап | Задача | Время | Что получаем |
|---|---|---|---|
| 1 | Карта + маркеры + Redux | 2–3 дня | Работающая карта с состоянием |
| 2 | Кластеризация + оптимизация | 2 дня | Производительность с 1000+ точек |
| 3 | AI-чат + SSE + бэкенд | 3–4 дня | Потоковые ответы AI про локации |
| 4 | Микрофронтенды | 3–4 дня | Module Federation, коммуникация модулей |
| 5 | Docker | 1 день | Готов к деплою |
| 6 | Тесты | 1–2 дня | Базовое покрытие |

**Итого:** ~2–3 недели при 2–3 часах в день

---

## README для GitHub

```markdown
# GeoChat

Интерактивная карта с AI-ассистентом для анализа городских локаций.

## Стек
React 19 · TypeScript · Redux Toolkit · Mapbox GL JS · 
Anthropic Claude API (SSE) · Module Federation · Node.js · Docker

## Запуск
cp .env.example .env  # добавить ANTHROPIC_API_KEY и VITE_MAPBOX_TOKEN
docker-compose up --build

## Фичи
- Интерактивная карта с кластеризацией маркеров
- AI-агент отвечает про выбранную локацию
- Потоковые ответы (текст появляется постепенно)
- Микрофронтенд-архитектура (Module Federation)
- Общий Redux store между модулями
```

---

## Что этот проект даёт на собеседовании

| Требование вакансии | Как проект закрывает |
|---|---|
| React + TypeScript + Redux Toolkit | Основной стек всего проекта |
| AI-инструменты в разработке | Cursor + Claude при написании кода |
| AI-агенты в продукте | Чат с Claude API, потоковые ответы |
| Обработка потоковых ответов | SSE + chunked responses реализованы |
| Микрофронтенды | Module Federation, 3 независимых модуля |
| Картографические библиотеки | Mapbox GL JS, векторные тайлы, кластеризация |
| Базовый бэкенд | Node.js / Express для проксирования LLM API |
| CI/CD и деплой | Docker + docker-compose |
| Финтех/геоданные | Тематика продукта близка к задачам Сбера |
