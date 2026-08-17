export const qaSelectors = {
  appRoot: '#app',
  mainMenu: '.menu-screen',
  newGame: '#new',

  sceneNavigationButton: '#episodes',
  sceneNavigationScreen: '.scene-select',
  sceneButton: '[data-scene]',
  vnRuntimeFrame: '[data-vn-frame="shared"][data-frame-context="runtime"]',
  vnDialogue: '.dialogue-text',

  match3CampaignButton: '#match3-campaign',
  match3CampaignScreen: '.match3-campaign-screen',
  match3CampaignLevelButton: '[data-campaign-level]',

  levelLabButton: '#level-lab',
  levelLabScreen: '.level-lab-screen',
  levelLabLevel: '#lab-level',
  levelLabSeed: '#lab-seed',
  levelLabPreview: '#lab-preview',
  levelLabPlay: '#lab-play',

  match3Screen: '.match-screen',
  match3Board: '.board[role="grid"]',
  match3Cell: '[data-cell]',
} as const;
