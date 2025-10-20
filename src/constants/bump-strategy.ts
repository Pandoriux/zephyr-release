export const DEFAULT_MAJOR_BUMP_STRATEGY = {
  types: ["!"],
  commitsPerBump: 1,
};

export const DEFAULT_MINOR_BUMP_STRATEGY = {
  types: ["feat"],
  commitsPerBump: 1,
};

export const DEFAULT_PATCH_BUMP_STRATEGY = {
  types: ["fix", "perf"],
  commitsPerBump: 1,
};

export const DEFAULT_PRERELEASE_BUMP_STRATEGY = {
  types: [],
  commitsPerBump: 1,
};

export const DEFAULT_BUILD_BUMP_STRATEGY = {
  types: [],
  commitsPerBump: 1,
};
