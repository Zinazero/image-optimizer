import express, { Request, Response } from 'express';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { LRUCache } from 'lru-cache';

const app = express();
const CACHE_DIR = path.resolve('./cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);


// Memory cache for hot images
const memoryCache = new LRUCache<string, Buffer>({
  max: 100, // max 100 images
  ttl: 1000 * 60 * 10 // 10 minutes
});

// Limits
const MAX_WIDTH = 2000;
const DEFAULT_QUALITY = 80;

app.get('/image', async (req: Request, res: Response) => {
  try {
    const src = req.query.src as string;
    if (!src) {
      res.status(400).send('Missing src parameter');
      return;
    }

    // Parse parameters with safety checks
    let w = req.query.w ? parseInt(req.query.w as string) : undefined;
    if (w && w > MAX_WIDTH) w = MAX_WIDTH;

    let q = req.query.q ? parseInt(req.query.q as string) : DEFAULT_QUALITY;
    q = Math.min(Math.max(q, 1), 100);

    // Determine best format based on Accept header
    const accept = req.headers.accept || '';
    const requestedFormat = (req.query.format as string)?.toLowerCase();
    const format = requestedFormat || (accept.includes('image/avif')
      ? 'avif'
      : accept.includes('image/webp')
      ? 'webp'
      : 'jpeg');

    // Generate cache key
    const cacheKey = crypto
      .createHash('md5')
      .update(`${src}-${w}-${q}-${format}`)
      .digest('hex');

    const cachedPath = path.join(CACHE_DIR, `${cacheKey}.${format}`);

    // Check memory cache
    if (memoryCache.has(cacheKey)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      return res.type(format).send(memoryCache.get(cacheKey));
    }

    // Check disk cache
    if (fs.existsSync(cachedPath)) {
      const buffer = await fs.promises.readFile(cachedPath);
      memoryCache.set(cacheKey, buffer);
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      return res.type(format).send(buffer);
    }

    // Fetch original image
    const response = await fetch(src);
    if (!response.ok) {
      res.status(400).send(`Failed to fetch image: ${response.statusText}`);
      return;
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    // Optimize image
    const optimized = await sharp(buffer)
      .resize(w)
      .toFormat(format as keyof sharp.FormatEnum, { quality: q })
      .toBuffer();

    // Save to disk asynchronously
    await fs.promises.writeFile(cachedPath, optimized);

    // Save to memory cache
    memoryCache.set(cacheKey, optimized);

    // Set cache headers
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.type(format).send(optimized);
  } catch (err) {
    console.error('Image optimization error:', err);
    res.status(500).send('Error optimizing image');
  }
});

export default app;
