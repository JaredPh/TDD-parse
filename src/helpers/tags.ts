import { format } from "date-fns";

export const TAG_NAMES = ["FIRST_NAME", "LAST_NAME", "CURRENT_DATE"] as const;

export type TagName = (typeof TAG_NAMES)[number];
export type TagType = "string" | "date";

export const TAGS: Record<TagName, { type: TagType; resolve: () => string }> = {
  FIRST_NAME: { type: "string", resolve: () => "John" },
  LAST_NAME: { type: "string", resolve: () => "Smith" },
  CURRENT_DATE: {
    type: "date",
    resolve: () => format(new Date(), "dd/MM/yyyy"),
  },
};

export const isValidTag = (str: any): str is TagName => TAG_NAMES.includes(str);
