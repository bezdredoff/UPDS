import packageMetadata from '../package.json';

export const APP_VERSION = packageMetadata.version;
export const BUILD_LABEL = 'ANM-030A R1.1 · Full Game Asset Gap Audit';
export const BUILD_ID = typeof __UPDS_BUILD_ID__ === 'string' ? __UPDS_BUILD_ID__ : 'local';
export const BUILD_TIMESTAMP = typeof __UPDS_BUILD_TIMESTAMP__ === 'string' ? __UPDS_BUILD_TIMESTAMP__ : 'unknown';
