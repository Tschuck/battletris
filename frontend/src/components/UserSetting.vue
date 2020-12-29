<template>
  <div class="text-gray-300">
    <p class="mb-3 font-bold" v-if="!minimal">{{ $t("settings.name") }}</p>
    <input
      v-model="name"
      id="battletrisname"
      placeholder="username"
      class="w-full px-3 py-2 leading-tight border rounded outline-none bg-2"
      @change="updateUser"
      :disabled="disabled"
    />

    <div class="mt-8">
      <p class="mb-3 font-bold" v-if="!minimal">{{ $t("settings.class") }}</p>

      <div class="flex flex-row items-center justify-center">
        <font-awesome-icon
          class="text-4xl cursor-pointer"
          icon="chevron-left"
          @click="selectClass(-1)"
          v-if="!disabled"
        />
        <component
          :is="classIterator[activeClassIndex].icon"
          height="80px"
          width="80px"
        />
        <font-awesome-icon
          class="text-4xl cursor-pointer"
          icon="chevron-right"
          @click="selectClass(1)"
          v-if="!disabled"
        />
      </div>

      <h3 class="my-3 font-bold text-center">
        {{ $t(`classes.${className}.title`) }}
      </h3>
      <div class="flex items-center justify-center w-full">
        <h3 class="text-xs"
          >{{ $t("classes.mana") }}: {{ classIterator[activeClassIndex].maxMana }}</h3
        >
        <h3 class="mx-2">|</h3>
        <h3 class="text-xs"
          >{{ $t("classes.armor") }}: {{ classIterator[activeClassIndex].maxArmor }} </h3>
      </div>
      <p class="p-3 mt-3 italic bg-2" v-if="!minimal">
        {{ $t(`classes.${className}.desc`) }}
      </p>

      <div :class="{ 'flex flex-row justify-center': minimal }">
        <div
          v-for="(ability, index) in classIterator[activeClassIndex].abilities"
          :key="`value-${className}-${index}`"
          class="flex items-center mt-4"
        >
          <div class="tooltip-box">
            <AbilityLogo
              :abilityIndex="index"
              :className="className"
              width="32px"
              height="32px"
            />
            <AbilityTooltip
              :className="className"
              :abilityIndex="index"
              v-if="minimal"
            />
          </div>
          <div class="ml-3" v-if="!minimal">
            <h2 class="text-xs font-bold">
              {{ $t(`classes.${className}.ability${index}.title`) }}
            </h2>
            <div>
              <span class="text-xs"
                >{{ $t("classes.mana") }}: {{ ability.mana }}</span
              >
              <span class="ml-5" v-if="ability.duration">|</span>
              <span class="ml-5 text-xs" v-if="ability.duration"
                >{{ $t("classes.duration") }}: {{ ability.duration }}ms</span
              >
            </div>
            <p
              class="text-xs text-justify text-gray-400"
              v-html="$t(`classes.${className}.ability${index}.desc`)"
            ></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
import { classes } from '@battletris/shared/functions/classes';
import ViewWrapper from './ViewWrapper.vue';

import AbilityLogo from '../icons/AbilityLogo.vue';
import Loading from './Loading.vue';
import Tooltip from './Tooltip.vue';
import AbilityTooltip from './AbilityTooltip.vue';
import SorcererIcon from '../icons/sorcerer.vue';
import UnknownIcon from '../icons/unknown.vue';
import WarriorIcon from '../icons/warrior.vue';
import currUser from '../lib/User';

@Component({
  components: {
    AbilityLogo,
    AbilityTooltip,
    Loading,
    SorcererIcon,
    Tooltip,
    UnknownIcon,
    ViewWrapper,
    WarriorIcon,
  },
  props: {
    minimal: {
      type: Boolean,
      default: false,
    },
    user: {},
  },
  setup(props) {
    const user: any = props.user;
    const name = ref<string>(user.name);
    const className = ref(user.className);
    const userId = ref(user.id);
    const disabled = ref(user.id !== currUser.id);

    const getDisplayClass = (getForClass: string, icon: any) => ({
      name: getForClass,
      icon,
      maxArmor: classes[getForClass].maxArmor,
      maxMana: classes[getForClass].maxMana,
      abilities: classes[getForClass].abilities.map((ability) => {
        const ticks = ability?.ticks || 0;
        const tickTimeout = ability?.tickTimeout || 0;
        return {
          duration: ticks > 0 ? ticks * tickTimeout : 0,
          mana: ability.mana,
        };
      }),
    });
    const classIterator = [
      getDisplayClass('unknown', UnknownIcon),
      getDisplayClass('warrior', WarriorIcon),
      getDisplayClass('sorcerer', SorcererIcon),
    ];
    const abilityIterator = ref([1, 2, 3, 4]);
    const activeClassIndex = ref(
      classIterator.findIndex(({ name: n }) => className.value === n),
    );
    const loading = ref(true);

    let debounce: ReturnType<typeof setTimeout>;
    const updateUser = () => {
      if (debounce) {
        window.clearTimeout(debounce);
      }

      if (name.value.length > 50) {
        name.value = name.value.slice(0, 50);
      }

      debounce = setTimeout(
        () => currUser.update(name.value, className.value),
        500,
      );
    };

    const selectClass = (increase: number) => {
      activeClassIndex.value += increase;

      if (activeClassIndex.value < 0) {
        activeClassIndex.value = classIterator.length - 1;
      } else if (activeClassIndex.value >= classIterator.length) {
        activeClassIndex.value = 0;
      }

      className.value = classIterator[activeClassIndex.value].name;
      updateUser();
    };

    return {
      abilityIterator,
      activeClassIndex,
      classIterator,
      className,
      disabled,
      loading,
      name,
      selectClass,
      updateUser,
      userId,
    };
  },
})
export default class Settings extends Vue {}
</script>
