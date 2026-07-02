# Community Connect Platform — Build Prompts

Two ready-to-paste prompts: one for **Gemini 2.5 Flash** (frontend) and one for **Claude Opus** (backend).
Section 1 is a **shared contract** — it appears inside both prompts word-for-word. That's what keeps the two AIs from drifting apart and producing endpoints/fields that don't match.

Assumptions I made (edit before pasting if wrong):
- Single community per deployment (not multi-tenant across many communities).
- Farmer and Women Entrepreneur both have real cart/checkout, sharing one cart and one checkout flow. Industry and Social Work stay enquiry-based (buyer sends interest, contact happens over phone/WhatsApp) since those are more B2B/bulk or free-service in nature.
- Payment gateway is stubbed (Razorpay-ready but not wired to a live key) — tell me if you want it fully wired.
- Stack: React + Vite + TypeScript + Tailwind on the frontend; Node.js + Express + TypeScript + PostgreSQL + Prisma on the backend. This is a free-tier-friendly, well-documented stack — Render's free plan supports both a static site (frontend) and a web service (backend) on it with no extra config.
- Hosting: Render free tier. Free web services spin down after ~15 min of inactivity and take 30-60s to wake back up on the next request — I've added a `/api/health` endpoint and a note on using a free uptime pinger (e.g. cron-job.org or UptimeRobot) to keep it warm. See section 5.

---

## 1. Shared Contract (identical in both prompts)

### Modules
1. **Industry Directory** — businesses list themselves under a segment; each business has products.
2. **Farmer Marketplace** — farmers list produce directly, cutting out the retailer markup.
3. **Women Entrepreneur Store** — real shopping experience: browse, cart, checkout.
4. **Social Work / Free Services** — NGOs and individuals list free services (tuition, camps, etc.).
5. **Social Contacts (Family Directory)** — families create a profile, add members with matrimonial-style detail, searchable/filterable, usable as a community directory and informally as a matrimonial tool.

### Data Model (field names must match exactly)

```
User
  id, fullName, email, phone, passwordHash, city, state,
  role (MEMBER | ADMIN), profilePhotoUrl, isVerified, createdAt, updatedAt

Business                      // Industry module
  id, ownerId -> User, businessName, segment, description,
  city, state, address, contactPhone, whatsappNumber, contactEmail,
  logoUrl, gstNumber?, isVerified, createdAt

IndustryProduct
  id, businessId -> Business, name, description, category,
  priceRange, unit, images[], moq, isActive, createdAt

FarmerProduce
  id, ownerId -> User, cropName, category (VEGETABLE|FRUIT|GRAIN|DAIRY|OTHER),
  pricePerUnit, unit (KG|DOZEN|QUINTAL), quantityAvailable, harvestDate,
  village, city, images[], isOrganic, isActive, createdAt

WomenProduct
  id, ownerId -> User, name, description,
  category (HANDICRAFTS|FOOD_PICKLES|CLOTHING_BOUTIQUE|JEWELLERY_ACCESSORIES|BEAUTY_WELLNESS|HOME_DECOR|OTHERS),
  price, stockQuantity, images[], isActive, createdAt

SocialService
  id, ownerId -> User, providerType (INDIVIDUAL|NGO), serviceName,
  category (EDUCATION_TUITION|HEALTHCARE_CAMP|SKILL_TRAINING|COUNSELING|LEGAL_AID|OTHERS),
  description, schedule, city, address, contactPhone, isActive, createdAt

Enquiry                       // shared across Industry/SocialWork (Farmer & Women use cart instead)
  id, listingType (INDUSTRY_PRODUCT|SOCIAL_SERVICE),
  listingId, buyerId -> User, sellerId -> User, message, contactPhone,
  status (PENDING|CONTACTED|CLOSED), createdAt

CartItem                      // shared cart: farmer produce + women's products together
  id, userId -> User, itemType (FARMER_PRODUCE|WOMEN_PRODUCT), itemId, quantity

Order
  id, userId -> User, totalAmount, status (PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELLED),
  shippingAddress, createdAt
OrderItem
  id, orderId -> Order, itemType (FARMER_PRODUCE|WOMEN_PRODUCT), itemId,
  itemNameSnapshot, quantity, priceAtPurchase

Family
  id, headOfFamilyUserId -> User, familyName, nativePlace, currentCity,
  currentState, currentAddress, contactPhone, contactEmail, isPublic, createdAt

FamilyMember
  id, familyId -> Family, fullName, relation (SELF|SPOUSE|SON|DAUGHTER|FATHER|MOTHER|OTHER),
  gender, dob, education, profession, companyName,
  maritalStatus (SINGLE|MARRIED|ENGAGED|DIVORCED|WIDOWED), photoUrl, bio, createdAt
```

