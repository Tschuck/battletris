<template>
  <div class="nes-container with-title">
    <p class="title">
      {{ 'members' | translate }}
    </p>

    <div
      class="mt-3"
      v-for="(connectionId, index) in Object.keys(users)">
      {{ users[connectionId].name }}
      ({{ users[connectionId].className }})
    </div>
  </div>
</template>

<script>
  import Component from './users';
  export default Component;
</script>
