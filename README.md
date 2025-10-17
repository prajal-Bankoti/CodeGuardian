# CodeGuardian - AI-Powered Code Reviews

An intelligent AI-powered code review assistant that helps developers write better, more secure code. CodeGuardian analyzes pull requests and provides contextual suggestions to improve code quality, security, and maintainability.

## 🚀 Features

- **AI-Powered Analysis**: Intelligent code review with contextual suggestions
- **Code Quality Checks**: Identify code smells and suggest refactoring opportunities
- **Security Detection**: Catch security vulnerabilities before they reach production
- **Performance Optimization**: Identify bottlenecks and suggest improvements
- **Code Organization**: Suggest better file structure and remove unused code
- **Smart Suggestions**: Contextual recommendations like "Move to constants file" or "Extract to utility"
- **Completely Free**: No hidden costs, no credit card required

## 🏗️ Project Structure

```
pr_master/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── assets/        # Static assets
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
│   ├── public/            # Public assets
│   ├── package.json       # Frontend dependencies
│   └── README.md          # Frontend documentation
├── backend/               # Node.js backend application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Custom middleware
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript types
│   │   └── validators/    # Input validation
│   ├── tests/             # Test files
│   ├── uploads/           # File uploads
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Yarn (v1.22 or higher)
- MongoDB
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pr_master
```

### 2. Install Dependencies

```bash
# Install all dependencies for both frontend and backend
yarn install
```

### 3. Environment Setup

```bash
# Backend environment
cp backend/env.example backend/.env
# Edit backend/.env with your configuration

# Frontend environment (optional)
cp frontend/env.example frontend/.env
# Edit frontend/.env if needed
```

### 4. Start Development Servers

```bash
# Start both frontend and backend concurrently
yarn dev

# Or start them individually:
# Backend only
yarn backend:dev

# Frontend only  
yarn frontend:dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## 📦 Yarn Workspace Commands

This project uses Yarn workspaces for managing dependencies across frontend and backend.

### Available Commands

| Command | Description |
|---------|-------------|
| `yarn install` | Install all dependencies |
| `yarn dev` | Start both frontend and backend in development |
| `yarn build` | Build both projects for production |
| `yarn test` | Run all tests |
| `yarn lint` | Lint all projects |
| `yarn lint:fix` | Fix linting issues |
| `yarn clean` | Clean build artifacts |

### Individual Project Commands

| Command | Description |
|---------|-------------|
| `yarn backend:dev` | Start backend development server |
| `yarn backend:build` | Build backend for production |
| `yarn backend:start` | Start backend production server |
| `yarn frontend:dev` | Start frontend development server |
| `yarn frontend:build` | Build frontend for production |
| `yarn frontend:preview` | Preview frontend production build |

### Workspace Commands

| Command | Description |
|---------|-------------|
| `yarn workspace node-backend <command>` | Run command in backend workspace |
| `yarn workspace react-frontend <command>` | Run command in frontend workspace |

## 🛠️ Technologies Used

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/users` | Get all users | Yes | Admin |
| GET | `/api/users/:id` | Get user by ID | Yes | Admin |
| PUT | `/api/users/:id` | Update user | Yes | User/Admin |
| DELETE | `/api/users/:id` | Delete user | Yes | Admin |

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your-database-name
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🧪 Testing

### Run All Tests
```bash
yarn test
```

### Individual Tests
```bash
# Backend tests only
yarn workspace node-backend test

# Frontend tests only
yarn workspace react-frontend test

# Test with coverage
yarn workspace node-backend test:coverage
```

## 🚀 Deployment

### Build for Production
```bash
# Build both frontend and backend
yarn build

# Or build individually
yarn backend:build
yarn frontend:build
```

### Backend Deployment
1. Build the project: `yarn backend:build`
2. Start the server: `yarn backend:start`
3. Set environment variables in production

### Frontend Deployment
1. Build the project: `yarn frontend:build`
2. Deploy the `frontend/build` folder to your hosting service

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Write comprehensive comments

### Git Workflow
1. Create feature branches from `main`
2. Make small, focused commits
3. Write descriptive commit messages
4. Create pull requests for code review

### Folder Structure
- Keep components small and focused
- Use proper separation of concerns
- Follow the established folder structure
- Group related files together

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Create a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation in the respective folders
2. Look for existing issues in the repository
3. Create a new issue with detailed information
4. Contact the development team

## 🔄 Updates

This project follows semantic versioning. Check the changelog for updates and breaking changes.

---

**Happy Coding! 🚀**
