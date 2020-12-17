import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faGithub,
} from '@fortawesome/free-brands-svg-icons';
import {
  faArrowDown, faArrowLeft, faArrowRight, faArrowUp,
  faChevronCircleRight, faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faCoffee,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Vue from 'vue';

library.add(faArrowDown);
library.add(faArrowLeft);
library.add(faArrowRight);
library.add(faArrowUp);
library.add(faChevronCircleRight);
library.add(faChevronDown);
library.add(faChevronLeft);
library.add(faChevronRight);
library.add(faChevronUp);
library.add(faCoffee);
library.add(faGithub);

Vue.component('font-awesome-icon', FontAwesomeIcon);
