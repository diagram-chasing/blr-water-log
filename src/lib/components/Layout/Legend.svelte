<script lang="ts">
  import { ArrowRight } from 'lucide-svelte';
  const legendItems = [
    { color: '#ffffff' },
    { color: '#abced0' },

    { color: '#519ea2' }
  ];
</script>

<div class="legend md:mx-0 mx-2">
  <h4
    class=" inline-flex font-khand-bold items-center py-2 text-lg tracking-normal text-zinc-700"
  >
    Higher chance of water accumulation <ArrowRight class="size-5 ml-2" />
  </h4>
  <div class="legend-items">
    {#each legendItems as item}
      <div class="legend-item">
        <svg width="100" height="10">
          <rect
            width="150"
            opacity="0.8"
            height="10"
            fill={item.color}
            stroke="#282828"
            stroke-width="0.3"
          />
        </svg>
      </div>
    {/each}
  </div>
</div>

<style>
  .legend-items {
    display: flex;
    flex-direction: row;
  }

  .legend-item {
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    text-align: center;
  }
</style>
