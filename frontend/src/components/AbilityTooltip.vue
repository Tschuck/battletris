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
        <h4 class="flex justify-between text-xs font-bold text-light">
          {{ $t(`classes.${className}.ability${abilityIndex}.title`) }}

          <span class="text-gray-600">
            <span class="text-xs"
              >{{ $t("classes.mana") }}: {{ mana }}</span
            >
            <span class="text-xs" v-if="duration"
              >, {{ $t("classes.duration") }}: {{ duration }}s</span
            >
          </span>
        </h4>
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
import { classes } from '@battletris/shared/functions/classes';
import { ref } from '@vue/composition-api';
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
  setup(props) {
    const ability = classes[props.className as string].abilities[props.abilityIndex as number];
    const mana = ref(ability.mana);
    const ticks = ability?.ticks || 0;
    const tickTimeout = ability?.tickTimeout || 0;
    const msDuration = ticks > 0 ? (ticks - 1) * tickTimeout : 0;
    const duration = ref(Math.round((msDuration / 1000) * 10) / 10);

    return {
      duration,
      mana,
    };
  },
})
export default class AbilityControl extends Vue {}
</script>
