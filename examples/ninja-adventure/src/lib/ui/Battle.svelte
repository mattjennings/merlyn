<script>
  import { fly } from 'svelte/transition'
  import { cubicInOut } from 'svelte/easing'
  import Menu from './components/Menu.svelte'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
</script>

<div
  class="main-menu"
  transition:fly={{
    y: 50,
    easing: cubicInOut,
    duration: 500,
  }}
>
  <div class="pane">
    <Menu let:register>
      <div class="actions">
        <button use:register id="attack" disabled>ATTACK</button>
        <button use:register id="items" disabled>ITEMS</button>
        <button
          use:register
          id="flee"
          on:select={() => {
            dispatch('flee')
          }}
        >
          FLEE
        </button>
      </div>
    </Menu>
  </div>
</div>

<style>
  .main-menu {
    display: flex;
    flex-flow: column;
    align-items: flex-start;
    justify-content: flex-end;
    height: 100%;
    max-height: 100%;
  }

  .actions {
    display: flex;
    flex-flow: column wrap;
    gap: 0.2rem;
    height: 100%;
  }

  .pane {
    border: 1px solid white;
    border-radius: 0.25rem;
    padding: 0.25rem;
    height: 3rem;
    opacity: 90%;
    padding: 0.5rem;

    background: radial-gradient(
      circle at -180px 0px,
      #0053ad 300px,
      #001b85 500px,
      #000223
    );
  }

  button:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.35);
    /* box-shadow: 0 0 0 0.75px rgba(255, 255, 255, 0.75); */
  }

  button {
    width: 2.5rem;
  }

  button:not([disabled]) {
    cursor: pointer;
  }

  button[disabled] {
    opacity: 0.5;
  }
</style>
