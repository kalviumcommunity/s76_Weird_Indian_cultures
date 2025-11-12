# Cultura Connect - Authentication Architecture Analysis

## Executive Summary
The Cultura Connect application implements a basic JWT-based authentication system with a Node.js/Express backend and Next.js frontend. The authentication is partially functional but has several critical gaps and areas for improvement.

---

## 1. EXISTING AUTHENTICATION IMPLEMENTATION

### 1.1 Backend Authentication (Express.js)

#### Authentication Libraries Used
- **JWT (jsonwebtoken)**: Version 9.0.2 - For token generation and verification
- **Bcrypt/BcryptJS**: Versions 5.1.1 and 3.0.2 - For password hashing
- **Express**: Version 4.21.2 - Web framework
- **Mongoose**: Version 8.10.0 - MongoDB ODM

#### Authentication Routes
Location: `/backend/routes.js`

```
POST   /api/item/signup    - Register new user
POST   /api/item/login     - User login
POST   /api/item/logout    - User logout (requires authentication)
```

#### Authentication Middleware
Location: `/backend/middleware/authmiddleware.js`

**Features:**
- Extracts JWT from HTTP-only cookies or Authorization header
- Verifies token signature and expiration
- Attaches user info to `req.user` on success
- Returns 401 status on invalid/missing tokens

**Implementation Details:**
- Default JWT_SECRET fallback: "your_jwt_secret_key" (NOT SECURE - should only use env var)
- Stores only `id` and `username` in `req.user`
- Does NOT handle token refresh

#### Authentication Controller
Location: `/backend/controller/Auth.js` (MongoDB version) and `/backend/sql_controller/S_auth.js` (SQL version)

**Signup Process:**
1. Validates required fields (username, email, password)
2. Normalizes email (lowercase, trim)
3. Checks for existing email
4. Hashes password using bcrypt (salt rounds: 10)
5. Saves user to MongoDB with timestamps
6. Returns user ID and username (no token)

**Login Process:**
1. Validates email and password presence
2. Queries user by normalized email
3. Compares password with bcrypt
4. Generates JWT token with:
   - Payload: {id, username, email}
   - Expiration: 7 days (configurable via TOKEN_EXPIRES_IN)
   - Secret: JWT_SECRET from env
5. Sets HTTP-only cookie with token
   - httpOnly: true (secure against XSS)
   - sameSite: "strict" (CSRF protection)
   - secure: true (only in production)
   - maxAge: 7 days (matches token expiration)
6. Returns user data (no sensitive info exposed)

**Logout Process:**
- Simply clears the "token" cookie
- No server-side token revocation

#### User Model
Location: `/backend/model/User.js`

**Database Schema:**
```
{
  username: String (required, trimmed)
  email: String (required, unique, lowercase, trimmed)
  password: String (required, hashed)
  timestamps: true (createdAt, updatedAt)
}
```

**Password Handling:**
- Pre-save hook auto-hashes password using bcrypt
- Only hashes if password is modified
- Includes `matchPassword()` method for login verification

---

### 1.2 Frontend Authentication (Next.js)

#### Client Configuration
Location: `/client/lib/constants.ts`

**API Endpoints:**
```javascript
signup: `${API_BASE_URL}/api/item/signup`
login: `${API_BASE_URL}/api/item/login`
```

