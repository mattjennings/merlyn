<script>
  import { fly } from 'svelte/transition'
  import { cubicInOut } from 'svelte/easing'
  import Menu from './components/Menu.svelte'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  let showAttackMenu = false
</script>

<div
  class="root"
  transition:fly={{
    y: 50,
    easing: cubicInOut,
    duration: 500,
  }}
>
  <div class="pane" class:inactive={showAttackMenu}>
    <Menu let:register active={!showAttackMenu}>
      <div class="actions">
        <button
          use:register
          id="attack"
          on:select={() => {
            showAttackMenu = true
          }}>ATTACK</button
        >
        <!-- <button use:register id="items" disabled>ITEMS</button> -->
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

  {#if showAttackMenu}
    <div
      class="attack-menu pane"
      transition:fly={{
        x: -1,
        opacity: 0,
        duration: 150,
      }}
    >
      <Menu
        let:register
        on:close={() => {
          showAttackMenu = false
        }}
      >
        <div class="actions">
          <button use:register id="1">Cyclops 1</button>
          <button use:register id="2">Cyclops 2</button>
        </div>
      </Menu>
    </div>
  {/if}
</div>

<style>
  .root {
    display: flex;
    flex-flow: row;
    align-items: flex-end;
    height: 100%;
    max-height: 100%;
    gap: 0.2rem;
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

  .pane.inactive {
    opacity: 0.5;
  }

  button:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 0.75px rgba(255, 255, 255, 0.75);
  }

  button:not([disabled]) {
    cursor: pointer;
  }

  button[disabled] {
    opacity: 0.5;
  }
</style>
