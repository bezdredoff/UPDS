declare const __UPDS_BUILD_ID__: string;
declare const __UPDS_BUILD_TIMESTAMP__: string;

declare module '*.md?raw' {
  const content: string;
  export default content;
}
