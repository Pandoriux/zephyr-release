import core from "@actions/core";

function main() {
  try {
    const name = core.getInput("name", { required: true });

    core.info("We are special because we were born into this world.");
    core.info(`Don't you agree, ${name}?`);
    core.info("=======================================================");
    core.notice("Zephyr Release run successfully!");
  } catch (error) {
    core.setFailed("❌ An unexpected error occurred:\n" + error);
  }
}

main();
