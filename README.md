<p align="center">
  <img alt="# Nodesecure Scanner" src="https://user-images.githubusercontent.com/4438263/226018084-113c49e6-6c69-4baa-8f84-87e6d695be6d.jpg">
</p>

<p align="center">
  <a href="https://github.com/NodeSecure/scanner">
    <img src="https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/NodeSecure/scanner/master/workspaces/scanner/package.json&query=$.version&label=Version" alt="version">
  </a>
  <a href="https://github.com/NodeSecure/scanner/graphs/commit-activity">
    <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge" alt="maintained">
  </a>
  <a href="https://api.securityscorecards.dev/projects/github.com/NodeSecure/scanner">
    <img src="https://api.securityscorecards.dev/projects/github.com/NodeSecure/scanner/badge?style=for-the-badge" alt="OpenSSF Scorecard">
  </a>
  <a href="https://github.com/NodeSecure/scanner/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/NodeSecure/scanner.svg?style=for-the-badge" alt="mit">
  </a>
  <a href="https://github.com/NodeSecure/scanner/actions/workflows/node.js.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/NodeSecure/scanner/node.js.yml?style=for-the-badge" alt="build">
  </a>
</p>

⚡️ Run a static analysis of your module's dependencies.

## 💡 Features

Scanner builds on [JS-X-Ray](https://github.com/NodeSecure/js-x-ray) (SAST) and [Vulnera](https://github.com/NodeSecure/vulnera) (CVE detection), and adds additional detections such as:

- Detects:
  - [Manifest confusion](https://blog.vlt.sh/blog/the-massive-hole-in-the-npm-ecosystem)
  - [Dependency confusion](https://www.landh.tech/blog/20250610-netflix-vulnerability-dependency-confusion/)
  - Typosquatting of popular package names
  - Install scripts (e.g. `install`, `preinstall`, `postinstall`, `preuninstall`, `postuninstall`)
- Highlights packages by name, version(s), or maintainer
- Highlights infrastructure components such as ip, hostname, email, url
- Supports NPM and Yarn lockfiles

## 💃 Getting Started

```bash
$ npm i @nodesecure/scanner
# or
$ yarn add @nodesecure/scanner
```

For full API documentation, options, and usage examples, see the [@nodesecure/scanner package README](./workspaces/scanner/README.md).

## Workspaces

- [@nodesecure/scanner](./workspaces/scanner)
- [@nodesecure/tarball](./workspaces/tarball)
- [@nodesecure/tree-walker](./workspaces/tree-walker)
- [@nodesecure/flags](./workspaces/flags)
- [@nodesecure/mama](./workspaces/mama)
- [@nodesecure/contact](./workspaces/contact)
- [@nodesecure/conformance](./workspaces/conformance)
- [@nodesecure/npm-types](./workspaces/npm-types)
- [@nodesecure/i18n](./workspaces/i18n)
- [@nodesecure/rc](./workspaces/rc)
- [@nodesecure/utils](./workspaces/utils)
- [@nodesecure/fs-walk](./workspaces/fs-walk)
- [@nodesecure/github](./workspaces/github)
- [@nodesecure/gitlab](./workspaces/gitlab)

## 🐥 Contributors guide

If you are a developer **looking to contribute** to the project, you must first read the [CONTRIBUTING](./CONTRIBUTING.md) guide.

Once you have finished your development, check that the tests (and linter) are still good by running the following script:

```bash
$ npm run check
```

> [!CAUTION]
> In case you introduce a new feature or fix a bug, make sure to include tests for it as well.

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-32-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=fraxken" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/scanner/pulls?q=is%3Apr+reviewed-by%3Afraxken" title="Reviewed Pull Requests">👀</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3Afraxken" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://tonygo.dev"><img src="https://avatars.githubusercontent.com/u/22824417?v=4?s=100" width="100px;" alt="Tony Gorez"/><br /><sub><b>Tony Gorez</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=tony-go" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=tony-go" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/scanner/pulls?q=is%3Apr+reviewed-by%3Atony-go" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3Atony-go" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://mickaelcroquet.fr"><img src="https://avatars.githubusercontent.com/u/23740372?v=4?s=100" width="100px;" alt="Haze"/><br /><sub><b>Haze</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=CroquetMickael" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mbalabash"><img src="https://avatars.githubusercontent.com/u/16868922?v=4?s=100" width="100px;" alt="Maksim Balabash"/><br /><sub><b>Maksim Balabash</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=mbalabash" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3Ambalabash" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://dev.to/antoinecoulon"><img src="https://avatars.githubusercontent.com/u/43391199?v=4?s=100" width="100px;" alt="Antoine Coulon"/><br /><sub><b>Antoine Coulon</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=antoine-coulon" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3Aantoine-coulon" title="Bug reports">🐛</a> <a href="https://github.com/NodeSecure/scanner/pulls?q=is%3Apr+reviewed-by%3Aantoine-coulon" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-antoine-coulon" title="Maintenance">🚧</a> <a href="#security-antoine-coulon" title="Security">🛡️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/nicolas-hallaert/"><img src="https://avatars.githubusercontent.com/u/39910164?v=4?s=100" width="100px;" alt="Nicolas Hallaert"/><br /><sub><b>Nicolas Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Rossb0b" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://sofiand.github.io/portfolio-client/"><img src="https://avatars.githubusercontent.com/u/39944043?v=4?s=100" width="100px;" alt="Yefis"/><br /><sub><b>Yefis</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=SofianD" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/franck-hallaert/"><img src="https://avatars.githubusercontent.com/u/110826655?v=4?s=100" width="100px;" alt="Franck Hallaert"/><br /><sub><b>Franck Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Aekk0" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/ange-tekeu-a155811b4/"><img src="https://avatars.githubusercontent.com/u/35274201?v=4?s=100" width="100px;" alt="Ange TEKEU"/><br /><sub><b>Ange TEKEU</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=tekeuange23" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Kawacrepe"><img src="https://avatars.githubusercontent.com/u/40260517?v=4?s=100" width="100px;" alt="Vincent Dhennin"/><br /><sub><b>Vincent Dhennin</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Kawacrepe" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=Kawacrepe" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/scanner/pulls?q=is%3Apr+reviewed-by%3AKawacrepe" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3AKawacrepe" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fabnguess"><img src="https://avatars.githubusercontent.com/u/72697416?v=4?s=100" width="100px;" alt="Kouadio Fabrice Nguessan"/><br /><sub><b>Kouadio Fabrice Nguessan</b></sub></a><br /><a href="#maintenance-fabnguess" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PierreDemailly"><img src="https://avatars.githubusercontent.com/u/39910767?v=4?s=100" width="100px;" alt="PierreDemailly"/><br /><sub><b>PierreDemailly</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=PierreDemailly" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/pulls?q=is%3Apr+reviewed-by%3APierreDemailly" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3APierreDemailly" title="Bug reports">🐛</a> <a href="https://github.com/NodeSecure/scanner/commits?author=PierreDemailly" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kishore881"><img src="https://avatars.githubusercontent.com/u/49707819?v=4?s=100" width="100px;" alt="Kishore"/><br /><sub><b>Kishore</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=kishore881" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=kishore881" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://clementgombauld.netlify.app/"><img src="https://avatars.githubusercontent.com/u/91478082?v=4?s=100" width="100px;" alt="Clement Gombauld"/><br /><sub><b>Clement Gombauld</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=clemgbld" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/intincrab"><img src="https://avatars.githubusercontent.com/u/93028153?v=4?s=100" width="100px;" alt="Ajāy "/><br /><sub><b>Ajāy </b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=intincrab" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=intincrab" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Rossb0b"><img src="https://avatars.githubusercontent.com/u/39910164?v=4?s=100" width="100px;" alt="Nicolas Hallaert"/><br /><sub><b>Nicolas Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Rossb0b" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/MaximeMRF"><img src="https://avatars.githubusercontent.com/u/57860498?v=4?s=100" width="100px;" alt="Maxime"/><br /><sub><b>Maxime</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=MaximeMRF" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/ange-tekeu-a155811b4/"><img src="https://avatars.githubusercontent.com/u/35274201?v=4?s=100" width="100px;" alt="Ange TEKEU"/><br /><sub><b>Ange TEKEU</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=tekeuange23" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AlexandreMalaj"><img src="https://avatars.githubusercontent.com/u/32218832?v=4?s=100" width="100px;" alt="Alexandre Malaj"/><br /><sub><b>Alexandre Malaj</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=AlexandreMalaj" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=AlexandreMalaj" title="Documentation">📖</a> <a href="#translation-AlexandreMalaj" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/FredGuiou"><img src="https://avatars.githubusercontent.com/u/99122562?v=4?s=100" width="100px;" alt="FredGuiou"/><br /><sub><b>FredGuiou</b></sub></a><br /><a href="#maintenance-FredGuiou" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jochri3"><img src="https://avatars.githubusercontent.com/u/23065918?v=4?s=100" width="100px;" alt="Christian Lisangola"/><br /><sub><b>Christian Lisangola</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=jochri3" title="Tests">⚠️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/QuentinLpy"><img src="https://avatars.githubusercontent.com/u/31780359?v=4?s=100" width="100px;" alt="Quentin Lepateley"/><br /><sub><b>Quentin Lepateley</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=QuentinLpy" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://antoineneff.me"><img src="https://avatars.githubusercontent.com/u/9216777?v=4?s=100" width="100px;" alt="Antoine Neff"/><br /><sub><b>Antoine Neff</b></sub></a><br /><a href="#translation-antoineneff" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.linkedin.com/in/kvoyer"><img src="https://avatars.githubusercontent.com/u/33313541?v=4?s=100" width="100px;" alt="Kévin VOYER"/><br /><sub><b>Kévin VOYER</b></sub></a><br /><a href="#translation-kecsou" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Mathieuka"><img src="https://avatars.githubusercontent.com/u/34446722?v=4?s=100" width="100px;" alt="Mathieu"/><br /><sub><b>Mathieu</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Mathieuka" title="Code">💻</a> <a href="#translation-Mathieuka" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://codebreaker.fr/"><img src="https://avatars.githubusercontent.com/u/53506859?v=4?s=100" width="100px;" alt="im_codebreaker"/><br /><sub><b>im_codebreaker</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=im-codebreaker" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=im-codebreaker" title="Documentation">📖</a> <a href="#design-im-codebreaker" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ayushmaanshrotriya"><img src="https://avatars.githubusercontent.com/u/65903307?v=4?s=100" width="100px;" alt="Ayushmaan Shrotriya"/><br /><sub><b>Ayushmaan Shrotriya</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=ayushmaanshrotriya" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Ineslujan"><img src="https://avatars.githubusercontent.com/u/65076833?v=4?s=100" width="100px;" alt="Inès & Mélu"/><br /><sub><b>Inès & Mélu</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Ineslujan" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/zwOk9"><img src="https://avatars.githubusercontent.com/u/18079239?v=4?s=100" width="100px;" alt="zwOk9"/><br /><sub><b>zwOk9</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=zwOk9" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pmartin-dev"><img src="https://avatars.githubusercontent.com/u/45450501?v=4?s=100" width="100px;" alt="Pierre Martin"/><br /><sub><b>Pierre Martin</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=pmartin-dev" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/7amed3li"><img src="https://avatars.githubusercontent.com/u/190534558?v=4?s=100" width="100px;" alt="Hamed Mohamed"/><br /><sub><b>Hamed Mohamed</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=7amed3li" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kulturman"><img src="https://avatars.githubusercontent.com/u/11850979?v=4?s=100" width="100px;" alt="Arnaud Bakyono "/><br /><sub><b>Arnaud Bakyono </b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=kulturman" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT
