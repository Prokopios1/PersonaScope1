import 'server-only'
import type { Locale } from '@/i18n-config'

const dictionaries = {
  en: () => import('@/messages/en.json').then((module) => module.default),
  el: () => import('@/messages/el.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  const loadDictionary = dictionaries[locale] ?? dictionaries.en;
  try {
    return await loadDictionary();
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error);
    // Fallback to English dictionary if the specified locale fails to load
    return await dictionaries.en();
  }
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
