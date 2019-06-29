<template>
  <div class="container-fluid w-100 h-100">
    <div class="row h-100">
      <battletris-panel
        :room="room"
        :tavernLink="true">
      </battletris-panel>

      <div class="col col-md-6 col-xl-9 mt-md-0 h-100 py-2 overflow-auto">
        <loading v-if="loading || error" :error="error"></loading>
        <template v-else>
          <div class="nes-container with-title">
            <p class="title">
              {{ $t('battlefield', { index: parseInt(room.replace('field', '')) + 1 }) }}
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import Component from './battlefield';
  export default Component;
</script>
