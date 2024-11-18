<script>
  import { ArrowRightFromLine } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import Logo from '$assets/dc-logo-no-text.png';
  import FrogImage from '$assets/frog.png';
  const dispatch = createEventDispatcher();
</script>

<div class="h-full flex flex-col">
  <div
    class="flex mx-4 py-4 justify-between border-b border-zinc-200 items-center"
  >
    <div>
      <h2 class="font-bold text-2xl text-zinc-900">Methodology</h2>
      <p class="text-zinc-500">How we built this map</p>
    </div>
    <button
      class="text-center text-sm w-[7rem] transition-all duration-100 bg-zinc-100 hover:bg-zinc-800 hover:text-white font-bold text-zinc-900 px-4 py-4 rounded-lg flex items-center justify-center gap-2"
      on:click={() => dispatch('back')}
      >Back
      <ArrowRightFromLine class="size-4" />
    </button>
  </div>

  <div class="px-4 py-6 flex-1 text-sm text-zinc-600 flex flex-col">
    <div class="flex-1">
      <p class="max-w-[30rem]">
        Using a 30m digital elevation model from <a
          href="https://spacedata.copernicus.eu/collections/copernicus-digital-elevation-model"
          target="_blank"
          rel="noopener noreferrer">Copernicus</a
        >, we analyzed the city's terrain to understand it's water flow
        patterns. We used WhiteboxTools, a geospatial analysis library, to map
        water accumulation, and identify major streams across the landscape. To
        produce the graduated layer you see on the map, we smoothened these
        accumulation values and reclassified them into distinct categories.
        <br /> <br /> All our code, including the hydrological analysis and this
        website, is open source and available on
        <a
          href="https://github.com/diagram-chasing/blr-water-log"
          target="_blank"
          rel="noopener noreferrer">GitHub</a
        >.
      </p>
    </div>
    <div
      class="flex flex-col md:flex-row gap-4 md:gap-2 justify-between items-start md:items-end footer"
    >
      <div class="flex gap-2 items-end">
        <img
          src={Logo}
          class="w-[60px] p-1 border border-zinc-300 rounded-lg"
          alt="Diagram Chasing"
        />
        <div class="flex gap-1 flex-col">
          <p class="text-xs text-justify">
            For <br />
            <a
              href="https://diagramchasing.fun"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:text-blue-800 transition-colors duration-100"
              >Diagram Chasing</a
            >
          </p>
          <p class="text-xs leading-relaxed text-justify">
            by <a href="https://bsky.app/profile/aman.bh">Aman Bhargava</a> &
            <a href="https://bsky.app/profile/vonter.bsky.social"
              >Vivek Matthew</a
            >
          </p>
        </div>
      </div>
      <p class="text-xs leading-relaxed text-justify">
        Illustrations by <a href="https://reechik.com">Reechik Bannerjee</a>
      </p>
    </div>
  </div>
</div>

<style lang="postcss">
  a {
    @apply underline underline-offset-4 leading-3;
  }
</style>
