s<template>
	<div class="h-100">
    <battletris-loading v-if="loading || error" :error="error"></battletris-loading>
    <template v-else>
      <router-view></router-view>
    </template>
	</div>
</template>

<script>
	import main from './main';
	export default main;
</script>
