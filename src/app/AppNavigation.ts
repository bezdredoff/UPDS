export interface AppNavigation {
  openScene(scene: number, line?: number): void;
  showMatchIntro(levelIndex: number): void;
  showDossier(back: () => void): void;
  showSettings(back?: () => void, showMainMenu?: boolean): void;
  showChoice(): void;
  showEnding(): void;
  showSceneSelect(): void;
  showDiagnostics(status?: string): void;
  showLevelLab(): void;
  showMenu(): void;
  returnToMainMenu(): void;
}
