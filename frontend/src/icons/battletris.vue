<template>
  <BaseIcon v-bind="$props">
    <defs>
      <radialGradient id="gradient-0">
        <stop offset="0" stop-color="#000" stop-opacity="1"></stop>
        <stop offset="1" stop-color="#000" stop-opacity="1"></stop>
      </radialGradient>
      <bx-grid x="0" y="0" width="31.81" height="31.81"></bx-grid>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        x1="250.197"
        y1="34.834"
        x2="250.197"
        y2="134.834"
        id="gradient-1"
      >
        <stop offset="0" style="stop-color: #bada55"></stop>
        <stop offset="1" style="stop-color: #758d29"></stop>
      </linearGradient>
    </defs>
    <g
      class=""
      style="touch-action: none"
      transform="matrix(1, 0, 0, 1, 17.770729, 2.646774)"
    ></g>
    <rect
      x="200.197"
      width="100"
      height="100"
      style="
        fill: rgb(255, 255, 255);
        stroke-width: 0px;
        stroke: rgb(186, 218, 85);
        paint-order: fill;
      "
      y="34.834"
      transform="matrix(0.788011, 0.615661, -0.615661, 0.788011, 203.951981, -97.670929)"
    ></rect>
    <rect
      x="200.197"
      width="100"
      height="100"
      style="fill: rgb(255, 255, 255)"
      y="142.308"
      transform="matrix(0.788011, 0.615661, -0.615661, 0.788011, 203.951981, -97.670929)"
    ></rect>
    <rect
      x="200.197"
      width="100"
      height="100"
      style="fill: rgb(255, 255, 255)"
      y="254.043"
      transform="matrix(0.788011, 0.615661, -0.615661, 0.788011, 203.951981, -97.670929)"
    ></rect>
    <rect
      x="200.197"
      width="100"
      height="100"
      style="fill: rgb(255, 255, 255)"
      y="365.166"
      transform="matrix(0.788011, 0.615661, -0.615661, 0.788011, 203.951981, -97.670929)"
    ></rect>
    <rect
      width="100"
      height="100"
      style="fill: rgb(255, 255, 255)"
      y="254.043"
      x="91.268"
      transform="matrix(0.788011, 0.615661, -0.615661, 0.788011, 203.951981, -97.670929)"
    ></rect>
    <rect
      x="308.732"
      width="100"
      height="100"
      style="fill: rgb(255, 255, 255)"
      y="254.043"
      transform="matrix(0.788011, 0.615661, -0.615661, 0.788011, 203.951981, -97.670929)"
    ></rect>
  </BaseIcon>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseIcon, { iconProps } from './BaseIcon.vue';

@Component({
  components: { BaseIcon },
  props: { ...iconProps },
})
export default class Icon extends Vue {}
</script>
