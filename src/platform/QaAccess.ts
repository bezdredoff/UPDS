export const QA_QUERY_PARAM = 'qa';
export const QA_QUERY_VALUE = '1';
export const QA_STORAGE_KEY = 'upds.qa.enabled';

const persistQaQuery = (query: URLSearchParams): boolean | null => {
  const value = query.get(QA_QUERY_PARAM);
  if (value === QA_QUERY_VALUE) {
    try { window.localStorage?.setItem(QA_STORAGE_KEY, QA_QUERY_VALUE); } catch { /* QA access must not affect gameplay */ }
    return true;
  }
  if (value === '0') {
    try { window.localStorage?.removeItem(QA_STORAGE_KEY); } catch { /* QA access must not affect gameplay */ }
    return false;
  }
  return null;
};

export const qaSurfaceEnabled = (search?: string): boolean => {
  if (typeof search === 'string') {
    return new URLSearchParams(search).get(QA_QUERY_PARAM) === QA_QUERY_VALUE;
  }

  // Real player browsers always expose Location. DOM-less smoke/QA harnesses do not,
  // so keep those harnesses capable without weakening the shipped browser surface.
  if (typeof window === 'undefined' || typeof window.location?.search !== 'string') return true;
  const queryResult = persistQaQuery(new URLSearchParams(window.location.search));
  if (queryResult !== null) return queryResult;
  try { return window.localStorage?.getItem(QA_STORAGE_KEY) === QA_QUERY_VALUE; } catch { return false; }
};
