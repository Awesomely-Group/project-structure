# ERP Dashboard — Arquitectura y Plan de Implementacion

## Context

Dashboard interno para gestionar la rentabilidad de proyectos. Los proyectos se obtienen de **multiples cuentas de Jira Cloud** y las facturas de **multiples cuentas de Holded**. La funcionalidad clave es **asignar facturas (completas o por linea) a proyectos** para calcular margenes, rentabilidad y horas facturables vs logueadas.

---

## Decisiones de arquitectura

| Decision | Eleccion | Razon |
|----------|----------|-------|
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 | Stack definido en CLAUDE.md, una sola app = un contenedor |
| Base de datos | DynamoDB (single-table design, 2 GSIs) | Nativo AWS, elegido para el deploy en ECS |
| API | Next.js Route Handlers | No necesita Express separado para un tool interno |
| Auth | NextAuth.js v5 + Credentials provider + JWT | Login simple, sin RBAC |
| State | TanStack Query (server) + Zustand (UI) | Cache, refetch, optimistic updates |
| Charts | Recharts | Ligero, buen soporte React |
| Dark mode | Tailwind `dark:` + toggle + CSS variables | Soporte light/dark/system |
| Deploy | Docker multi-stage → AWS ECS | Contenedor unico con standalone output |
| Sync | Webhooks (Jira + Holded) + manual fallback | Tiempo real + resiliencia |

---

## DynamoDB — Single-table design

**Tabla: `erp-dashboard`**

| Entity | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK |
|--------|----|----|--------|--------|--------|--------|
| Account | `ACCOUNT#{provider}#{id}` | `METADATA` | `ACCOUNTS` | `{provider}#{id}` | — | — |
| Project | `PROJECT#{id}` | `METADATA` | `ACCOUNT#jira#{accountId}` | `PROJECT#{id}` | `PROJECTS` | `{status}#{id}` |
| Invoice | `INVOICE#{id}` | `METADATA` | `ACCOUNT#holded#{accountId}` | `INVOICE#{id}` | `INVOICES` | `{status}#{id}` |
| InvoiceLine | `INVOICE#{invoiceId}` | `LINE#{lineNumber}` | `INVOICELINES#{ASSIGNED\|UNASSIGNED}` | `{invoiceId}#LINE#{lineNumber}` | `PROJECT#{projectId}` (si asignada) | `INVOICELINE#{invoiceId}#LINE#{lineNumber}` |
| User | `USER#{id}` | `METADATA` | `USERS` | `{email}` | — | — |
| SyncEvent | `SYNC#{accountId}` | `EVENT#{timestamp}` | — | — | — | — |

### Access patterns

| Patron | Query |
|--------|-------|
| Listar proyectos | GSI2: `PK=PROJECTS`, paginar con `LastEvaluatedKey` |
| Lineas de un proyecto | GSI2: `PK=PROJECT#{id}`, SK begins_with `INVOICELINE#` |
| Lineas sin asignar | GSI1: `PK=INVOICELINES#UNASSIGNED` |
| Facturas de una cuenta Holded | GSI1: `PK=ACCOUNT#holded#{id}` |
| Proyectos de una cuenta Jira | GSI1: `PK=ACCOUNT#jira#{id}` |
| Lineas de una factura | Base: `PK=INVOICE#{id}`, SK begins_with `LINE#` |
| Usuario por email | GSI1: `PK=USERS`, SK=`{email}` |
| Historial sync | Base: `PK=SYNC#{accountId}`, SK begins_with `EVENT#` |

### Asignacion (TransactWriteItems)

1. **Update InvoiceLine**: set `assignedProjectId`, cambiar GSI1PK de `UNASSIGNED` a `ASSIGNED`, set GSI2PK
2. **Update Invoice**: incrementar `assignedLineCount`
3. **Update Project**: sumar amount a `totalBilled`, recalcular `margin` y `marginPercent`
4. **Condition**: `attribute_not_exists(assignedProjectId) OR assignedProjectId = :null`

---

## Estructura del proyecto

```
EP-aws/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout (providers, theme)
│   │   ├── page.tsx                            # Redirect → /dashboard
│   │   ├── globals.css                         # Tailwind + CSS variables (dark mode)
│   │   ├── (auth)/login/page.tsx               # Login
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                      # Sidebar + header + auth guard
│   │   │   ├── dashboard/page.tsx              # KPIs, charts, actividad reciente
│   │   │   ├── projects/page.tsx               # Lista proyectos
│   │   │   ├── projects/[projectId]/page.tsx   # Detalle + financials + facturas asignadas
│   │   │   ├── invoices/page.tsx               # Lista facturas
│   │   │   ├── invoices/[invoiceId]/page.tsx   # Detalle + lineas + asignacion
│   │   │   ├── accounts/page.tsx               # Gestion cuentas Jira/Holded
│   │   │   └── sync/page.tsx                   # Estado sync + manual trigger
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── accounts/                       # CRUD cuentas
│   │       ├── projects/                       # Listar + detalle proyectos
│   │       ├── invoices/                       # Listar + detalle + asignacion
│   │       ├── webhooks/jira/[accountId]/      # Webhook receiver Jira
│   │       ├── webhooks/holded/[accountId]/    # Webhook receiver Holded
│   │       └── dashboard/stats/route.ts        # Agregaciones KPI
│   ├── lib/
│   │   ├── db/                                 # DynamoDB client, keys, entities
│   │   ├── auth/                               # NextAuth.js config
│   │   ├── services/jira/                      # Cliente API Jira Cloud
│   │   ├── services/holded/                    # Cliente API Holded
│   │   ├── services/sync/                      # Orquestador + cola webhook
│   │   ├── crypto/encrypt.ts                   # AES-256-GCM
│   │   ├── env.ts                              # Validacion Zod
│   │   ├── errors.ts                           # Result pattern
│   │   ├── types.ts                            # Tipos de dominio
│   │   └── utils.ts                            # cn() helper
│   ├── components/                             # UI, layout, dashboard, projects, invoices, accounts, sync
│   ├── hooks/                                  # TanStack Query hooks
│   └── stores/                                 # Zustand (theme, sidebar)
├── scripts/                                    # create-table.ts, seed.ts
├── tests/                                      # unit, integration, e2e
├── Dockerfile                                  # Multi-stage para ECS
├── docker-compose.yml                          # DynamoDB Local
└── .env.example                                # Variables de entorno
```

