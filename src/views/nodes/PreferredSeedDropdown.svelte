<script lang="ts">
  import { HttpdClient, type BaseUrl } from "@http-client";

  import { derived } from "svelte/store";

  import config from "virtual:config";
  import {
    addSeedsToConfiguredSeeds,
    configuredPreferredSeeds,
    preferredSeeds,
    removeSeedFromConfiguredSeeds,
    selectPreferredSeed,
  } from "@app/lib/seeds";
  import { closeFocused } from "@app/components/Popover.svelte";
  import { deduplicateStore } from "@app/lib/deduplicateStore";
  import { push } from "@app/lib/router";

  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Popover from "@app/components/Popover.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const selectedSeed = deduplicateStore(
    derived(preferredSeeds, $ => $?.selected),
  );

  const validateInput = async (seed: BaseUrl) => {
    if (stateOptions.find(s => s.hostname === seed.hostname)) {
      validationMessage = "Seed node already added.";
      return false;
    }
    const api = new HttpdClient(seed);
    try {
      await api.getNode();
      return true;
    } catch (e) {
      validationMessage = "Seed node isn't reachable";
      return false;
    }
  };

  // Reset state if inputValue changes
  $: {
    customSeed;
    submittingInput = false;
    validationMessage = undefined;
    valid = true;
  }
  $: stateOptions = $preferredSeeds.seeds;
  let valid = true;
  let submittingInput = false;
  let validationMessage: undefined | string = undefined;
  let customSeed: string = "";
  let expanded = false;
</script>

<style>
  .popover {
    display: flex;
    flex-direction: column;
  }

  .validation-message {
    color: var(--color-foreground-red);
    margin-top: 0.5rem;
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .dropdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .divider {
    height: 1px;
    width: 100%;
    margin: 0.5rem 0;
    background-color: var(--color-border-default);
  }

  .icon-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>

<Popover
  bind:expanded
  popoverContainerMinWidth="0"
  popoverPositionTop="2.5rem"
  popoverPositionLeft="0"
  popoverPadding="0.25rem"
  popoverBorderRadius="var(--border-radius-small)">
  <div
    class="icon-item"
    slot="toggle"
    title="Switch preferred seeds"
    let:toggle>
    <slot />
    <IconButton on:click={toggle}>
      <Icon name={expanded ? "chevron-up" : "chevron-down"} />
    </IconButton>
  </div>

  <svelte:fragment slot="popover">
    <div style:width="16rem">
      <TextInput
        {valid}
        name="seed"
        bind:value={customSeed}
        loading={submittingInput}
        placeholder="Navigate to seed"
        on:submit={async () => {
          submittingInput = true;
          const customSeedBaseUrl = {
            hostname: customSeed,
            port: config.nodes.defaultHttpdPort,
            scheme: config.nodes.defaultHttpdScheme,
          };
          valid = await validateInput(customSeedBaseUrl);
          if (valid) {
            addSeedsToConfiguredSeeds(
              $configuredPreferredSeeds.length === 0
                ? [customSeedBaseUrl, config.fallbackPreferredSeed]
                : [customSeedBaseUrl],
            );
            selectPreferredSeed(customSeedBaseUrl);
            customSeed = "";
            closeFocused();
            void push({
              resource: "nodes",
              params: { baseUrl: $selectedSeed, projectPageIndex: 0 },
            });
          } else {
            submittingInput = false;
          }
        }} />
      {#if validationMessage}
        <span class="validation-message txt-small">{validationMessage}</span>
      {/if}
      <div class="divider" />
      <div class="popover">
        {#if stateOptions}
          <DropdownList items={stateOptions}>
            <DropdownListItem
              let:item
              on:click={() => {
                selectPreferredSeed(item);
                closeFocused();
                void push({
                  resource: "nodes",
                  params: { baseUrl: $selectedSeed, projectPageIndex: 0 },
                });
              }}
              slot="item"
              selected={item.hostname === $selectedSeed.hostname}>
              <div class="dropdown-item">
                <div class="icon-item" style:min-width="0">
                  <Icon name="seedling" />
                  <div class="txt-overflow">
                    {item.hostname}
                  </div>
                </div>
                {#if stateOptions && stateOptions.length > 1}
                  <IconButton
                    on:click={() => {
                      removeSeedFromConfiguredSeeds(item.hostname);
                      selectPreferredSeed(config.fallbackPreferredSeed);
                      closeFocused();
                      void push({
                        resource: "nodes",
                        params: { baseUrl: $selectedSeed, projectPageIndex: 0 },
                      });
                    }}>
                    <Icon name="cross" />
                  </IconButton>
                {/if}
              </div>
            </DropdownListItem>
            <DropdownListItem
              on:click={() => {
                selectPreferredSeed(config.fallbackPreferredSeed);
                closeFocused();
                void push({
                  resource: "nodes",
                  params: { baseUrl: $selectedSeed, projectPageIndex: 0 },
                });
              }}
              slot="empty"
              selected>
              <div class="dropdown-item">
                <div class="icon-item" style:min-width="0">
                  <Icon name="seedling" />
                  <div class="txt-overflow">
                    {config.fallbackPreferredSeed.hostname}
                  </div>
                </div>
              </div>
            </DropdownListItem>
          </DropdownList>
        {/if}
      </div>
    </div>
  </svelte:fragment>
</Popover>
