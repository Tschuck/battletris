<template>
  <div class="h-100 d-flex flex-column"
    style="min-width: 350px; width: 350px;">
    <slot name="panel-start"></slot>
    <div class="d-flex pb-2">
      <battletris-config
        class="w-100"
        :room="room">
      </battletris-config>
    </div>

    <div class="d-flex pb-2">
      <battletris-users
        class="w-100"
        style="max-height: 250px;"
        :room="room">
      </battletris-users>
    </div>

    <div class="d-flex" style="flex: 1">
      <battletris-chat
        class="w-100"
        :room="room">
      </battletris-chat>
    </div>
  </div>
</template>

<script>
  import Component from './panel';
  export default Component;
</script>
