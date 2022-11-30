import { z, ZodType } from "zod";

type SuppliedDataValueField = {
  key: string;
  type: "boolean" | "date" | "number" | "string";
  nullable: boolean;
};

type SuppliedDataObjectField = {
  key: string;
  type: "object";
  schema: SuppliedData;
  nullable: boolean;
};

type SuppliedDataField = SuppliedDataValueField | SuppliedDataObjectField;

export type SuppliedData = SuppliedDataField[];

const zodSchemas: Record<SuppliedDataValueField["type"], ZodType> = {
  boolean: z.boolean(),
  date: z.string().datetime(),
  number: z.number(),
  string: z.string(),
};

const isObjectField = (
  field: SuppliedDataField
): field is SuppliedDataObjectField => field.type === "object";

const applyNullable = (validator: ZodType, makeNullable: boolean) =>
  makeNullable ? z.nullable(validator) : validator;

export const createZodValidatorFromSchema = (fields: SuppliedData) =>
  z.object(
    fields.reduce((zodObj, field): Record<string, ZodType> => {
      const fieldValidator = isObjectField(field)
        ? createZodValidatorFromSchema(field.schema)
        : zodSchemas[field.type];

      return {
        ...zodObj,
        [field.key]: applyNullable(fieldValidator, field.nullable),
      };
    }, {})
  );
