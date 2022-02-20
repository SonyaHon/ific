import { readFile } from 'fs-extra';
import { parseStringAsTokens, parseTokensAsData } from '../reader';
import { parseModule, Syntax } from 'esprima';
import { generate as generateJS } from 'escodegen';

export const complilteData = (data: unknown): string => {
  const code = parseModule("");
  code.body.push({
    type: Syntax.ExpressionStatement,
    expression: {
      type: Syntax.CallExpression,
      optional: false,
      callee: {
        type: Syntax.MemberExpression,
        computed: false,
        optional: false,
        object: {
          type: Syntax.Identifier,
          name: "console",
        },
        property: {
          type: Syntax.Identifier,
          name: "log"
        },
      },
      arguments: [
        {
          type: Syntax.Literal,
          value: "Hello, World",
        }
      ],
    },
  });
  return generateJS(code);
};

export const compile = async (targetpath: string) => {
  const fileContents = await readFile(targetpath, "utf-8");
  const tokens = parseStringAsTokens(fileContents);
  const data = parseTokensAsData(tokens);
  const js = complilteData(data);
  return js;
};
