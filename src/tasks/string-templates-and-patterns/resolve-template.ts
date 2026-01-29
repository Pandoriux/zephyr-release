import { Liquid, type Template } from "liquidjs";
import { STRING_PATTERN_CONTEXT } from "./pattern-context.ts";

export const liquidEngine = new Liquid({ jsTruthy: true });

const PARSED_TEMPLATE_CACHE = new Map<string, Template[]>();

export async function resolveStringTemplateOrThrow(
  template: string,
  additionalContext?: Record<string, unknown>,
): Promise<string> {
  try {
    let parsedTemplate = PARSED_TEMPLATE_CACHE.get(template);

    if (!parsedTemplate) {
      parsedTemplate = liquidEngine.parse(template);
      PARSED_TEMPLATE_CACHE.set(template, parsedTemplate);
    }

    const renderedTemplate = await liquidEngine.render(
      parsedTemplate,
      additionalContext
        ? { ...STRING_PATTERN_CONTEXT, additionalContext }
        : STRING_PATTERN_CONTEXT,
    );

    if (typeof renderedTemplate !== "string") {
      throw new Error(
        `Resolved template is not a string. Received '${typeof renderedTemplate}'`,
      );
    }

    return renderedTemplate;
  } catch (error) {
    throw new Error(
      `'${resolveStringTemplateOrThrow.name}' error: failed to resolve string template '${template}'`,
      { cause: error },
    );
  }
}
