<template>
  <div class="spinner-box">
    <div class="circle-border" :style="`height: ${height}; width: ${width};`">
      <div class="circle-core"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  props: {
    width: { type: String, default: '50px' },
    height: { type: String, default: '50px' },
  },
})
export default class Loading extends Vue {}
</script>

<style lang="scss" scoped>
/* https://codepen.io/AlexWarnes/pen/jXYYKL */
/* KEYFRAMES */

@keyframes spin {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(359deg);
  }
}

/* ALTERNATING ORBITS */
.circle-border {
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: rgb(63, 249, 220);
  background: linear-gradient(
    0deg,
    rgba(63, 249, 220, 0.1) 33%,
    rgba(63, 249, 220, 1) 100%
  );
  animation: spin 0.8s linear 0s infinite;
}

.circle-core {
  width: 100%;
  height: 100%;
  background-color: var(--bg-1);
  border-radius: 50%;
}
</style>
