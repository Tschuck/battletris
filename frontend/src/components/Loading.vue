<template>
  <div class="loading">
    <div class="elem elem-1"></div>
    <div class="elem elem-2"></div>
    <div class="elem elem-3"></div>
    <div class="elem elem-4"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  props: {
    msg: { type: String },
  },
})
export default class Home extends Vue {}
</script>

<style lang="scss">
.loading {
  width: 105px;
  height: 100px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: auto;
  text-align: center;
  animation: rotate-move 5s cubic-bezier(.5,0,.5,1) infinite;
}

.elem {
  width: 45px;
  height: 45px;
  display: inline-block;
  margin: 1px;
  border-radius: 5px;
}

.elem-1 {
  background-color: #fc6a21;
  animation: elem-1-move 5s linear infinite;
}

.elem-2 {
  background-color: #f84d30;
  animation: elem-2-move 5s linear infinite;
}

.elem-3 {
  background-color: #f02b57;
  animation: elem-3-move 5s linear infinite;
}

.elem-4 {
  background-color: #ec1879;
  animation: elem-4-move 5s linear infinite;
}

@keyframes elem-1-move {
  5%, 95% {transform: translate(0, 0)}
  11.6%, 21.6%, 78.2%, 88.2% {transform: translate(-27px, 0px)}
  28.3%, 38.3%, 61.6%, 71.6% {transform: translate(-27px, 51px)}
  44.9%, 59.9% {transform: translate(-27px, 51px)}
}

@keyframes elem-2-move {
  5%, 95% {transform: translate(0, 0)}
  11.6%, 21.6%, 78.2%, 88.2% {transform: translate(-27px, 0px)}
  28.3%, 38.3%, 61.6%, 71.6% {transform: translate(-27px, 0px)}
  44.9%, 59.9% {transform: translate(25px, 0px)}
}

@keyframes elem-3-move {
  5%, 95% {transform: translate(0, 0)}
  11.6%, 21.6%, 78.2%, 88.2% {transform: translate(25px, 0px)}
  28.3%, 38.3%, 61.6%, 71.6% {transform: translate(25px, 0px)}
  44.9%, 59.9% {transform: translate(25px, 0px)}
}

@keyframes elem-4-move {
  5%, 95% {transform: translate(0, 0)}
  11.6%, 21.6%, 78.2%, 88.2% {transform: translate(25px, 0px)}
  28.3%, 38.3%, 61.6%, 71.6% {transform: translate(25px, 0px)}
  44.9%, 59.9% {transform: translate(25px, 0px)}
}

@keyframes rotate-move {
  15.6%, 17.6%, 48.9%, 50.9%, 82.2%, 84.2% {transform: translate(-50%, -50%) rotate(360deg)}
  0%, 32.3%, 34.3%, 65.6%, 67.6%, 99% {transform: translate(-50%, -50%) rotate(0)}
}
</style>