**Industry segments** (Gujarat/Surat-relevant): `TEXTILE, CHEMICAL, MECHANICAL_ENGINEERING, DIAMOND_JEWELLERY, PLASTICS, CERAMICS, PHARMA, FOOD_PROCESSING, IT_SERVICES, REAL_ESTATE, LOGISTICS, AUTOMOBILE_PARTS, HANDICRAFTS, OTHERS`

### API Response Envelope (must match exactly)

Success (single item):
```json
{ "success": true, "data": { }, "message": "optional" }
```
Success (list, paginated):
```json
{ "success": true, "data": [ ], "meta": { "page": 1, "limit": 20, "total": 123, "totalPages": 7 } }
```
Error:
```json
{ "success": false, "error": { "code": "STRING_CODE", "message": "human readable message" } }
```

### Auth
- `Authorization: Bearer <JWT>` header on every protected request.
- JWT payload: `{ userId, role }`.

### Standard query params on list endpoints
`page`, `limit`, `search`, `city`, `segment`/`category` (module-specific), `sortBy`, `order`

### Full Endpoint Map (must match exactly — do not invent alternate paths)

```
Auth
  POST   /api/auth/register        { fullName, email, phone, password, city, state }
  POST   /api/auth/login           { email|phone, password } -> { token, user }
  GET    /api/auth/me              (auth)
  PUT    /api/auth/me              (auth)
  POST   /api/auth/logout          (auth)

Industry
  GET    /api/industry/segments
  GET    /api/industry/businesses                          ?segment&city&search&page&limit
  POST   /api/industry/businesses                          (auth)
  GET    /api/industry/businesses/:businessId
  PUT    /api/industry/businesses/:businessId               (auth, owner)
  DELETE /api/industry/businesses/:businessId               (auth, owner)
  GET    /api/industry/businesses/:businessId/products
  POST   /api/industry/businesses/:businessId/products      (auth, owner)
  GET    /api/industry/products/:productId
  PUT    /api/industry/products/:productId                  (auth, owner)
  DELETE /api/industry/products/:productId                  (auth, owner)

Farmer
  GET    /api/farmer/produce                                ?category&city&search&page&limit
  POST   /api/farmer/produce                                (auth)
  GET    /api/farmer/produce/:id
  PUT    /api/farmer/produce/:id                             (auth, owner)
  DELETE /api/farmer/produce/:id                             (auth, owner)

Women Entrepreneur
  GET    /api/women/products                                ?category&city&search&page&limit
  POST   /api/women/products                                (auth)
  GET    /api/women/products/:id
  PUT    /api/women/products/:id                             (auth, owner)
  DELETE /api/women/products/:id                             (auth, owner)

Cart & Orders (shared by Farmer Produce + Women's Products)
  GET    /api/cart                                           (auth)
  POST   /api/cart                                           (auth) { itemType: FARMER_PRODUCE|WOMEN_PRODUCT, itemId, quantity }
  PUT    /api/cart/:itemId                                   (auth) { quantity }
  DELETE /api/cart/:itemId                                   (auth)
  POST   /api/orders                                         (auth) { shippingAddress } — checkout entire cart (mixed item types ok)
  GET    /api/orders                                         (auth)
  GET    /api/orders/:id                                     (auth)

Social Work
  GET    /api/social-work/services                          ?category&city&search&page&limit
  POST   /api/social-work/services                          (auth)
  GET    /api/social-work/services/:id
  PUT    /api/social-work/services/:id                       (auth, owner)
  DELETE /api/social-work/services/:id                       (auth, owner)

Enquiries (used by Industry and Social Work only)
  POST   /api/enquiries                                      (auth) { listingType, listingId, message, contactPhone }
  GET    /api/enquiries/received                             (auth)
  GET    /api/enquiries/sent                                 (auth)

Health (for uptime pinger — see section 5)
  GET    /api/health                                          -> 200 OK, no auth, no DB call

Social Contacts
  GET    /api/families                                       ?city&search&page&limit
  POST   /api/families                                       (auth)
  GET    /api/families/:id
  PUT    /api/families/:id                                    (auth, owner)
  DELETE /api/families/:id                                    (auth, owner)
  POST   /api/families/:id/members                            (auth, owner)
  PUT    /api/family-members/:memberId                        (auth, owner)
  DELETE /api/family-members/:memberId                        (auth, owner)

Uploads
  POST   /api/uploads/image                                   (auth) multipart/form-data -> { url }

Admin
  GET    /api/admin/pending-verifications                     (auth, admin)
  PUT    /api/admin/verify/:type/:id                          (auth, admin)
```

