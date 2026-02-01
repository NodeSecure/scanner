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

const sast_warnings = {
  parsing_error: "JavaScript kodu meriyah ile ayrıştırılırken bir hata oluştu. Bu, metinden AST'ye dönüşümün başarısız olduğu anlamına gelir. Böyle bir hatayla karşılaşırsanız, lütfen bir issue açın.",
  unsafe_import: "Bir içe aktarma (require, require.resolve) ifadesi/deyimi takip edilemiyor.",
  unsafe_regex: "Güvensiz bir RegEx (Düzenli İfade) tespit edildi ve ReDoS saldırısı için kullanılabilir.",
  unsafe_stmt: "eval() veya Function(\"\") gibi tehlikeli ifadelerin kullanımı.",
  unsafe_assign: "process veya require gibi korumalı bir global değişkene atama yapılması.",
  encoded_literal: "Kodlanmış bir değişmez değer (literal) tespit edildi (onaltılık değer, unicode dizisi, base64 dizesi vb. olabilir).",
  suspicious_file: "İçinde ondan fazla kodlanmış değişmez değer (literal) bulunan şüpheli dosya.",
  short_identifiers: "Tanımlayıcıların ortalama uzunluğu 1.5'in altında. Sadece dosya 5'ten fazla tanımlayıcı içeriyorsa mümkündür.",
  suspicious_literal: "Tüm değişmez değerlerin (literals) şüpheli puanlarının toplamı 3'ten büyük.",
  obfuscated_code: "Kodun gizlenmiş/karartılmış (obfuscated) olma ihtimali çok yüksek...",
  weak_crypto: "Kod muhtemelen zayıf bir şifreleme algoritması içeriyor (md5, sha1...)",
  shady_link: "Bir değişmez değer (string), şüpheli uzantıya sahip bir alan adına (domain) URL içeriyor.",
  zero_semver: "0.x ile başlayan anlamsal sürüm (kararsız proje veya ciddi sürümleme yapılmamış).",
  empty_package: "Paket dosyası (tarball) sadece package.json dosyası içeriyor.",
  unsafe_command: "spawn() veya exec() gibi şüpheli child_process komutlarının kullanımı.",
  serialize_environment: "Kod process.env'yi serileştirmeye çalışıyor, bu da ortam değişkenlerinin sızmasına yol açabilir.",
  synchronous_io: "Kod, olay döngüsünü (event loop) engelleyebilecek ve performansı düşürebilecek senkron G/Ç (I/O) işlemleri içeriyor."
};

export const turkish = { lang, depWalker, warnings, sast_warnings };
