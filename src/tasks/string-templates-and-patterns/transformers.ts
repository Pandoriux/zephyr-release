import { liquidEngine } from "./resolve-template.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";

export async function registerTransformersToTemplateEngine(
  provider: PlatformProvider,
  token: string,
) {
  liquidEngine.registerFilter(
    "md_link_compare_tag",
    (txt, tag1, tag2) => `[${txt}](${provider.getCompareTagUrl(tag1, tag2)})`,
  );

  liquidEngine.registerFilter(
    "md_link_compare_tag_from_current_to_latest",
    (txt, skip) => `[${txt}]()`,
  );
}
