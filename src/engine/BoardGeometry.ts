/** Row-major board dimensions. Omitted level dimensions retain the shipped 8×8 layout. */
export type BoardDimensions = Readonly<{ rows: number; columns: number }>;

export const LEGACY_BOARD_DIMENSIONS: BoardDimensions = Object.freeze({ rows: 8, columns: 8 });

export function validBoardDimensions(size: BoardDimensions): boolean {
  return Number.isSafeInteger(size.rows) && size.rows >= 3
    && Number.isSafeInteger(size.columns) && size.columns >= 3
    && Number.isSafeInteger(size.rows * size.columns);
}

export function createBoardGeometry(size: BoardDimensions = LEGACY_BOARD_DIMENSIONS) {
  if (!validBoardDimensions(size)) throw new Error('Board dimensions must be integer rows and columns of at least 3');
  const { rows, columns } = size;
  const cellCount = rows * columns;
  return {
    rows, columns, cellCount,
    rowOf: (index: number): number => Math.floor(index / columns),
    colOf: (index: number): number => index % columns,
    indexOf: (row: number, column: number): number => row * columns + column,
    contains: (index: number): boolean => Number.isInteger(index) && index >= 0 && index < cellCount,
  };
}
