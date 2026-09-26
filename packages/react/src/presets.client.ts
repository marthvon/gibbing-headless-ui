"use client";

export const enum PanelPreset {
  TOP="panel-container-t panel-drag-t t",
  LEFT="panel-container-l panel-drag-l l",
  RIGHT="panel-container-r panel-drag-r r",
  BOTTOM="panel-container-b panel-drag-b b"
}

export const enum CardPreset {
  TO_RIGHT="bg-gradient-to-r bg-position bg-x-down | -translate-x-full",
  TO_LEFT="bg-gradient-to-l -bg-position-x bg-x-1/2 | translate-x-full",
  TO_TOP="bg-gradient-to-t bg-position bg-y-down | translate-y-full",
  TO_BOTTOM="bg-gradient-to-b -bg-position-y bg-y-1/2 | -translate-y-full",
  TO_RIGHT_AT_HALF="bg-gradient-to-r bg-position bg-x-1/2 | -translate-x-full",
  TO_LEFT_AT_HALF="bg-gradient-to-l -bg-position-x bg-x-3/4 | translate-x-full",
  TO_TOP_AT_HALF="bg-gradient-to-t bg-position bg-y-1/2 | translate-y-full",
  TO_BOTTOM_AT_HALF="bg-gradient-to-b -bg-position-y bg-y-3/4 | -translate-y-full",
}

export const enum DropdownPreset {
  TOP="flex-col-reverse dropdown-click-top dropdown-hover-top", 
  LEFT="flex-row-reverse dropdown-click-left dropdown-hover-left", 
  BOTTOM="flex-col dropdown-click-bottom dropdown-hover-bottom", 
  RIGHT="flex-row dropdown-click-right dropdown-hover-right"
}

export const enum Interact {
  HOVER=1,
  CLICK=2,
  HOVER_N_CLICK=3
}