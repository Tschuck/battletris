<template>
  <div>
    <div class="flex justify-center mb-3">
      <div class="mr-3 control-square">
        <div class="text-lg font-bold">Q</div>
      </div>
      <div class="mr-3 control-square">
        <div class="text-lg font-bold">W</div>
      </div>
      <div class="mr-3 control-square">
        <div class="text-lg font-bold">E</div>
      </div>
      <div class="control-square">
        <div class="text-lg font-bold">R</div>
      </div>
    </div>
    <div class="flex justify-center mb-2">
      <div class="control-square">
        <font-awesome-icon
          class="text-lg cursor-pointer"
          icon="arrow-up"
        />
      </div>
    </div>
    <div class="flex justify-center">
      <div class="mr-2 control-square">
        <font-awesome-icon
          class="text-lg cursor-pointer"
          icon="arrow-left"
        />
      </div>
      <div class="mr-2 control-square">
        <font-awesome-icon
          class="text-lg cursor-pointer"
          icon="arrow-down"
        />
      </div>
      <div class="control-square">
        <font-awesome-icon
          class="text-lg cursor-pointer"
          icon="arrow-right"
        />
      </div>
    </div>
    <div class="mt-2 control w-100">
      <font-awesome-icon
        class="text-lg cursor-pointer"
        icon="angle-double-down"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
})
export default class Controls extends Vue {}
</script>

<style lang="postcss">
.control, .control-square {
  @apply border text-center flex justify-center items-center;

  background-color: var(--bg-1);
  border: 1px sloid var(--bg-2);
  height: 40px;
}

.control-square {
  width: 40px;
}
</style>
