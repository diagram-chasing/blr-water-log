import { getLinkPreview } from 'link-preview-js';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = './src/lib/data/link-previews.json';
const FAVICON_DIR = './src/lib/assets/favicons';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

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
  let count = 0;
  const total = uniqueUrls.size;
  let requestsThisMinute = 0;
  const startTime = Date.now();

  const TWO_MONTHS = 2 * 30 * 24 * 60 * 60 * 1000; // 2 months in milliseconds

  for (const url of uniqueUrls) {
    count++;

    // Skip if we have recent data
    if (previews[url] && previews[url].lastFetched) {
      const lastFetched = new Date(previews[url].lastFetched);
      if (Date.now() - lastFetched < TWO_MONTHS) {
        console.log(`Skipping ${url} - data is less than two months old`);
        continue;
      }
    }

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
