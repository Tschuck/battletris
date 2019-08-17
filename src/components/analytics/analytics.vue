<template>
  <div class="container-fluid">
    <battletris-loading v-if="loading"></battletris-loading>
    <template v-else>
      <div class="row">
        <div class="col-md-6 mt-3">
          <div class="card p-4 text-center">
            <h5>{{ 'analytics.battle-count-today' | translate }}</h5>
            <h3>{{ todayBattles }}</h3>
          </div>
        </div>
        <div class="col-md-6 mt-3">
          <div class="card p-4 text-center">
            <h5>{{ 'analytics.battle-count-current' | translate }}</h5>
            <h3>{{ runningBattles }}</h3>
          </div>
        </div>
      </div>
      <div class="row pt-3">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <h5>{{ 'analytics.battle-count-overview' | translate }}</h5>
            </div>
            <div class="card-body text-center">
              <div class="d-flex w-100 p-3 text-left">
                <div class="w-100">
                  <div class="d-flex align-items-center w-100">
                    <b for="name" class="col-3 p-0 m-0">{{ 'analytics.start-date' | translate }}</b>
                    <input type="date" id="name" class="form-control"
                      v-model="dateRange.start"
                      @keyup="useConfiguration(500)">
                  </div>
                  <div class="d-flex align-items-center w-100 mt-1">
                    <b for="name" class="col-3 p-0 m-0">{{ 'analytics.end-date' | translate }}</b>
                    <input type="date" id="name" class="form-control"
                      v-model="dateRange.end"
                      @keyup="useConfiguration(500)">
                  </div>
                </div>
                <div class="text-right p-3">
                   <button type="button" class="btn btn-primary"
                    @click="loadAnalytics()">
                    {{ 'analytics.analyze' | translate }}
                  </button>
                </div>
              </div>
              <line-chart
                :width="$el.offsetWidth - 100" :height="300"
                :chart-data="dateToBattleData"
                :options="chartJsOptions">              
              </line-chart>
            </div>
          </div>
        </div>
      </div>

      <div class="row pt-3">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header d-flex">
              <h5>{{ 'analytics.detailed' | translate }}</h5>
            </div>
            <div class="card-body text-center">
              <div class="d-flex w-100 p-3 text-left">
                <div class="w-100">
                  <div class="d-flex align-items-center w-100">
                    <b for="name" class="col-3 p-0 m-0">{{ 'analytics.date' | translate }}</b>
                    <input type="date" id="name" class="form-control"
                      v-model="dateRange.table"
                      @keyup="useConfiguration(500)">
                  </div>
                </div>
                <div class="text-right pl-3">
                   <button type="button" class="btn btn-primary"
                    @click="loadAnalytics()">
                    {{ 'analytics.analyze' | translate }}
                  </button>
                </div>
              </div>
              <div class="border p-3 mt-3"
                v-for="(battle, index) in tableData">
                <div class="d-flex">
                  <span v-if="battle.room">{{ $t('battlefield', { index: parseInt(battle.room.replace('field', '')) + 1 }) }}</span>
                  <span>({{ (new Date(battle.date)).getHours() }}:{{ (new Date(battle.date)).getMinutes() }})</span>
                </div>

                <table class="mt-3 w-100 text-left">
                  <thead>
                    <tr>
                      <th>{{ 'analytics.table.name' | translate }}</th>
                      <th>{{ 'analytics.table.className' | translate }}</th>
                      <th>{{ 'analytics.table.blocks' | translate }}</th>
                      <th>{{ 'analytics.table.rows' | translate }}</th>
                    </tr>
                  </thead>
                  <tr v-for="(user, index) in battle.users">
                    <td>{{ user.name }}</td>
                    <td>({{ `classes.${ user.className }.title`  | translate }})</td>
                    <td>{{ user.blockIndex }}</td>
                    <td>{{ user.rows }}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import Component from './analytics';
  export default Component;
</script>
