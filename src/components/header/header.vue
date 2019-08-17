<template>
  <nav class="navbar navbar-expand-lg d-flex">
    <template v-if="!loading">
      <div class="d-flex align-items-center">
        <a class="navbar-brand d-flex align-items-center mr-0"
          v-b-tooltip.hover
          :title="$t('go-to-tavern')"
          href="#/tavern">
          <img src="/img/battletris.svg" style="height: 50px;">

          <h5 class="mb-0 ml-3">
            {{ 'battletris' | translate }}
          </h5>
        </a>

        <i class="mdi mdi-chevron-right h4 mb-0 mx-3"></i>
        <h5 class="mb-0">
          <template v-if="room.indexOf('field') === -1">
            {{ `rooms.${ room }` | translate }}
          </template>
          <template v-else>
            {{ $t('battlefield', { index: parseInt(room.replace('field', '')) + 1 }) }}
          </template>
        </h5>
      </div>
      <span class="mx-auto"></span>
      <div>
        <b-dropdown size="lg" variant="link" dropleft
          toggle-class="text-decoration-none"
          no-caret
          v-b-tooltip.hover
          :title="$t('members')"
          v-if="users">
          <template slot="button-content">
            <i class="mdi mdi-account-group h4"></i>
            ({{ Object.keys(users).length }})
          </template>
          <b-dropdown-item v-for="(connectionId, index) in Object.keys(users)">
            {{ users[connectionId].name }}
            ({{ `classes.${ users[connectionId].className }.title`  | translate }})
          </b-dropdown-item>
        </b-dropdown>
        <button class="btn"
          v-b-tooltip.hover
          :title="$t('config')"
          @click="$refs.configModal.show();">
          <i class="mdi mdi-cogs h4"></i>
        </button>
        <a class="btn"
          v-if="room !== 'analytics'"
          v-b-tooltip.hover
          :title="$t('rooms.analytics')"
          href="#/analytics">
          <i class="mdi mdi-poll h4"></i>
        </a>
        <button class="btn"
          v-b-tooltip.hover
          :title="$t('whats-battletris')"
          @click="$refs.infoModal.show();">
          <i class="mdi mdi-information-outline h4"></i>
        </button>
        <a class="btn" target="_blank"
          v-b-tooltip.hover
          :title="$t('go-to-github')"
          href="https://github.com/tschuck/battletris">
          <i class="mdi mdi-github-circle h4"></i>
        </a>
      </div>

      <div>
        <b-modal
          id="info-modal"
          ref="infoModal"
          size="lg"
          :title="$t('whats-battletris')"
          ok-only>
          <span class="d-block text-justify"
            v-html="$t('whats-battletris-long')">
          </span>
          <b class="d-block mt-3">{{ 'battle.controls.title' | translate }}</b>
          <battletris-controls></battletris-controls>
        </b-modal>
        <b-modal
          id="config-modal"
          ref="configModal"
          size="lg"
          ok-only>
          <template slot="modal-title">
            {{ $t('config') | translate }}
            <button class="btn"
              v-b-toggle.more-infos>
              <i class="mdi mdi-information-outline"
                v-b-tooltip.hover
                :title="$t('whats-battletris')">
              </i>
            </button>
          </template>
          <div class="mb-3">
            <b-collapse
              id="more-infos"
              ref="moreInfos"
              class="mt-2">
              <div class="p-3 border">
                <span class="d-block text-justify"
                  v-html="$t('whats-battletris-long')">
                </span>
              </div>
              <div class="mt-3 p-3 border">
                <b>Tldr</b>
                <battletris-controls></battletris-controls>
              </div>
            </b-collapse>
          </div>
          <div class="d-flex align-items-center">
            <b for="name" class="col-3 p-0 m-0">{{ 'your-name' | translate }}</b>
            <input type="text" id="name" class="form-control"
              v-model="$store.state.userConfig.name"
              @keyup="useConfiguration(500)">
          </div>

          <div class="d-flex align-items-center mt-3">
            <b for="theme" class="col-3 p-0 m-0">{{ 'theme' | translate }}</b>
            <select id="theme" class="form-control"
              v-model="theme"
              @change="setTheme(theme)">
              <option value="light">{{ 'themes.light' | translate }}</option>
              <option value="dark">{{ 'themes.dark' | translate }}</option>
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

          <div class="mt-3 pt-3 border-top">
            <b for="class" class="col-3 p-0 m-0">{{ 'your-class' | translate }}</b>

            <div class="d-flex justify-content-between mt-3">
              <div
                class="text-center clickable"
                v-for="(className, index) in Object.keys(classes)"
                @click="useClass(className)">
                <battletris-class-img
                  :className="className"
                  :width="'100px'"
                  :height="'100px'"
                  :color="$store.state.userConfig.className !== className ?
                    'var(--battletris-class-icon-color)':
                    'var(--battletris-class-icon-color-active)'">
                </battletris-class-img>
                <span
                  :style="{
                    color: $store.state.userConfig.className !== className ?
                      'var(--battletris-class-icon-color)':
                      'var(--battletris-class-icon-color-active)'
                  }">
                  {{ `classes.${ className }.title` | translate }}
                </span>
              </div>
            </div>

            <div class="border mt-3 p-3">
              <span v-html="$t(`classes.${ $store.state.userConfig.className }.desc`)"></span>

              <battletris-abilities
                class="mt-3"
                :className="$store.state.userConfig.className"
                :descriptionMode="true">
              </battletris-abilities>
            </div>
          </div>
        </b-modal>
      </div>
    </template>
  </nav>
</template>
<script>
  import Component from './header';
  export default Component;
</script>