<script>
  import { selectedPOI } from '../Map/map';
  import { scrollFade } from 'svelte-ux';
  import { smScreen } from 'svelte-ux';
  import { createEventDispatcher } from 'svelte';
  import { waterFill } from './waterFill';
  import Diagram from '../../../ai2html/diagram.svelte';
  export let pois;
  const dispatch = createEventDispatcher();

  // Add default POIs array
  const defaultPOIs = [
    'Ecospace',
    'Kendriya Vihar',
    'Manyata Tech Park',
    'Nayandahalli'
  ];

  // Custom sort function to prioritize default POIs
  function customSort(a, b) {
    const aIndex = defaultPOIs.indexOf(a);
    const bIndex = defaultPOIs.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  }

  $: options = Object.keys(pois).sort(customSort);
</script>

<div class="flex flex-col h-full p-4 bg-white rounded-t-xl">
  <!-- Header Section -->
  <div class="grid grid-cols-1 md:grid-cols-8 gap-2">
    <div class="col-span-1 md:col-span-4">
      <h2
        class="mb-2 font-khand-bold text-xl text-black/80 md:text-3xl uppercase bg-white"
      >
        The way of water
      </h2>
      <p class="text-sm leading-relaxed text-gray-600 md:text-base">
        Natural water channels crisscross Bangalore's landscape - the city's
        original drainage system. When these old waterways get blocked or built
        over, that's usually where you'll spot flooding during rains.
      </p>
    </div>
    <div
      class="col-span-1 mx-auto md:max-w-full max-w-[20rem] md:col-span-4 w-full px-2 items-center"
    >
      <svelte:component this={Diagram} />
    </div>
  </div>

  <!-- POI Grid Section -->

  <div class="flex pt-2 h-full gap-2">
    <div
      class="w-1/3 h-full md:w-2/3 flex items-start flex-col justify-between"
    >
      <p class="text-xs md:text-base font-medium text-zinc-500">
        Some of the same places are often mentioned in the news.
      </p>

      <button
        on:click={() => {
          dispatch('showMethodology');
        }}
        class="text-xs -ml-2 px-2 py-2 hover:text-black md:text-sm underline underline-offset-8 text-zinc-500"
      >
        Methodology
      </button>
    </div>
    <div
      use:scrollFade
      class="flex flex-col divide-y w-full max-h-[8rem] md:max-h-[9rem] divide-zinc-100 items-center overflow-y-auto"
    >
      {#each options as option}
        <button
          class=" py-2 px-4 text-center text-sm md:text-base transition-colors w-full duration-200 hover:bg-zinc-100 hover:text-black"
          on:click={() => {
            $selectedPOI = option;
            dispatch('selectedPOI', option);
          }}
        >
          {option}
        </button>
      {/each}
    </div>
  </div>
</div>
