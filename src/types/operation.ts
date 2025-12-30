export interface Operation { // for future use, ignore for now
  target: "prepare" | "release";
  jobs: ("create-pr" | "update-pr" | "create-release")[];
}
