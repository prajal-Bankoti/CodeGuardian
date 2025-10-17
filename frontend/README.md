# React Frontend

A modern React application built with TypeScript, Redux Toolkit, and Tailwind CSS.

## 🚀 Features

- **React 18** with TypeScript for type safety
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **React Router** for client-side routing
- **Axios** for API calls
- **Responsive Design** that works on all devices
- **Modern Folder Structure** following best practices

## 📁 Project Structure

```
src/
├── assets/                 # Static assets
│   ├── images/            # Image files
│   ├── icons/             # Icon files
│   └── fonts/             # Font files
├── components/            # Reusable components
│   ├── common/            # Common components (Header, Sidebar, etc.)
│   ├── forms/             # Form components
│   └── ui/                # UI components (Button, Modal, etc.)
├── pages/                 # Page components
├── layouts/               # Layout components
├── hooks/                 # Custom React hooks
├── contexts/              # React Context providers
├── services/              # API service functions
├── store/                 # Redux store
│   ├── slices/            # Redux slices
│   └── selectors/         # Redux selectors
├── utils/                 # Utility functions
├── types/                 # TypeScript type definitions
├── constants/             # Application constants
├── styles/                # Global styles
├── App.tsx                # Main App component
└── index.tsx              # Entry point
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Create environment file**
   ```bash
   cp env.example .env
   ```

4. **Start development server**
   ```bash
   yarn start
   ```

The application will be available at `http://localhost:3000`

## 📜 Available Scripts

- `yarn start` - Start development server
- `yarn build` - Build for production
- `yarn test` - Run tests
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn type-check` - Run TypeScript type checking
- `yarn clean` - Clean build directory
- `yarn preview` - Preview production build

## 🎨 Styling

This project uses **Tailwind CSS** for styling. The configuration includes:

- Custom color palette
- Custom fonts (Inter)
- Custom animations
- Responsive design utilities
- Component classes for common patterns

### Custom CSS Classes

- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.input-field` - Input field style
- `.card` - Card component style
- `.container-custom` - Custom container with max-width
- `.text-gradient` - Gradient text effect

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### TypeScript Configuration

The project includes path aliases for cleaner imports:

```typescript
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
```

## 📦 State Management

The application uses **Redux Toolkit** for state management with the following slices:

- **authSlice** - Authentication state
- **uiSlice** - UI state (sidebar, theme, notifications)

### Usage Example

```typescript
import { useAppDispatch, useAppSelector } from '@/store/store';
import { loginUser } from '@/store/slices/authSlice';

const dispatch = useAppDispatch();
const { user, isLoading } = useAppSelector((state) => state.auth);

// Dispatch action
dispatch(loginUser({ email, password }));
```

## 🚦 API Integration

API calls are handled through service functions in the `services/` directory:

```typescript
import { authService } from '@/services/authService';

// Login user
const response = await authService.login({ email, password });
```

## 🧪 Testing

The project is set up with Jest and React Testing Library:

```bash
npm test
```

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Build for Production

```bash
yarn build
```

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `build` folder to Netlify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
