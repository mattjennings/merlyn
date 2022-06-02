<script lang="ts">
  import { Loader } from 'excalibur'
  import { tweened } from 'svelte/motion'
  import { cubicInOut } from 'svelte/easing'
  import { fade } from 'svelte/transition'

  export let loader: Loader

  let progress = tweened(0, {
    easing: cubicInOut,
    duration: 500,
  })

  loader.on('progress', (value) => {
    $progress = value
  })
</script>

<div class="bg-gray-800 h-full flex justify-center items-center" out:fade>
  <div class="flex flex-col justify-center border-2 rounded-full w-32 h-4 px-1">
    <div
      class="bg-white rounded-full h-1.5"
      style:width={`calc(${$progress}%)`}
    />
  </div>
</div>
