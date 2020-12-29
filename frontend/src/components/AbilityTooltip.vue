<template>
  <Tooltip style="width: 400px; text-align: left;">
    <div class="flex items-center px-3 py-1 bg-1">
      <AbilityLogo
        :abilityIndex="abilityIndex"
        :className="className"
        width="100px"
        height="100px"
      />
      <div class="ml-3">
        <h2 class="text-xs font-bold">
          {{ $t(`classes.${className}.ability${abilityIndex}.title`) }}
        </h2>
        <p
          class="text-xs text-justify text-gray-400"
          v-html="$t(`classes.${className}.ability${abilityIndex}.desc`)"
        ></p>
      </div>
    </div>
  </Tooltip>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Tooltip from './Tooltip.vue';
import AbilityLogo from '../icons/AbilityLogo.vue';

export const iconProps = {
  color: { type: String, default: '#e2e8f0' },
  width: { type: String, default: '100%' },
  height: { type: String, default: 'auto' },
};

@Component({
  components: {
    AbilityLogo,
    Tooltip,
  },
  props: {
    className: { type: String },
    abilityIndex: { type: Number },
  },
})
export default class AbilityControl extends Vue {}
</script>
