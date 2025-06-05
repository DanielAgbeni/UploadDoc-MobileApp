# Authentication Implementation

## Overview
This document describes the authentication system implemented for the UploadDoc mobile application using React Native, Expo Router, and NativeWind.

## Features Implemented

### ✅ Core Authentication
- **Email/Password Login** - Standard login with email and password
- **User Registration** - Account creation with name, email, matric number, and password
- **Email Verification** - OTP-based email verification after registration
- **Google Sign-in** - OAuth integration with Google authentication
- **Persistent Login** - User stays logged in across app restarts
- **Protected Routes** - Authentication-gated navigation

### ✅ User Experience
- **Theme-aware UI** - All auth screens respect light/dark mode
- **Form Validation** - Client-side validation with error messages
- **Loading States** - Visual feedback during API calls
- **Remember Email** - Option to remember email for future logins
- **Resend Verification** - Ability to resend OTP codes with cooldown

### ✅ Security Features
- **Token Management** - Secure storage of JWT tokens
- **Auto Token Refresh** - Validates tokens on app start
- **Secure Storage** - Uses AsyncStorage for sensitive data
- **Input Sanitization** - Proper validation and sanitization

## File Structure

```
app/
├── auth/
│   ├── _layout.tsx          # Auth stack navigation
│   ├── login.tsx            # Login screen
│   ├── register.tsx         # Registration screen
│   └── verify-email.tsx     # Email verification screen
├── components/auth/
│   ├── AuthButton.tsx       # Reusable auth button component
│   ├── AuthInput.tsx        # Reusable input component
│   └── GoogleSignInButton.tsx # Google sign-in component
├── context/
│   └── AuthContext.tsx      # Authentication state management
├── services/
│   ├── authService.ts       # API calls for authentication
│   └── storageService.ts    # Local storage utilities
├── types/
│   └── auth.ts              # TypeScript interfaces
└── _layout.tsx              # Root layout with auth routing
```

## API Integration

### Backend Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend OTP
- `GET /api/auth/status` - Check user status
- `GET /api/auth/google` - Google OAuth

### Base URL
```typescript
const BASE_URL = 'http://localhost:5000';
```

## Usage

### 1. Starting the App
When the app starts, it automatically:
1. Checks for stored authentication tokens
2. Validates tokens with the backend
3. Routes to appropriate screen (auth or main app)

### 2. User Registration Flow
1. User fills registration form
2. Form validation occurs
3. API call to register endpoint
4. Success → Redirect to email verification
5. User enters OTP code
6. Verification → Auto-login and redirect to main app

### 3. Login Flow
1. User enters email/password
2. Form validation
3. API call to login endpoint
4. Success → Store tokens and redirect to main app
5. If unverified → Redirect to verification screen

### 4. Google Sign-in Flow
1. User taps Google sign-in button
2. Opens web browser for OAuth
3. User completes Google authentication
4. App receives callback with token
5. Store tokens and redirect to main app

## Components

### AuthContext
Provides global authentication state and methods:
```typescript
const { 
  user, 
  isAuthenticated, 
  isLoading, 
  login, 
  register, 
  logout 
} = useAuth();
```

### AuthInput
Reusable input component with validation:
```typescript
<AuthInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={emailError}
/>
```

### AuthButton
Themed button with loading states:
```typescript
<AuthButton
  title="Sign In"
  onPress={handleLogin}
  loading={isLoading}
  variant="primary"
/>
```

## Theme Integration
All authentication screens use the app's theme system:
- Automatic light/dark mode detection
- Consistent color scheme
- Theme-aware components

## Error Handling
- Network errors with user-friendly messages
- API error responses with specific feedback
- Form validation with inline error display
- Graceful handling of authentication failures

## Security Considerations
- Passwords are never stored locally
- JWT tokens stored securely in AsyncStorage
- Automatic token validation on app start
- Proper cleanup on logout

## Testing
To test the authentication system:
1. Start your backend server on `http://localhost:5000`
2. Run `npm start` to start the Expo development server
3. Test registration, login, and verification flows
4. Verify persistent login by restarting the app

## Future Enhancements
- Biometric authentication
- Password reset functionality
- Social login with other providers
- Two-factor authentication
- Session management improvements