---

## 2. FRONTEND PROMPT — paste this into Gemini 2.5 Flash

```
You are building the frontend for "Community Connect" — a platform for a specific
community in Gujarat, India that combines e-commerce and a social/family directory.
Keep the UI classic, clean, and interactive — NOT flashy or over-designed. Think
"well-built Indian community portal", not a startup landing page. Mobile-first,
since most users will open this on a phone.

TECH STACK
- React 18 + Vite + TypeScript
- Tailwind CSS for styling
- React Router v6 for routing
- TanStack Query (React Query) for all server data fetching/caching
- Axios for HTTP, with a single configured instance (baseURL from
  import.meta.env.VITE_API_BASE_URL, JWT attached via request interceptor from
  localStorage, 401 responses auto-redirect to /login)
- React Hook Form + Zod for all forms and validation
- Zustand (or React Context) for auth state (current user, token)
- lucide-react for icons

DESIGN DIRECTION
- Warm, trustworthy palette: deep blue or maroon as primary, warm amber/saffron
  as accent, neutral off-white background. Avoid pure black/white, avoid gradients
  everywhere.
- Card-based layouts for all listings (business cards, produce cards, product
  cards, family cards).
- Simple top navbar: logo, module dropdown/links, search, profile menu.
- Clear typography hierarchy, generous spacing, no dense cramped grids.
- Loading skeletons (not spinners) for lists. Toast notifications for
  success/error. Simple modals for confirmations.

APP STRUCTURE (module home first, then sub-pages)
1. Landing page (public) — brief platform explanation, 5 module cards
   (Industry, Farmer, Women Entrepreneur, Social Work, Social Contacts), CTA to
   register/login.
2. Auth: /login, /register — email or phone + password, city/state fields on
   register.
3. Dashboard (after login) — 5 module cards as entry points, plus "My Listings"
   and "My Enquiries" shortcuts.
4. Industry module
   - /industry — segment filter chips, business grid, search, city filter
   - /industry/:businessId — business details + its product list
   - /industry/products/:productId — product detail + "Send Enquiry" button
     (opens modal: message + contact phone -> POST /api/enquiries)
   - /industry/new, /industry/:businessId/edit — business form
   - /industry/:businessId/products/new — product form
5. Farmer module (full shopping flow, shares cart with Women Entrepreneur)
   - /farmer — category filter (vegetable/fruit/grain/dairy), city filter, grid
     of produce cards showing crop, price/unit, quantity available, village,
     "Add to Cart" button (respects quantityAvailable as max)
   - /farmer/:id — detail, quantity selector, add to cart
   - /farmer/new, /farmer/:id/edit — produce form (for farmers listing produce)
6. Women Entrepreneur module (full shopping flow, shares cart with Farmer)
   - /women — category filter, product grid with price + "Add to Cart"
   - /women/:id — product detail, quantity selector, add to cart
   - /women/new, /women/:id/edit — product form (for sellers)
6b. Shared Cart & Checkout (items from Farmer and Women modules can sit in the
   same cart together)
   - /cart — cart items grouped visually by type (Farmer Produce / Women's
     Products), quantity edit, remove, running total, "Checkout" button
   - /checkout — shipping address form -> POST /api/orders
   - /orders — order history with status, each order showing its mixed items
7. Social Work module
   - /social-work — category filter (tuition/health camp/skill training/etc.),
     city filter, service grid
   - /social-work/:id — detail + "Contact / Enquire"
   - /social-work/new, /social-work/:id/edit — service form
8. Social Contacts module
   - /families — search + city filter, family cards showing family name,
     native place, current city, member count
   - /families/:id — full family detail: head of family, address, contact,
     and a table/list of every member (name, relation, age from dob,
     education, profession, company, marital status, photo, bio)
   - /families/new — create family profile form
   - /families/:id/edit — edit family
   - /families/:id/members/new, /family-members/:memberId/edit — member form
     with ALL fields (this is the matrimonial-detail form: name, relation,
     gender, dob, education, profession, company, marital status, photo, bio)
9. Profile — /profile — edit own user info, "My Listings" across all 4
   e-commerce modules, "My Family" shortcut, "My Enquiries" (Industry + Social
   Work, sent + received), "My Orders" (Farmer + Women purchases)
10. Admin — /admin/verifications — list of pending business/user verifications
    with approve button (only visible if role === 'ADMIN')

SHARED COMPONENTS TO BUILD
Navbar, Footer, ProtectedRoute (redirects to /login if no token),
AdminRoute, Card (generic), ListingCard (variant per module),
FamilyCard, FilterBar (search + dropdowns), Pagination, ImageUploader
(calls POST /api/uploads/image, shows preview), Modal, Toast, EmptyState,
LoadingSkeleton, Badge (for verified/isOrganic/isVerified tags).

API INTEGRATION — use this exact contract, do not invent your own field
names or endpoint paths:

[PASTE the entire "1. Shared Contract" section from above here — data model,
response envelope, auth header, and full endpoint map]

FOLDER STRUCTURE
src/
  api/          (axios instance + one file per module: auth.ts, industry.ts,
                 farmer.ts, women.ts, cart.ts, socialWork.ts, families.ts,
                 uploads.ts, enquiries.ts — each exporting typed functions
                 matching the endpoint map exactly)
  components/
  pages/
  hooks/        (useAuth, useCart, etc.)
  store/        (zustand auth store)
  types/        (TypeScript interfaces matching the data model exactly)
  routes/

Build every page listed above, fully wired to the API layer (no mock data —
call the real endpoints via the api/ functions). Handle loading, empty, and
error states on every list/detail page. Keep components small and reusable.
Do not add features not listed here.
```

