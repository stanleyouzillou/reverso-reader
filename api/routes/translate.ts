import express, { Request, Response } from 'express';
import { translate } from '@vitalets/google-translate-api';
import { HttpProxyAgent } from 'http-proxy-agent';

const router = express.Router();

// List of public proxies to rotate through
// Mix of user-provided and recently found public proxies
const PROXIES = [
  'http://103.152.112.162:80',   // User provided
  'http://144.125.164.158:80',   // US
  'http://62.60.151.128:80',     // SE
  'http://103.35.188.243:3128',  // MD
  'http://101.47.17.165:7890',   // SG
  'http://216.229.112.25:8080',  // US
  'http://154.17.228.122:80',    // US
  'http://202.83.30.96:80',      // IN
  'http://47.56.110.204:8989',   // HK
];

router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, to = 'en', from = 'auto' } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    // Try without proxy first (sometimes it works for a few requests)
    // Actually, if we are already rate limited, we might want to skip direct connection.
    // But let's keep it as the first attempt or maybe randomized.
    // For now, let's try direct first, then proxies.
    
    let result;
    let lastError;
    let success = false;

    // Attempt 1: Direct connection
    try {
      console.log('Attempting translation via direct connection...');
      result = await translate(text, { to, from });
      success = true;
    } catch (error: any) {
      console.log(`Direct connection failed: ${error.name} - ${error.message}`);
      lastError = error;
      
      // If it's not a rate limit error, it might be something else, but we'll try proxies anyway for robustness
      // specifically for TooManyRequestsError
    }

    // Attempt 2+: Proxies
    if (!success) {
      // Shuffle proxies to avoid hitting the same dead one every time
      const shuffledProxies = [...PROXIES].sort(() => 0.5 - Math.random());
      
      for (const proxyUrl of shuffledProxies) {
        if (success) break;
        
        try {
          console.log(`Attempting translation via proxy: ${proxyUrl}`);
          const agent = new HttpProxyAgent(proxyUrl);
          
          result = await translate(text, { 
            to, 
            from, 
            fetchOptions: { agent } 
          });
          
          success = true;
          console.log(`Success with proxy: ${proxyUrl}`);
        } catch (error: any) {
          console.log(`Proxy ${proxyUrl} failed: ${error.name}`);
          lastError = error;
          // Continue to next proxy
        }
      }
    }

    if (success && result) {
      res.json({
        text: result.text,
        raw: result.raw
      });
    } else {
      throw lastError || new Error('All proxy attempts failed');
    }

  } catch (error: any) {
    console.error('Final Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed',
      details: error.message 
    });
  }
});

export default router;
