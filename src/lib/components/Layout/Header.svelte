<script>
  import Logo from '$lib/assets/dc-logo-no-text.png';
  import { CircleHelp } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const ANIMATION_DURATION = 30; // seconds - matches the fill-drain animation
</script>

<header class="absolute top-0 left-0 right-0 w-full min-h-[60px] p-3 md:p-4">
  <!-- Logo Section -->
  <div class="fixed left-[3%] md:left-[1%] md:bottom-[1%] top-3 md:top-auto">
    <div
      class="flex items-center bg-white shadow-2xl border border-zinc-300 shadow-black px-1 md:px-2 py-1 rounded-md md:shadow-2xl"
    >
      <a
        href="https://diagramchasing.fun"
        class="flex items-center gap-x-2"
        target="_blank"
      >
        <img
          src={Logo}
          class="md:-ml-1 w-[56px] md:w-[30px] bg-white rounded-sm"
          alt="DC Logo"
        />
        <div class="hidden md:block">
          <p class="text-xs font-semibold text-gray-900">A project by</p>
          <p
            class="text-sm tracking-wide font-khand-bold uppercase font-bold text-gray-900"
          >
            Diagram Chasing
          </p>
        </div>
      </a>
    </div>
  </div>

  <!-- Water Container Section -->
  <div
    class="flex pointer-events-none justify-center items-center md:ml-0 ml-[72px] relative flex-col gap-2"
  >
    <div
      class="relative max-w-[300px] bg-white px-2 flex md:flex-col gap-1 flex-row items-center md:h-full h-[66px] p-2 md:p-3 rounded-lg shadow-md overflow-hidden w-full md:w-auto"
    >
      <h1
        class="font-khand-bold w-[90%] md:text-4xl text-2xl md:text-center font-bold uppercase"
      >
        BLR Water Log
      </h1>
      <p
        class="md:text-sm md:w-full w-[90%] text-xs md:text-center font-semibold"
      >
        Mapping where water drains and flows
      </p>

      <!-- Water Effect -->
      <div
        class="absolute bottom-0 left-0 right-0 min-h-[3.5rem] overflow-hidden"
      >
        <div
          class="water-level h-full"
          style="animation-duration: {ANIMATION_DURATION}s;"
        >
          <!-- Add the paper boat here -->
          <div class="paper-boat"></div>
        </div>
        <div class="bubbles">
          {#each Array(10) as _, i}
            <div
              class="bubble"
              style="--delay: {i * 0.2}s; --position: {Math.random() * 100}%"
            ></div>
          {/each}
        </div>
      </div>
    </div>
    <div class="w-full max-w-[300px] flex justify-end">
      <button
        class="bg-white p-2 rounded-md shadow-md hover:bg-zinc-50 transition-colors duration-200 pointer-events-auto md:absolute md:right-0 md:top-0"
        on:click={() => dispatch('showMethodology')}
        aria-label="Show methodology"
      >
        <CircleHelp class="w-5 h-5 text-zinc-700" />
      </button>
    </div>
  </div>
</header>

<style lang="postcss">
  .water-level {
    @apply absolute bottom-0 left-0 right-0;
    background: rgba(175, 224, 228, 0.7);
    animation: fill-drain 30s cubic-bezier(0.42, 0, 0.58, 1) infinite;
  }

  .bubble {
    @apply absolute bottom-0;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    left: var(--position);
    animation: bubble 2s ease-in infinite;
    animation-delay: var(--delay);
  }

  @keyframes wave {
    0% {
      transform: translateX(-75%);
    }
    100% {
      transform: translateX(-25%);
    }
  }

  @keyframes bubble {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(-40px);
      opacity: 0;
    }
  }

  @keyframes fill-drain {
    0%,
    15% {
      height: 0%;
    }

    75% {
      height: 100%;
    }
    80%,
    100% {
      height: 0%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .water-level {
      animation: none;
      height: 50%;
    }

    .bubble {
      display: none;
    }
  }

  .paper-boat {
    @apply absolute;
    width: 54px;
    height: 62px;
    left: 70%;
    bottom: 100%;
    transform: translateY(100%);

    animation: float 30s cubic-bezier(0.42, 0, 0.58, 1) infinite;
  }

  .paper-boat::before {
    content: '';
    @apply absolute;
    bottom: 0;
    width: 100%;
    height: 100%;

    background: white;
    clip-path: polygon(
      47% 18%,
      36% 28%,
      10% 29%,
      22% 44%,
      52% 44%,
      72% 44%,
      83% 29%,
      56% 27%
    );
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(100%) translateX(0%) rotate(30deg);
    }
    25% {
      transform: translateY(100%) translateX(40%) rotate(2deg);
    }
    50% {
      transform: translateY(100%) translateX(0%) rotate(0deg);
    }
    75% {
      transform: translateY(100%) translateX(-60%) rotate(22deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .paper-boat {
      animation: none;
      transform: translateY(100%);
    }
  }
</style>
