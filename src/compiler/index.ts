import { readFile } from 'fs-extra';
import { parseStringAsTokens, parseTokensAsData } from '../reader';

export const compile = async (targetpath: string) => {
  const fileContents = await readFile(targetpath, "utf-8");
  const tokens = parseStringAsTokens(fileContents);
  const data = parseTokensAsData(tokens);
  console.log(JSON.stringify(data, null, 4));
  const js = "";
  return js;
};
