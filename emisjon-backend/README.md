# Emisjon Backend

## Authentication

### Security Features
- **HTTP-Only Cookies**: Authentication tokens are stored in HTTP-only cookies, preventing XSS attacks
- **No localStorage**: Never uses localStorage for sensitive data - all auth tokens are in secure cookies
- **Secure Flag**: Cookies are marked as secure in production (HTTPS only)
- **SameSite Protection**: Cookies use SameSite=lax to prevent CSRF attacks
- **CORS Configured**: Only allows requests from the frontend origin (http://localhost:5173)

### Auth Endpoints
- `POST /api/auth/login` - Login with email/password, sets auth cookie
- `POST /api/auth/register` - Register new user, sets auth cookie
- `POST /api/auth/logout` - Logout and clear auth cookie
- `GET /api/auth/check` - Check if user is authenticated (validates cookie)
- `GET /api/auth/me` - Get current user profile

### Cookie Configuration
The backend uses HTTP-only cookies with the following settings:
```javascript
{
  httpOnly: true,              // Cannot be accessed via JavaScript
  secure: true,                 // HTTPS only in production
  sameSite: 'lax',             // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}
```

### Frontend Setup
The frontend axios instance must have `withCredentials: true` to send cookies:
```javascript
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true  // Required for cookie authentication
});
```

## Docker Commands

### Start all services (PostgreSQL, Backend, Adminer)
```bash
docker-compose up -d
```

### Start with rebuild (if you made code changes)
```bash
docker-compose up -d --build
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (removes database data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs emisjon_backend
docker-compose logs postgres
```

### Access Services
- **Backend API**: http://localhost:3000
- **Adminer (Database UI)**: http://localhost:8080
  - Server: `postgres`
  - Username: `emisjon_user`
  - Password: `emisjon_password`
  - Database: `emisjon_db`
- **Prisma Studio**: Run `pnpm run prisma:studio` then open http://localhost:5555


