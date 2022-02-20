import { Keyword } from "./datatypes/keyword";
import { parseStringAsTokens, parseTokensAsData } from "./reader";

console.log(JSON.stringify([Symbol.for("some-crap"), 10]));

const input = `(println (str "Hello, World" " " 420))
({:some "value"} :some)`;

const tokens = parseStringAsTokens(input);

console.log("Tokens", tokens);

const data = parseTokensAsData(tokens);

console.log("Data", data);

const kw = new Keyword("somekw");
console.log( Object.keys({[kw as any]: 10, b: 20})  );
