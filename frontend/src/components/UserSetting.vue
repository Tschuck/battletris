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
          :is="classes[activeClassIndex].icon"
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
      <p class="p-3 italic bg-2" v-if="!minimal">
        {{ $t(`classes.${className}.desc`) }}
      </p>

      <div :class="{ 'flex flex-row justify-center': minimal }">
        <div
          v-for="(_, index) in abilityIterator"
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
            <Tooltip
              :value="$t(`classes.${className}.ability${index}.desc`)"
              v-if="minimal"
            />
          </div>
          <div class="ml-3" v-if="!minimal">
            <h2 class="text-xs font-bold">
              {{ $t(`classes.${className}.ability${index}.title`) }}
            </h2>
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
import ViewWrapper from './ViewWrapper.vue';

import AbilityLogo from '../icons/AbilityLogo.vue';
import Loading from './Loading.vue';
import Tooltip from './Tooltip.vue';
import SorcererIcon from '../icons/sorcerer.vue';
import UnknownIcon from '../icons/unknown.vue';
import WarriorIcon from '../icons/warrior.vue';
import currUser from '../lib/User';

@Component({
  components: {
    AbilityLogo,
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
    const classes = [
      { name: 'unknown', icon: UnknownIcon },
      { name: 'warrior', icon: WarriorIcon },
      { name: 'sorcerer', icon: SorcererIcon },
    ];
    const abilityIterator = ref([1, 2, 3, 4]);
    const activeClassIndex = ref(
      classes.findIndex(({ name: n }) => className.value === n),
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
        activeClassIndex.value = classes.length - 1;
      } else if (activeClassIndex.value >= classes.length) {
        activeClassIndex.value = 0;
      }

      className.value = classes[activeClassIndex.value].name;
      updateUser();
    };

    return {
      abilityIterator,
      activeClassIndex,
      classes,
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
