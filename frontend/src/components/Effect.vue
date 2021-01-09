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
        <span class="text-xs text-center">
          {{ props.seconds }}s
          <span v-if="stack > 1">(x{{ stack }})</span>
        </span>
      </template>
    </countdown>
    <AbilityTooltip :className="className" :abilityIndex="abilityIndex" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { classes, ClassesIndex } from '@battletris/shared/functions/classes';
import {
  computed, onBeforeMount, onBeforeUnmount, ref,
} from '@vue/composition-api';
import Tooltip from './Tooltip.vue';
import AbilityLogo from '../icons/AbilityLogo.vue';
import AbilityTooltip from './AbilityTooltip.vue';
import currUser from '../lib/User';

@Component({
  components: {
    AbilityLogo,
    Tooltip,
    AbilityTooltip,
  },
  props: {
    userId: { type: String },
    classIndex: { type: Number },
    abilityIndex: { type: Number },
    ticked: { type: Number },
    stack: { type: Number },
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

    onBeforeMount(() => {
      // add blur to the screen
      if (props.userId === currUser.id && className.value === 'unknown'
        && props.abilityIndex === 3) {
        document.body.classList.add('effect-blur');
      }
    });

    onBeforeUnmount(() => {
      // remove blur to the screen
      if (props.userId === currUser.id && className.value === 'unknown'
        && props.abilityIndex === 3) {
        document.body.classList.remove('effect-blur');
      }
    });

    return {
      className,
      duration,
      ticks,
    };
  },
})
export default class AbilityControl extends Vue {}
</script>

<style lang="postcss">
.effect-blur {
  filter: blur(20px);
}
</style>
