<script>
  import { selectedPOI } from '../Map/map';
  import { ArrowLeftFromLine } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  import LinkPreview from './LinkPreview.svelte';
  import Frog from '$assets/frog.png';
  export let pois;
  console.log(pois);
  const dispatch = createEventDispatcher();
</script>

<div class="h-full flex flex-col">
  <div
    class="flex mx-4 py-4 justify-between border-b border-zinc-200 items-center"
  >
    <div>
      <h2 class="font-bold text-2xl text-zinc-900">
        {$selectedPOI}
      </h2>
      <p class="text-zinc-500">
        {pois[$selectedPOI].neighborhood}
      </p>
    </div>
    <button
      class=" text-center text-sm w-[7rem] transition-all duration-100 bg-zinc-100 hover:bg-zinc-800 hover:text-white font-bold text-zinc-600 px-4 py-4 rounded-md flex items-center justify-center gap-2"
      on:click={() => {
        dispatch('back');
      }}
    >
      <ArrowLeftFromLine class="size-4" />
      Back
    </button>
  </div>

  <div class="px-4 pt-2">
    <h3 class="font-bold pb-2 text-lg text-zinc-900 border-b border-zinc-200">
      In the news
    </h3>
    {#if $selectedPOI && pois[$selectedPOI]?.links}
      {#each Object.entries(pois[$selectedPOI].links).sort((a, b) => Number(b[0]) - Number(a[0])) as [year, links]}
        <div class="flex mt-4 md:flex-row flex-col gap-4 mb-6">
          <div class=" md:mb-0 flex items-start">
            <p class=" rounded-lg font-bold text-zinc-600 whitespace-nowrap">
              {year}
            </p>
          </div>
          <div>
            <ul class="space-y-3 w-full">
              {#each links as link}
                <li>
                  <LinkPreview url={link} />
                </li>
              {/each}
            </ul>
          </div>
        </div>
      {/each}
    {/if}
  </div>
  <!-- Add empty state -->
  <div
    class="flex-1 pb-8 m-2 flex items-center justify-center h-full text-center text-zinc-400"
  >
    <div class="flex gap-y-2 items-center justify-center flex-col">
      <img
        src={Frog}
        class="size-24 md:size-28 opacity-60 grayscale-[30%]"
        alt="Frog rowing a boat"
      />
      <!-- <Waves class="size-6  text-zinc-400" /> -->

      <p class="font-medium text-sm">That's all we've collected for now</p>
      <div class=" text-center text-xs text-zinc-600">
        Found another mention? <a
          class="text-zinc-600 border hover:bg-zinc-200 border-zinc-200 bg-zinc-100 px-2 py-1 rounded-sm transition-colors duration-100"
          target="_blank"
          href="https://github.com/diagram-chasing/blr-water-log/issues/new?assignees=&labels=data%2Cflooding-incident&projects=&template=add-flooding-incident.yml&title=Add+Flooding+Incident%3A+{$selectedPOI}"
          >Contribute</a
        > to the map.
      </div>
    </div>
  </div>
</div>
