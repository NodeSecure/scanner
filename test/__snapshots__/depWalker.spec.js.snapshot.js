exports['walk @slimio/is 1'] = {
  "@slimio/is": {
    "versions": {
      "1.5.1": {
        "id": 0,
        "usedBy": {},
        "isDevDependency": false,
        "existOnRemoteRegistry": true,
        "flags": [
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
        "gitUrl": null
      }
    },
    "vulnerabilities": [],
    "metadata": {
      "dependencyCount": 0,
      "publishedCount": 7,
      "lastUpdateAt": "2019-06-11T06:41:41.590Z",
      "lastVersion": "1.5.1",
      "hasManyPublishers": true,
      "hasReceivedUpdateInOneYear": false,
      "homepage": "https://github.com/SlimIO/is#readme",
      "author": {
        "name": "SlimIO"
      },
      "publishers": [
        {
          "name": "fraxken",
          "email": "gentilhomme.thomas@gmail.com",
          "version": "1.5.1",
          "at": "2019-06-11T06:41:41.590Z"
        }
      ],
      "maintainers": [
        {
          "email": "gentilhomme.thomas@gmail.com",
          "name": "fraxken"
        },
        {
          "email": "alexandre.malaj@gmail.com",
          "name": "alexandre.malaj"
        }
      ]
    }
  }
}

exports['from pacote 1'] = [
  "id",
  "rootDependencyName",
  "scannerVersion",
  "vulnerabilityStrategy",
  "warnings",
  "dependencies"
]
