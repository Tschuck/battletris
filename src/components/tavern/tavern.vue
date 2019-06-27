<template>
  <div class="content-container d-flex">
    <div class="col-md-4">
      <battletris-users
        :roomName="'tavern'">
      </battletris-users>

      <battletris-chat
        class="mt-3"
        :roomName="'tavern'">
      </battletris-chat>
    </div>

    <div class="col-md-8">
      <loading v-if="loading || error" :error="error"></loading>
      <template v-else>
        <div class="nes-container with-title">
          <p class="title">
            {{ 'tavern' | translate }}
          </p>

          {{ 'welcome' | translate }}...

          <div class="mt-4">
            <div class="nes-field">
              <label for="name">{{ 'your-name' | translate }}</label>
              <input type="text" id="name" class="nes-input"
                v-model="$store.state.userConfig.name">
            </div>
          </div>

          <div class="mt-4">
            <div class="nes-field">
              <label for="class">{{ 'your-class' | translate }}</label>
              <div class="nes-select">
                <select id="class"
                  v-model="$store.state.userConfig.className">
                  <option
                    v-for="(className, index) in Object.keys(classes)"
                    :value="className">
                    {{ `classes.${ className }` | translate }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="text-right mt-4">
            <button type="button" class="nes-btn is-primary"
              @click="useConfiguration()">
              {{ 'use-config' | translate }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
  import Component from './tavern';
  export default Component;
</script>
