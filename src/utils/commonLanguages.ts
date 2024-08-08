import type { Languages } from '@/types';

export const commonLanguages = (
  userLanguages: Languages | null,
  currentUserLanguages: Languages | null,
  includeLevel: boolean = false
): string => {
  if (!userLanguages || !currentUserLanguages) {
    return '';
  }

  // Find common languages, excluding English
  const commonLangs = userLanguages
    .filter(
      (userLang) =>
        currentUserLanguages.some(
          (currentLang) =>
            currentLang.language.toLowerCase() ===
            userLang.language.toLowerCase()
        ) && userLang.language.toLowerCase() !== 'english'
    )
    .map((lang) => ({
      language: lang.language,
      level: lang.level,
    }));

  // If no common languages, return empty string
  if (commonLangs.length === 0) {
    return '';
  }

  // Format the list of languages
  let result = 'Speaks ';
  if (commonLangs.length === 1) {
    result += formatLanguage(commonLangs[0], includeLevel);
  } else if (commonLangs.length === 2) {
    result += `${formatLanguage(
      commonLangs[0],
      includeLevel
    )} and ${formatLanguage(commonLangs[1], includeLevel)}`;
  } else {
    // For 3 or more languages
    const lastLang = commonLangs.pop(); // Remove the last language
    result +=
      commonLangs.map((lang) => formatLanguage(lang, includeLevel)).join(', ') +
      ', and ' +
      formatLanguage(lastLang!, includeLevel);
  }

  // Add exclamation mark to non-empty results
  return result + '!';
};

const formatLanguage = (
  lang: { language: string; level: string },
  includeLevel: boolean
): string => {
  return includeLevel ? `${lang.language} (${lang.level})` : lang.language;
};
