import process from "node:process";
import * as core from "@actions/core";
import { logger } from "../src/tasks/logger.ts";
import {
  formatDebugMessage,
  formatIndentedMessage,
  formatStepMessage,
} from "../src/utils/formatters/log.ts";

// Ensure debug paths run in this experiment.
process.env.DEBUG = "true";

console.log(formatDebugMessage("formatDebugMessage(): yellow"));
console.log(formatStepMessage("formatStepMessage(): step\nsecond line"));
console.log(
  formatIndentedMessage("formatIndentedMessage(): indent\nsecond line"),
);
console.log("==============");

logger.info("info: hello");
logger.step("step: run something\nstep: second line");

logger.debug("debug: should be yellow\nanother debug line");
logger.debugWrap((debugLogger) => {
  debugLogger.startGroup("debugWrap group");
  debugLogger.info("debugWrap info line 1\nline 2");
  debugLogger.endGroup();
});

logger.startGroup("normal group");
logger.info("inside group");
logger.endGroup();
console.log("==============");

logger.indent.startGroup("indent group");
logger.indent.info("indent info line 1\nindent info line 2");
logger.indent.debug("indent debug line 1\nindent debug line 2");
logger.indent.debugWrap((debugLogger) => {
  debugLogger.startGroup("indent debugWrap group");
  debugLogger.info(
    "indent debugWrap info line 1\nindent debugWrap info line 2",
  );
  debugLogger.endGroup();
});
logger.indent.endGroup();

console.log("==============");
console.log("==============\n");

console.group("normal group");
console.info("inside group");
console.groupEnd();
