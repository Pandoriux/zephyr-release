import { Octokit } from "@octokit/action";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { paginateGraphQL } from "@octokit/plugin-paginate-graphql";
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";
import { taskLogger } from "../../tasks/logger.ts";

const OctokitInstance = Octokit.plugin(
  restEndpointMethods,
  paginateRest,
  paginateGraphQL,
  retry,
  throttling,
);

export function getOctokitClient(
  token: string,
): InstanceType<typeof OctokitInstance> {
  return new OctokitInstance({
    auth: token,
    request: {
      retries: 3,
      retryAfter: 2,
    },
    throttle: {
      onRateLimit: (retryAfter, options, _octokit, retryCount) => {
        taskLogger.debug(
          `Request quota exhausted for request ${options.method} ${options.url}. Expect to retry after ${retryAfter} seconds.`,
        );

        if (retryAfter > 120) {
          taskLogger.warn(
            `Rate limit wait time (${retryAfter}s) exceeds maximum (120s) for ${options.method} ${options.url}. Request will fail.`,
          );
          return false;
        }

        if (retryCount > 1) {
          taskLogger.warn(
            `Maximum retry attempts (1) exceeded for ${options.method} ${options.url}. Request will fail.`,
          );
          return false;
        }

        return true;
      },
      onSecondaryRateLimit: (retryAfter, options, _octokit, retryCount) => {
        taskLogger.debug(
          `Secondary rate limit hit for request ${options.method} ${options.url}. Expect to retry after ${retryAfter} seconds.`,
        );

        if (retryCount > 3) {
          taskLogger.warn(
            `Maximum secondary rate limit retry attempts (3) exceeded for ${options.method} ${options.url}. Request will fail.`,
          );
          return false;
        }

        return true;
      },
    },
  });
}
