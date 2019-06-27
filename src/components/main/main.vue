<template>
	<div>
    <loading v-if="loading || error" :error="error"></loading>
    <template v-else>
      <router-view></router-view>
    </template>
	</div>
</template>

<script>
	import main from './main';
	export default main;
</script>
