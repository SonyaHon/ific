import { writeFile } from 'fs-extra';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { compile } from './compiler';

yargs(hideBin(process.argv))
  .scriptName("ific")
  .usage('$0 <cmd> [args]')
  .command("compile <file>", "Compile file ific file to javascript",
    (yrgs) => yrgs
      .positional(
        "file",
        {
          type: "string",
          describe: "Entry file",
          required: true
        })
      .option(
        "output",
        {
          type: "string",
          alias: "o",
          describe: "Output file",
          required: true
        }),
    async (argv) => {
      console.log("Compliling...");
      const output = argv.output || "out.js";
      const label = `Compiling ${argv.file} into ${output} done. Time taken`;
      console.time(label)
      const compiledJS = await compile(argv.file as string);
      await writeFile(output, compiledJS);
      console.timeEnd(label)
    })
  .command("run", "Compile file to temporary location and run it immidiately",
    (yrgs) => yrgs
      .positional(
        "file",
        {
          type: "string",
          describe: "Entry file", required: true
        }),
    async (argv) => { console.log("Running", argv) })
  .command("repl", "Start a REPL",
    (yrgs) => yrgs
      .option(
        "namespace",
        {
          type: "string",
          alias: "n", describe: "Load namepsace"
        }),
    async (argv) => { console.log("Starting REPL", argv) })
  .help()
  .demandCommand()
  .parse();
