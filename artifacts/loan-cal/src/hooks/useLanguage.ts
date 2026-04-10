import { useState, useEffect } from "react";
import { loadLanguage, saveLanguage } from "@/lib/storage";
import type { Lang } from "@/lib/i18n";

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(loadLanguage);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  function setLang(newLang: Lang) {
    saveLanguage(newLang);
    setLangState(newLang);
  }

  return { lang, setLang };
}