---

## 3. BACKEND PROMPT — paste this into Claude Opus

```
You are building the backend for "Community Connect" — a platform for a
specific community in Gujarat, India that combines e-commerce and a social/
family directory. The frontend is being built separately in React and will
call your API exactly as specified below — match it precisely, including
field names, endpoint paths, and response shape, or the two will not connect.

TECH STACK
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT auth (jsonwebtoken) + bcrypt for password hashing
- Zod for request validation
- Multer for handling image upload multipart requests (store locally under
  /uploads and serve statically, or stub an S3-style upload function behind
  an interface so it's easy to swap later)
- cors configured to allow the frontend origin from an env var
  FRONTEND_ORIGIN
- Centralized error-handling middleware that always returns the error
  envelope shown below (never leak raw stack traces to the client)

DATA MODEL / API CONTRACT — implement exactly this, field-for-field:

[PASTE the entire "1. Shared Contract" section from above here — data model,
response envelope, auth header, and full endpoint map]

IMPLEMENTATION REQUIREMENTS
1. Prisma schema: create a complete schema.prisma implementing every model
   above with correct relations, enums, and appropriate @default/@updatedAt.
   Use uuid() for all ids. Add indexes on city, segment/category, and search-
   relevant text fields.
2. Auth
   - POST /api/auth/register: hash password with bcrypt (cost 12), create
     User, return { token, user } (omit passwordHash from response).
   - POST /api/auth/login: accept email OR phone + password.
   - Auth middleware: verify JWT from Authorization: Bearer header, attach
     req.user = { userId, role }.
   - Ownership middleware: for PUT/DELETE routes marked "(auth, owner)",
     verify req.user.userId matches the resource's ownerId (or
     headOfFamilyUserId for family routes) OR req.user.role === 'ADMIN'.
3. Every list endpoint must support page, limit (default 20), search
   (case-insensitive partial match on the relevant name/description fields),
   city, and the module-specific category/segment filter — and must return
   the paginated envelope with meta.
4. Every single-resource GET/POST/PUT/DELETE must return the single-item
   envelope.
5. Enquiries: POST /api/enquiries must resolve sellerId server-side by
   looking up the listing (based on listingType + listingId) — never trust
   a sellerId from the client.
6. Cart & Orders: cart items can be a mix of FARMER_PRODUCE and WOMEN_PRODUCT
   (distinguished by CartItem.itemType). POST /api/orders must read the
   caller's current CartItems, resolve each item's live price and available
   quantity from the correct table based on itemType, compute totalAmount,
   create an Order + OrderItems (storing itemNameSnapshot and
   priceAtPurchase) in a single Prisma transaction, decrement
   stockQuantity/quantityAvailable on the source record, and clear the cart.
   Reject checkout with a clear error code if any item's available quantity
   is insufficient.
7. Health check: GET /api/health returns 200 with { success: true, data: { status: "ok" } }
   immediately, with no database query and no auth — this is hit every few
   minutes by an external uptime pinger to prevent the Render free-tier
   service from cold-sleeping, so it needs to respond fast and never depend
   on the DB connection being warm.
8. Image upload: POST /api/uploads/image accepts multipart/form-data field
   "image", validates it's an image type and under 5MB, stores it, and
   returns { success: true, data: { url } }.
9. Validation: every POST/PUT body validated with a Zod schema before
   touching the database; on failure return 400 with error.code
   "VALIDATION_ERROR" and a message listing the failing fields.
10. Seed script: seed the industry segments enum values, a couple of sample
   admin/member users, and a handful of sample listings per module so the
   frontend has data to render immediately.
11. Keep the server lightweight on cold start: avoid heavy synchronous work
   in app startup, and make sure Prisma's connection pool size is modest
   (Render free Postgres + free web service both have low connection limits).

FOLDER STRUCTURE
src/
  routes/        (one file per module, matching the endpoint map)
  controllers/
  services/      (business logic, e.g. checkout transaction)
  middleware/    (auth.ts, ownership.ts, errorHandler.ts, validate.ts)
  schemas/       (zod schemas per module)
  prisma/schema.prisma
  utils/
  app.ts
  server.ts
.env.example (DATABASE_URL, JWT_SECRET, FRONTEND_ORIGIN, PORT)

Return the response envelope exactly as specified for every endpoint,
including errors. Implement every route in the endpoint map — no more, no
fewer, and no renamed paths — so the React frontend can call it without any
adjustment.
```

