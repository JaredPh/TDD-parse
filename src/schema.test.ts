import { ZodError } from "zod";

import { SuppliedData, createZodValidatorFromSchema } from "./schema";

const exampleSchema: SuppliedData = [
  { key: "id", type: "number", nullable: false },
  { key: "fname", type: "string", nullable: false },
  { key: "lname", type: "string", nullable: false },
  { key: "dob", type: "date", nullable: false },
  { key: "ssd", type: "date", nullable: true },
  { key: "isActive", type: "boolean", nullable: false },
  {
    key: "address",
    type: "object",
    nullable: false,
    schema: [
      { key: "number", type: "number", nullable: true },
      { key: "address", type: "string", nullable: true },
      { key: "city", type: "string", nullable: false },
      { key: "postcode", type: "string", nullable: false },
    ],
  },
  {
    key: "meterReadings",
    type: "object",
    nullable: true,
    schema: [
      {
        key: "electricity",
        type: "object",
        nullable: false,
        schema: [
          { key: "previous", type: "number", nullable: false },
          { key: "current", type: "number", nullable: false },
        ],
      },
      {
        key: "gas",
        type: "object",
        nullable: true,
        schema: [
          { key: "previous", type: "number", nullable: false },
          { key: "current", type: "number", nullable: false },
        ],
      },
    ],
  },
];

const goodData = {
  id: 123,
  fname: "Bruce",
  lname: "Wayne",
  dob: "1992-12-30T00:00:00.000Z",
  ssd: "2023-01-12T00:00:00.000Z",
  isActive: true,
  address: {
    address: "Some Street",
    city: "Gotham City",
    number: 34,
    postcode: "B4 7MN",
  },
  meterReadings: {
    electricity: {
      current: 456,
      previous: 123,
    },
    gas: {
      current: 1234,
      previous: 789,
    },
  },
};

describe("zod schema for supplied data", () => {
  const zodSchema = createZodValidatorFromSchema(exampleSchema);

  describe("Valid data", () => {
    test("should validate good data", () => {
      expect(zodSchema.safeParse(goodData)).toEqual({
        success: true,
        data: goodData,
      });
    });
  });

  describe("Invalid data", () => {
    describe("String", () => {
      it.each`
        type         | value
        ${"number"}  | ${99}
        ${"boolean"} | ${false}
        ${"object"}  | ${{ a: 1 }}
      `("should return a invalid_type error ($type) ", ({ value, type }) => {
        const badData = { ...goodData, fname: value };

        expect(zodSchema.safeParse(badData)).toEqual({
          success: false,
          error: new ZodError([
            {
              code: "invalid_type",
              expected: "string",
              received: type,
              path: ["fname"],
              message: `Expected string, received ${type}`,
            },
          ]),
        });
      });
    });

    describe("Number", () => {
      it.each`
        type         | value
        ${"string"}  | ${"hello"}
        ${"boolean"} | ${false}
        ${"object"}  | ${{ a: 1 }}
      `("should return a invalid_type error ($type) ", ({ value, type }) => {
        const badData = { ...goodData, id: value };

        expect(zodSchema.safeParse(badData)).toEqual({
          success: false,
          error: new ZodError([
            {
              code: "invalid_type",
              expected: "number",
              received: type,
              path: ["id"],
              message: `Expected number, received ${type}`,
            },
          ]),
        });
      });
    });

    describe("Boolean", () => {
      it.each`
        type        | value
        ${"string"} | ${"hello"}
        ${"number"} | ${99}
        ${"object"} | ${{ a: 1 }}
      `("should return a invalid_type error ($type) ", ({ value, type }) => {
        const badData = { ...goodData, isActive: value };

        expect(zodSchema.safeParse(badData)).toEqual({
          success: false,
          error: new ZodError([
            {
              code: "invalid_type",
              expected: "boolean",
              received: type,
              path: ["isActive"],
              message: `Expected boolean, received ${type}`,
            },
          ]),
        });
      });
    });

    describe("Dates", () => {
      it.each`
        type         | value
        ${"number"}  | ${99}
        ${"boolean"} | ${false}
        ${"object"}  | ${{ a: 1 }}
      `("should return a invalid_type error ($type) ", ({ value, type }) => {
        const badData = { ...goodData, dob: value };

        expect(zodSchema.safeParse(badData)).toEqual({
          success: false,
          error: new ZodError([
            {
              code: "invalid_type",
              expected: "string",
              received: type,
              path: ["dob"],
              message: `Expected string, received ${type}`,
            },
          ]),
        });
      });

      it("should return an error", () => {
        const badData = { ...goodData, dob: "invalid string" };

        expect(zodSchema.safeParse(badData)).toEqual({
          success: false,
          error: new ZodError([
            {
              code: "invalid_string",
              validation: "datetime",
              message: "Invalid datetime",
              path: ["dob"],
            },
          ]),
        });
      });
    });

    describe("Object", () => {
      it.each`
        type         | value
        ${"string"}  | ${"hello"}
        ${"number"}  | ${99}
        ${"boolean"} | ${true}
      `("should return a invalid_type error ($type) ", ({ value, type }) => {
        const badData = { ...goodData, address: value };

        expect(zodSchema.safeParse(badData)).toEqual({
          success: false,
          error: new ZodError([
            {
              code: "invalid_type",
              expected: "object",
              received: type,
              path: ["address"],
              message: `Expected object, received ${type}`,
            },
          ]),
        });
      });

      it.each`
        type         | value
        ${"string"}  | ${"hello"}
        ${"number"}  | ${99}
        ${"boolean"} | ${true}
      `(
        "should return a invalid_type error for nested objects ($type) ",
        ({ value, type }) => {
          const badData = {
            ...goodData,
            meterReadings: {
              electricity: goodData.meterReadings.electricity,
              gas: value,
            },
          };

          expect(zodSchema.safeParse(badData)).toEqual({
            success: false,
            error: new ZodError([
              {
                code: "invalid_type",
                expected: "object",
                received: type,
                path: ["meterReadings", "gas"],
                message: `Expected object, received ${type}`,
              },
            ]),
          });
        }
      );
    });

    describe("Nullable data", () => {
      it("should allow null for a string field", () => {
        const data = {
          ...goodData,
          address: { ...goodData.address, address: null },
        };

        expect(zodSchema.safeParse(data)).toEqual({
          success: true,
          data,
        });
      });

      it("should allow null for a number field", () => {
        const data = {
          ...goodData,
          address: { ...goodData.address, number: null },
        };

        expect(zodSchema.safeParse(data)).toEqual({
          success: true,
          data,
        });
      });

      it("should allow null for a date field", () => {
        const data = { ...goodData, ssd: null };

        expect(zodSchema.safeParse(data)).toEqual({
          success: true,
          data,
        });
      });

      it("should allow null for an object field", () => {
        const data = { ...goodData, meterReadings: null };

        expect(zodSchema.safeParse(data)).toEqual({
          success: true,
          data,
        });
      });

      it("should allow null for a nested object field", () => {
        const data = {
          ...goodData,
          meterReadings: {
            electricity: goodData.meterReadings.electricity,
            gas: null,
          },
        };

        expect(zodSchema.safeParse(data)).toEqual({
          success: true,
          data,
        });
      });
    });
  });
});
