exports['walk @slimio/is 1'] = {
  "@slimio/is": {
    "versions": {
      "1.5.1": {
        "id": 0,
        "usedBy": {},
        "isDevDependency": false,
        "existOnRemoteRegistry": true,
        "flags": [
          "isOutdated",
          "hasManyPublishers"
        ],
        "description": "SlimIO is (JavaScript Primitives &amp; Objects type checker)",
        "author": {
          "name": "SlimIO"
        },
        "engines": {
          "node": ">=10"
        },
        "repository": {
          "type": "git",
          "url": "git+https://github.com/SlimIO/is.git"
        },
        "scripts": {
          "prepublishOnly": "pkg-ok",
          "test": "cross-env psp && ava --verbose",
          "doc": "jsdoc -c ./jsdoc.json -r -R ./README.md -P ./package.json --verbose",
          "coverage": "nyc npm test",
          "report": "nyc report --reporter=html"
        },
        "warnings": [],
        "composition": {
          "extensions": [
            "",
            ".js",
            ".json",
            ".md",
            ".toml",
            ".ts"
          ],
          "minified": [],
          "unused": [],
          "missing": [],
          "alias": {},
          "required_nodejs": [],
          "required_thirdparty": [],
          "required_subpath": {}
        },
        "license": {
          "uniqueLicenseIds": [
            "MIT"
          ],
          "hasMultipleLicenses": false,
          "licenses": [
            {
              "uniqueLicenseIds": [
                "MIT"
              ],
              "spdxLicenseLinks": [
                "https://spdx.org/licenses/MIT.html#licenseText"
              ],
              "spdx": {
                "osi": true,
                "fsf": true,
                "fsfAndOsi": true,
                "includesDeprecated": false
              },
              "from": "package.json"
            },
            {
              "uniqueLicenseIds": [
                "MIT"
              ],
              "spdxLicenseLinks": [
                "https://spdx.org/licenses/MIT.html#licenseText"
              ],
              "spdx": {
                "osi": true,
                "fsf": true,
                "fsfAndOsi": true,
                "includesDeprecated": false
              },
              "from": "LICENSE"
            }
          ]
        },
        "gitUrl": null,
        "integrity": "c9781c55ab750e58bed9ce2560581ff4087b8c3129462543fa6fee4e717ba2a9",
        "links": {
          "npm": "https://www.npmjs.com/package/@slimio/is/v/1.5.1",
          "homepage": "https://github.com/SlimIO/is#readme",
          "github": "https://github.com/SlimIO/is",
          "gitlab": null
        }
      }
    },
    "vulnerabilities": [],
    "metadata": {
      "dependencyCount": 0,
      "publishedCount": 8,
      "lastUpdateAt": "2023-01-23T02:15:37.203Z",
      "lastVersion": "2.0.0",
      "hasManyPublishers": true,
      "hasReceivedUpdateInOneYear": true,
      "homepage": "https://github.com/SlimIO/is#readme",
      "author": {
        "name": "SlimIO"
      },
      "publishers": [
        {
          "name": "fraxken",
          "email": "gentilhomme.thomas@gmail.com",
          "version": "2.0.0",
          "at": "2023-01-23T02:15:37.203Z"
        }
      ],
      "maintainers": [
        {
          "name": "fraxken",
          "email": "gentilhomme.thomas@gmail.com",
          "at": "2023-01-23T02:15:37.203Z",
          "version": "2.0.0"
        },
        {
          "name": "alexandre.malaj",
          "email": "alexandre.malaj@gmail.com"
        }
      ],
      "integrity": {
        "1.5.1": "c9781c55ab750e58bed9ce2560581ff4087b8c3129462543fa6fee4e717ba2a9"
      }
    }
  }
}

exports['from pacote 1'] = [
  "id",
  "rootDependencyName",
  "scannerVersion",
  "vulnerabilityStrategy",
  "warnings",
  "flaggedAuthors",
  "dependencies"
]
