<template>
  <div class="h-100 d-flex flex-column">
    <loading v-if="loading || error" :error="error"></loading>
    <template v-else>
      <battletris-header
        :room="room"
        :users="roomDetails.users">
      </battletris-header>
      <div class="d-flex w-100 h-100">
        <div class="p-3 d-flex flex-column" style="min-width: 350px; width: 350px;">
          <b-nav tabs>
            <b-nav-item :active="leftPanelIndex === 0" @click="leftPanelIndex = 0">
              {{ 'battle.battle' | translate }}
            </b-nav-item>
            <b-nav-item :active="leftPanelIndex === 1" @click="leftPanelIndex = 1">
              {{ 'chat' | translate }}
            </b-nav-item>
          </b-nav>

          <div class="card" style="flex: 1" v-if="leftPanelIndex === 0">
            <div class="card-header">
              <h5>{{ $t('battlefield', { index: parseInt(room.replace('field', '')) + 1 }) }}</h5>
            </div>
            <template v-if="battle">
              <div class="card-body">
                <div class="d-flex mb-3">
                  <b>{{ `battle.status` | translate }}:</b>
                  <span class="mx-auto"></span>
                  <div>
                    {{ battle.status }}

                    <template v-if="battle.status === 'starting'">
                      ({{ battle.startCounter }}s)
                    </template>
                  </div>
                </div>
                <template v-if="battle.status === 'started'">
                  <p>{{ 'battle.duration' | translate }}: {{ battle.duration }}s</p>
                </template>

                <div class="border-top pt-3"
                  v-if="battle.users[connectionId]">
                  <battletris-user-status
                    :battle="battle"
                    :user="battle.users[connectionId]">
                  </battletris-user-status>
                    
                  <div class="d-flex">
                    <b>{{ 'battle.next-block' | translate }}:</b>
                    <span class="mx-auto"></span>
                    <div>
                      <div class="d-flex"
                        v-for="(row, rowIndex) in battle.users[connectionId].nextBlock.map"
                        v-if="battle.users[connectionId].nextBlock.map[rowIndex].filter((col) => col).length !== 0">
                        <div v-for="(col, colIndex) in battle.users[connectionId].nextBlock.map[rowIndex]"
                          style="width: 20px; height: 20px; border: 1px solid var(--battletris-block-border)"
                          :style="{
                            'background-color': col ? `var(--battletris-block-bg-${ battle.users[connectionId].nextBlock.type })` : 'transparent',
                          }">
                        </div>
                      </div>
                    </div>
                  </div> 
                </div>
              </div>
              <div class="p-3 text-right border-top">
                <template v-if="battle.status !== 'started'">
                  <template v-if="!battle.users[connectionId]">
                    <button type="button" class="btn btn-primary"
                      @click="battle.status === 'starting' ?
                        setBattleStatus('accept') :
                        setBattleStatus('join')
                      ">
                      {{ 'battle.join' | translate }}
                    </button>
                  </template>

                  <template v-else>
                    <button type="button" class="btn btn-warning"
                      @click="setBattleStatus('leave')">
                      {{ 'battle.leave' | translate }}
                    </button>
                    <button type="button" class="btn btn-success"
                      @click="setBattleStatus('accept')"
                      v-if="battle.users[connectionId].status !== 'accepted'">
                      {{ 'battle.start' | translate }}
                    </button>
                  </template>
                </template>
                <template v-else>
                  <button type="button" class="btn btn-warning"
                    @click="setBattleStatus('leave')">
                    {{ 'battle.leave' | translate }}
                  </button>
                </template>
              </div>
            </template>
          </div>

          <battletris-chat :room="room" v-if="leftPanelIndex === 1"></battletris-chat>
        </div>

        <div v-if="battle.users[connectionId]">
          <battletris-map
            class="w-100 mt-3"
            style="height: calc(100% - 200px); min-width: 400px"
            @init="battleMaps[connectionId] = $event">
          </battletris-map>
        </div>

        <div class="d-flex flex-wrap">
          <div class="card"
            :style="{
              'min-width': `${ getUserContainerSize() }px`,
              'max-width': `${ getUserContainerSize() }px`,
            }"
            v-for="(userId, index) in Object.keys(battle.users)"
            v-if="userId !== connectionId && roomDetails.users[userId]">
            <div class="card-header" v-if="userId && roomDetails.users">
              <h5>
                {{ $t('user', { index: index + 1 }) }}
              </h5>
            </div>
            <div class="card-body">
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
      </div>
    </template>
  </div>
</template>

<script>
  import Component from './battlefield';
  export default Component;
</script>
