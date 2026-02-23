import {
  githubGetHost,
  githubGetNamespace,
  githubGetReferencePathPart,
  githubGetRepositoryName,
} from "./repository.ts";
import { joinUrlSegments } from "../../utils/transformers/url.ts";

export function githubGetReferenceUrl(ref: string): string {
  const refId = ref.startsWith("#") ? ref.slice(1) : ref;

  return new URL(
    joinUrlSegments(
      githubGetNamespace(),
      githubGetRepositoryName(),
      githubGetReferencePathPart(),
      refId,
    ),
    githubGetHost(),
  ).href;
}
