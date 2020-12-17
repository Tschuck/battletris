<template>
  <ViewWrapper>
    <div class="px-8 pb-8 mt-20" style="max-width: 600px;">
      <h2 class="font-bold">{{ $t("tutorial.interactive") }}</h2>
      <p class="p-4 mt-4 text-xs bg-2">{{ $t("tutorial.interactive-desc") }}</p>

      <h2 class="mt-8 font-bold">{{ $t("tutorial.title") }}</h2>
      <p class="p-4 mt-4 text-xs bg-2">{{ $t("tutorial.desc") }}</p>

      <h3 class="mt-8 text-sm font-bold">
        {{ $t("tutorial.tavern.title") }}
      </h3>
      <p class="p-4 mt-4 text-xs bg-2" v-html="$t('tutorial.tavern.desc')" />

      <h3 class="mt-8 text-sm font-bold">
        {{ $t("tutorial.battle-control.title") }}
      </h3>
      <p
        class="p-4 mt-4 text-xs bg-2"
        v-html="$t('tutorial.battle-control.desc')"
      />

      <h3 class="mt-8 text-sm font-bold">
        {{ $t("tutorial.how-to-play.title") }}
      </h3>
      <p class="p-4 mt-4 text-xs bg-2" v-html="$t('tutorial.how-to-play.desc')" />

      <h3 class="mt-8 text-sm font-bold">
        {{ $t("tutorial.abilities.title") }}
      </h3>
      <p class="p-4 mt-4 text-xs bg-2" v-html="$t('tutorial.abilities.desc')" />

      <h3 class="mt-8 text-sm font-bold">
        {{ $t("tutorial.targets.title") }}
      </h3>
      <p class="p-4 mt-4 text-xs bg-2" v-html="$t('tutorial.targets.desc')" />
    </div>
  </ViewWrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ViewWrapper from '../components/ViewWrapper.vue';

@Component({
  components: {
    ViewWrapper,
  },
  setup() {
    return { };
  },
})
export default class Home extends Vue {}
</script>
