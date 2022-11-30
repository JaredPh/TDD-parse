import { add, format, parse } from "date-fns";

import { isArrayOf } from "../utils/arrays";

import { TagType } from "./tags";

type PipeParamValidatorFn = (params: string[]) => boolean;
type PipeResolverFn = (text: string) => (...params: string[]) => string;

export const PIPES: Record<
  string,
  {
    types: TagType[];
    validateParams: PipeParamValidatorFn;
    resolve: PipeResolverFn;
  }
> = {
  lowercase: {
    types: ["string"],
    validateParams: isArrayOf([]),
    resolve: (text: string) => () => text.toLocaleLowerCase(),
  },
  uppercase: {
    types: ["string"],
    validateParams: isArrayOf([]),
    resolve: (text: string) => () => text.toUpperCase(),
  },
  append: {
    types: ["string", "date"],
    validateParams: isArrayOf(["string"]),
    resolve: (text: string) => (textToAppend) => `${text}${textToAppend}`,
  },
  maxLength: {
    types: ["string", "date"],
    validateParams: isArrayOf(["int"]),
    resolve: (text: string) => (maxLength: string) => {
      if (!/^[0-9]+$/.test(maxLength)) return text;

      return text.substring(0, Number(maxLength));
    },
  },
  substring: {
    types: ["string", "date"],
    validateParams: isArrayOf(["int", "int"]),
    resolve: (text: string) => (start: string, end: string) =>
      text.substring(Number(start), Number(end)),
  },
  addDays: {
    types: ["date"],
    validateParams: isArrayOf(["int"]),
    resolve: (text: string) => (daysToAddStr: string) => {
      const inputDate = parse(text, "dd/MM/yyyy", new Date());
      const outputDate = add(inputDate, { days: Number(daysToAddStr) });

      return format(outputDate, "dd/MM/yyyy");
    },
  },
};

export type PipeName = (keyof typeof PIPES)[number];
const MODIFIER_NAMES = Object.keys(PIPES);

export const isPipeName = (str: string): str is PipeName =>
  MODIFIER_NAMES.includes(str);
