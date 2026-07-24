// Import Third-party Dependencies
import { sast_warnings } from "@nodesecure/js-x-ray/i18n/french";

// Import Internal Dependencies
import { taggedString as tS } from "../utils.ts";

const lang = "fr";

const depWalker = {
  dep_tree: "arbre de dépendances",
  fetch_and_walk_deps: "Importation et analyse de l'intégralité des dépendances...",
  fetch_on_registry: "En attente de l'importation des packages du registre npm...",
  waiting_tarball: "En attente de l'analyse des tarballs...",
  fetch_metadata: "Metadonnées importées :",
  analyzed_tarball: "Tarballs en cours d'analyse :",
  success_fetch_deptree: tS`Analyse de l'${0} terminée avec succès en ${1}`,
  success_tarball: tS`${0} tarballs analysés avec succès en ${1}`,
  success_registry_metadata: "Metadonnées requises pour tous les packages importées avec succès !",
  failed_rmdir: tS`Suppression du dossier ${0} échouée !`
};

const warnings = {
  disable_scarf: "Cette dépendance peut récolter des données contre votre volonté, pensez donc à la désactiver en fournissant la variable d'environnement SCARF_ANALYTICS",
  keylogging: "Cette dépendance peut obtenir vos entrées clavier ou de souris. Cette dépendance peut être utilisée en tant que 'keylogging' attacks/malwares."
};

const package_warnings = {
  zero_semver: "Version sémantique commençant par 0.x (projet instable ou sans versionnement sérieux)",
  empty_package: "L'archive du package ne contient qu'un fichier package.json."
};

export const french = { lang, depWalker, warnings, sast_warnings, package_warnings };
