<script lang="ts">
  import { Drawer } from 'vaul-svelte';
  import { cubicInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { Waves, LocateIcon, Loader2 } from 'lucide-svelte';
  import { selectedPOI } from '../Map/map';
  import { smScreen } from 'svelte-ux';

  import Legend from './Legend.svelte';
  import DefaultDrawerScreen from './DefaultDrawerScreen.svelte';
  import POIScreen from './POIScreen.svelte';
  import Methodology from './Methodology.svelte';
  import Header from './Header.svelte';

  export let pois;
  export let isLocating = false;

  const dispatch = createEventDispatcher();

  // Screen state management
  type Screen = 'default' | 'poi' | 'methodology';
  let currentScreen: Screen = 'default';
  let previousScreen: Screen = 'default';

  // UI state
  let drawerOpen = false;
  let showCloseHint = false;
  let value = 0.8;

  // Transition helper
  function getTransitionDirection(from: Screen, to: Screen): number {
    const screenOrder = { default: 0, methodology: -1, poi: 1 };
    return screenOrder[to] > screenOrder[from] ? 1 : -1;
  }

  function fadeSlideCubic(
    node: HTMLElement,
    {
      duration,
      direction = 1,
      delay = 0
    }: { duration: number; direction?: number; delay?: number }
  ) {
    return {
      delay,
      duration,
      css: (t: number, u: number) => `
        position: absolute;
        width: 100%;
        transform: translateX(${cubicInOut(direction * u) * 100}%);
        opacity: ${cubicInOut(t)};
      `
    };
  }

  // Event handlers
  function handleOpacityChange(e: Event) {
    const value = parseFloat((e.target as HTMLInputElement).value);
    dispatch('opacityChange', value);
  }

  function handleClose() {
    currentScreen = 'default';
    $selectedPOI = null;
    showCloseHint = false;
    drawerOpen = false;
  }

  function handleScreenChange(newScreen: Screen) {
    previousScreen = currentScreen;
    currentScreen = newScreen;
    drawerOpen = true;
  }

  function handleBack(from: Screen) {
    if (from === 'poi') {
      $selectedPOI = null;
    }
    handleScreenChange('default');
  }

  // Handle POI selection
  $: if ($selectedPOI && currentScreen === 'default') {
    handleScreenChange('poi');
    if (!showCloseHint && !$smScreen) {
      showCloseHint = true;
      setTimeout(() => (showCloseHint = false), 12000);
    }
  }
</script>

<Header on:showMethodology={() => handleScreenChange('methodology')} />

<div
  class="fixed w-full md:w-fit bottom-0 -left-5 md:left-1/2 transform md:-translate-x-1/2 z-50"
>
  <div class="w-full max-w-[19rem] md:max-w-sm mx-auto">
    <!-- Controls -->
    <div class="flex gap-2 w-full items-center">
      <div
        class="px-4 w-full py-2 z-10 justify-center items-center flex gap-1 border-zinc-300 border bg-white rounded-lg md:shadow-lg"
      >
        <Waves class="size-6 stroke-[#74B1B5]" />
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.1"
          bind:value
          class="w-full h-2 rounded-lg appearance-none cursor-pointer relative [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#74B1B5] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:mt-[-4px] hover:[&::-webkit-slider-thumb]:brightness-95 [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#74B1B5] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-colors hover:[&::-moz-range-thumb]:brightness-95 [&::-moz-range-progress]:bg-[#74B1B5] [&::-moz-range-track]:bg-zinc-200"
          on:input={handleOpacityChange}
          style="--range-progress: {value * 120}%;"
        />
      </div>
      <button
        class="px-4 hover:bg-zinc-100 py-2 my-2 z-10 md:my-4 justify-center items-center flex gap-1 border-zinc-300 border bg-white rounded-lg md:shadow-lg"
        on:click={() => dispatch('locate')}
      >
        {#if isLocating}
          <Loader2 class="size-6 stroke-[#74B1B5] animate-spin" />
        {:else}
          <LocateIcon class="size-6 stroke-[#74B1B5]" />
        {/if}
      </button>
    </div>

    <!-- Drawer -->
    <Drawer.Root
      onClose={handleClose}
      open={$selectedPOI !== null || drawerOpen}
      closeOnOutsideClick={true}
    >
      <Drawer.Trigger
        class="bg-white shadow-2xl shadow-black w-full max-w-[44rem] rounded-t-2xl rounded-b-none md:px-6 py-2"
      >
        <Legend />
        <div
          class="mx-auto my-2 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300"
        />
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay class="fixed isolate inset-0 z-100 bg-black/40" />

        {#if showCloseHint}
          <div
            class="absolute top-28 right-1/2 translate-x-1/2 transform -translate-x-1/2"
            transition:fade
            on:click={() => (showCloseHint = false)}
          >
            <p class="text-white uppercase text-xl font-bold">tap to close</p>
          </div>
        {/if}

        <Drawer.Content
          class="bg-zinc-100 overflow-x-hidden overflow-y-clip max-w-2xl md:mx-auto mx-2 z-50 flex flex-col h-[35rem] md:h-1/2 rounded-t-[20px] absolute bottom-0 left-0 right-0"
        >
          <div
            class="bg-white overflow-x-hidden overflow-y-auto rounded-t-[20px] flex-1 relative"
          >
            <div class="relative h-full">
              {#if currentScreen === 'poi' && $selectedPOI}
                <div
                  class="h-full"
                  transition:fadeSlideCubic={{
                    duration: 400,
                    direction: getTransitionDirection(previousScreen, 'poi')
                  }}
                >
                  <POIScreen {pois} on:back={() => handleBack('poi')} />
                </div>
              {:else if currentScreen === 'methodology'}
                <div
                  class="h-full"
                  transition:fadeSlideCubic={{
                    duration: 400,
                    direction: getTransitionDirection(
                      previousScreen,
                      'methodology'
                    )
                  }}
                >
                  <Methodology on:back={() => handleBack('methodology')} />
                </div>
              {:else}
                <div
                  class="h-full"
                  transition:fadeSlideCubic={{
                    duration: 400,
                    direction: getTransitionDirection(previousScreen, 'default')
                  }}
                >
                  <DefaultDrawerScreen
                    {pois}
                    on:showMethodology={() => handleScreenChange('methodology')}
                    on:selectPoi={() => handleScreenChange('poi')}
                  />
                </div>
              {/if}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  </div>
</div>

<style>
  input[type='range'] {
    background: linear-gradient(
      to right,
      #74b1b5 0%,
      #74b1b5 var(--range-progress),
      rgb(228 228 231) var(--range-progress),
      rgb(228 228 231) 100%
    );
  }

  input[type='range']::-webkit-slider-runnable-track {
    background: none;
  }
</style>
