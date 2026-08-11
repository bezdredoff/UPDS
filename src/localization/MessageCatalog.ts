export type MessageValue = string | number | boolean;
export type MessageParams = Readonly<Record<string, MessageValue>>;
export type MessageCatalog = Readonly<Record<string, string>>;
export type LocaleCatalogs<LocaleName extends string = string> = Readonly<Partial<Record<LocaleName, MessageCatalog>>>;

const parameterPattern = /\{([a-zA-Z0-9_.-]+)\}/g;

export const formatMessage = (template: string, params: MessageParams = {}): string =>
  template.replace(parameterPattern, (token, name: string) => {
    const value = params[name];
    return value === undefined ? token : String(value);
  });
