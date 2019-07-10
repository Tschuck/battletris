<template>
  <div :class="{
      'nes-container with-title': container
    }" v-if="!loading">
    <template v-if="container">
      <p class="title">
        {{ 'members' | translate }}
      </p>

      <div class="h-100 overflow overflow-auto">
        <div
          class="mb-3 force-oneline"
          v-for="(connectionId, index) in Object.keys(userList)">
          {{ userList[connectionId].name }}
          ({{ `classes.${ userList[connectionId].className }`  | translate }})
        </div>
      </div>
    </template>
    <template v-else>
      <div
        class="mb-3 force-oneline"
        v-for="(connectionId, index) in Object.keys(userList)">
        {{ userList[connectionId].name }}
        ({{ `classes.${ userList[connectionId].className }`  | translate }})
      </div>
    </template>
  </div>
</template>

<script>
  import Component from './users';
  export default Component;
</script>
