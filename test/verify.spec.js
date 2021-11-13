// Import Internal Dependencies
import { verify } from "../index.js";

test("verify 'express' package", async() => {
  const data = await verify("express@4.17.0");
  expect(data).toMatchSnapshot();
});
