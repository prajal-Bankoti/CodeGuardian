# Node.js Backend

A modern Node.js backend built with Express, TypeScript, and MongoDB.

## 🚀 Features

- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication
- **Bcrypt** password hashing
- **Express Validator** for input validation
- **Helmet** for security
- **CORS** enabled
- **Rate limiting** protection
- **Morgan** logging
- **Compression** middleware
- **Clean Architecture** with separation of concerns

## 📁 Project Structure

```
src/
├── config/                # Configuration files
│   └── database.ts        # Database connection
├── controllers/           # Route controllers
│   ├── authController.ts  # Authentication logic
│   └── userController.ts  # User management logic
├── models/                # Database models
│   └── User.ts           # User model
├── routes/                # API routes
│   ├── authRoutes.ts     # Authentication routes
│   └── userRoutes.ts     # User routes
├── middlewares/           # Custom middleware
│   ├── auth.ts           # Authentication middleware
│   ├── errorHandler.ts   # Error handling
│   └── notFound.ts       # 404 handler
├── services/              # Business logic services
├── utils/                 # Utility functions
├── types/                 # TypeScript type definitions
├── validators/            # Input validation schemas
├── constants/             # Application constants
├── server.ts              # Server entry point
└── app.ts                 # Express app configuration
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Create environment file**
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/your-database-name
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Start development server**
   ```bash
   yarn dev
   ```

The server will be available at `http://localhost:5000`

## 📜 Available Scripts

- `yarn dev` - Start development server with nodemon
- `yarn start` - Start production server
- `yarn build` - Build TypeScript to JavaScript
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn type-check` - Run TypeScript type checking
- `yarn clean` - Clean build directory

## 🗄️ Database Setup

### MongoDB Installation

1. **Install MongoDB**
   - [Download MongoDB](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS

2. **Start MongoDB service**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Connect to MongoDB**
   ```bash
   mongosh
   ```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Routes
Include the JWT token in the Authorization header:
```bash
Authorization: Bearer <your-jwt-token>
```

## 📡 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### User Routes
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Health Check
- `GET /health` - Server health status

## 🛡️ Security Features

- **Helmet** - Sets security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevents abuse
- **Input Validation** - Validates request data
- **Password Hashing** - Bcrypt encryption
- **JWT Tokens** - Secure authentication

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/your-database-name` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration | `7d` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:3000` |

### TypeScript Configuration

The project includes path aliases for cleaner imports:

```typescript
import { User } from '@/models/User';
import { protect } from '@/middlewares/auth';
```

## 🧪 Testing

Run tests with Jest:

```bash
yarn test
```

## 📊 Logging

The application uses Morgan for HTTP request logging:

- **Development**: Detailed logs
- **Production**: Combined logs

## 🚀 Deployment

### Build for Production

```bash
yarn build
```

### Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables in Heroku dashboard
5. Deploy: `git push heroku main`

### Deploy to DigitalOcean

1. Create a droplet
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies: `yarn install`
5. Build: `yarn build`
6. Start: `yarn start`

## 🔍 Error Handling

The API includes comprehensive error handling:

- **Validation Errors** - Input validation failures
- **Authentication Errors** - Invalid tokens
- **Authorization Errors** - Insufficient permissions
- **Database Errors** - MongoDB connection issues
- **Server Errors** - Internal server errors

## 📈 Performance

- **Compression** - Gzip compression
- **Rate Limiting** - Prevents abuse
- **Database Indexing** - Optimized queries
- **Connection Pooling** - Efficient database connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
