exports['verify express@4.17.0 1'] = {
  "files": {
    "list": [
      "History.md",
      "LICENSE",
      "Readme.md",
      "index.js",
      "lib\\application.js",
      "lib\\express.js",
      "lib\\middleware\\init.js",
      "lib\\middleware\\query.js",
      "lib\\request.js",
      "lib\\response.js",
      "lib\\router\\index.js",
      "lib\\router\\layer.js",
      "lib\\router\\route.js",
      "lib\\utils.js",
      "lib\\view.js",
      "package.json"
    ],
    "extensions": [
      ".md",
      ".js",
      ".json"
    ],
    "minified": []
  },
  "directorySize": 208134,
  "uniqueLicenseIds": [
    "MIT"
  ],
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
  ],
  "ast": {
    "dependencies": {
      "index.js": {
        "./lib/express": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 11,
              "column": 17
            },
            "end": {
              "line": 11,
              "column": 41
            }
          }
        }
      },
      "lib\\application.js": {
        "finalhandler": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 16,
              "column": 19
            },
            "end": {
              "line": 16,
              "column": 42
            }
          }
        },
        "./router": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 17,
              "column": 13
            },
            "end": {
              "line": 17,
              "column": 32
            }
          }
        },
        "methods": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 18,
              "column": 14
            },
            "end": {
              "line": 18,
              "column": 32
            }
          }
        },
        "./middleware/init": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 19,
              "column": 17
            },
            "end": {
              "line": 19,
              "column": 45
            }
          }
        },
        "./middleware/query": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 20,
              "column": 12
            },
            "end": {
              "line": 20,
              "column": 41
            }
          }
        },
        "debug": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 21,
              "column": 12
            },
            "end": {
              "line": 21,
              "column": 28
            }
          }
        },
        "./view": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 22,
              "column": 11
            },
            "end": {
              "line": 22,
              "column": 28
            }
          }
        },
        "http": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 23,
              "column": 11
            },
            "end": {
              "line": 23,
              "column": 26
            }
          }
        },
        "./utils": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 26,
              "column": 19
            },
            "end": {
              "line": 26,
              "column": 37
            }
          }
        },
        "depd": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 27,
              "column": 16
            },
            "end": {
              "line": 27,
              "column": 31
            }
          }
        },
        "array-flatten": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 28,
              "column": 14
            },
            "end": {
              "line": 28,
              "column": 38
            }
          }
        },
        "utils-merge": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 29,
              "column": 12
            },
            "end": {
              "line": 29,
              "column": 34
            }
          }
        },
        "path": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 30,
              "column": 14
            },
            "end": {
              "line": 30,
              "column": 29
            }
          }
        },
        "setprototypeof": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 31,
              "column": 21
            },
            "end": {
              "line": 31,
              "column": 46
            }
          }
        }
      },
      "lib\\express.js": {
        "body-parser": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 15,
              "column": 17
            },
            "end": {
              "line": 15,
              "column": 39
            }
          }
        },
        "events": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 16,
              "column": 19
            },
            "end": {
              "line": 16,
              "column": 36
            }
          }
        },
        "merge-descriptors": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 17,
              "column": 12
            },
            "end": {
              "line": 17,
              "column": 40
            }
          }
        },
        "./application": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 18,
              "column": 12
            },
            "end": {
              "line": 18,
              "column": 36
            }
          }
        },
        "./router/route": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 19,
              "column": 12
            },
            "end": {
              "line": 19,
              "column": 37
            }
          }
        },
        "./router": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 20,
              "column": 13
            },
            "end": {
              "line": 20,
              "column": 32
            }
          }
        },
        "./request": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 21,
              "column": 10
            },
            "end": {
              "line": 21,
              "column": 30
            }
          }
        },
        "./response": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 22,
              "column": 10
            },
            "end": {
              "line": 22,
              "column": 31
            }
          }
        },
        "./middleware/query": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 79,
              "column": 16
            },
            "end": {
              "line": 79,
              "column": 45
            }
          }
        },
        "serve-static": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 81,
              "column": 17
            },
            "end": {
              "line": 81,
              "column": 40
            }
          }
        }
      },
      "lib\\middleware\\init.js": {
        "setprototypeof": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 16,
              "column": 21
            },
            "end": {
              "line": 16,
              "column": 46
            }
          }
        }
      },
      "lib\\middleware\\query.js": {
        "utils-merge": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 15,
              "column": 12
            },
            "end": {
              "line": 15,
              "column": 34
            }
          }
        },
        "parseurl": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 16,
              "column": 15
            },
            "end": {
              "line": 16,
              "column": 34
            }
          }
        },
        "qs": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 17,
              "column": 9
            },
            "end": {
              "line": 17,
              "column": 22
            }
          }
        }
      },
      "lib\\request.js": {
        "accepts": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 16,
              "column": 14
            },
            "end": {
              "line": 16,
              "column": 32
            }
          }
        },
        "depd": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 17,
              "column": 16
            },
            "end": {
              "line": 17,
              "column": 31
            }
          }
        },
        "net": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 18,
              "column": 11
            },
            "end": {
              "line": 18,
              "column": 25
            }
          }
        },
        "type-is": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 19,
              "column": 13
            },
            "end": {
              "line": 19,
              "column": 31
            }
          }
        },
        "http": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 20,
              "column": 11
            },
            "end": {
              "line": 20,
              "column": 26
            }
          }
        },
        "fresh": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 21,
              "column": 12
            },
            "end": {
              "line": 21,
              "column": 28
            }
          }
        },
        "range-parser": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 22,
              "column": 17
            },
            "end": {
              "line": 22,
              "column": 40
            }
          }
        },
        "parseurl": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 23,
              "column": 12
            },
            "end": {
              "line": 23,
              "column": 31
            }
          }
        },
        "proxy-addr": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 24,
              "column": 16
            },
            "end": {
              "line": 24,
              "column": 37
            }
          }
        }
      },
      "lib\\router\\index.js": {
        "./route": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 16,
              "column": 12
            },
            "end": {
              "line": 16,
              "column": 30
            }
          }
        },
        "./layer": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 17,
              "column": 12
            },
            "end": {
              "line": 17,
              "column": 30
            }
          }
        },
        "methods": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 18,
              "column": 14
            },
            "end": {
              "line": 18,
              "column": 32
            }
          }
        },
        "utils-merge": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 19,
              "column": 12
            },
            "end": {
              "line": 19,
              "column": 34
            }
          }
        },
        "debug": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 20,
              "column": 12
            },
            "end": {
              "line": 20,
              "column": 28
            }
          }
        },
        "depd": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 21,
              "column": 16
            },
            "end": {
              "line": 21,
              "column": 31
            }
          }
        },
        "array-flatten": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 22,
              "column": 14
            },
            "end": {
              "line": 22,
              "column": 38
            }
          }
        },
        "parseurl": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 23,
              "column": 15
            },
            "end": {
              "line": 23,
              "column": 34
            }
          }
        },
        "setprototypeof": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 24,
              "column": 21
            },
            "end": {
              "line": 24,
              "column": 46
            }
          }
        }
      },
      "lib\\router\\layer.js": {
        "path-to-regexp": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 16,
              "column": 17
            },
            "end": {
              "line": 16,
              "column": 42
            }
          }
        },
        "debug": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 17,
              "column": 12
            },
            "end": {
              "line": 17,
              "column": 28
            }
          }
        }
      },
      "lib\\router\\route.js": {
        "debug": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 16,
              "column": 12
            },
            "end": {
              "line": 16,
              "column": 28
            }
          }
        },
        "array-flatten": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 17,
              "column": 14
            },
            "end": {
              "line": 17,
              "column": 38
            }
          }
        },
        "./layer": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 18,
              "column": 12
            },
            "end": {
              "line": 18,
              "column": 30
            }
          }
        },
        "methods": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 19,
              "column": 14
            },
            "end": {
              "line": 19,
              "column": 32
            }
          }
        }
      },
      "lib\\utils.js": {
        "safe-buffer": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 15,
              "column": 13
            },
            "end": {
              "line": 15,
              "column": 35
            }
          }
        },
        "content-disposition": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 16,
              "column": 25
            },
            "end": {
              "line": 16,
              "column": 55
            }
          }
        },
        "content-type": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 17,
              "column": 18
            },
            "end": {
              "line": 17,
              "column": 41
            }
          }
        },
        "depd": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 18,
              "column": 16
            },
            "end": {
              "line": 18,
              "column": 31
            }
          }
        },
        "array-flatten": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 19,
              "column": 14
            },
            "end": {
              "line": 19,
              "column": 38
            }
          }
        },
        "send": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 20,
              "column": 11
            },
            "end": {
              "line": 20,
              "column": 26
            }
          }
        },
        "etag": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 21,
              "column": 11
            },
            "end": {
              "line": 21,
              "column": 26
            }
          }
        },
        "proxy-addr": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 22,
              "column": 16
            },
            "end": {
              "line": 22,
              "column": 37
            }
          }
        },
        "qs": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 23,
              "column": 9
            },
            "end": {
              "line": 23,
              "column": 22
            }
          }
        },
        "querystring": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 24,
              "column": 18
            },
            "end": {
              "line": 24,
              "column": 40
            }
          }
        }
      },
      "lib\\view.js": {
        "debug": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 16,
              "column": 12
            },
            "end": {
              "line": 16,
              "column": 28
            }
          }
        },
        "path": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 17,
              "column": 11
            },
            "end": {
              "line": 17,
              "column": 26
            }
          }
        },
        "fs": {
          "unsafe": false,
          "inTry": false,
          "location": {
            "start": {
              "line": 18,
              "column": 9
            },
            "end": {
              "line": 18,
              "column": 22
            }
          }
        }
      }
    },
    "warnings": [
      {
        "kind": "parsing-error",
        "value": "Cannot read properties of undefined (reading 'tagName')",
        "location": [
          [
            0,
            0
          ],
          [
            0,
            0
          ]
        ],
        "file": "lib\\response.js"
      },
      {
        "kind": "unsafe-import",
        "location": [
          [
            81,
            13
          ],
          [
            81,
            25
          ]
        ],
        "file": "lib\\view.js"
      }
    ]
  }
}
