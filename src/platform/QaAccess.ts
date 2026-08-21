export const QA_QUERY_PARAM = 'qa';
export const QA_QUERY_VALUE = '1';

export const qaSurfaceEnabled = (search?: string): boolean => {
  const resolvedSearch = search ?? (
    typeof window !== 'undefined' && typeof window.location?.search === 'string'
      ? window.location.search
      : ''
  );
  return new URLSearchParams(resolvedSearch).get(QA_QUERY_PARAM) === QA_QUERY_VALUE;
};
