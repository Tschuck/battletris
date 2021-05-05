import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faGithub,
} from '@fortawesome/free-brands-svg-icons';
import {
  faAngleDoubleDown, faArrowDown, faArrowLeft, faArrowRight, faArrowUp,
  faChartLine, faChevronCircleRight, faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faCoffee,
  faCrosshairs, faPlus, faRedo, faThLarge, faTrophy, faUndo, faUserCircle, faTimesCircle, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Vue from 'vue';

library.add(faAngleDoubleDown);
library.add(faArrowDown);
library.add(faArrowLeft);
library.add(faArrowRight);
library.add(faArrowUp);
library.add(faChartLine);
library.add(faChevronCircleRight);
library.add(faChevronDown);
library.add(faChevronLeft);
library.add(faChevronRight);
library.add(faChevronUp);
library.add(faCoffee);
library.add(faCrosshairs);
library.add(faGithub);
library.add(faPlus);
library.add(faRedo);
library.add(faThLarge);
library.add(faTimesCircle);
library.add(faTrash);
library.add(faTrophy);
library.add(faUndo);
library.add(faUserCircle);

Vue.component('font-awesome-icon', FontAwesomeIcon);
