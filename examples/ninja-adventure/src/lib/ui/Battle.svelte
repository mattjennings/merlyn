<script>
  import { cubicInOut } from 'svelte/easing'
  import Menu from './components/Menu.svelte'
  import { createEventDispatcher } from 'svelte'
  import { fly } from './transitions'

  const dispatch = createEventDispatcher()

  let showAttackMenu = false
</script>

<div class="pixel" />
<div
  class="root"
  transition:fly={{
    y: 10,
    easing: cubicInOut,
    duration: 200,
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
        duration: 200,
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
    gap: 1em;
  }

  .actions {
    display: flex;
    flex-flow: column wrap;
    gap: 2em;
    height: 100%;
  }

  .pane {
    border: 0.75em solid white;
    border-radius: 2em;
    padding: 2em 3em;
    height: 40em;
    opacity: 90%;

    background: radial-gradient(
      circle at -15% 0,
      #0053ad 20%,
      #001b85 125%,
      #000223
    );
  }

  .pane.inactive {
    opacity: 0.5;
  }
</style>
