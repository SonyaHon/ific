// const println = Symbol();
// const str = Symbol();
// const defvar = Symbol();

import { parseStringAsTokens } from "./reader";

// /*

//   ific

//   (println (str 10 "some string"))

//   (console.log, </ (() => 10)() />)

//   (defvar pi 3.14)
//   (pritnln pi)

//   (import "fs")
  

// */

// const data = [println, [str, 10, "some string"]];

// const data2 = [defvar, Symbol(), 3.14];

// const global_env: Record<symbol, any> = {
//   [println]: console.log,
//   [str]: (...args: any) => args.join(),
//   [defvar]: (key: symbol, value: any) => {
//     global_env[key] = value;
//   },
// };

// (() => {

//   // (() => {
//   //   const pi = Symbol();
//   //   global_env[defvar](pi, 3.14);
//   //   global_env[println](global_env[pi]);
//   // })();

//   (() => {
//     global_env[println]( (() => 10)() );
//   })();
  
// })();


const data = `(println (str 10 69 "Some string
Literal"))`;

const tokens = parseStringAsTokens(data);

console.log(tokens);
