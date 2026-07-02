# Community Connect — Backend Implementation Plan

Build the complete Node.js + Express + TypeScript backend for a community-based platform combining e-commerce and a social/family directory, targeting a Gujarat/Surat community.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` |
| Validation | Zod |
| File Upload | Multer (local `/uploads` dir, served statically) |
| CORS | `cors` package, origin from `FRONTEND_ORIGIN` env var |

## Proposed Changes

### 1. Project Scaffolding

#### [NEW] `package.json`
Initialize with all dependencies: `express`, `@prisma/client`, `prisma`, `jsonwebtoken`, `bcrypt`, `zod`, `multer`, `cors`, `dotenv`, and their `@types/*` counterparts. Scripts: `dev` (ts-node-dev), `build` (tsc), `start` (node dist/server.js), `seed` (ts-node prisma/seed.ts).

#### [NEW] `tsconfig.json`
Target ES2020, strict mode, outDir `dist`, rootDir `src`.

#### [NEW] `.env.example`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/community_connect
JWT_SECRET=your-secret-key
FRONTEND_ORIGIN=http://localhost:5173
PORT=3000
```

---

### 2. Prisma Schema & Database

#### [NEW] `prisma/schema.prisma`
Complete schema implementing every model from the shared contract:
- **Enums**: `Role`, `IndustrySegment`, `ProduceCategory`, `ProduceUnit`, `WomenProductCategory`, `SocialServiceCategory`, `ProviderType`, `EnquiryListingType`, `EnquiryStatus`, `CartItemType`, `OrderStatus`, `Relation`, `Gender`, `MaritalStatus`
- **Models**: `User`, `Business`, `IndustryProduct`, `FarmerProduce`, `WomenProduct`, `SocialService`, `Enquiry`, `CartItem`, `Order`, `OrderItem`, `Family`, `FamilyMember`
- All IDs use `uuid()`, relations properly defined, indexes on `city`, `segment`/`category`, and searchable text fields.

#### [NEW] `prisma/seed.ts`
Seeds: industry segment values, 2 sample users (1 admin, 1 member), and 2–3 sample listings per module so the frontend has data immediately.

---

### 3. Application Entry Points

#### [NEW] `src/app.ts`
Express app setup: JSON body parsing, CORS, static file serving for `/uploads`, mount all route modules, centralized error handler.

#### [NEW] `src/server.ts`
Reads `PORT` from env, starts listening. Lightweight cold start — no heavy synchronous work.

---

### 4. Middleware

#### [NEW] `src/middleware/auth.ts`
- `authenticate`: Verifies JWT from `Authorization: Bearer <token>`, attaches `req.user = { userId, role }`.

#### [NEW] `src/middleware/ownership.ts`
- `checkOwnership(resourceFetcher)`: Verifies `req.user.userId === resource.ownerId` (or `headOfFamilyUserId` for family routes) OR `role === ADMIN`.

#### [NEW] `src/middleware/validate.ts`
- `validate(schema)`: Zod middleware — parses `req.body` against schema; on failure returns 400 with `VALIDATION_ERROR`.

#### [NEW] `src/middleware/errorHandler.ts`
- Centralized error handler returning the exact error envelope `{ success: false, error: { code, message } }`. Never leaks stack traces.

---

### 5. Zod Validation Schemas

#### [NEW] `src/schemas/auth.schema.ts`
Register, login, update profile schemas.

#### [NEW] `src/schemas/industry.schema.ts`
Create/update business, create/update product schemas.

#### [NEW] `src/schemas/farmer.schema.ts`
Create/update produce schema.

#### [NEW] `src/schemas/women.schema.ts`
Create/update women product schema.

#### [NEW] `src/schemas/socialWork.schema.ts`
Create/update social service schema.

#### [NEW] `src/schemas/enquiry.schema.ts`
Create enquiry schema.

#### [NEW] `src/schemas/cart.schema.ts`
Add to cart, update quantity schemas.

#### [NEW] `src/schemas/order.schema.ts`
Create order (checkout) schema.

#### [NEW] `src/schemas/family.schema.ts`
Create/update family, create/update family member schemas.

---

### 6. Utility Helpers

#### [NEW] `src/utils/response.ts`
Helper functions: `successResponse(data, message?)`, `paginatedResponse(data, meta)`, `errorResponse(code, message, statusCode)`.

#### [NEW] `src/utils/pagination.ts`
Parses `page`, `limit` from query params, computes `skip`/`take`, builds `meta` object.

#### [NEW] `src/utils/jwt.ts`
`signToken(payload)`, `verifyToken(token)` wrappers.

#### [NEW] `src/utils/upload.ts`
Multer config: single file field `"image"`, validates image type, max 5MB, stores under `/uploads`.

---

### 7. Routes, Controllers & Services (one per module)

Each module follows the pattern: **route** → **controller** → **service** → **Prisma**.

#### Auth Module
- `src/routes/auth.routes.ts`
- `src/controllers/auth.controller.ts`
- `src/services/auth.service.ts`
- Endpoints: `POST /register`, `POST /login`, `GET /me`, `PUT /me`, `POST /logout`

#### Industry Module
- `src/routes/industry.routes.ts`
- `src/controllers/industry.controller.ts`
- `src/services/industry.service.ts`
- Endpoints: `GET /segments`, full CRUD for businesses & products

#### Farmer Module
- `src/routes/farmer.routes.ts`
- `src/controllers/farmer.controller.ts`
- `src/services/farmer.service.ts`
- Endpoints: full CRUD for produce

#### Women Entrepreneur Module
- `src/routes/women.routes.ts`
- `src/controllers/women.controller.ts`
- `src/services/women.service.ts`
- Endpoints: full CRUD for women products

#### Cart & Orders Module
- `src/routes/cart.routes.ts`, `src/routes/order.routes.ts`
- `src/controllers/cart.controller.ts`, `src/controllers/order.controller.ts`
- `src/services/cart.service.ts`, `src/services/order.service.ts`
- Cart supports mixed `FARMER_PRODUCE` + `WOMEN_PRODUCT` items
- Checkout uses a **Prisma transaction**: resolves live prices, checks stock, creates Order + OrderItems, decrements stock, clears cart. Rejects with clear error if insufficient quantity.

#### Social Work Module
- `src/routes/socialWork.routes.ts`
- `src/controllers/socialWork.controller.ts`
- `src/services/socialWork.service.ts`
- Endpoints: full CRUD for social services

#### Enquiries Module
- `src/routes/enquiry.routes.ts`
- `src/controllers/enquiry.controller.ts`
- `src/services/enquiry.service.ts`
- `POST /api/enquiries` resolves `sellerId` server-side (never trusts client)
- `GET /received`, `GET /sent`

#### Social Contacts (Families) Module
- `src/routes/family.routes.ts`
- `src/controllers/family.controller.ts`
- `src/services/family.service.ts`
- Family CRUD + member CRUD (nested under family)

#### Uploads Module
- `src/routes/upload.routes.ts`
- `src/controllers/upload.controller.ts`
- `POST /api/uploads/image` — multipart, validates image type & 5MB limit

#### Health Check
- `GET /api/health` → 200, no auth, no DB call

#### Admin Module
- `src/routes/admin.routes.ts`
- `src/controllers/admin.controller.ts`
- `src/services/admin.service.ts`
- `GET /pending-verifications`, `PUT /verify/:type/:id`

---

### 8. Final File Tree

```
ecommercecommunity/
├── .env.example
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    ├── app.ts
    ├── server.ts
    ├── middleware/
    │   ├── auth.ts
    │   ├── ownership.ts
    │   ├── validate.ts
    │   └── errorHandler.ts
    ├── schemas/
    │   ├── auth.schema.ts
    │   ├── industry.schema.ts
    │   ├── farmer.schema.ts
    │   ├── women.schema.ts
    │   ├── socialWork.schema.ts
    │   ├── enquiry.schema.ts
    │   ├── cart.schema.ts
    │   ├── order.schema.ts
    │   └── family.schema.ts
    ├── routes/
    │   ├── auth.routes.ts
    │   ├── industry.routes.ts
    │   ├── farmer.routes.ts
    │   ├── women.routes.ts
    │   ├── cart.routes.ts
    │   ├── order.routes.ts
    │   ├── socialWork.routes.ts
    │   ├── enquiry.routes.ts
    │   ├── family.routes.ts
    │   ├── upload.routes.ts
    │   ├── admin.routes.ts
    │   └── health.routes.ts
    ├── controllers/
    │   ├── auth.controller.ts
    │   ├── industry.controller.ts
    │   ├── farmer.controller.ts
    │   ├── women.controller.ts
    │   ├── cart.controller.ts
    │   ├── order.controller.ts
    │   ├── socialWork.controller.ts
    │   ├── enquiry.controller.ts
    │   ├── family.controller.ts
    │   ├── upload.controller.ts
    │   └── admin.controller.ts
    ├── services/
    │   ├── auth.service.ts
    │   ├── industry.service.ts
    │   ├── farmer.service.ts
    │   ├── women.service.ts
    │   ├── cart.service.ts
    │   ├── order.service.ts
    │   ├── socialWork.service.ts
    │   ├── enquiry.service.ts
    │   ├── family.service.ts
    │   └── admin.service.ts
    └── utils/
        ├── response.ts
        ├── pagination.ts
        ├── jwt.ts
        ├── prisma.ts
        └── upload.ts
```

## Key Design Decisions

1. **Prisma connection pool size** kept modest (connection_limit=5) for Render free tier compatibility.
2. **Local file storage** for uploads with a stubbed interface so S3 can be swapped in later.
3. **Checkout transaction** is atomic — either the entire order succeeds or rolls back.
4. **Enquiry sellerId** is always resolved server-side for security.
5. **Health endpoint** does zero DB work for fast cold-start pinger responses.

## Verification Plan

### Automated Tests
- Run `npx prisma validate` to verify schema correctness
- Run `npx tsc --noEmit` to verify TypeScript compiles without errors
- Run `npm run build` to confirm production build succeeds

### Manual Verification
- Start the dev server and hit key endpoints with curl:
  - `GET /api/health` → 200
  - `POST /api/auth/register` → creates user
  - `POST /api/auth/login` → returns token
  - `GET /api/industry/segments` → returns segments list
  - `GET /api/farmer/produce` → returns paginated produce
