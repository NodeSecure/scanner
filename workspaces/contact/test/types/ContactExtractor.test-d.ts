// Import Third-party Dependencies
import {
  expectType
} from "tsd";

// Import Internal Dependencies
import {
  ContactExtractor
} from "../../dist/index.js";

expectType<ContactExtractor>(new ContactExtractor({
  highlight: [
    { email: "foo" },
    { name: "bar" }
  ]
}));
