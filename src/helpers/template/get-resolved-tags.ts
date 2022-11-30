import { TAGS, TagName } from "../tags";

const resolveTag = (tag: TagName) => TAGS[tag].resolve();

export const getResolvedTags = (tags: TagName[]) =>
  Object.fromEntries(tags.map((tag) => [tag, resolveTag(tag)])) as Record<
    TagName,
    string
  >;
