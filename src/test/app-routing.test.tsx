import { matchRoutes } from "react-router";
import { describe, expect, it } from "vitest";

import { routes } from "@/router";

// Match routes without rendering: auth checks need a network the test run lacks.
describe("App routing", () => {
  it.each(["/", "/signin", "/signup", "/app"])(
    "matches a page for %s instead of not found",
    (path) => {
      const matches = matchRoutes(routes, path);
      expect(matches?.at(-1)?.route.path).toBe(path);
    },
  );

  it("falls back to the not-found page for unknown paths", () => {
    const matches = matchRoutes(routes, "/does-not-exist");
    expect(matches?.at(-1)?.route.path).toBe("*");
  });
});
