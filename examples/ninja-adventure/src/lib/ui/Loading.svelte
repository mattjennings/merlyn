<script>
  import { fade } from 'svelte/transition'
</script>

<div class="loader" in:fade={{ delay: 500 }} out:fade />

<style>
  .loader {
    position: absolute;
    bottom: 10em;
    right: 10em;
  }
  .loader:after {
    content: ' ';
    display: block;
    width: 8em;
    height: 8em;
    border-radius: 50%;
    border: 1em solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: loader 1.2s linear infinite;
    mix-blend-mode: difference;
  }
  @keyframes loader {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
