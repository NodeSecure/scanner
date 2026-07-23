// Import Third-party Dependencies
import { sast_warnings } from "@nodesecure/js-x-ray/i18n/arabic";

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

export const arabic = { lang, depWalker, warnings, sast_warnings };
