<template>
  <div class="nes-container with-title"
    v-if="!loading">
    <p class="title">
      {{ 'config' | translate }}
    </p>

    <div class="nes-field d-flex align-items-center">
      <label for="name" class="col-3 p-0 m-0">{{ 'your-name' | translate }}</label>
      <input type="text" id="name" class="nes-input"
        v-model="$store.state.userConfig.name"
        @keyup="useConfiguration(500)">
    </div>

    <div class="nes-field d-flex align-items-center mt-3">
      <label for="class" class="col-3 p-0 m-0">{{ 'your-class' | translate }}</label>
      <div class="nes-select">
        <select id="class"
          v-model="$store.state.userConfig.className"
          @change="useConfiguration(0)">
          <option
            v-for="(className, index) in Object.keys(classes)"
            :value="className">
            {{ `classes.${ className }` | translate }}
          </option>
        </select>
      </div>
    </div>

    <div class="nes-field d-flex align-items-center mt-3">
      <label for="theme" class="col-3 p-0 m-0">{{ 'theme' | translate }}</label>
      <div class="nes-select">
        <select id="theme"
          v-model="theme"
          @change="setTheme(theme)">
          <option value="light">{{ 'themes.light' | translate }}</option>
          <option value="dark">{{ 'themes.dark' | translate }}</option>
          <option value="final-fantasy">{{ 'themes.final-fantasy' | translate }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
  import Component from './config';
  export default Component;
</script>
