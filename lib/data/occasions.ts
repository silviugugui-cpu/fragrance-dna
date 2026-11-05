import source from "./occasions.json";

export const occasions = source.occasions;
export const occasionsPage = source.page;
export type Occasion = (typeof occasions)[number];
export interface OccasionFilters {
  occasion: string;
  season: string;
  setting: string;
  time: string;
  territory: string;
}

export function filterOccasions(filters: OccasionFilters): Occasion[] {
  return occasions.filter((item) =>
    (!filters.occasion || item.id === filters.occasion)
    && (!filters.season || item.seasons.includes(filters.season))
    && (!filters.setting || item.settings.includes(filters.setting) || item.settings.includes("mixed"))
    && (!filters.time || item.timeOfDay.includes(filters.time) || item.timeOfDay.includes("anytime"))
    && (!filters.territory || item.territoryIds.includes(filters.territory)));
}
