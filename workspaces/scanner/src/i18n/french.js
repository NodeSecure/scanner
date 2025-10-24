// Import Third-party Dependencies
import { taggedString as tS } from "@nodesecure/i18n";

const scanner = {
  disable_scarf: "Cette dépendance peut récolter des données contre votre volonté, pensez donc à la désactiver en fournissant la variable d'environnement SCARF_ANALYTICS",
  keylogging: "Cette dépendance peut obtenir vos entrées clavier ou de souris. Cette dépendance peut être utilisée en tant que 'keylogging' attacks/malwares.",
  typo_squatting: tS`La dépendance '${0}' est similaire aux packages populaires suivants : ${1}`,
  dependency_confusion: "Cette dépendance a été trouvée à la fois sur un registre public et privé, mais sa signature ne correspond pas.",
  dependency_confusion_missing: "Cette dépendance a été trouvée seulement sur le registre privé, cette dépendance est vulnérable à une attaque par confusion de dépendance.",
  dependency_confusion_missing_org: tS`L'organisation '${0}' n'est pas revendiquée sur le registre public`
};

export default { scanner };