---

## API Endpoints

### Auth
| Method | Path | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/[...nextauth]` | NextAuth.js handler |

### Accounts
| Method | Path | Descripcion |
|--------|------|-------------|
| GET | `/api/accounts` | Listar cuentas (filtrar por provider) |
| POST | `/api/accounts` | Crear cuenta |
| GET | `/api/accounts/[id]` | Detalle cuenta |
| PUT | `/api/accounts/[id]` | Actualizar cuenta |
| DELETE | `/api/accounts/[id]` | Eliminar cuenta |
| POST | `/api/accounts/[id]/sync` | Sync manual |

### Projects
| Method | Path | Descripcion |
|--------|------|-------------|
| GET | `/api/projects` | Listar (paginado, filtros) |
| GET | `/api/projects/[id]` | Detalle con financials |
| GET | `/api/projects/[id]/invoices` | Lineas asignadas |

### Invoices
| Method | Path | Descripcion |
|--------|------|-------------|
| GET | `/api/invoices` | Listar (paginado, filtros) |
| GET | `/api/invoices/[id]` | Detalle con lineas |
| POST | `/api/invoices/[id]/assign` | Asignar factura completa a proyecto |
| POST | `/api/invoices/[id]/lines/[n]/assign` | Asignar linea a proyecto |
| POST | `/api/invoices/[id]/lines/[n]/unassign` | Desasignar linea |

### Webhooks
| Method | Path | Descripcion |
|--------|------|-------------|
| POST | `/api/webhooks/jira/[accountId]` | Receiver Jira |
| POST | `/api/webhooks/holded/[accountId]` | Receiver Holded |

### Dashboard
| Method | Path | Descripcion |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | KPIs agregados |

---

## Fases de implementacion

### Fase 1: Fundacion ✅
- Next.js 16 + TypeScript + Tailwind CSS 4 + pnpm
- Docker Compose con DynamoDB Local
- Scripts: create-table (tabla + 2 GSIs), seed
- Core lib: db client, keys, env (Zod), errors (Result), types, crypto (AES-256-GCM)
- Dark mode: CSS variables + theme toggle

### Fase 2: Auth
- Entity `user.ts` + NextAuth.js config
- Login page + middleware protegiendo dashboard
- Seed admin user

### Fase 3: Gestion de cuentas
- Entity `account.ts` con CRUD + encrypted API keys
- API routes + UI (account-list, account-form)
- TanStack Query provider

### Fase 4: Integracion Jira Cloud
- Cliente REST API v3
- Sync: proyectos, issues, sprints, worklogs
- Entity `project.ts` + API routes
- Webhook handler

### Fase 5: Integracion Holded
- Cliente REST API
- Sync: facturas + lineas
- Entity `invoice.ts` + API routes
- Webhook handler

### Fase 6: Sistema de asignacion
- Entity `assignment.ts` con TransactWriteItems
- API routes assign/unassign
- UI: assign-dialog, bulk-assign-dialog
- Optimistic updates

### Fase 7: Dashboard UI
- Layout completo: sidebar, header, breadcrumbs
- Paginas: projects, invoices, accounts, sync
- Data tables con filtros, paginacion, busqueda

### Fase 8: Analytics
- Endpoint agregaciones
- KPI cards, profitability chart, hours chart
- Recent activity feed

### Fase 9: Sync orchestration
- Orquestador multi-cuenta + cola webhooks
- Sync manual per-account y global
- Historial sync

### Fase 10: Hardening + Deploy
- Tests completos (unit, integration)
- Error boundaries, skeletons, toasts
- ECS task definition + ALB

---

## Riesgos y mitigaciones

| Riesgo | Mitigacion |
|--------|------------|
| Rate limits Jira API | Exponential backoff, cache, respetar `Retry-After` |
| Holded API menos documentada | Validacion Zod en responses, tests contra datos reales |
| Webhook unreliable | Sync periodico (cron 15min) + manual fallback |
| DynamoDB single-table complexity | Typing fuerte en `keys.ts`, tests unitarios por query |
| Seguridad API keys | AES-256-GCM at rest, nunca enviar al frontend, SSM para encryption key |
