<script>
  import { Dialog } from 'svelte-ux';
  import Submerged from '$assets/submerged.webp';
  export let open = false;
  export let message = 'Are you sure you want to do that?';
</script>

<Dialog
  bind:open
  classes={{
    dialog:
      'w-[25rem] mx-2  bg-white rounded-lg shadow-xl border border-zinc-300',
    backdrop: 'dark:bg-black/40 bg-black/40'
  }}
>
  <div
    style="background-image: url({Submerged});
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;"
    class="p-4 relative"
  >
    <div class="absolute inset-0 bg-white/80"></div>
    <div class="relative">
      <div
        class="text-3xl font-khand-bold font-medium text-center text-zinc-900"
      >
        Oops!
      </div>
      <div class="font-medium text-center text-zinc-900 font-supreme py-3">
        {@html message}
      </div>
    </div>
  </div>
</Dialog>