---

## 4. Order of operations
1. Paste the backend prompt into Claude Opus first, get the API running and confirm the seed data returns correctly (hit a few endpoints with curl/Postman).
2. Paste the frontend prompt into Gemini, set `VITE_API_BASE_URL` to your running backend URL.
3. Because both prompts share the exact same contract block, the two shouldn't need any endpoint renaming to connect — but always sanity-check auth header handling and the pagination meta shape first, since those are the two things most likely to silently mismatch.

## 5. Hosting on Render (free tier) + stopping cold starts

**Backend** — Render "Web Service", free plan:
- Build command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- Start command: `npm run start` (should run the compiled `dist/server.js`)
- Env vars to set in Render dashboard: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN`, `PORT` (Render sets `PORT` for you — make sure `server.ts` reads `process.env.PORT`)
- Database: Render's free Postgres works, but it expires after 90 days on the free plan — note that on your calendar, or use a free-forever Postgres like Neon/Supabase and just point `DATABASE_URL` at it instead.

**Frontend** — Render "Static Site", free plan:
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Env var: `VITE_API_BASE_URL` set to your backend's Render URL

**The cold-start problem**: Render's free web services spin down after ~15 minutes with no traffic, and the next request pays a 30-60 second cold-start penalty. A static site (your frontend) doesn't have this problem — only the backend does.

To stop it from sleeping, use a free "keep-alive" pinger that hits your `/api/health` endpoint every 10-14 minutes (must be under 15):
- **cron-job.org** — free, no signup limits, just point it at `https://your-backend.onrender.com/api/health` on a schedule.
- **UptimeRobot** — free tier also works and doubles as uptime monitoring/alerts if the service actually goes down.

Either one is enough on its own — you don't need both. This keeps the backend permanently warm without you paying for Render's paid tier.
