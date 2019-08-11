<template>
  <div class="h-100 d-flex flex-column">
    <battletris-loading v-if="loading || error" :error="error"></battletris-loading>
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
                <div class="d-flex">
                  <b>{{ `battle.status` | translate }}:</b>
                  <span class="mx-auto"></span>
                  <div>
                    {{ battle.status }}

                    <template v-if="battle.status === 'starting'">
                      ({{ battle.startCounter }}s)
                    </template>
                  </div>
                </div>
                <div class="d-flex" v-if="battle.status === 'started'">
                  <b>{{ 'battle.duration' | translate }}:</b>
                  <span class="mx-auto"></span>
                  <span>{{ parseInt(battle.duration / 1000) }}s</span>
                </div>

                <template v-if="battle.users[connectionId]">
                  <div class="border-top mt-3 pt-3">
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
                </template>
                <div class="border-top mt-3 pt-3">
                  <battletris-controls></battletris-controls>
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
                    v-if="battle.users[connectionId]"
                    @click="setBattleStatus('leave')">
                    {{ 'battle.leave' | translate }}
                  </button>
                </template>
              </div>
            </template>
          </div>

          <battletris-chat :room="room" v-if="leftPanelIndex === 1"></battletris-chat>
        </div>

        <div class="p-3">
          <div class="card h-100"
            style="min-width: auto;"
            v-if="battle.users[connectionId]">
            <battletris-map
              class="w-100 mt-3"
              style="height: calc(100% - 200px); min-width: 400px"
              @init="battleMaps[connectionId] = $event">
            </battletris-map>
            <battletris-mana-bar
              class="mx-1 mt-2"
              :mana="battle.users[connectionId].mana">
            </battletris-mana-bar>

            <div class="mt-5 text-center">
              <battletris-abilities
                :className="battle.users[connectionId].className"
                :battleUser="battle.users[connectionId]">
              </battletris-abilities>
            </div>
          </div>
        </div>

        <div class="row w-100 m-0 pr-5">
          <template v-for="(userIndex, index) in userArray">
            <battletris-opponent
              :battle="battle"
              :roomDetails="roomDetails"
              :userId="Object.keys(battle.users)[index]"
              @init="battleMaps[Object.keys(battle.users)[index]] = $event.map">
            </battletris-opponent>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import Component from './battlefield';
  export default Component;
</script>
