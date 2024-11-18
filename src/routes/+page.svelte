<script lang="ts">
  import { onMount } from 'svelte';
  import Map from '../lib/components/Map/map';
  import Header from '../lib/components/Layout/Header.svelte';
  import Drawer from '../lib/components/Layout/Drawer.svelte';
  import SEO from '../lib/components/Layout/SEO.svelte';
  import AlertDialog from '../lib/components/Layout/AlertDialog.svelte';
  // import { base } from '$app/paths'
  export let data;
  let mapContainer: HTMLElement;
  let map: Map;
  let alertOpen = false;
  let alertMessage = '';
  let isLocating = false;

  onMount(() => {
    map = new Map();
    map.init(mapContainer);

    return () => {
      map.cleanup();
    };
  });

  let metadata = {
    title: 'BLR Water Log',
    description:
      "Where does Bangalore's water flow and accumulate?",
    date: '2024-11-18',
    categories: ['gis', 'map', 'blr', 'flood', 'bangalore', 'water'],
    author: ['Aman Bhargava', 'Vivek Matthew'].join(', '),
    ogImage: `/sharecard.jpg`
  };

  function updateOpacity(value: number) {
    if (map) {
      map.setLayerOpacity(value);
    }
  }

  async function handleLocate() {
    if (isLocating) return;

    try {
      isLocating = true;
      const result = await map.locate();
      if (result.type === 'error' && result.message) {
        alertMessage = result.message;
        alertOpen = true;
      }
    } catch (error) {
      console.error('Location error:', error);
      alertMessage = 'Something went wrong while trying to locate you';
      alertOpen = true;
    } finally {
      isLocating = false;
    }
  }
</script>

<main data-vaul-drawer-wrapper>
  <SEO {...metadata} />
  <div bind:this={mapContainer} class="map-container"></div>
  <Header />
  <Drawer
    pois={data.pois}
    on:opacityChange={e => updateOpacity(e.detail)}
    on:locate={handleLocate}
    {isLocating}
  />
  <AlertDialog bind:open={alertOpen} message={alertMessage} />
</main>

<style lang="postcss">
  :global(::-webkit-scrollbar) {
    width: 0.5rem;
    height: 0.5rem;
  }

  :global(::-webkit-scrollbar-track) {
    background-color: rgb(244 244 245); /* zinc-100 */
  }
  :global(::-webkit-scrollbar-thumb) {
    background-color: rgb(212 212 216); /* zinc-300 */
    border-radius: 0.125rem;
  }
  .map-container {
    width: 100%;
    height: 100dvh;
  }

  /* Add top and bottom gradient that go from black to transparent */
  .map-container::after {
    content: '';
    position: absolute;
    width: 100%;
    user-select: none;
    height: 15%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7));
  }

  /* On mobile, hide the attribution */
  @media (max-width: 768px) {
    :global(.maplibregl-ctrl.maplibregl-ctrl-attrib) {
      display: none;
    }
  }
</style>
