import { getResolvedTags } from "./helpers/template/get-resolved-tags";
import { resolveTags } from "./helpers/template/resolve-tags";
import { validateTemplateTagMatches } from "./helpers/template/validate-template-tag-matches";
import { SuppliedData } from "./schema";

const getTagStrings = (template: string): string[] =>
  template.match(/(?<={).*?(?=})/g) ?? [];

export const resolveTemplate = ({
  unresolvedTemplate,
  suppliedData,
  suppliedDataSchema,
}: {
  unresolvedTemplate: string;
  suppliedData: Record<string, string> | undefined;
  suppliedDataSchema: SuppliedData;
}) => {
  const tagStrings = getTagStrings(unresolvedTemplate);

  const templateData = validateTemplateTagMatches(
    tagStrings,
    suppliedData,
    suppliedDataSchema
  );

  if (!templateData.isValid) {
    return {
      unresolvedTemplate,
      tags: templateData.tags,
      suppliedData: templateData.suppliedData,
      isValid: templateData.isValid,
      errors: templateData.errors,
    };
  }

  const resolvedTags = getResolvedTags(templateData.tags);

  const resolvedTemplate = resolveTags(
    unresolvedTemplate,
    resolvedTags,
    suppliedData,
    templateData
  );

  return {
    unresolvedTemplate,
    resolvedTemplate,
    tags: templateData.tags,
    suppliedData: templateData.suppliedData,
    isValid: templateData.isValid,
  };
};