**Base URL:** Configurable via `NEXT_PUBLIC_API_BASE_URL` env var (default: http://localhost:5000)

#### Login Page
Location: `/client/app/login/page.tsx`

**Features:**
- Email and password input form
- Error handling via alerts
- Loading state during submission
- Redirect to /home on successful login
- Link to signup page
- Styled with Indian flag colors

**Implementation Issues:**
- Uses basic `fetch()` without credentials flag
- Alert() for all user feedback (poor UX)
- No token persistence check
- No error distinction (network vs auth errors)

#### Signup Page
Location: `/client/app/signup/page.tsx`

**Features:**
- Username, email, password input
- Form validation on client-side
- Redirect to login on success
- Same styling as login

**Issues:**
- No password strength validation
- No email verification
- No password confirmation field
- Same alert-based UX issues

#### State Management
- **No global authentication context** - Each page manages its own state
- **localStorage usage**: Only stores `userId` on create item page
- **useRouter** from Next.js navigation for redirects
- **No session persistence**: Users are logged out on page refresh

---

## 2. PROTECTED ROUTES & AUTHORIZATION

### Backend Route Protection

**Protected Routes (Require Authentication Middleware):**
```
GET  /api/item/fetch/:id      - Get single item (needs auth)
PUT  /api/item/update/:id     - Update item (needs auth)
DELETE /api/item/delete/:id   - Delete item (needs auth)
POST /api/item/logout         - Logout (needs auth)
```

**Unprotected Routes:**
```
GET  /api/item/fetch          - Get all items (public)
GET  /api/item/users          - Get all users (public)
GET  /api/item/usercreatedby/:userId - Get user items (public)
PUT  /api/item/like/:id       - Like item (public)
POST /api/item/save           - Save item (public)
POST /api/item/comment        - Add comment (public)
GET  /api/item/comments/:id   - Get comments (public)
POST /api/item/create         - Create item (public - NO AUTH!)
```

**CRITICAL ISSUE:** `/api/item/create` route has NO authentication middleware despite being a sensitive endpoint!

### Frontend Route Protection
- **NO protected routes on frontend**
- All pages are publicly accessible
- No route guards or middleware checking authentication

---

## 3. SECURITY ANALYSIS

### Strengths
1. Passwords hashed with bcrypt (10 salt rounds)
2. HTTP-only cookies prevent XSS token theft
3. CSRF protection via sameSite: "strict"
4. JWT token expiration (7 days)
5. Email uniqueness validation
6. CORS properly configured with credential support

### Critical Issues
1. **No auth persistence**: User loses login state on page refresh
2. **No protected routes on frontend**: Any page accessible even if not logged in
3. **Unprotected create endpoint**: Anyone can create items as any user
4. **No rate limiting**: Brute force attacks possible
5. **No password requirements**: Users can set weak passwords
6. **No email verification**: Fake emails accepted
7. **No refresh token mechanism**: Token expires after 7 days with no renewal
8. **Weak default JWT_SECRET**: "your_jwt_secret_key" in fallback
9. **No logout verification**: Cleared cookie can be immediately restored
10. **No session management**: No way to invalidate tokens server-side

### Medium Issues
1. **No password reset**: Users cannot recover forgotten passwords
2. **No role-based access control**: All authenticated users have same permissions
3. **No audit logging**: No track of who did what and when
4. **localStorage userId exposure**: User ID stored in plain text in browser
5. **Limited error messages**: Generic "Invalid email or password" (good for security, but...)
6. **No input sanitization**: SQL injection not protected (but using MongoDB limits exposure)
7. **No HTTPS enforcement**: Secure flag only in production

---

## 4. MISSING FEATURES & GAPS

### Critical Missing Features
1. **Session/Auth Context Provider**: No global auth state management
2. **Protected Route Component**: No middleware to protect frontend pages
3. **Token Refresh**: No refresh token mechanism
4. **Token Revocation**: No server-side logout (token blacklist)
5. **Password Reset**: No forgot password flow
6. **Email Verification**: No email confirmation requirement

### Important Missing Features
1. **User Profile Management**: No ability to update user info
2. **Two-Factor Authentication**: No 2FA/MFA support
3. **Password Change**: No endpoint to change password
4. **Role-Based Authorization**: No admin/user role differentiation
5. **API Key Authentication**: No API key support for programmatic access
6. **Social Login**: No OAuth integration (Google, GitHub, etc.)
7. **Account Deactivation**: No soft delete/deactivation option

### Quality of Life Missing
1. **Email Notifications**: No email on signup/login/logout
2. **Login Activity Log**: No record of who logged in when
3. **Device Management**: No ability to see/revoke sessions
4. **Rate Limiting**: No protection against brute force
5. **CAPTCHA**: No bot protection on signup/login

---

## 5. DATABASE & DATA FLOW

### User Collection (MongoDB)
```
User {
  _id: ObjectId
  username: String
  email: String (unique index)
  password: String (hashed)
  createdAt: Date
  updatedAt: Date
}
```

### Item Collection (MongoDB)
```
Item {
  _id: ObjectId
  CultureName: String
  CultureDescription: String
  Region: String
  Significance: String
  created_by: ObjectId (refs User)
  ImageURL: String
  VideoURL: String
  Likes: Number
  Saves: Number
  likedBy: [ObjectId]
  savedBy: [ObjectId]
  createdAt: Date
  updatedAt: Date
}
```

**Issue:** No user profile or user preference collection for storing additional user data.

---

## 6. CLIENT-SIDE AUTH STATE

### Current Approach
- **useState**: Each page manages login/logout locally
- **localStorage**: Only stores userId, not auth tokens
- **Cookies**: HTTP-only, so inaccessible from JavaScript

### Data Flow
1. User submits login form
2. Fetch call sends credentials to backend
3. Backend returns user info and sets cookie
4. Cookie is automatically sent with future requests (credentials: include needed)
5. Page manually redirects on success
6. **No automatic session restoration on page reload**

---

## 7. CONFIGURATION & ENVIRONMENT

### Environment Variables Used
**Backend (.env):**
```
PORT=5000
MYSQL_HOST=localhost (unused - MySQL code not active)
MYSQL_USER=root (unused)
MYSQL_PASSWORD=1 (unused)
MYSQL_DATABASE=culturedb (unused)
JWT_SECRET=oosipodu
DB_URL='mongodb+srv://...' (active)
CLIENT_URLS=http://localhost:5173,http://localhost:3000
```

**Frontend (uses NEXT_PUBLIC_ prefix):**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000 (inferred)
```

**Issues:**
- JWT_SECRET exposed in .env (commit to git)
- Multiple database configs (confusion between MySQL and MongoDB)
- Hardcoded URLs for local development

---

## 8. LIBRARIES & DEPENDENCIES

### Authentication Stack
- **jsonwebtoken** (9.0.2): Token generation
- **bcryptjs** (3.0.2): Password hashing (alternative to bcrypt)
- **bcrypt** (5.1.1): Primary password hashing
- **cookie-parser** (1.4.7): Parse cookies from requests
- **axios** (1.8.3): HTTP client (frontend, has credential support)
- **express** (4.21.2): Web framework

### Supporting
- **mongoose** (8.10.0): MongoDB ODM
- **joi** (17.13.3): Schema validation
- **multer** (2.0.1): File upload handling
- **cors** (2.8.5): Cross-origin requests
- **dotenv** (16.4.7): Environment variables
- **next** (15.1.5): React framework
- **react** (19.0.0): UI library

---

## 9. RECOMMENDATIONS FOR IMPROVEMENT

### Immediate Priority (High Risk)
1. **Protect /api/item/create route** with authentication middleware
2. **Create auth context provider** for global state management
3. **Add protected route component** on frontend
4. **Implement token refresh mechanism** with refresh tokens
5. **Add session persistence** to survive page reloads

### High Priority
1. Implement server-side token blacklist for logout
2. Add password strength requirements
3. Implement email verification flow
4. Add password reset functionality
5. Create role-based access control system
6. Add input validation and sanitization

### Medium Priority
1. Implement rate limiting on auth endpoints
2. Add CAPTCHA on signup/login
3. Create user profile management endpoints
4. Implement user preference storage
5. Add login activity logging
6. Support for password change
7. Device/session management

### Low Priority (Nice to Have)
1. OAuth integration (Google, GitHub)
2. Two-factor authentication
3. Biometric authentication support
4. Passwordless login (magic links)
5. Social sign-in options

---

## 10. ARCHITECTURE RECOMMENDATIONS

### Frontend Architecture
```
/app
  /auth
    /context.ts          - AuthContext for state
    /provider.tsx        - AuthProvider wrapper
    /hooks.ts            - useAuth hook
  /login
  /signup
  /home (protected)
  /profile (protected)
  middleware.ts         - Protected route middleware
```

### Backend Architecture
```
/middleware
  authenticate.js       - JWT verification
  authorize.js         - Role-based access
  validate.js          - Input validation
  errorHandler.js      - Centralized error handling
/routes
  auth.js              - Auth endpoints
  items.js             - Item CRUD (protected)
  users.js             - User endpoints
/services
  authService.js       - Auth logic
  userService.js       - User management
/models
  User.js
  RefreshToken.js      - For token rotation
  AuditLog.js          - Activity tracking
```

---

## 11. SECURITY CHECKLIST

Current Status:
- [ ] Passwords hashed - ✅ (bcrypt)
- [ ] HTTPS in production - ✅ (cookie secure flag)
- [ ] HTTP-only cookies - ✅
- [ ] CSRF protection - ✅ (sameSite: strict)
- [ ] Input validation - ❌ (minimal)
- [ ] Rate limiting - ❌
- [ ] Protected routes - ❌ (frontend)
- [ ] Protected endpoints - ❌ (create route)
- [ ] Email verification - ❌
- [ ] Password reset - ❌
- [ ] Refresh tokens - ❌
- [ ] Token blacklist - ❌
- [ ] Error logging - ❌
- [ ] Session management - ❌
- [ ] 2FA/MFA - ❌
- [ ] Role-based access - ❌

---

## 12. CURRENT FLOW DIAGRAMS

### Login Flow
```
1. User submits email/password
   ↓
2. Frontend: POST /api/item/login
   ↓
3. Backend: Hash comparison + JWT generation
   ↓
4. Backend: Set HTTP-only cookie
   ↓
5. Frontend: Redirect to /home
   ↓
6. User stays logged in (while cookie exists)
   ↗
7. Page refresh: User stays logged in (cookie auto-sent)
   ↓
8. Token expires (7 days): User forced to log in again
```

### Create Item Flow
```
1. User selects user from dropdown (localStorage.userId)
   ↓
2. User fills form and submits
   ↓
3. Frontend: POST /api/item/create with created_by=userId
   ↓
4. Backend: ACCEPTS (NO AUTH CHECK) ⚠️ SECURITY ISSUE
   ↓
5. Item created with any user ID
   ↗
6. Anyone can impersonate anyone else
```

---

## CONCLUSION

Cultura Connect has a functional but incomplete authentication system. While basic JWT auth and password hashing are in place, critical security gaps exist:

1. **Unprotected create endpoint** allows user spoofing
2. **No frontend route protection** exposes all pages
3. **No persistent authentication** between page reloads
4. **No token refresh mechanism** forces 7-day logout
5. **No global auth state** makes managing auth tedious

These issues should be addressed before production use. The recommended priority is:
1. Immediate: Fix unprotected routes and add auth context
2. High: Add persistence and refresh tokens
3. Medium: Email verification and password reset
4. Low: OAuth and advanced features
