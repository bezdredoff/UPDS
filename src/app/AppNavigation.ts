import type { StoryEndingId } from '../data/storyGraph';
export interface AppNavigation {
  openScene(scene: number, line?: number): void;
  showMatchIntro(levelIndex: number): void;
  showDossier(back: () => void): void;
  showSettings(back?: () => void, showMainMenu?: boolean): void;
  showChoice(): void;
  showEnding(endingId: StoryEndingId): void;
  showSceneSelect(): void;
  showDiagnostics(status?: string): void;
  showLevelLab(): void;
  showSceneStudio(): void;
  showMatch3Campaign(): void;
  showMenu(): void;
  returnToMainMenu(): void;
}
