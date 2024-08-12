/* eslint-disable max-len */

// Import Internal Dependencies
import { taggedString as tS } from "../src/utils.js";

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

const sast_warnings = {
  parsing_error: `Une erreur s'est produite lors de l'analyse du code JavaScript avec meriyah.
              Cela signifie que la conversion de la chaîne de caractères AST a échoué.
              Si vous rencontrez une telle erreur, veuillez ouvrir une issue.`,
  unsafe_import: "Impossible de suivre l'import (require, require.resolve) statement/expr.",
  unsafe_regex: "Un RegEx a été détecté comme non sûr et peut être utilisé pour une attaque ReDoS.",
  unsafe_stmt: "Utilisation d'instructions dangereuses comme eval() ou Function(\"\").",
  unsafe_assign: "Attribution d'un processus ou d'un require global protégé..",
  encoded_literal: "Un code littérale a été découvert (il peut s'agir d'une valeur hexa, d'une séquence unicode, d'une chaîne de caractères base64, etc.)",
  short_identifiers: "Cela signifie que tous les identifiants ont une longueur moyenne inférieure à 1,5. Seulement possible si le fichier contient plus de 5 identifiants.",
  suspicious_literal: "Cela signifie que la somme des scores suspects de tous les littéraux est supérieure à 3.",
  suspicious_file: "Un fichier suspect contenant plus de dix chaines de caractères encodés",
  obfuscated_code: "Il y a une très forte probabilité que le code soit obscurci...",
  weak_crypto: "Le code contient probablement un algorithme de chiffrement faiblement sécurisé (md5, sha1...).",
  shady_link: "Un Literal (string) contient une URL vers un domaine avec une extension suspecte.",
  zeroSemVer: "Version sémantique commençant par 0.x (projet instable ou sans versionnement sérieux)"
};

export const french = { lang, depWalker, warnings, sast_warnings };
