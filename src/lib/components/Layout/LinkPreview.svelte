<script>
  import linkPreviews from '$lib/data/link-previews.json';
  import { ExternalLink } from 'lucide-svelte';

  const favicons = import.meta.glob(
    '/src/lib/assets/favicons/*.{png,jpg,jpeg,svg}',
    { eager: true }
  );

  export let url;
  $: preview = linkPreviews[url];
  $: faviconSrc = preview?.favicon ? favicons[preview.favicon]?.default : null;
</script>

<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  class="block border rounded-lg hover:bg-zinc-50 transition-colors duration-100"
>
  <div class="p-3">
    {#if preview}
      <div class="flex gap-3">
        {#if preview.image}
          <div class="block flex-shrink-0">
            <img
              src={preview.image}
              alt=""
              class="size-28 object-cover rounded-sm bg-zinc-100"
            />
          </div>
        {/if}
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h3
              class=" font-medium text-zinc-800 leading-relaxed line-clamp-2 md:text-base text-sm"
            >
              {preview.title}
            </h3>
            <ExternalLink class="size-4 flex-shrink-0 text-zinc-400" />
          </div>
          {#if preview.description}
            <p class="text-sm text-zinc-500 line-clamp-2 mt-1">
              {preview.description}
            </p>
          {/if}
          <div class="flex items-center gap-2 mt-2">
            {#if faviconSrc}
              <img src={faviconSrc} alt="" class="w-4 h-4 rounded-sm" />
            {/if}
            <p class="text-xs text-zinc-400 truncate">
              {preview.siteName || new URL(url).hostname}
            </p>
          </div>
        </div>
      </div>
    {:else}
      <div class="text-sm text-zinc-600 break-all">
        {url}
      </div>
    {/if}
  </div>
</a>
