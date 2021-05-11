<template>
  <VSelect
    class="w-full"
    v-model="activeKeyMapId"
    :options="keyMaps"
    :clearable="false"
    :reduce="keyMap => keyMap.id"
    label="id"
    @option:selected="keyMapChanged"
  >
    <template #selected-option="{ id, name }">
      {{ name ? name : $t(`laboratory.key-maps.${id.toLowerCase()}`) }}
    </template>
    <template #option="{ id, name }">
      {{ name ? name : $t(`laboratory.key-maps.${id.toLowerCase()}`) }}
    </template>
  </VSelect>
</template>

<script lang="ts">
import { ref, watch } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import {
  KeyMaps,
} from '@battletris/shared';
import ViewWrapper from './ViewWrapper.vue';
import user from '../lib/User';
import GameField from '../game/GameField.vue';

@Component({
  components: {
    GameField,
    ViewWrapper,
  },
  props: {
    value: { type: String, required: false },
    keyMaps: {
      default: () => [
        ...user.keyMaps,
        ...KeyMaps.map((KeyMapClass) => new KeyMapClass()),
      ],
    },
  },
  setup(props, { emit }) {
    const activeKeyMapId = ref(props.value || 'default');

    const keyMapChanged = () => {
      emit('change', activeKeyMapId.value);
    };

    watch(() => props.value, (newValue) => {
      activeKeyMapId.value = newValue;
    });

    return {
      activeKeyMapId,
      keyMapChanged,
    };
  },
})
export default class Laboratory extends Vue {}
</script>
