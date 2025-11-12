# Cultura Connect - Authentication Quick Reference

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CULTURA CONNECT AUTH                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend: Next.js 15 (React 19)                             │
│  Backend: Express.js + MongoDB                               │
│  Auth: JWT + HTTP-only Cookies + Bcrypt                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## File Locations Reference

### Backend Authentication
```
/backend/
├── controller/Auth.js              ✅ Login/Signup/Logout logic
├── middleware/authmiddleware.js    ✅ JWT verification
├── model/User.js                   ✅ User schema + bcrypt
├── model/schema.js                 - Item schema
├── model/Comment.js                - Comment schema
├── routes.js                       - Route definitions
└── .env                            - Configuration (SECRET EXPOSED!)
```

### Frontend Authentication
```
/client/
├── app/
│   ├── login/page.tsx              ✅ Login form
│   ├── signup/page.tsx             ✅ Signup form
│   ├── home/page.tsx               ✅ Main page
│   └── form/page.tsx               - Create item page
├── components/
│   ├── Navbar.tsx                  - Navigation
│   ├── CulturalEntity.tsx           - Item display
│   └── forms/CultureForm.tsx        - Item creation form
├── lib/constants.ts                ✅ API routes config
└── .env                            - Frontend config
```

---

## Authentication Flow

### Login Flow
```
User Browser              Backend Server
     │                          │
     │─── POST /login ──────────>│
     │   {email, password}       │
     │                           │
     │<─ Set-Cookie: token ──────│
     │   {user data}             │
     │                           │
     Redirect to /home
     │
     Stored in HTTP-only cookie
     (Auto-sent with each request)
```

### Protected Request
```
User Browser              Backend Server
     │                          │
     │─── GET /fetch/id ────────>│
     │ (+ cookie)                │
     │                           ├─ Verify JWT
     │                           ├─ Check expiry
     │<─── Return data ──────────│
     │
```

### Logout Flow
```
User Browser              Backend Server
     │                          │
     │─── POST /logout ─────────>│
     │ (+ cookie, requires auth) │
     │                           │
     │<─ Clear-Cookie: token ───│
     │   {success message}       │
```

---

## Current Security Status

### Protected Endpoints (3)
```
✅ GET  /api/item/fetch/:id      - Auth required
✅ PUT  /api/item/update/:id     - Auth required
✅ DELETE /api/item/delete/:id   - Auth required
```

### Unprotected Endpoints (5)
```
❌ POST /api/item/create         - NO AUTH (CRITICAL)
❌ GET  /api/item/fetch          - Public
❌ GET  /api/item/users          - Public
❌ PUT  /api/item/like/:id       - Public
❌ GET  /api/item/comments/:id   - Public
```

### Frontend Routes
```
❌ /login                         - Accessible without login
❌ /signup                        - Accessible without login
❌ /home                          - Accessible without login
❌ /form                          - Accessible without login
(No route protection = Anyone can access)
```

---

## Security Scorecard

| Feature | Status | Notes |
|---------|--------|-------|
| **Password Hashing** | ✅ | bcrypt with 10 salt rounds |
| **JWT Tokens** | ✅ | 7-day expiration |
| **HTTP-only Cookies** | ✅ | Protected against XSS |
| **CSRF Protection** | ✅ | sameSite: strict |
| **Email Uniqueness** | ✅ | Enforced at DB level |
| **Auth Persistence** | ❌ | Lost on page refresh |
| **Protected Routes** | ❌ | Frontend has no guards |
| **Protected Create** | ❌ | Anyone can create items |
| **Rate Limiting** | ❌ | Brute force vulnerability |
| **Password Requirements** | ❌ | No strength validation |
| **Email Verification** | ❌ | No confirmation flow |
| **Password Reset** | ❌ | No forgot password |
| **Refresh Tokens** | ❌ | No token rotation |
| **Token Blacklist** | ❌ | Can't revoke on logout |
| **Role-Based Access** | ❌ | No admin/user roles |
| **Audit Logging** | ❌ | No activity tracking |

---

## Critical Issues (Fix ASAP)

### 1. Unprotected Create Endpoint
**Risk**: Anyone can create items as any user
**Location**: `/backend/routes.js` line 28-35
**Fix**: Add `authenticate` middleware to create route

```javascript
// Current (VULNERABLE)
route.post('/create', upload.fields(...), create);

// Should be
route.post('/create', authenticate, upload.fields(...), create);
```

### 2. No Frontend Auth Context
**Risk**: No global auth state, users lost on refresh
**Location**: Scattered across multiple pages
**Fix**: Create AuthContext + Provider + useAuth hook

### 3. No Protected Routes
**Risk**: All pages accessible even if not logged in
**Location**: `/client/app/**`
**Fix**: Add middleware.ts to protect pages

### 4. No Token Refresh
**Risk**: Users forced to log in every 7 days
**Location**: `/backend/controller/Auth.js`
**Fix**: Implement refresh token mechanism

---

## Key Numbers

