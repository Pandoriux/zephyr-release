import * as v from "@valibot/valibot";
import { CommandSchema } from "../src/schemas/configs/modules/components/command.ts";


console.log("no pipe " + v.getDefault(
    CommandSchema.options[1].entries.timeout,
  ))

 console.log("pipe " + v.getDefault(
    CommandSchema.options[1].entries.timeout.pipe[0],
  ))