
export interface DependencyRef {
  id: number;
  usedBy: Record<string, string>;
  isDevDependency: boolean;
  existOnRemoteRegistry: boolean;
  flags: string[];
  description: string;
  size: number;
  author: Record<string, any>;
  engines: Record<string, any>;
  repository: any;
  scripts: Record<string, string>;
  warnings: any;
  license: any;
  gitUrl: string | null;
  alias: Record<string, string>;
  composition: {
    extensions: string[];
    files: string[];
    minified: string[];
    unused: string[];
    missing: string[];
    required_files: string[];
    required_nodejs: string[];
    required_thirdparty: string[];
    required_subpath: Record<string, string>;
  }
}
