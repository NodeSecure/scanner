import { jest } from "@jest/globals";

// Require Internal Dependencies
import securityModule from "../../src/vulnerabilities/strategies/security-wg.js";

describe("Security Working Group inner methods", () => {
  // it("should delete and hydrate vulnerabilities DB without side effects", async() => {
  //   const vulnStrategy = await SecurityWGStrategy({ sideEffects: false });
  //   vulnStrategy.deleteDB();
  //   await vulnStrategy.hydrateDB();
  // });

  it("should delete and hydrate vulnerabilities DB with side effects", async() => {
    const spy = jest.spyOn(securityModule, "checkHydrateDB");

    await securityModule.SecurityWGStrategy({ sideEffects: true });
    await (() => expect(spy).toHaveBeenCalledTimes(1));
  });
});


