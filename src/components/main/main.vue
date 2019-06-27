<template>
	<div>
    <h1 class="d-flex align-items-center justify-content-center mt-5"
      v-if="loading || error">
      {{ loading ? 'loading' : error | translate }}
    </h1>
    <template v-else>
      <router-view></router-view>
    </template>
	</div>
</template>

<script>
	import main from './main';
	export default main;
</script>
