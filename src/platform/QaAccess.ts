export const QA_QUERY_PARAM = 'qa';
export const QA_QUERY_VALUE = '1';

export const qaSurfaceEnabled = (search?: string): boolean => {
  if (typeof search === 'string') {
    return new URLSearchParams(search).get(QA_QUERY_PARAM) === QA_QUERY_VALUE;
  }

  // Real player browsers always expose Location. DOM-less smoke/QA harnesses do not,
  // so keep those harnesses capable without weakening the shipped browser surface.
  if (typeof window === 'undefined' || typeof window.location?.search !== 'string') return true;
  return new URLSearchParams(window.location.search).get(QA_QUERY_PARAM) === QA_QUERY_VALUE;
};
