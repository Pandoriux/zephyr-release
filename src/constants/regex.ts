export const SEMVER_REGEX = new RegExp(
  "^"
    + "(0|[1-9]\\d*)\\." // major
    + "(0|[1-9]\\d*)\\." // minor
    + "(0|[1-9]\\d*)" // patch
    + "(?:-" // pre-release
    + "((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)"
    + "(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?"
    + "(?:\\+" // build metadata
    + "([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?"
    + "$",
);
