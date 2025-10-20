import { Router, Request, Response } from 'express';
import { api42Service } from '../services/42api';

const router = Router();

// OAuth2 login endpoint - redirects to 42 intranet
router.get('/login', (req: Request, res: Response) => {
  const apiUid = process.env.API_UID;
  const redirectUri = process.env.REDIRECT_URI;
  
  if (!apiUid || !redirectUri || apiUid.includes('your_') || apiUid.includes('here')) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('42 API credentials not configured. Please set API_UID and API_SECRET in the backend .env file with real 42 API credentials.')}`);
  }

  // Construct the 42 OAuth authorization URL
  const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${apiUid}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=public`;
  
  // Redirect user to 42 intranet for authentication
  res.redirect(authUrl);
});

// OAuth2 callback endpoint - handles the callback from 42 intranet
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    const apiUid = process.env.API_UID;
    const apiSecret = process.env.API_SECRET;
    const redirectUri = process.env.REDIRECT_URI;

    if (!apiUid || !apiSecret || !redirectUri) {
      return res.status(500).json({ error: '42 API not properly configured' });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: apiUid,
        client_secret: apiSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', await tokenResponse.text());
      return res.status(400).json({ error: 'Failed to authenticate with 42 intranet' });
    }

    const tokenData = await tokenResponse.json() as { access_token: string; token_type: string; };
    const { access_token } = tokenData;

    // Get user profile with the access token
    const profileResponse = await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error('Failed to get user profile:', await profileResponse.text());
      return res.status(400).json({ error: 'Failed to get user profile' });
    }

    const profileData = await profileResponse.json() as { login: string; id: number; };
    const userLogin = profileData.login;

    // Sync user data using our existing service
    try {
      const syncResult = await api42Service.syncUserData(userLogin);
      
      // Update last_login timestamp for the user
      const { updateUser, getUserByLogin } = await import('../services/db');
      const user = await getUserByLogin(userLogin);
      if (user) {
        await updateUser(user.id, { last_login: new Date().toISOString() } as any);
      }
      
      // Redirect to frontend with success and user login
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
      res.redirect(`${frontendUrl}/auth/success?login=${encodeURIComponent(userLogin)}`);
    } catch (syncError) {
      console.error('Failed to sync user data:', syncError);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Failed to sync user data')}`);
    }

  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
  }
});

// Check authentication status
router.get('/status', (req: Request, res: Response) => {
  const configured = !!(process.env.API_UID && process.env.API_SECRET && process.env.REDIRECT_URI);
  
  res.json({
    configured,
    ready: configured,
    authUrl: configured ? '/auth/login' : null,
    message: configured ? 'OAuth2 authentication ready' : '42 API OAuth not configured',
  });
});

export default router;