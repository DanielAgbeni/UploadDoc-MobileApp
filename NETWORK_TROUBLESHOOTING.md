# Network Troubleshooting Guide

## Problem: "Network error. Please check your connectivity and try again"

This error occurs when the mobile app cannot connect to your backend server. Here's how to fix it:

## ✅ Quick Fix Steps

### 1. **Check Your Backend Server**
Make sure your backend server is running on port 5000:
```bash
# In your backend directory
npm start
# or
node server.js
```

### 2. **Verify Your IP Address**
Your current configuration uses: `192.168.137.156:5000`

Test if this is accessible:
- Open a browser on your computer
- Go to: `http://192.168.137.156:5000`
- You should see your backend response (not an error page)

### 3. **Test Connection from the App**
In the login screen, you'll see a "🔧 Test Backend Connection" button (development only).
Tap it to test if the app can reach your backend.

### 4. **Common Network Issues**

#### **Issue: Wrong IP Address**
If your IP changed, update `app/services/authService.ts`:
```typescript
// Line 23: Update this IP address
return 'http://YOUR_NEW_IP:5000';
```

To find your current IP:
- **Windows**: Open Command Prompt → `ipconfig`
- **Mac/Linux**: Open Terminal → `ifconfig` or `ip addr`
- Look for your WiFi adapter's IPv4 address

#### **Issue: Firewall Blocking**
- **Windows**: Allow Node.js through Windows Firewall
- **Mac**: System Preferences → Security & Privacy → Firewall → Allow Node.js
- **Linux**: `sudo ufw allow 5000`

#### **Issue: Different Networks**
- Ensure your phone/emulator is on the same WiFi network as your computer
- If using Android emulator, try using `10.0.2.2:5000` instead
- If using iOS simulator, `localhost:5000` should work

### 5. **Platform-Specific Solutions**

#### **Android Emulator**
```typescript
// In authService.ts, try this for Android emulator:
return 'http://10.0.2.2:5000';
```

#### **iOS Simulator**
```typescript
// In authService.ts, try this for iOS simulator:
return 'http://localhost:5000';
```

#### **Physical Device**
Must use your computer's actual IP address (current: `192.168.137.156`)

## 🔧 Advanced Troubleshooting

### Test Backend Manually
```bash
# Test if backend is responding
curl http://192.168.137.156:5000/api/auth/status

# Or use a tool like Postman to test:
# GET http://192.168.137.156:5000/api/auth/status
```

### Check Network Configuration
```bash
# Find all network interfaces
ipconfig /all    # Windows
ifconfig -a      # Mac/Linux

# Test connectivity
ping 192.168.137.156
```

### Update Backend CORS (if needed)
Make sure your backend allows requests from your mobile app:
```javascript
// In your backend server
app.use(cors({
  origin: '*', // For development only
  credentials: true
}));
```

## 📱 App Configuration

The app automatically detects your development environment and uses:
1. **Expo debugger host** (if available)
2. **Fallback IP**: `192.168.137.156:5000`
3. **Production URL**: (when not in development)

## 🚨 Emergency Fixes

### Quick IP Update
If you need to quickly change the IP address:

1. Open `app/services/authService.ts`
2. Find line 23: `return 'http://192.168.137.156:5000';`
3. Replace with your current IP
4. Save and reload the app

### Test with Public API
For testing purposes, you can temporarily use a public API:
```typescript
// Temporary test - replace with a public endpoint
return 'https://jsonplaceholder.typicode.com';
```

## ✅ Verification Checklist

- [ ] Backend server is running on port 5000
- [ ] Can access `http://YOUR_IP:5000` in browser
- [ ] Phone/emulator on same network as computer
- [ ] Firewall allows port 5000
- [ ] Correct IP address in authService.ts
- [ ] "Test Backend Connection" button works in app

## 📞 Still Having Issues?

1. **Check the console logs** in your development tools
2. **Use the test connection button** in the login screen
3. **Try different IP addresses** (WiFi adapter, Ethernet, etc.)
4. **Restart your backend server** and mobile app
5. **Check if antivirus software** is blocking connections

## 🎯 Success Indicators

When everything works correctly:
- ✅ Test connection button shows "Connection Test Successful"
- ✅ Registration/login attempts show specific API errors (not network errors)
- ✅ Console logs show "Making request to: http://YOUR_IP:5000/api/auth/..."
- ✅ Console logs show "Response status: 200" or other HTTP status codes
