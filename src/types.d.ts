export type ImageType = {
  id: number,
  src: string,
  width: number,
  height: number,
  alt: string
}
import { Interact } from "./utils";
export type InteractType = typeof Interact[keyof typeof Interact];