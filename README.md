# @luxass/vscode-config

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

Typesafe Visual Studio Code configurations

## 📦 Installation

```sh
npm install @luxass/vscode-config
```

## 📚 Usage

```ts
import { createConfig } from "@luxass/vscode-config";

const config = createConfig<{
  readonly outputPath: string;
  readonly framework: {
    readonly enabled: boolean;
    readonly type: "react" | "vue";
  };
}>({
  section: "playground"
});

const framework = config.get("framework"); // type: { enabled: boolean; type: "react" | "vue"; }
// => { enabled: false, type: "react" }

config.set("framework", { enabled: true, type: "vue" });
```

## 📄 License

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@luxass/vscode-config?style=flat&colorA=18181B&colorB=4169E1
[npm-version-href]: https://npmjs.com/package/@luxass/vscode-config
[npm-downloads-src]: https://img.shields.io/npm/dm/@luxass/vscode-config?style=flat&colorA=18181B&colorB=4169E1
[npm-downloads-href]: https://npmjs.com/package/@luxass/vscode-config
