// Import Third-party Dependencies
import { taggedString as tS } from "@nodesecure/i18n";

const scanner = {
  disable_scarf: "Cette dépendance peut récolter des données contre votre volonté, pensez donc à la désactiver en fournissant la variable d'environnement SCARF_ANALYTICS",
  keylogging: "Cette dépendance peut obtenir vos entrées clavier ou de souris. Cette dépendance peut être utilisée en tant que 'keylogging' attacks/malwares.",
  typo_squatting: tS`La dépendance '${0}' est similaire aux packages populaires suivants : ${1}`,
  dependency_confusion: "Cette dépendance a été trouvée à la fois sur un registre public et privé, mais sa signature ne correspond pas.",
  dependency_confusion_missing: "Cette dépendance a été trouvée seulement sur le registre privé, cette dépendance est vulnérable à une attaque par confusion de dépendance.",
  dependency_confusion_missing_org: tS`L'organisation '${0}' n'est pas revendiquée sur le registre public`,
  npx_confusion_unclaimed: tS`npx '${0}' a été trouvé dans le script package.json ${1} du package ${2} et n'est pas revendiqué sur le registre public, un attaquant peut enregistrer ce nom et obtenir une RCE sur chaque poste de développeur et chaque pipeline CI qui exécute ce script`,
  npx_confusion_claimed: tS`npx '${0}' a été trouvé dans le script package.json ${1} du package ${2} et est revendiqué sur le registre public, vérifiez qu'il s'agit d'un package de confiance, un attaquant pourrait avoir enregistré ce nom et obtenir une RCE sur chaque poste de développeur et chaque pipeline CI qui exécute ce script`,
  bin_confusion_unclaimed: tS`Le binaire '${0}' a été trouvé dans le champ bin du package.json de ${1} et n'est pas revendiqué sur le registre public, un attaquant peut enregistrer ce nom et obtenir une RCE sur chaque poste de développeur et chaque pipeline CI qui qui exécute ce binaire`,
  bin_confusion_claimed: tS`Le binaire '${0}' a été trouvé dans le champ bin du package.json de ${1} et est revendiqué sur le registre public, vérifiez qu'il s'agit d'un package de confiance, un attaquant pourrait avoir enregistré ce nom et obtenir une RCE sur chaque poste de développeur et chaque pipeline CI qui exécute ce binaire`
};

export default { scanner };
