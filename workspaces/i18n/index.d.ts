declare namespace i18n {
  type languages = "french" | "english";

  export function getLocalLang(): Promise<languages>;
  export function setLocalLang(newLanguage: languages): Promise<void>;
  export function getToken(token: string, ...parameters: any[]): Promise<string>;
  export function getTokenSync(token: string, ...parameters: any[]): string;
  export function getLanguages(): Promise<languages[]>;
  export function taggedString(str: string | TemplateStringsArray, ...keys: any[]): (...keys: any[]) => string;
  export function extend(language: string, tokens: Record<string, any>): void;
  export function extendFromSystemPath(path: string): Promise<void>;
}

export default i18n;
