export interface ProjectConfig {
  owner: string;
  repo: string;
  customDescription?: string;
  customImage?: string;
  customTitle?: string;
  customUrl?: string;
}

export const PROJECTS: ProjectConfig[] = [
  {
    owner: 'hadobedo',
    repo: 'Myrient-Downloader-GUI',
  },
  {
    owner: 'nick-eb',
    repo: 'nickebsite-vite',
    customTitle: 'Jellyfin Legacy Player',
    customDescription: 'Jellyfin music player, designed for legacy devices that do not support modern (Jellyfin) music players; serving as fully-functional prototype for future native legacy iOS app',
    customUrl: 'https://github.com/nick-eb/nickebsite-vite/tree/main/public/jfl'
  },
  {
    owner: 'nick-eb',
    repo: 'nickebsite-vite',
    customTitle: 'nick-eb.dev',
    customDescription: 'The code for the site you\'re on right now!',
    customUrl: 'https://github.com/nick-eb/nickebsite-vite'
  },
  {
    owner: 'bonello-nicholas',
    repo: 'uni-library-management-java'
  },
  {
    owner: 'hadobedo',
    repo: 'FunkiniOS',
    customDescription: 'A port of Friday Night Funkin\' to iOS with various optimizations for wider device compatibility. Built using Haxe and Xcode.',
  }
] as const;
