import { PIPES } from "../pipes";

import { TemplateValidationObj } from "./validate-template-tag-matches";

const prependSuppliedDataKeys = (
  suppliedData: Record<string, string>
): Record<string, string> => {
  const prependKey = ([key, value]: [string, string]) => [
    `SUPPLIED_DATA.${key}`,
    value,
  ];

  const entries = Object.entries(suppliedData);
  return Object.fromEntries(entries.map(prependKey));
};

export const resolveTags = (
  unresolvedTemplate: string,
  resolvedTags: Record<string, string>,
  suppliedData: Record<string, string> = {},
  templateData: TemplateValidationObj
) => {
  const resolvedData = {
    ...resolvedTags,
    ...prependSuppliedDataKeys(suppliedData),
  };

  return templateData.matches.reduce(
    (partiallyResolvedTemplateStr, { match, tag, pipes }) =>
      partiallyResolvedTemplateStr.replace(
        match,
        pipes.reduce(
          (resolvedTagStr, pipe) =>
            PIPES[pipe.name].resolve(resolvedTagStr)(...pipe.params),
          resolvedData[tag] as string
        )
      ),
    unresolvedTemplate
  );
};
