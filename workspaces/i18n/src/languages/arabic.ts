// Require Internal Dependencies
import { taggedString as tS } from "../utils.ts";

const lang = "ar";

const depWalker = {
  dep_tree: "شجرة الاعتمادات",
  fetch_and_walk_deps: "جاري جلب وفحص جميع الاعتمادات...",
  fetch_on_registry: "في انتظار جلب الحزم من سجل npm...",
  waiting_tarball: "في انتظار تحليل ملفات الحزم (tarballs)...",
  fetch_metadata: "تم جلب البيانات الوصفية للحزمة:",
  analyzed_tarball: "تم تحليل ملفات npm:",
  success_fetch_deptree: tS`تم تصفح ${0} بنجاح خلال ${1}`,
  success_tarball: tS`تم تحليل ${0} ملف حزمة بنجاح خلال ${1}`,
  success_registry_metadata: "تم جلب البيانات الوصفية المطلوبة لجميع الحزم بنجاح!",
  failed_rmdir: tS`فشل حذف الدليل ${0}!`
};

const warnings = {
  disable_scarf: "هذا الاعتماد قد يقوم بجمع بيانات عنك، لتعطيله استخدم متغير البيئة: (SCARF_ANALYTICS)",
  keylogging: "هذا الاعتماد يمكنه تسجيل مدخلاتك (Keylogging). قد يُستخدم في هجمات خبيثة."
};

const sast_warnings = {
  parsing_error: "فشل تحليل كود JavaScript. التحويل إلى AST لم ينجح (meriyah). يرجى فتح issue.",
  unsafe_import: "تعذر تتبع جملة استيراد (require / require.resolve).",
  unsafe_regex: "تم اكتشاف تعبير نمطي غير آمن (ReDoS Attack).",
  unsafe_stmt: "استخدام لجملة خطيرة: eval() أو Function(\"\").",
  unsafe_assign: "تعيين قيمة لمتغير محمي: process أو require.",
  encoded_literal: "تم اكتشاف نص مشفر (Hex, Unicode, Base64, etc).",
  suspicious_file: "ملف مشبوه (يحتوي على أكثر من 10 نصوص مشفرة).",
  short_identifiers: "المعرفات قصيرة جداً (أقل من 1.5). ملف مشبوه.",
  suspicious_literal: "مجموع النقاط المشبوهة للنصوص (Literals) أكبر من 3.",
  obfuscated_code: "احتمالية عالية أن الكود مموه (Obfuscated).",
  weak_crypto: "خوارزمية تشفير ضعيفة (md5, sha1, ...).",
  shady_link: "رابط بامتداد مشبوه داخل النص.",
  zero_semver: "إصدار غير مستقر (0.x) - Semantic Versioning.",
  empty_package: "الحزمة فارغة (تحتوي فقط على package.json).",
  unsafe_command: "أمر child_process مشبوه: spawn() أو exec().",
  serialize_environment: "محاولة تسريب متغيرات البيئة (process.env serialization).",
  synchronous_io: "عمليات I/O متزامنة قد تبطئ التطبيق (Sync I/O)."
};

export const arabic = { lang, depWalker, warnings, sast_warnings };
