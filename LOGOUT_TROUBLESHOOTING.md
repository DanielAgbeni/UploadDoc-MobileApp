# Logout Troubleshooting Guide

## What I Fixed

### 1. **Enhanced Logout Function**
- Added detailed console logging to track logout process
- Improved error handling with fallback logout
- Clear authentication state even if storage clearing fails

### 2. **Updated Profile Screen**
- Shows complete user information including:
  - Full Name
  - Email Address
  - Matric Number
  - User ID
  - Account Type (Student/Admin/Super Admin)
  - Document Token
  - Documents Received
  - Verification Status
- Added debug information (development only)
- Better error handling for logout

### 3. **Fixed Tab Label**
- Profile tab now shows user's first name instead of "Profile"
- Falls back to "Profile" if user name is not available

## Testing the Logout

### 1. **Check Console Logs**
When you tap "Sign Out", you should see these logs:
```
User initiated logout
Starting logout process...
Logout completed successfully
Logout successful, user should be redirected to auth
```

### 2. **Debug Information**
In development mode, you'll see a yellow debug box showing:
- User authenticated: Yes/No
- User ID
- Console log reminder

### 3. **Expected Behavior**
After successful logout:
1. User data is cleared from storage
2. Auth state is reset
3. App should redirect to login screen
4. Tab navigation should disappear

## If Logout Still Doesn't Work

### Check These Things:

1. **Console Logs**: Look for any error messages
2. **Storage Clearing**: Verify AsyncStorage is being cleared
3. **State Updates**: Check if auth state is properly updating
4. **Navigation**: Ensure the root layout is responding to auth changes

### Manual Debug Steps:

1. **Test Storage Clearing**:
   ```javascript
   // Add this to profile screen temporarily
   const testStorageClear = async () => {
     await StorageService.clearAuthData();
     console.log('Storage cleared manually');
   };
   ```

2. **Test State Update**:
   ```javascript
   // Check if dispatch is working
   const testStateUpdate = () => {
     dispatch({ type: 'LOGOUT' });
     console.log('State updated manually');
   };
   ```

3. **Check Root Layout**:
   - Verify `isAuthenticated` is changing to `false`
   - Ensure navigation switches to auth stack

## Common Issues and Solutions

### Issue: Logout button doesn't respond
**Solution**: Check if `handleLogout` function is properly bound and `useAuth` hook is working

### Issue: User stays logged in after logout
**Solution**: 
- Check if `StorageService.clearAuthData()` is working
- Verify auth reducer `LOGOUT` case is resetting state properly
- Ensure root layout is listening to `isAuthenticated` changes

### Issue: App crashes on logout
**Solution**: 
- Check for any async operations that might be running
- Verify all cleanup is handled properly
- Look for memory leaks or unfinished promises

### Issue: Navigation doesn't change after logout
**Solution**: 
- Check if `isAuthenticated` state is properly updating
- Verify root layout conditional rendering logic
- Ensure auth context is properly providing updated state

## Verification Checklist

- [ ] Console shows logout logs
- [ ] Debug info shows "User authenticated: No" after logout
- [ ] App redirects to login screen
- [ ] Tab navigation disappears
- [ ] User can log back in successfully
- [ ] No error messages in console

## Quick Test

1. Log in to the app
2. Go to Profile tab (should show your first name)
3. Scroll down and check debug info
4. Tap "Sign Out"
5. Confirm in alert dialog
6. Check console logs
7. Verify redirect to login screen

If any step fails, check the console for error messages and refer to the troubleshooting steps above.
