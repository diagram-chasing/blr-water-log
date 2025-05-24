import { getLinkPreview } from 'link-preview-js';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = './src/lib/data/link-previews.json';
const FAVICON_DIR = './src/lib/assets/favicons';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Command line arguments
const args = process.argv.slice(2);
const mode = args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'default';

// Processing modes:
// 'new-only': Only process URLs not in cache
// 'failed-only': Only process URLs that previously failed
// 'stale': Only process URLs older than threshold
// 'force-all': Process all URLs regardless of cache
// 'default': Skip recent successful URLs (current behavior)

console.log(`Running in mode: ${mode}`);

// Ensure favicon directory exists
if (!fs.existsSync(FAVICON_DIR)) {
  fs.mkdirSync(FAVICON_DIR, { recursive: true });
}

// Load existing previews if available
let existingPreviews = {};
try {
  existingPreviews = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
} catch (error) {
  console.log('No existing previews found, creating new file');
}

const poisData = JSON.parse(
  fs.readFileSync('./src/lib/data/pois.json', 'utf8')
);

function shouldProcessUrl(url, previews, mode) {
  const existing = previews[url];
  const TWO_MONTHS = 2 * 30 * 24 * 60 * 60 * 1000;

  switch (mode) {
    case 'new-only':
      return !existing;

    case 'failed-only':
      return existing && existing.error;

    case 'stale':
      if (!existing || !existing.lastFetched) return true;
      const lastFetched = new Date(existing.lastFetched);
      return Date.now() - lastFetched >= TWO_MONTHS;

    case 'force-all':
      return true;

    case 'default':
    default:
      // Skip if we have recent successful data
      if (existing && existing.lastFetched && !existing.error) {
        const lastFetched = new Date(existing.lastFetched);
        return Date.now() - lastFetched >= TWO_MONTHS;
      }
      return true;
  }
}

async function getFavicon(url) {
  try {
    const domain = new URL(url).hostname;
    const faviconPath = path.join(FAVICON_DIR, `${domain}.png`);

    // Check if we already have the favicon
    if (fs.existsSync(faviconPath)) {
      return `/src/lib/assets/favicons/${domain}.png`;
    }

    const response = await fetch(`https://favicone.com/${domain}?s=32`);

    if (!response.ok) {
      throw new Error(`Favicon API returned ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(faviconPath, Buffer.from(buffer));

    return `/src/lib/assets/favicons/${domain}.png`;
  } catch (error) {
    console.warn(`Failed to fetch favicon for ${url}:`, error.message);
    return '';
  }
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  try {
    const [preview, favicon] = await Promise.all([
      getLinkPreview(url, {
        timeout: 10000,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)'
        }
      }),
      getFavicon(url)
    ]);

    return {
      url,
      title: preview.title || new URL(url).hostname,
      description: preview.description || '',
      image: preview.images?.[0] || '',
      favicon,
      siteName: preview.siteName || new URL(url).hostname,
      lastFetched: new Date().toISOString()
    };
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying ${url}, ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }

    console.error(`Error fetching ${url}:`, error.message);
    return {
      url,
      title: new URL(url).hostname,
      description: '',
      image: '',
      favicon: '',
      siteName: new URL(url).hostname,
      error: error.message,
      lastFetched: new Date().toISOString()
    };
  }
}

async function main() {
  const uniqueUrls = new Set();
  poisData.features.forEach(feature => {
    if (feature.properties.url) {
      uniqueUrls.add(feature.properties.url);
    }
  });

  const previews = { ...existingPreviews };

  // Filter URLs based on mode
  const urlsToProcess = Array.from(uniqueUrls).filter(url =>
    shouldProcessUrl(url, previews, mode)
  );

  console.log(`Total URLs found: ${uniqueUrls.size}`);
  console.log(`URLs to process in '${mode}' mode: ${urlsToProcess.length}`);

  if (urlsToProcess.length === 0) {
    console.log('No URLs to process. Exiting.');
    return;
  }

  let count = 0;
  const total = urlsToProcess.length;
  let requestsThisMinute = 0;
  const startTime = Date.now();

  for (const url of urlsToProcess) {
    count++;

    // Rate limiting for favicon API (100 requests per minute)
    requestsThisMinute++;
    if (requestsThisMinute >= 100) {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 60000) {
        const waitTime = 60000 - elapsedTime;
        console.log(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      requestsThisMinute = 0;
    }

    console.log(`Processing ${count}/${total}: ${url}`);
    previews[url] = await fetchWithRetry(url);

    // Save progress after each fetch
    fs.writeFileSync(CACHE_FILE, JSON.stringify(previews, null, 2));

    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Done! Metadata saved to link-previews.json');
}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
