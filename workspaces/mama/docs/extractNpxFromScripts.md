# extractNpxFromScripts

Parse the binary name, flags and script name from a npx command `npx --flags binaryName` in each script if present.

## Function Signature

```ts
export type NpxCommand = {
  binaryName: string;
  flags: string[];
  scriptName: string;
};

export function* extractNpxFromScripts(
  scripts: Record<string, string> | undefined
): IterableIterator<NpxCommand>
```


## Example Usage

```ts

extractNpxFromScripts({
test: "npx --yes=false jest",
exec: "npx my-internal-tool",
start: "npm run start"
});

/*
Will yield:

{ binaryName: "jest", 
flags: ["--yes=false"],
scriptName: "test" 
}

Then:

{
binaryName: "my-internal-tool", 
flags: [], scriptName: 
"exec" 
}

Nothing is extracted from the start script since there is no npx command in it.
*/

extractNpxFromScripts({
release: "npx -y -p @changesets/cli@3.0.1 -c 'changeset version'" 
});

/*
Will yield:

{
binaryName: "@changesets/cli",
flags: ["-y", "-p"],
scriptName: "release"
}

Note: that the binary name is given without the version
*/

extractNpxFromScripts({
release: "npx a && npx b" 
});

/*
Will yield:

{
binaryName: "a",
flags: [],
scriptName: "release"
}

Then:

{
binaryName: "b",
flags: [],
scriptName: "release"
}

*/
```


## How It Works

The function uses a regular expression:

```ts
/\bnpx\s+((?:--?\w[\w-]*(?:[=\s]\S+)?\s+)*)(\S+)/g
```

to extract for each script:

* **binaryName** → the binary name (without the version when there is one) in the npx command (e.g. `"npx jest"` → `"jest"`)
* **flags** → the flags in the npx command (e.g. `"npx -y --no jest"` → `["-y", "--no"]`)
* **scriptName** → the name of the script where there is an npx command (e.g. `{"test":"npx -y --no jest"}` → `"test"`)

If there is no script containing a npx command the function does not yield anything.
