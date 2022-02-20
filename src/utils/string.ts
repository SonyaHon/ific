export const unescapeString = (str: string): string => {
  return str
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\v/g, '\v')
    .replace(/\\"/g, '\"')
    .replace(/\\\\/g, '\\');
}
