import express, { Request, Response } from 'express';
import { translateText } from '../services/translationService';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, to = 'en-GB', from = 'auto' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await translateText(text, to, from);

    res.json({
      translation: result.translation,
      dictionary: result.dictionary
    });
  } catch (error: any) {
    console.error('Translation API error:', error);

    // Return appropriate error status based on the error type
    if (error.status === 400 || error.message.includes('required')) {
      return res.status(400).json({
        error: 'Bad Request',
        details: error.message
      });
    } else if (error.message.includes('Authentication')) {
      return res.status(500).json({
        error: 'Authentication Error',
        details: 'Google Cloud Translation API authentication failed'
      });
    } else if (error.message.includes('Quota exceeded') || error.message.includes('Rate Limit')) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        details: 'Translation quota exceeded, please try again later'
      });
    } else {
      return res.status(500).json({
        error: 'Translation Failed',
        details: error.message
      });
    }
  }
});

export default router;
