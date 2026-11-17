export type DayCtx = {
  date: Date;
  iso: string;
  inMonth: boolean;
  selected: boolean;
  today: boolean;
};
export type WeekdayCtx = {
  dow: number;
  label: string;
};
export type HeadingCtx = {
  view: Date;
  label: string;
  setView: (date: Date) => void;
};
