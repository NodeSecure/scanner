// Import Third-party Dependencies
import { sast_warnings } from "@nodesecure/js-x-ray/i18n/turkish";

// Require Internal Dependencies
import { taggedString as tS } from "../utils.ts";

const lang = "tr";

const depWalker = {
  dep_tree: "bağımlılık ağacı",
  fetch_and_walk_deps: "Tüm bağımlılıklar getiriliyor ve taranıyor...",
  fetch_on_registry: "Paketlerin npm kayıt defterinden (registry) getirilmesi bekleniyor...",
  waiting_tarball: "Paket dosyalarının (tarball) analiz edilmesi bekleniyor...",
  fetch_metadata: "Paket meta verileri getirildi:",
  analyzed_tarball: "Analiz edilen npm paket dosyaları:",
  success_fetch_deptree: tS`${0} başarıyla ${1} içinde tarandı`,
  success_tarball: tS`${0} paket dosyası ${1} içinde başarıyla analiz edildi`,
  success_registry_metadata: "Tüm paketler için gerekli meta veriler başarıyla getirildi!",
  failed_rmdir: tS`${0} dizini silinemedi!`
};

const warnings = {
  disable_scarf: "Bu bağımlılık izniniz olmadan veri toplayabilir, SCARF_ANALYTICS ortam değişkeni ile devre dışı bırakmayı düşünün.",
  keylogging: "Bu bağımlılık klavye ve fare girişlerinizi alabilir. 'Keylogging' saldırıları/kötü amaçlı yazılımları için kullanılabilir."
};

export const turkish = { lang, depWalker, warnings, sast_warnings };