| Metric | Value |
|--------|-------|
| JWT Expiration | 7 days |
| Bcrypt Salt Rounds | 10 |
| Cookie Max Age | 7 days |
| Protected Backend Routes | 3 out of 8 (37%) |
| Protected Frontend Routes | 0 out of 4 (0%) |
| Critical Security Issues | 5+ |
| Missing Auth Features | 6+ |

---

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String,        // Required
  email: String,           // Required, Unique, Lowercase
  password: String,        // Required, Hashed with bcrypt
  createdAt: Date,
  updatedAt: Date
}
```

### Item Collection
```javascript
{
  _id: ObjectId,
  CultureName: String,
  CultureDescription: String,
  Region: String,
  Significance: String,
  created_by: ObjectId,    // Refs User - NO OWNER CHECK!
  ImageURL: String,
  VideoURL: String,
  Likes: Number,
  Saves: Number,
  likedBy: [ObjectId],     // Array of user IDs
  savedBy: [ObjectId],     // Array of user IDs
  createdAt: Date,
  updatedAt: Date
}
```

---

## Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=oosipodu                    # EXPOSED IN GIT!
DB_URL=mongodb+srv://...               # MongoDB connection
TOKEN_EXPIRES_IN=7d                    # Optional
CLIENT_URLS=http://localhost:3000      # CORS config

# Unused (Legacy MySQL config)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=1
MYSQL_DATABASE=culturedb
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

---

## Dependencies

### Authentication Libraries
- `jsonwebtoken` (9.0.2) - JWT generation/verification
- `bcryptjs` (3.0.2) - Password hashing
- `bcrypt` (5.1.1) - Alternative password hashing
- `cookie-parser` (1.4.7) - Parse cookies
- `cors` (2.8.5) - CORS handling
- `express` (4.21.2) - Web framework

### Supporting Libraries
- `mongoose` (8.10.0) - MongoDB ODM
- `joi` (17.13.3) - Schema validation
- `multer` (2.0.1) - File uploads
- `axios` (1.8.3) - HTTP client (frontend)
- `next` (15.1.5) - Framework (frontend)
- `react` (19.0.0) - UI (frontend)

---

## Next Steps (Priority Order)

### Immediate (This Week)
- [ ] Add authenticate middleware to /api/item/create
- [ ] Create AuthContext + Provider
- [ ] Add protected route wrapper
- [ ] Implement session persistence

### High Priority (This Month)
- [ ] Refresh token mechanism
- [ ] Email verification
- [ ] Password reset flow
- [ ] Rate limiting

### Medium Priority (Next Month)
- [ ] Password strength requirements
- [ ] Logout token blacklist
- [ ] Role-based access control
- [ ] Activity logging

### Low Priority (Future)
- [ ] OAuth integration
- [ ] Two-factor authentication
- [ ] Passwordless login
- [ ] Advanced security features

---

## Testing Checklist

### Manual Testing
- [ ] Sign up with valid email
- [ ] Try sign up with existing email
- [ ] Try weak password (if validation added)
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Create item while logged in
- [ ] Try create item while logged out (should fail after fix)
- [ ] Logout and verify session cleared
- [ ] Refresh page - should still be logged in
- [ ] Wait 7 days (or mock token expiry)

### Security Testing
- [ ] Try creating item without auth header
- [ ] Try updating someone else's item
- [ ] Try deleting someone else's item
- [ ] Send token in Authorization header
- [ ] Access protected page without login
- [ ] Inspect auth cookie in DevTools
- [ ] Check if password is hashed in DB
- [ ] Test CORS from different origin

---

## Common Gotchas

1. **JWT Secret in .env**: Stored in git repo (SECURITY ISSUE)
2. **No Token Refresh**: Users logged out after 7 days
3. **Create Not Protected**: Anyone can impersonate anyone
4. **Frontend Loss on Refresh**: No persistent session
5. **No Email Verification**: Fake emails accepted
6. **Alert() for Errors**: Poor user experience
7. **localhost URLs**: Hardcoded for development
8. **localStorage userId**: Exposed user ID

---

## Useful Commands

```bash
# Backend startup
cd backend && npm install && npm start

# Frontend startup
cd client && npm install && npm run dev

# Test signup
curl -X POST http://localhost:5000/api/item/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass"}'

# Test login
curl -X POST http://localhost:5000/api/item/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}' \
  -c cookies.txt

# Test protected endpoint
curl http://localhost:5000/api/item/fetch/123 \
  -b cookies.txt
```

---

## Quick Links

- Analysis Document: `/AUTHENTICATION_ANALYSIS.md`
- Routes: `/backend/routes.js`
- Auth Controller: `/backend/controller/Auth.js`
- User Model: `/backend/model/User.js`
- Auth Middleware: `/backend/middleware/authmiddleware.js`
- Login Page: `/client/app/login/page.tsx`
- Signup Page: `/client/app/signup/page.tsx`
- API Config: `/client/lib/constants.ts`

