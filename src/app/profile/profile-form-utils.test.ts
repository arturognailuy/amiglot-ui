import { describe, expect, it } from "vitest";

import { buildFormValues, expandAvailability } from "./profile-form";
import type { ProfileFormValues } from "./schema";
import type { ProfileResponse } from "./profile-types";

const baseResponse = (): ProfileResponse => ({
  user: { id: "user-1", email: "test@example.com" },
  profile: {
    handle: "",
    timezone: "",
    birth_year: null,
    birth_month: null,
    country_code: null,
  },
  languages: [],
  availability: [],
});

describe("profile-form utils", () => {
  it("buildFormValues sorts languages and groups availability by order", () => {
    const data = baseResponse();
    data.languages = [
      { language_code: "es", level: 2, is_native: false, is_target: true, order: 2 },
      { language_code: "en", level: 5, is_native: true, is_target: false, order: 1 },
    ];
    data.availability = [
      {
        weekday: 1,
        start_local_time: "09:00",
        end_local_time: "10:00",
        timezone: "",
        order: 2,
      },
      {
        weekday: 3,
        start_local_time: "09:00",
        end_local_time: "10:00",
        timezone: "",
        order: 1,
      },
      {
        weekday: 2,
        start_local_time: "11:00",
        end_local_time: "12:00",
        timezone: "UTC",
      },
    ];

    const values = buildFormValues(data, "America/Vancouver");

    expect(values.timezone).toBe("America/Vancouver");
    expect(values.languages.map((lang) => lang.language_code)).toEqual(["en", "es"]);
    expect(values.availability).toHaveLength(2);
    expect(values.availability[0]).toMatchObject({
      start_local_time: "09:00",
      end_local_time: "10:00",
      timezone: "America/Vancouver",
      weekdays: [1, 3],
    });
    expect(values.availability[1]).toMatchObject({
      start_local_time: "11:00",
      end_local_time: "12:00",
      timezone: "UTC",
      weekdays: [2],
    });
  });

  it("expandAvailability flattens weekdays with order and timezone fallback", () => {
    const values: ProfileFormValues = {
      handle: "tester",
      birthYear: "",
      birthMonth: "",
      countryCode: "",
      timezone: "UTC",
      languages: [
        { language_code: "en", level: 5, is_target: false, description: "" },
      ],
      availability: [
        {
          weekdays: [1, 2],
          start_local_time: "18:00",
          end_local_time: "20:00",
          timezone: "",
        },
      ],
    };

    const expanded = expandAvailability(values);

    expect(expanded).toHaveLength(2);
    expect(expanded[0]).toMatchObject({
      weekday: 1,
      timezone: "UTC",
      order: 1,
    });
    expect(expanded[1]).toMatchObject({
      weekday: 2,
      timezone: "UTC",
      order: 1,
    });
  });
});
