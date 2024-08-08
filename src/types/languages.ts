export type LanguageLevel =
  | 'native'
  | 'fluent'
  | 'advanced'
  | 'intermediate'
  | 'beginner';

export interface Language {
  language: string;
  level: LanguageLevel;
}

export type Languages = Language[];
