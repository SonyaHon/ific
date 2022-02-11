import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';



yargs(hideBin(process.argv))
  .scriptName("ific")
  .usage('$0 <cmd> [args]')
  .command("compile", "Compile file ific file to javascript",
	   (yrgs) => yrgs
	     .positional("file", {type: "string", describe: "Entry file", required: true})
	     .option("output", {type: "string", alias: "o", describe: "Output file", required: true}),
	   async (argv) => { console.log("Compiling", argv) })
  .command("run", "Compile file to temporary location and run it immidiately",
	   (yrgs) => yrgs
	     .positional("file", {type: "string", describe: "Entry file", required: true}),
	   async (argv) => {console.log("Running", argv)})
  .command("repl", "Start a REPL",
	   (yrgs) => yrgs
	     .option("namespace", {type: "string", alias: "n", describe: "Load namepsace"}),
	   async (argv) => {console.log("Starting REPL", argv)})
  .help()
  .demandCommand()
  .parse();
