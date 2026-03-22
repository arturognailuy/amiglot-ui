export type MatchLanguage = {
  language_code: string;
  level: number;
  is_native: boolean;
  learner_level: number;
};

export type BridgeLanguage = {
  language_code: string;
  level: number;
};

export type OverlapSlot = {
  weekday: number;
  start_utc: string;
  end_utc: string;
  overlap_minutes: number;
};

export type MatchItem = {
  user_id: string;
  handle: string;
  country_code?: string;
  age?: number;
  mutual_teach: MatchLanguage[];
  mutual_learn: MatchLanguage[];
  bridge_languages: BridgeLanguage[];
  availability_overlap: OverlapSlot[];
  total_overlap_minutes: number;
};

export type DiscoverResponse = {
  items: MatchItem[];
  next_cursor: string | null;
};
