/**
 * Barrel re-export — keeps all existing import paths working:
 *
 *   import Select from "@/components/ui/Select"
 *   import { SelectOption, SelectProps } from "@/components/ui/Select"
 *
 * The implementation now lives in the Select/ folder.
 */
export { default } from "./Select/index";
export type { SelectOption, SelectProps } from "./Select/types";
