<template>
  <div>
    <div class="d-flex p-2" v-if="tavernLink">
      <div class="nes-container w-100 with-title">
        <p class="title">
          {{ 'tavern' | translate }}
        </p>

        <button type="button" class="nes-btn is-primary"
          @click="$router.push({ path: '/tavern' })">
          {{ 'go-to-tavern' | translate }}
        </button>
      </div>
    </div>
    <div class="d-flex p-2">
      <battletris-config
        class="w-100"
        :room="room">
      </battletris-config>
    </div>

    <div class="d-flex p-2">
      <battletris-users
        class="w-100"
        style="max-height: 250px;"
        :room="room">
      </battletris-users>
    </div>

    <div class="d-flex p-2" style="flex: 1">
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
