<template>
  <div class="w-100 h-100 d-flex">
    <battletris-panel :room="room">
      <template v-slot:panel-start>
        <div class="d-flex pb-2">
          <div class="nes-container w-100 with-title">
            <p class="title">
              {{ $t('battlefield', { index: parseInt(room.replace('field', '')) + 1 }) }}
            </p>
            <div class="container-fluid p-0 mt-3" v-if="battle">
              <div class="row">
                <div class="col-6">
                  <p>
                    {{ `battle.status` | translate }}:
                    {{ battle.status }}

                    <template v-if="battle.status === 'starting'">
                      ({{ battle.startCounter }}s)
                    </template>
                  </p>
                  <template v-if="battle.status === 'started'">
                    <p>{{ 'battle.duration' | translate }}: {{ battle.duration }}s</p>
                  </template>
                  <p>
                    {{ `battle.speed` | translate }}:
                    {{ battle.config.gameLoopTimeout }}
                  </p>
                </div>

                <div class="col-6 text-right">
                  <template v-if="battle.status !== 'started'">
                    <template v-if="!battle.users[connectionId]">
                      <button type="button" class="nes-btn is-primary"
                        @click="battle.status === 'starting' ?
                          setBattleStatus('accept') :
                          setBattleStatus('join')
                        ">
                        {{ 'battle.join' | translate }}
                      </button>
                    </template>

                    <template v-else>
                      <button type="button" class="nes-btn is-warning"
                        @click="setBattleStatus('leave')">
                        {{ 'battle.leave' | translate }}
                      </button>
                      <button type="button" class="nes-btn is-success"
                        @click="setBattleStatus('accept')"
                        v-if="battle.users[connectionId].status !== 'accepted'">
                        {{ 'battle.start' | translate }}
                      </button>
                    </template>
                  </template>

                  <!-- <template v-else>
                    <button type="button" class="nes-btn is-error"
                      @click="setBattleStatus('stop')">
                      {{ 'battle.stop' | translate }}
                    </button>
                  </template> -->
                </div>
              </div>
            </div>

            <div class="w-100 text-right mt-3 pt-3 border-top">
              <button type="button" class="nes-btn"
                @click="$router.push({ path: '/tavern' })">
                {{ 'go-to-tavern' | translate }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </battletris-panel>

    <div class="w-100 mt-md-0 h-100 d-flex overflow-auto">
      <loading v-if="loading || error" :error="error"></loading>
      <template v-else-if="!reloading">
        <div class="nes-container with-title w-100 h-100"
          v-if="battle.users[connectionId]">
          <p class="title">
            {{ roomDetails.users[connectionId].name }}
          </p>
            
          <div class="h-100 d-flex flex-column">
            <battletris-user-status
              :battle="battle"
              :user="battle.users[connectionId]">
            </battletris-user-status>
            <battletris-map
              class="w-100 mt-3"
              style="height: calc(100% - 200px); min-width: 500px"
              @init="battleMaps[connectionId] = $event">
            </battletris-map>
          </div>
        </div>
        <div class="h-100 d-flex flex-wrap"
          :style="{
            'min-width': `${ getUserContainerSize() }px`,
            'max-width': `${ getUserContainerSize() }px`,
          }">
          <div class="nes-container"
            style="min-width: 300px; height: 50%;"
            v-for="(userId, index) in Object.keys(battle.users)"
            v-if="userId !== connectionId && roomDetails.users[userId]">
            <p class="title" v-if="userId && roomDetails.users">
              {{ roomDetails.users[userId].name }}
            </p>
            <p class="title" v-else>
              {{ $t('user', { index: index + 1 }) }}
            </p>
            <div class="h-100 d-flex flex-column">
              <battletris-user-status
                :battle="battle"
                :user="battle.users[userId]">
              </battletris-user-status>
              <battletris-map
                class="w-100 h-100 mt-3"
                @init="battleMaps[userId] = $event">
              </battletris-map>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
  import Component from './battlefield';
  export default Component;
</script>
