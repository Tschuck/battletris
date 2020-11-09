<template>
  <div class="flex">
    <input
      v-model="name"
      id="battletrisname"
      placeholder="username"
      class="w-full px-3 py-2 leading-tight text-gray-300 bg-gray-900 border border-gray-600 rounded outline-none focus:border-gray-300"
      @change="updateUser"
    />
    <div class="ml-3">
      <div
        class="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-gray-300"
        :class="{ 'bg-gray-600': !isSelectClass, 'bg-gray-300': isSelectClass }"
        @click=" isSelectClass = !isSelectClass"
      >
        <ClassLogo :className="className" height="24" width="24" />
      </div>
    </div>

    <ClassSelect
      v-model="className"
      :isVisible="isSelectClass"
      ref="classSelect"
      @input="updateUser"
      @toggle="isSelectClass = !isSelectClass"
    />
  </div>
</template>

<script lang="ts">
import { ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import user from '../lib/User';
import ClassLogo from './ClassLogo.vue';
import ClassSelect from './ClassSelect.vue';

@Component({
  components: {
    ClassLogo,
    ClassSelect,
  },
  props: {
    isOpen: { type: String },
    loading: { type: Boolean },
  },
  setup() {
    const name = ref(user.name);
    const className = ref(user.className);
    const isSelectClass = ref(false);
    const classSelect = ref(null);

    let debounce: ReturnType<typeof setTimeout>;
    const updateUser = () => {
      if (debounce) {
        window.clearTimeout(debounce);
      }
      debounce = setTimeout(() => user.update(name.value, className.value), 500);
    };

    return {
      className,
      classSelect,
      isSelectClass,
      name,
      updateUser,
    };
  },
})
export default class RootNav extends Vue {}
</script>
