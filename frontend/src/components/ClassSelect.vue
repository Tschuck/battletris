<template>
  <div>
    <transition name="right-swipe">
      <div
        class="fixed flex class-select"
        style="width: 40%"
        v-if="isVisible"
      >
        <div class="flex-grow p-6 text-gray-300 bg-gray-900">
          <h1 class="text-lg font-bold">{{ $t(`classes.${value}.title`) }}</h1>
          <p class="text-xs text-gray-400" v-html="$t(`classes.${value}.desc`)"></p>

          <div
            v-for="(_, index) in abilityIterator"
            :key="`value-${index}`"
            class="flex items-center mt-4"
          >
            <div>
              <AbilityLogo
                :abilityIndex="index"
                :className="value"
                width="32px"
                height="32px"
                color="#fff"
              />
            </div>
            <div class="flex-grow"></div>
            <div class="ml-3">
              <h2 class="text-xs font-bold">
                {{ $t(`classes.${value}.ability${index}.title`) }}
              </h2>
              <p
                class="text-xs text-gray-400"
                v-html="$t(`classes.${value}.ability${index}.desc`)"
              ></p>
            </div>
          </div>
        </div>

        <div class="flex-shrink-0">
          <div
            class="flex items-center px-3 py-1 mb-3"
            :class="{
              'bg-gray-900 text-gray-300': className === value,
            }"
            v-for="className in classes"
            :key="className"
            @click="$emit('input', className)"
          >
            <h1 class="mr-6 text-center">{{ $t(`classes.${className}.title`) }}</h1>
            <div class="flex-grow"></div>
            <div>
              <div
                class="flex items-center justify-center w-10 h-10 border-4 border-gray-900 border-solid rounded-full cursor-pointer"
                :class="{
                  'bg-gray-900': className !== value,
                  'bg-gray-300': className === value,
                }"
              >
                <ClassLogo
                  :className="className"
                  :style="
                    className !== value ? 'filter: brightness(0) invert(1)' : ''
                  "
                  height="24"
                  width="24"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div class="backdrop" v-if="isVisible" @click="isVisible = false" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ref } from '@vue/composition-api';
import ClassLogo from './ClassLogo.vue';
import AbilityLogo from './AbilityLogo.vue';

@Component({
  components: {
    ClassLogo,
    AbilityLogo,
  },
  props: {
    value: { type: String },
    isVisible: { type: Boolean },
  },
  setup() {
    const classes = ['sorcerer', 'unknown', 'warrior'];
    const abilityIterator = [1, 2, 3, 4];
    const render = ref(false);

    return {
      abilityIterator,
      classes,
      render,
    };
  },
})
export default class ClassGallery extends Vue {}
</script>

<style lang="postcss" scoped>
.class-select {
  top: 68px;
  right: 1px;
  z-index: 10;
  transition: 0.4s ease-out right;

  @apply bg-gray-100;

  &.is-visible {
    right: 1px;
  }
}

.backdrop {
  top: 66px;
  left: 0;
  right: 0;
  bottom: 0;
  position: fixed;
  background-color: rgb(26 33 44 / 0.5);
  z-index: 9;
}

.right-swipe-enter-active, .right-swipe-leave-active {
  right: opacity .5s;
}
.right-swipe-enter, .right-swipe-leave-to {
  right: -100%;
}
</style>
