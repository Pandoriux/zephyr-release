import { liquidEngine } from "./resolve-template.ts";
import type { PlatformProvider } from "../../types/providers/platform-provider.ts";

export function registerTransformersToTemplateEngine(
  provider: PlatformProvider,
) {
  liquidEngine.registerFilter(
    "md_link_compare_tag",
    (txt, tag1, tag2) => `[${txt}](${provider.getCompareTagUrl(tag1, tag2)})`,
  );

  liquidEngine.registerFilter(
    "md_link_compare_tag_from_current_to_latest",
    async (txt, currentTag, skip = 0) => {
      const url = await provider.getCompareTagUrlFromCurrentToLatest(
        currentTag,
        skip,
      );
      return `[${txt}](${url})`;
    },
  );
}
