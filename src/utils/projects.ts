export interface ProjectConfig {
  owner: string;
  repo: string;
  customDescription?: string;
  customImage?: string;
}

export const PROJECTS: ProjectConfig[] = [
  {
    owner: 'hadobedo',
    repo: 'FunkiniOS',
    customDescription: 'A port of Friday Night Funkin\' to iOS with various optimizations for wider device compatibility. Built using Haxe and Xcode.',
  },
  {
    owner: 'hadobedo',
    repo: 'Myrient-Downloader-GUI',
  },
  {
    owner: 'bonello-nicholas',
    repo: 'uni-library-management-java'
  }
] as const;
