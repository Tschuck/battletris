<template>
  <ViewWrapper :title="$t('start-page.tutorial')">
    <div class="px-8" style="max-width: 1200px;">
      <div class="justify-start py-8 items-left md:flex">
        <div class="flex justify-center p-3 mr-3 bg-2">
          <img class="tutorial-img" src="./img/1-start-screen.png">
        </div>
        <div>
          <h2 class="font-bold">
            {{ $t("tutorial.1-battletris.title") }}
          </h2>
          <p class="flex-grow p-4 mt-4 bg-2">
            {{ $t("tutorial.1-battletris.desc") }}
          </p>
        </div>
      </div>
      <div class="justify-start py-8 items-left md:flex">
        <div class="flex justify-center p-3 mr-3 bg-2">
          <img class="tutorial-img" src="./img/2-quick-navigation.png">
        </div>
        <div>
          <h2 class="font-bold">
            {{ $t("tutorial.2-quick-nav.title") }}
          </h2>
          <p class="flex-grow p-4 mt-4 bg-2">
            {{ $t("tutorial.2-quick-nav.desc") }}
          </p>
        </div>
      </div>
      <div class="justify-start py-8 items-left md:flex">
        <div class="flex justify-center p-3 mr-3 bg-2">
          <img class="tutorial-img" src="./img/3-rooms.png">
        </div>
        <div>
          <h2 class="font-bold">
            {{ $t("tutorial.3-rooms.title") }}
          </h2>
          <p class="flex-grow p-4 mt-4 bg-2">
            {{ $t("tutorial.3-rooms.desc") }}
          </p>
        </div>
      </div>
      <div class="justify-start py-8 items-left md:flex">
        <div class="flex justify-center p-3 mr-3 bg-2">
          <img class="tutorial-img" src="./img/4-joining.png">
        </div>
        <div>
          <h2 class="font-bold">
            {{ $t("tutorial.4-joining.title") }}
          </h2>
          <p class="flex-grow p-4 mt-4 bg-2">
            {{ $t("tutorial.4-joining.desc") }}
          </p>
        </div>
      </div>
      <div class="justify-start py-8 items-left md:flex">
        <div class="flex justify-center p-3 mr-3 bg-2">
          <img class="tutorial-img" src="./img/5-game.png">
        </div>
        <div>
          <h2 class="font-bold">
            {{ $t("tutorial.5-game.title") }}
          </h2>
          <!-- <div class="flex-grow p-4 mt-4 bg-2" v-html="$t('tutorial.5-game.desc')" /> -->
          <div class="flex-grow p-4 mt-4 bg-2">
            <div>
              <p>BATTLETRIS is full packed with classic and new features.</p>
              <p class="mt-4 font-bold">Controls</p>

              <div class="flex items-center">
                <span>Please checkup the laboratory to see the controls and adjust your game feeling.</span>

                <router-link
                  :to="`/laboratory?back=${$route.path}`"
                  class="inline-block mx-4 button-outline"
                >
                  <FlaskIcon width="30px" />
                  go to Laboratory
                </router-link>
              </div>

              <p class="mt-4 font-bold">Leveling and basic mechanics</p>
              <p>
                When looking at the bar aboth your game field, you will see a view small icons. Here you can see your target within the game, your cleared rows, used blocks, your level and the speed until the block will move down. When you resolve multiple rows at once, all buffs, debuffs, mana and experience gain will be increased. And something really important: Sometimes is playing slow very good, you can view your enemies and react on them. But keep in mind, the speed of falling blocks will increase on global resolved rows! So, when you play safe and slow, others will play faster, will reach higher levels, can activate abilities on you AND the speed will be faster too.
              </p>
              <p class="mt-4 font-bold">Mana, Armor, Experience</p>
              <p>
                The colorized bars next to the icons represents armor, mana and experience. When you resolve rows, mana and experience will increase. When resolve multiple rows at once, you will get even more mana and experience. Each time you get a level up, your mana and armor will increase based on your level. Higher armor / mana means also a higher rate of regeneration.
              </p>
              <p class="mt-4 font-bold">Targeting</p>
              <p>
                You can target others and others can also target you. When you target someone else and resolve rows, they will receive a debuff and their armor will decrese. When the armor reaches zero, you will push a row to the bottom of the other field. if you target yourself and resolve rows, you will get a buff, that will regenerate your armor.
              </p>
              <p class="mt-4 font-bold">Abilities</p>
              <p>
                Each class has 4 abilities. With enough mana you activte them on your self or your target. Have a look at the settings page to read detailed about your abilities.
              </p>
              <p class="mt-4 font-bold">Nerding</p>
              <ul>
                <li>
                  <p class="font-bold">Speed increase</p>
                  <i>
                    const speedPercentage = 100 / (config.maxSpeedRowsPerUser * this.users.length);<br>
                    this.speed = Math.ceil(config.userSpeed - (7 * speedPercentage * clearRows));
                  </i>
                </li>
                <li class="mt-3">
                  <p class="font-bold">Mana increase</p>
                  <i>
                    Math.ceil(
                      (this.maxMana / 100) * ((10 * clearedRows) + clearedRows * clearedRows),
                    );
                  </i>
                </li>
                <li class="mt-3">
                  <p class="font-bold">Armor increase / decrease</p>
                  <i>
                    cleared rows = 1 => 8 * 1 armor each 500 ms<br>
                    cleared rows = 2 => 6 * 3 armor each 500 ms<br>
                    cleared rows = 3 => 4 * 10 armor each 500 ms<br>
                    cleared rows = 4 => 3 * 20 armor each 500 ms<br>
                  </i>
                </li>
                <li class="mt-3">
                  <p class="font-bold">Level Mana, Armor, Experience increase</p>
                  <i>
                    Math.ceil(baseValue + (baseValue * scaling * level));
                  </i>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="justify-start py-8 items-left md:flex">
        <div class="flex justify-center p-3 mr-3 bg-2">
          <img class="tutorial-img" src="./img/6-export-import.png">
        </div>
        <div>
          <h2 class="font-bold">
            {{ $t("tutorial.6-export-import.title") }}
          </h2>
          <p class="flex-grow p-4 mt-4 bg-2">
            {{ $t("tutorial.6-export-import.desc") }}
          </p>
        </div>
      </div>
    </div>
  </ViewWrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ViewWrapper from '../../components/ViewWrapper.vue';
import FlaskIcon from '../../icons/flask.vue';

@Component({
  components: {
    FlaskIcon,
    ViewWrapper,
  },
  setup() {
    return { };
  },
})
export default class Home extends Vue {}
</script>

<style lang="postcss">
  .tutorial-img {
    max-width: 300px;
    max-height: 300px;
  }
</style>
