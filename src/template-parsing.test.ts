import timekeeper from "timekeeper";

import { resolveTemplate } from "./template-parsing";

describe("Templates", () => {
  beforeAll(() => {
    timekeeper.freeze("2023-05-02");
  });

  afterAll(() => {
    timekeeper.reset();
  });

  describe("Tags", () => {
    describe("should return resolved templates for valid templates with:", () => {
      it("no tags", () => {
        const expected = {
          unresolvedTemplate: "Hello World!",
          resolvedTemplate: "Hello World!",
          isValid: true,
          tags: [],
          suppliedData: [],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("valid tags", () => {
        const expected = {
          unresolvedTemplate: "Hello { FIRST_NAME } { LAST_NAME }!",
          resolvedTemplate: "Hello John Smith!",
          isValid: true,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: [],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("valid tags and pipes", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME | uppercase } { LAST_NAME | lowercase }!",
          resolvedTemplate: "Hello JOHN smith!",
          isValid: true,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: [],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("valid tags and a pipe with a parameter", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME }, tomorrow is { CURRENT_DATE | addDays:1 }!",
          resolvedTemplate: "Hello John, tomorrow is 03/05/2023!",
          isValid: true,
          tags: ["FIRST_NAME", "CURRENT_DATE"],
          suppliedData: [],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });
        expect(actual).toEqual(expected);
      });

      it("valid tags and a pipes with multiple parameters", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME | substring:0:1 } { LAST_NAME }!",
          resolvedTemplate: "Hello J Smith!",
          isValid: true,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: [],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("valid tags and chained pipes", () => {
        const expected = {
          unresolvedTemplate: "Hello { FIRST_NAME | maxLength:2 | uppercase }!",
          resolvedTemplate: "Hello JO!",
          isValid: true,
          tags: ["FIRST_NAME"],
          suppliedData: [],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("kitchen sink", () => {
        const expected = {
          unresolvedTemplate:
            "Hello {     FIRST_NAME   |     substring :   0:3    | lowercase | maxLength:1 | uppercase  } { LAST_NAME }, today is { CURRENT_DATE | substring:0:5 }, and tomorrow is { CURRENT_DATE | addDays:1 | maxLength:5}, the year is {CURRENT_DATE | substring:6:10 | append:AD }!",
          resolvedTemplate:
            "Hello J Smith, today is 02/05, and tomorrow is 03/05, the year is 2023AD!",
          isValid: true,
          tags: ["FIRST_NAME", "LAST_NAME", "CURRENT_DATE"],
          suppliedData: [],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });
    });

    describe("should return errors for invalid templates with:", () => {
      it("an invalid tag", () => {
        const expected = {
          unresolvedTemplate: "Hello { BILL_PAYER }!",
          isValid: false,
          tags: [],
          suppliedData: [],
          errors: [
            { type: "INVALID_TAG", tag: "BILL_PAYER", match: "{ BILL_PAYER }" },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("a mix valid and invalid tags", () => {
        const expected = {
          unresolvedTemplate:
            "Hello {TITLE } {FIRST_NAME } {MIDDLE_NAME} { LAST_NAME }!",
          isValid: false,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: [],
          errors: [
            { type: "INVALID_TAG", tag: "TITLE", match: "{TITLE }" },
            { type: "INVALID_TAG", tag: "MIDDLE_NAME", match: "{MIDDLE_NAME}" },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("valid tags and invalid pipes", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME }, yesterday was { CURRENT_DATE | subtractDays:1 }!",
          isValid: false,
          tags: ["FIRST_NAME", "CURRENT_DATE"],
          suppliedData: [],
          errors: [
            {
              type: "INVALID_PIPE",
              reason: "PIPE_NOT_FOUND",
              tag: "CURRENT_DATE",
              pipe: "subtractDays",
              match: "{ CURRENT_DATE | subtractDays:1 }",
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("a mix of invalid tags and invalid pipes", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME } { MIDDLE_NAME } {LAST_NAME}, yesterday was { CURRENT_DATE | subtractDays:1 }!",
          isValid: false,
          tags: ["FIRST_NAME", "LAST_NAME", "CURRENT_DATE"],
          suppliedData: [],
          errors: [
            {
              type: "INVALID_TAG",
              tag: "MIDDLE_NAME",
              match: "{ MIDDLE_NAME }",
            },
            {
              type: "INVALID_PIPE",
              reason: "PIPE_NOT_FOUND",
              tag: "CURRENT_DATE",
              pipe: "subtractDays",
              match: "{ CURRENT_DATE | subtractDays:1 }",
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("a pipe with a missing param", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME }, tomorrow is { CURRENT_DATE | addDays }!",
          isValid: false,
          tags: ["FIRST_NAME", "CURRENT_DATE"],
          suppliedData: [],
          errors: [
            {
              type: "INVALID_PIPE",
              reason: "INVALID_PARAMS",
              tag: "CURRENT_DATE",
              pipe: "addDays",
              match: "{ CURRENT_DATE | addDays }",
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("a pipe with too few params", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME }, tomorrow is { CURRENT_DATE | addDays:1 | substring : 0 }!",
          isValid: false,
          tags: ["FIRST_NAME", "CURRENT_DATE"],
          suppliedData: [],
          errors: [
            {
              type: "INVALID_PIPE",
              reason: "INVALID_PARAMS",
              tag: "CURRENT_DATE",
              pipe: "substring",
              match: "{ CURRENT_DATE | addDays:1 | substring : 0 }",
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("a pipe with too many params", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME }, tomorrow is { CURRENT_DATE | addDays:1:2 }!",
          isValid: false,
          tags: ["FIRST_NAME", "CURRENT_DATE"],
          suppliedData: [],
          errors: [
            {
              type: "INVALID_PIPE",
              reason: "INVALID_PARAMS",
              tag: "CURRENT_DATE",
              pipe: "addDays",
              match: "{ CURRENT_DATE | addDays:1:2 }",
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("a pipe with incorrect param type", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME }, tomorrow is { CURRENT_DATE | addDays:blue }!",
          isValid: false,
          tags: ["FIRST_NAME", "CURRENT_DATE"],
          suppliedData: [],
          errors: [
            {
              type: "INVALID_PIPE",
              reason: "INVALID_PARAMS",
              tag: "CURRENT_DATE",
              pipe: "addDays",
              match: "{ CURRENT_DATE | addDays:blue }",
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("multiple pipes with incorrect param type", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME }, tomorrow is { CURRENT_DATE | addDays:blue | substring:0:green}!",
          isValid: false,
          tags: ["FIRST_NAME", "CURRENT_DATE"],
          suppliedData: [],
          errors: [
            {
              type: "INVALID_PIPE",
              reason: "INVALID_PARAMS",
              tag: "CURRENT_DATE",
              pipe: "addDays",
              match: "{ CURRENT_DATE | addDays:blue | substring:0:green}",
            },
            {
              type: "INVALID_PIPE",
              reason: "INVALID_PARAMS",
              tag: "CURRENT_DATE",
              pipe: "substring",
              match: "{ CURRENT_DATE | addDays:blue | substring:0:green}",
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("multiple pipes with incorrect tag type", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME | addDays:1 }, tomorrow is { CURRENT_DATE | uppercase | lowercase }!",
          isValid: false,
          tags: ["FIRST_NAME", "CURRENT_DATE"],
          suppliedData: [],
          errors: [
            {
              type: "INVALID_PIPE",
              reason: "NOT_ALLOWED_FOR_TAG_TYPE",
              tag: "FIRST_NAME",
              pipe: "addDays",
              match: "{ FIRST_NAME | addDays:1 }",
            },
            {
              type: "INVALID_PIPE",
              reason: "NOT_ALLOWED_FOR_TAG_TYPE",
              tag: "CURRENT_DATE",
              pipe: "uppercase",
              match: "{ CURRENT_DATE | uppercase | lowercase }",
            },
            {
              type: "INVALID_PIPE",
              reason: "NOT_ALLOWED_FOR_TAG_TYPE",
              tag: "CURRENT_DATE",
              pipe: "lowercase",
              match: "{ CURRENT_DATE | uppercase | lowercase }",
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });

      it("kitchen sink", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { FIRST_NAME | titlecase  } { MIDDLE_NAME } { LAST_NAME | addDays:1 | lowercase }, today is { CURRENT_DATE | addDays:blue }, and tomorrow is { CURRENT_DATE | addDays:1 | substring:0:green}!",
          isValid: false,
          tags: ["FIRST_NAME", "LAST_NAME", "CURRENT_DATE"],
          suppliedData: [],
          errors: [
            {
              type: "INVALID_PIPE",
              reason: "PIPE_NOT_FOUND",
              tag: "FIRST_NAME",
              pipe: "titlecase",
              match: "{ FIRST_NAME | titlecase  }",
            },
            {
              type: "INVALID_TAG",
              tag: "MIDDLE_NAME",
              match: "{ MIDDLE_NAME }",
            },
            {
              type: "INVALID_PIPE",
              reason: "NOT_ALLOWED_FOR_TAG_TYPE",
              tag: "LAST_NAME",
              pipe: "addDays",
              match: "{ LAST_NAME | addDays:1 | lowercase }",
            },
            {
              type: "INVALID_PIPE",
              reason: "INVALID_PARAMS",
              tag: "CURRENT_DATE",
              pipe: "addDays",
              match: "{ CURRENT_DATE | addDays:blue }",
            },
            {
              type: "INVALID_PIPE",
              reason: "INVALID_PARAMS",
              tag: "CURRENT_DATE",
              pipe: "substring",
              match: "{ CURRENT_DATE | addDays:1 | substring:0:green}",
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [],
        });

        expect(actual).toEqual(expected);
      });
    });
  });

  describe("Supplied Data", () => {
    describe("should return resolved template for valid templates with:", () => {
      it("one supplied data tag", () => {
        const expected = {
          unresolvedTemplate:
            "Hello {FIRST_NAME} {SUPPLIED_DATA.middleName} {LAST_NAME}!",
          resolvedTemplate: "Hello John Lucy Smith!",
          isValid: true,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: ["middleName"],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: {
            middleName: "Lucy",
          },
          suppliedDataSchema: [
            { key: "middleName", type: "string", nullable: false },
          ],
        });

        expect(actual).toEqual(expected);
      });

      it("one supplied data tag with params", () => {
        const expected = {
          unresolvedTemplate:
            "Hello {FIRST_NAME} {SUPPLIED_DATA.middleName | uppercase } {LAST_NAME}!",
          resolvedTemplate: "Hello John LUCY Smith!",
          isValid: true,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: ["middleName"],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: {
            middleName: "Lucy",
          },
          suppliedDataSchema: [
            { key: "middleName", type: "string", nullable: false },
          ],
        });

        expect(actual).toEqual(expected);
      });

      it("multiple supplied data tags", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { SUPPLIED_DATA.title } {FIRST_NAME} {SUPPLIED_DATA.middleName} {LAST_NAME}!",
          resolvedTemplate: "Hello Mr John Lucy Smith!",
          isValid: true,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: ["title", "middleName"],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: {
            title: "Mr",
            middleName: "Lucy",
          },
          suppliedDataSchema: [
            { key: "title", type: "string", nullable: false },
            { key: "middleName", type: "string", nullable: false },
          ],
        });

        expect(actual).toEqual(expected);
      });

      it("multiple supplied data tags with params", () => {
        const expected = {
          unresolvedTemplate:
            "Hello { SUPPLIED_DATA.title |uppercase} {FIRST_NAME } {SUPPLIED_DATA.middleName | maxLength : 1 | uppercase } {LAST_NAME}!",
          resolvedTemplate: "Hello MR John L Smith!",
          isValid: true,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: ["title", "middleName"],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: {
            title: "mr",
            middleName: "lucy",
          },
          suppliedDataSchema: [
            { key: "title", type: "string", nullable: false },
            { key: "middleName", type: "string", nullable: false },
          ],
        });

        expect(actual).toEqual(expected);
      });
    });

    describe("should return errors for invalid templates with:", () => {
      it("invalid supplied data (empty)", () => {
        const expected = {
          unresolvedTemplate:
            "Hello {FIRST_NAME} {SUPPLIED_DATA.middleName} {LAST_NAME}!",
          isValid: false,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: ["middleName"],
          errors: [
            {
              type: "INVALID_SUPPLIED_DATA",

              issues: [
                {
                  code: "invalid_type",
                  expected: "string",
                  message: "Required",
                  path: ["middleName"],
                  received: "undefined",
                },
              ],
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: {},
          suppliedDataSchema: [
            { key: "middleName", type: "string", nullable: false },
          ],
        });

        expect(actual).toEqual(expected);
      });

      it("invalid supplied data (missing key)", () => {
        const expected = {
          unresolvedTemplate:
            "Hello {SUPPLIED_DATA.title} {FIRST_NAME} {SUPPLIED_DATA.middleName} {LAST_NAME}!",
          isValid: false,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: ["title", "middleName"],
          errors: [
            {
              type: "INVALID_SUPPLIED_DATA",
              issues: [
                {
                  code: "invalid_type",
                  expected: "string",
                  message: "Required",
                  path: ["title"],
                  received: "undefined",
                },
              ],
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: { middleName: "Lucy" },
          suppliedDataSchema: [
            { key: "title", type: "string", nullable: false },
            { key: "middleName", type: "string", nullable: false },
          ],
        });

        expect(actual).toEqual(expected);
      });

      it("invalid supplied data (missing keys)", () => {
        const expected = {
          unresolvedTemplate:
            "Hello {SUPPLIED_DATA.title} {FIRST_NAME} {SUPPLIED_DATA.middleName} {LAST_NAME}!",
          isValid: false,
          tags: ["FIRST_NAME", "LAST_NAME"],
          suppliedData: ["title", "middleName"],
          errors: [
            {
              type: "INVALID_SUPPLIED_DATA",
              issues: [
                {
                  code: "invalid_type",
                  expected: "string",
                  message: "Required",
                  path: ["title"],
                  received: "undefined",
                },
                {
                  code: "invalid_type",
                  expected: "string",
                  message: "Required",
                  path: ["middleName"],
                  received: "undefined",
                },
              ],
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: {},
          suppliedDataSchema: [
            { key: "title", type: "string", nullable: false },
            { key: "middleName", type: "string", nullable: false },
          ],
        });

        expect(actual).toEqual(expected);
      });

      it("kitchen sink", () => {
        const expected = {
          unresolvedTemplate:
            "Hello {SUPPLIED_DATA.title} { FIRST_NAME | titlecase  } { MIDDLE_NAME } { LAST_NAME | addDays:1 | lowercase }, today is { CURRENT_DATE | addDays:blue }, and tomorrow is { CURRENT_DATE | addDays:1 | substring:0:green}!",
          isValid: false,
          tags: ["FIRST_NAME", "LAST_NAME", "CURRENT_DATE"],
          suppliedData: ["title"],
          errors: [
            {
              type: "INVALID_PIPE",
              reason: "PIPE_NOT_FOUND",
              tag: "FIRST_NAME",
              pipe: "titlecase",
              match: "{ FIRST_NAME | titlecase  }",
            },
            {
              type: "INVALID_TAG",
              tag: "MIDDLE_NAME",
              match: "{ MIDDLE_NAME }",
            },
            {
              type: "INVALID_PIPE",
              reason: "NOT_ALLOWED_FOR_TAG_TYPE",
              tag: "LAST_NAME",
              pipe: "addDays",
              match: "{ LAST_NAME | addDays:1 | lowercase }",
            },
            {
              type: "INVALID_PIPE",
              reason: "INVALID_PARAMS",
              tag: "CURRENT_DATE",
              pipe: "addDays",
              match: "{ CURRENT_DATE | addDays:blue }",
            },
            {
              type: "INVALID_PIPE",
              reason: "INVALID_PARAMS",
              tag: "CURRENT_DATE",
              pipe: "substring",
              match: "{ CURRENT_DATE | addDays:1 | substring:0:green}",
            },
            {
              type: "INVALID_SUPPLIED_DATA",
              issues: [
                {
                  code: "invalid_type",
                  expected: "string",
                  message: "Required",
                  path: ["title"],
                  received: "undefined",
                },
              ],
            },
          ],
        };

        const actual = resolveTemplate({
          unresolvedTemplate: expected.unresolvedTemplate,
          suppliedData: undefined,
          suppliedDataSchema: [
            { key: "title", type: "string", nullable: false },
          ],
        });

        expect(actual).toEqual(expected);
      });
    });
  });
});
