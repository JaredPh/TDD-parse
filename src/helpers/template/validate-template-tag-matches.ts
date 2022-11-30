import { ZodError } from "zod";

import {
  TemplateError,
  getInvalidPipeNotFoundError,
  getInvalidPipeParamsError,
  getInvalidPipeTypeError,
  getInvalidTagError,
  getSuppliedDataIsInvalidError,
} from "../template/errors";
import { PIPES, isPipeName } from "../pipes";
import { SuppliedData, createZodValidatorFromSchema } from "../../schema";
import { TAGS, TagName, isValidTag } from "../tags";
import { addToUniqueArray } from "../../utils/arrays";
import { splitAndTrim } from "../../utils/strings";

type MatchData = {
  match: string;
  tag: string;
  pipes: { name: string; params: string[] }[];
};

type PipeData = {
  name: string;
  params: string[];
};

export type TemplateValidationObj = {
  isValid: boolean;
  tags: TagName[];
  suppliedData: string[];
  errors: TemplateError[];
  matches: MatchData[];
};

const getTagFromStr = (tag: string): [string, PipeData[]] => {
  const [tagName, ...pipeStrArr] = splitAndTrim(tag, "|");
  const pipes = pipeStrArr.map(getPipeFromStr);

  return [tagName, pipes];
};

const getPipeFromStr = (
  pipeStr: string
): { name: string; params: string[] } => {
  const [name, ...params] = splitAndTrim(pipeStr, ":");
  return { name, params };
};

const isSuppliedDataTag = (tag: string): boolean =>
  /^SUPPLIED_DATA\.[A-Za-z0-9]+$/.test(tag);

export const validateTemplateTagMatches = (
  matches: string[],
  suppliedData: Record<string, string> = {},
  suppliedDataSchema: SuppliedData
) => {
  const data = matches.reduce(
    (output, tagString) => {
      const match = `{${tagString}}`;

      const [tag, pipes] = getTagFromStr(tagString);

      if (isSuppliedDataTag(tag)) {
        const [_, key] = tag.split(".");

        output.suppliedData.push(key);
        output.matches.push({
          match,
          tag,
          pipes,
        });
        return output;
      }

      const tagIsValid = isValidTag(tag);

      if (tagIsValid) {
        output.tags = addToUniqueArray(output.tags, tag);

        const tagType = TAGS[tag].type;

        const pipeErrors = pipes.reduce((errArr, { name, params }) => {
          if (!isPipeName(name)) {
            errArr.push(
              getInvalidPipeNotFoundError({ tag, pipe: name, match })
            );
          } else if (!PIPES[name].types.includes(tagType)) {
            errArr.push(
              getInvalidPipeTypeError({
                tag,
                match,
                pipe: name,
              })
            );
          } else if (!PIPES[name].validateParams(params)) {
            errArr.push(
              getInvalidPipeParamsError({
                tag,
                match,
                pipe: name,
              })
            );
          }

          return errArr;
        }, [] as TemplateError[]);

        if (pipeErrors.length === 0) {
          output.matches.push({
            match,
            tag,
            pipes,
          });
        } else {
          output.errors = [...output.errors, ...pipeErrors];
        }
      } else {
        output.errors.push(getInvalidTagError({ tag, match }));
      }

      output.isValid = output.isValid && output.errors.length === 0;

      return output;
    },
    {
      tags: [],
      errors: [],
      matches: [],
      suppliedData: [],
      isValid: true,
    } as TemplateValidationObj
  );

  try {
    createZodValidatorFromSchema(suppliedDataSchema).parse(suppliedData);
  } catch (e) {
    return {
      ...data,
      isValid: false,
      errors: [
        ...data.errors,
        getSuppliedDataIsInvalidError((e as ZodError).issues),
      ],
    };
  }

  return data;
};
