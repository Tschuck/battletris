<template>
  <div>
    <h1 class="d-flex align-items-center justify-content-center mt-5">
      {{ error ?  error : 'loading' | translate }}
    </h1>
  </div>
</template>

<script>
  import Component from './loading';
  export default Component;
</script>
