
export interface DependencyRef {
  id: number;
  usedBy: Record<string, string>;
  isDevDependency: boolean;
  existOnRemoteRegistry: boolean;
  flags: string[];
  description: string;
  size: number;
  authors: Record<string, any>;
  engines: Record<string, any>;
  repository: any;
  scripts: Record<string, string>;
  warnings: any;
  license: any;
  gitUrl: string | null;
  composition: {
    extensions: string[];
    files: string[];
    minified: string[];
    unused: string[];
    missing: string[];
    alias: Record<string, any>;
    required_files: string[];
    required_nodejs: string[];
    required_thirdparty: string[];
    required_subpath: Record<string, string>;
  }
}
