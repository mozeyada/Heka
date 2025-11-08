# API Endpoints Summary - Heka

## Available Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Couples (`/api/couples`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/couples/create` | Create couple profile (invite partner) | Yes |
| GET | `/api/couples/me` | Get current user's couple | Yes |

### Arguments (`/api/arguments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/arguments/create` | Create new argument | Yes |
| GET | `/api/arguments/` | List all arguments for couple | Yes |
| GET | `/api/arguments/{id}` | Get specific argument | Yes |

### Perspectives (`/api/perspectives`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/perspectives/create` | Submit perspective for argument | Yes |
| GET | `/api/perspectives/argument/{id}` | Get perspectives for argument | Yes |

---

## Authentication Flow

1. **Register:** `POST /api/auth/register`
   ```json
   {
     "email": "user@example.com",
     "password": "securepassword123",
     "name": "John Doe",
     "age": 25
   }
   ```

2. **Login:** `POST /api/auth/login`
   ```json
   {
     "username": "user@example.com",  // Note: OAuth2 uses "username" field
     "password": "securepassword123"
   }
   ```
   Returns: `{ "access_token": "...", "token_type": "bearer", ... }`

3. **Use Token:** Include in header:
   ```
   Authorization: Bearer <token>
   ```

---

## Core User Flow

1. **Register** → Get user account
2. **Create Couple** → Invite partner by email
3. **Create Argument** → Start new argument
4. **Submit Perspective** → User 1 submits their side
5. **Submit Perspective** → User 2 submits their side
6. **AI Analysis** → (Sprint 3) Both perspectives trigger AI mediation

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (access denied)
- `404` - Not Found

---

## Next Steps

- AI Mediation endpoint (Sprint 3)
- Subscription management endpoints (Sprint 4)
- Check-ins and goals endpoints (Sprint 4)

