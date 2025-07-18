// Import Third-party Dependencies
import { taggedString as tS } from "@nodesecure/i18n";

const scanner = {
  disable_scarf: "Cette dépendance peut récolter des données contre votre volonté, pensez donc à la désactiver en fournissant la variable d'environnement SCARF_ANALYTICS",
  keylogging: "Cette dépendance peut obtenir vos entrées clavier ou de souris. Cette dépendance peut être utilisée en tant que 'keylogging' attacks/malwares.",
  typo_squatting: tS`Le package '${0}' est similaire aux packages populaires suivants : ${1}`
};

export default { scanner };

