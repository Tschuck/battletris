<template>
  <nav class="navbar navbar-expand-lg d-flex">
    <div class="d-flex align-items-center">
      <a class="navbar-brand" href="#/tavern">
        <img src="/img/battletris.svg" style="height: 50px;">
      </a>

      <h5 class="mb-0">{{ 'battletris' | translate }}</h5>
    </div>
    <span class="mx-auto"></span>
    <div>
      <button class="btn"
        v-b-modal.modal-config
        v-b-tooltip.hover
        :title="$t('config')">
        <i class="mdi mdi-cogs h4"></i>
      </button>
    </div>

    <div>
      <b-modal
        id="modal-config"
        :title="$t('config')"
        ok-only>
        <div class="d-flex align-items-center">
          <b for="name" class="col-3 p-0 m-0">{{ 'your-name' | translate }}</b>
          <input type="text" id="name" class="form-control"
            v-model="$store.state.userConfig.name"
            @keyup="useConfiguration(500)">
        </div>

        <div class="d-flex align-items-center mt-3">
          <b for="class" class="col-3 p-0 m-0">{{ 'your-class' | translate }}</b>
          <select id="class" class="form-control"
            v-model="$store.state.userConfig.className"
            @change="useConfiguration(0)">
            <option
              v-for="(className, index) in Object.keys(classes)"
              :value="className">
              {{ `classes.${ className }` | translate }}
            </option>
          </select>
        </div>

        <div class="d-flex align-items-center mt-3">
          <b for="theme" class="col-3 p-0 m-0">{{ 'theme' | translate }}</b>
          <select id="theme" class="form-control"
            v-model="theme"
            @change="setTheme(theme)">
            <option value="light">{{ 'themes.light' | translate }}</option>
            <option value="dark">{{ 'themes.dark' | translate }}</option>
            <option value="final-fantasy">{{ 'themes.final-fantasy' | translate }}</option>
          </select>
        </div>

        <div class="d-flex align-items-center mt-3">
          <b for="theme" class="col-3 p-0 m-0">{{ 'block-preview' | translate }}</b>
          <span class="mx-auto"></span>
          <div class="form-check">
            <input type="checkbox"
              v-model="$store.state.userConfig.blockPreview"
              @change="useConfiguration(0)">
          </div>
        </div>
      </b-modal>
    </div>
  </nav>
</template>
<script>
  import Component from './header';
  export default Component;
</script>