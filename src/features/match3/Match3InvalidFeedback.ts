import type { MoveResult } from '../../engine/Match3Game';

export type Match3InvalidFeedbackKey =
  | 'match3.feedback.noMatch'
  | 'match3.feedback.moveBlocked'
  | 'match3.feedback.storyObjectLocked'
  | 'match3.feedback.adjacentOnly'
  | 'match3.feedback.swapUnavailable';

export function match3InvalidFeedbackKey(reason: MoveResult['reason']): Match3InvalidFeedbackKey {
  switch (reason) {
    case 'no-match':
      return 'match3.feedback.noMatch';
    case 'blocked':
      return 'match3.feedback.moveBlocked';
    case 'ingredient':
      return 'match3.feedback.storyObjectLocked';
    case 'not-adjacent':
      return 'match3.feedback.adjacentOnly';
    default:
      return 'match3.feedback.swapUnavailable';
  }
}
