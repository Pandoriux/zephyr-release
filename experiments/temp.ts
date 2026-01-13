import * as v from "@valibot/valibot";
import { CommitParser } from "conventional-commits-parser";

const msg = "feat: new feat";

const parser = new CommitParser();

const res = parser.parse(msg);

console.log(res);
