<script lang="ts">
  import IconButton from "@app/components/IconButton.svelte";
  import Icon from "@app/components/Icon.svelte";
  import KeyHint from "@app/components/KeyHint.svelte";
  import Popover from "@app/components/Popover.svelte";
  import Settings from "./Settings.svelte";
</script>

<style>
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--font-size-small);
    color: var(--color-foreground-dim);
    height: 2.3125rem;
    background-color: var(--color-background-dip);
    padding: 0 1rem;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .right {
    display: flex;
    gap: 1.5rem;
  }

  a {
    display: flex;
  }

  a:hover {
    color: var(--color-fill-secondary);
  }
</style>

<div class="footer">
  <div class="left">
    <Popover popoverPositionBottom="3rem" popoverPositionLeft="0">
      <IconButton slot="toggle" let:toggle on:click={toggle}>
        <Icon name="settings" />
        Settings
      </IconButton>

      <Settings slot="popover" />
    </Popover>
  </div>

  <div class="center">
    Press <KeyHint>?</KeyHint>
    for keyboard shortcuts
  </div>
  <div class="right">
    <a
      style:display="flex"
      style:align-items="center"
      style:gap="0.25rem"
      target="_blank"
      rel="noreferrer"
      href="https://radicle.xyz">
      radicle.xyz
      <Icon name="arrow-box-up-right" />
    </a>
  </div>
</div>
