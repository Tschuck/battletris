<template>
  <div>
    tavern {{ $store.state.userConfig.name }}

    <p v-for="(connectionId, index) in Object.keys(users)">
      {{ users[connectionId].name }}
    </p>
  </div>
</template>

<script>
  import Component from './tavern';
  export default Component;
</script>
