import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowUp, faArrowDown, faArrowLeft, faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// icons
library.add(faArrowUp);
library.add(faArrowDown);
library.add(faArrowLeft);
library.add(faArrowRight);

Vue.component('font-awesome-icon', FontAwesomeIcon);
