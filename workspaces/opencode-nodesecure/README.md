<p align="center"><h1 align="center">
  @nodesecure/opencode-nodesecure
</h1>

<p align="center">
Opencode Nodesecure
</p>


## Getting Started

This package is available in the Node Package Repository.

Add the plugin to your [OpenCode config](https://opencode.ai/docs/config/):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-nodesecure"]
}
```

That's it. OpenCode will automatically install the plugin on next run.

## Updating

> [!WARNING]
> OpenCode does NOT auto-update plugins.

To get the latest version, clear the cached plugin and let OpenCode reinstall it:

```bash
rm -rf ~/.cache/opencode/node_modules/opencode-nodesecure
opencode
```

## Tools Provided

| Tool        | Description                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| `cwd_scanner` | Perform a security scan on the current working directory |
| `remote_packages_scanner` | Perform a security scan on the given npm packages.         |

## Usage

Use natural language (e.g. i want to make a security scan on the current working directory, i want to perform a security scan on this dependency: react@19.0.0).
