<template>
  <div class="px-4 py-1 bg-1 tooltip-box">
    <AbilityLogo
      :className="className"
      :abilityIndex="abilityIndex"
      width="20px"
      height="20px"
    />
    <countdown :interval="1000" :time="duration">
      <template slot-scope="props">
        <span class="text-xs text-center">{{ props.seconds }}s</span>
      </template>
    </countdown>
    <AbilityTooltip :className="className" :abilityIndex="abilityIndex" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { classes, ClassesIndex } from '@battletris/shared/functions/classes';
import { computed, ref } from '@vue/composition-api';
import Tooltip from './Tooltip.vue';
import AbilityLogo from '../icons/AbilityLogo.vue';
import AbilityTooltip from './AbilityTooltip.vue';

@Component({
  components: {
    AbilityLogo,
    Tooltip,
    AbilityTooltip,
  },
  props: {
    classIndex: { type: Number },
    abilityIndex: { type: Number },
    ticked: { type: Number },
  },
  setup(props) {
    const className = ref(
      ClassesIndex[props.classIndex as number].toLowerCase(),
    );
    const ability = classes[className.value].abilities[props.abilityIndex as number];
    const ticked = props.ticked as number;
    const ticks = ability?.ticks || 0;
    const tickTimeout = ability?.tickTimeout || 0;
    const duration = computed(() => ((ticks - ticked) * tickTimeout));

    return {
      className,
      duration,
      ticks,
    };
  },
})
export default class AbilityControl extends Vue {}
</script>
