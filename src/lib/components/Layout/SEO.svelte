<script lang="ts">
  import { onMount } from 'svelte';

  export let title: string = 'Default Title';
  export let description: string = 'Default description of your website';
  export let keywords: string = 'svelte, seo, web development';
  export let author: string = 'Your Name';
  export let canonicalUrl: string = '';
  export let ogImage: string =
    'https://milton-dc-story.netlify.app/sharecard.jpg';
  export let twitterHandle: string = null;
  export let twitterCardType: 'summary' | 'summary_large_image' =
    'summary_large_image';

  let currentUrl: string;

  onMount(() => {
    currentUrl = window.location.href;
  });
</script>

<svelte:head>
  <!-- Basic Meta Tags -->
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <meta name="author" content={author} />
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Canonical URL -->
  <link rel="canonical" href={canonicalUrl || currentUrl} />

  <!-- Open Graph Tags -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta
    property="og:image"
    content="https://blr-rains.netlify.app/sharecard.jpg"
  />
  <meta property="og:url" content={canonicalUrl || currentUrl} />
  <meta property="og:type" content="website" />

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content={twitterCardType} />
  <meta name="twitter:site" content={twitterHandle} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />

  <!-- Additional Meta Tags -->
  <meta name="language" content="English" />
  <meta name="revisit-after" content="7 days" />
  <meta name="distribution" content="global" />
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
</svelte:head>
