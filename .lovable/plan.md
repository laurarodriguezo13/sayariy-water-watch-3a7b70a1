
# Sayariy CropGuard — Lovable Migration Plan

## Context
The existing repo `lorepini/sayari-cropguard` is a **Python Dash** dashboard (NDVI/NDWI/EVI monitoring + Random Forest stress scoring + Claude-generated Spanish alerts) for 5 Lambayeque communities. We will rebuild the **frontend** as a React + Tailwind app on TanStack Start, in Spanish, themed with the Sayariy logo palette, calling your Python backend as an external API.

## Design system (from logo)
Tokens added to `src/styles.css` (oklch):
- `--primary` magenta/burgundy ≈ `#A8195C` (Sayariy wordmark)
- `--accent` orange ≈ `#E8A33D` (left figure)
- `--success` / data-positive green ≈ `#3FA535` (right figure)
- Neutral cream background, dark slate text
- Map risk scale: green → amber → magenta (reuses brand palette)
- Spanish UI throughout, semantic HTML, accessible contrast

## Information architecture (Spanish routes)
```text
/                       → Inicio (landing: misión, cómo funciona, comunidades)
/proyecto               → El proyecto (CropGuard + Sayariy)
/comunidades            → Lista de comunidades monitoreadas
/dashboard              → Panel general (KPIs, mapa, alertas activas)
/dashboard/comunidad/$id → Detalle por comunidad (NDVI/NDWI/EVI, alertas, recomendaciones)
/dashboard/alertas      → Histórico de alertas + filtros
/dashboard/datos        → Estado de fuentes (Sentinel-2, modelo, última corrida)
/contacto               → Contacto Sayariy
```
Each route gets its own `head()` (título, descripción, og:*) in Spanish.

## Components (`src/components/`)
- `Header` con logo Sayariy + navegación
- `Footer` con créditos y SDG badges (2, 1, 13)
- `KpiCard`, `RiskBadge` (verde/ámbar/magenta)
- `CommunityMap` (Leaflet + GeoJSON `lambayeque_communities.geojson`)
- `IndexTimeSeries` (Recharts: NDVI, NDWI, EVI)
- `AlertCard` / `AlertList` (alertas en español del LLM)
- `CommunityTable` ordenable por riesgo
- `DataSourceStatus` (última escena Sentinel-2, fecha del modelo)
- `LanguageNote` (solo español por ahora; estructura lista para EN futuro)

## API integration (`src/lib/cropguard-api.ts`)
Typed client + TanStack Query. Expected endpoints from your Python pipeline (we'll align with what you expose; defaults below):

```text
GET /api/communities                    → lista + geometría
GET /api/communities/:id/indices?from&to → series NDVI/NDWI/EVI
GET /api/communities/:id/stress         → score actual + horizonte 2–4 sem
GET /api/alerts?active=true             → alertas activas (es)
GET /api/pipeline/status                → última corrida, escenas usadas
```

Two deployment options for the API URL:
1. **Direct call** (CORS habilitado, sin secretos sensibles) — `VITE_CROPGUARD_API_URL`.
2. **Proxied via Lovable Cloud server function** — si la API requiere clave (Anthropic, Copernicus). Recomendado.

If your API isn't deployed yet, I'll build with realistic mock data shaped like the GeoJSON + indices, so the UI is usable immediately.

## Phases

### Phase 1 — Marca + sitio público (parity con Sayariy)
- Tokens del logo en `src/styles.css`
- Header/Footer, página `/` con hero, misión, cómo funciona, CTA al dashboard
- `/proyecto`, `/comunidades`, `/contacto`
- SEO por ruta, responsive, imágenes optimizadas

### Phase 2 — Dashboard skeleton con datos mock
- `/dashboard` con KPIs, mapa (Leaflet + comunidades), tabla de riesgo, alertas
- `/dashboard/comunidad/$id` con series temporales y recomendaciones
- Loading skeletons + error boundaries

### Phase 3 — Conexión a la API real
- Cliente tipado + TanStack Query (cache, refetch)
- Si requiere secreto: enable Lovable Cloud + server function proxy
- Manejo de errores, reintentos

### Phase 4 — Mejoras
- Filtros temporales, exportar CSV de alertas
- Notificaciones (toast) cuando llega nueva alerta
- (Opcional) Auth Lovable Cloud para vistas por rol (NGO staff vs público)

## Decisiones técnicas
- TanStack Start + React 19 + Tailwind v4 + shadcn/ui (ya en el template)
- Recharts para series, Leaflet para mapa
- Solo idioma español (textos directos en componentes; arquitectura lista para i18n futuro)
- `src/routeTree.gen.ts` no se edita
- El repo de GitHub `sayari-cropguard` se mantiene como referencia; este proyecto Lovable se conectará a un repo nuevo (ej. `sayari-cropguard-web`) para sync bidireccional

## Lo que necesito de ti antes/durante el build
1. **URL de la API CropGuard** desplegada (o confirmar "usar mock por ahora")
2. ¿La API requiere **clave secreta**? Si sí → activamos Lovable Cloud
3. **Textos finales** del landing en español (puedes pasarlos después; uso borradores)
4. ¿Mantenemos las **5 comunidades** del README o agregamos más?

## Fuera de alcance
- Reescribir el pipeline Python (sigue en tu repo actual)
- Entrenar/hostear el modelo en Lovable
- Ingesta directa de Sentinel-2 (la hace tu pipeline)

## Próximo paso
Cambia a **Build mode** y arranco con Phase 1 (marca + sitio público en español). Mientras tanto, comparte la URL de la API si ya está desplegada.
