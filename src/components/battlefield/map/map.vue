<template>
  <div class="battletris-map">
    <template v-if="!user">
      <div class="map-row" v-for="(row, rowIndex) in emptyField">
        <div class="map-column" v-for="(column, columnIndex) in emptyField[rowIndex]">
          <!-- -->
        </div>
      </div>
    </template>
    <template v-else>
      <div class="map-row" v-for="(row, rowIndex) in user.map">
        <div class="map-column" v-for="(column, columnIndex) in user.map[rowIndex]">
          <!-- -->
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import Component from './map';
  export default Component;
</script>
