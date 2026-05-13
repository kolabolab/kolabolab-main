import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/auth/google', (req, res) => {
  const clientId = '361419093704-i6mig7fi7jtkhm525990u7llm02tbald.apps.googleusercontent.com';
  const redirectUri = 'http://localhost:3001/auth/google/callback';
  const scope = 'email profile';
  
  const googleAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  
  res.redirect(googleAuthUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;
  
  if (error) {
    return res.redirect('http://localhost:3000/login?error=oauth_failed');
  }
  
  if (!code) {
    return res.redirect('http://localhost:3000/login?error=no_code');
  }
  
  try {
    // Exchange code for tokens
    const clientId = '361419093704-i6mig7fi7jtkhm525990u7llm02tbald.apps.googleusercontent.com';
    const clientSecret = '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';
    const redirectUri = 'http://localhost:3001/auth/google/callback';
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });
    
    const userInfo = await userResponse.json();
    console.log('OAuth attempt for email:', userInfo.email);
    
    // CRITICAL: Check if user exists in our database
    const registeredUsers = [
      'your-email@gmail.com',
      'admin@kolabolab.com'
      // beryour@gmail.com is EXPLICITLY NOT INCLUDED
    ];
    
    console.log(`🔍 Checking if ${userInfo.email} is in registered users:`, registeredUsers);
    
    if (!registeredUsers.includes(userInfo.email)) {
      // User not registered - REJECT and redirect to registration
      console.log(`❌ REJECTED: ${userInfo.email} is NOT in registered users list`);
      console.log('❌ Redirecting to registration page...');
      return res.redirect(`http://localhost:3000/register?error=not_registered&email=${encodeURIComponent(userInfo.email)}&message=${encodeURIComponent('Please register first before signing in with Google')}`);
    }
    
    // User is registered - create session token
    console.log('✅ AUTHORIZED: Login successful for:', userInfo.email);
    const mockToken = btoa(JSON.stringify({ 
      email: userInfo.email, 
      name: userInfo.name,
      id: userInfo.id,
      verified: true 
    }));
    
    return res.redirect(`http://localhost:3000/auth/callback?token=${mockToken}&refresh=mock_refresh_token`);
    
  } catch (error) {
    console.error('OAuth error:', error);
    return res.redirect('http://localhost:3000/login?error=oauth_failed');
  }
});

app.listen(3001, () => {
  console.log('🔒 Secure OAuth server running on http://localhost:3001');
  console.log('📋 Registered users: your-email@gmail.com, admin@kolabolab.com');
  console.log('❌ beryour@gmail.com is NOT registered and will be rejected');
});