import { ZodIssue } from "zod";

type BaseTemplateError<T> = { type: T; tag: string; match: string };
type BaseTemplatePipeError<T> = BaseTemplateError<"INVALID_PIPE"> & {
  reason: T;
  pipe: string;
};

type GetErrorParams<ET> = Omit<ET, "type" | "reason">;

type InvalidTagError = BaseTemplateError<"INVALID_TAG">;
export const getInvalidTagError = ({
  tag,
  match,
}: GetErrorParams<InvalidTagError>): InvalidTagError => ({
  type: "INVALID_TAG",
  tag,
  match,
});

type InvalidPipeParamsError = BaseTemplatePipeError<"INVALID_PARAMS">;
export const getInvalidPipeParamsError = ({
  tag,
  pipe,
  match,
}: GetErrorParams<InvalidPipeParamsError>): InvalidPipeParamsError => ({
  type: "INVALID_PIPE",
  reason: "INVALID_PARAMS",
  tag,
  pipe,
  match,
});

type InvalidPipeTypeError = BaseTemplatePipeError<"NOT_ALLOWED_FOR_TAG_TYPE">;
export const getInvalidPipeTypeError = ({
  tag,
  pipe,
  match,
}: GetErrorParams<InvalidPipeTypeError>): InvalidPipeTypeError => ({
  type: "INVALID_PIPE",
  reason: "NOT_ALLOWED_FOR_TAG_TYPE",
  tag,
  pipe,
  match,
});

type InvalidPipeNotFoundError = BaseTemplatePipeError<"PIPE_NOT_FOUND">;
export const getInvalidPipeNotFoundError = ({
  tag,
  match,
  pipe,
}: GetErrorParams<InvalidPipeNotFoundError>): InvalidPipeNotFoundError => ({
  type: "INVALID_PIPE",
  reason: "PIPE_NOT_FOUND",
  tag,
  pipe,
  match,
});

type InvalidSuppliedDataError = ReturnType<
  typeof getSuppliedDataIsInvalidError
>;
export const getSuppliedDataIsInvalidError = (issues: ZodIssue[]) => ({
  type: "INVALID_SUPPLIED_DATA",
  issues,
});

export type TemplateError =
  | InvalidTagError
  | InvalidPipeParamsError
  | InvalidPipeTypeError
  | InvalidPipeNotFoundError
  | InvalidSuppliedDataError;
