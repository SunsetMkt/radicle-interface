<script lang="ts">
  import Badge from "@app/components/Badge.svelte";

  export let labels: string[] = [];
</script>

<style>
  .header {
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
  }
  .body {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
    font-size: var(--font-size-small);
  }
  @media (max-width: 1349.98px) {
    .wrapper {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      align-items: flex-start;
    }
    .header {
      margin-bottom: 0;
      height: 2rem;
      display: flex;
      align-items: center;
    }
    .body {
      align-items: flex-start;
    }
    .no-labels {
      height: 2rem;
      display: flex;
      align-items: center;
    }
  }
</style>

<div class="wrapper">
  <div class="header">Labels</div>
  <div class="body">
    {#each labels as label}
      <Badge variant="neutral" size="small">
        {label}
      </Badge>
    {:else}
      <div class="txt-missing no-labels">No labels</div>
    {/each}
  </div>
</div>
