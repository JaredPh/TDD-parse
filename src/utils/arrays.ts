import { z } from "zod";

export const isArrayOf =
  (expectedItems: ("string" | "int")[]) =>
  (arr: unknown[]): boolean => {
    if (expectedItems.length !== arr.length) return false;
    const validators: Record<"string" | "int", any> = {
      string: z.string().min(1),
      int: z.coerce.number().int(),
    };

    for (let index = 0; index < arr.length; index += 1) {
      const paramIsInvalid =
        validators[expectedItems[index]].safeParse(arr[index]).success == false;

      if (paramIsInvalid) return false;
    }

    return true;
  };

export const addToUniqueArray = <T>(arr: T[], value: T): T[] =>
  arr.includes(value) ? arr : [...arr, value];
