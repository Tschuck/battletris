import VueI18n, {
  Path, Values, Locale,
} from 'vue-i18n';
import VueRouter from 'vue-router';

/**
 * Overloads VueI18n interface to avoid needing to cast return value to string.
 * @see https://github.com/kazupon/vue-i18n/issues/410
 */
declare module 'vue-i18n/types' {
  // eslint-disable-next-line no-shadow
  export default class VueI18n {
    t(key: Path, locale: Locale, values?: Values): string;

    t(key: Path, values?: Values): string;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $t: typeof VueI18n.prototype.t;
    $i18n: typeof VueI18n;
    $router: typeof VueRouter;
  }

  interface VueConstructor {
    i18n: typeof VueI18n.prototype;
  }
}

export {};
