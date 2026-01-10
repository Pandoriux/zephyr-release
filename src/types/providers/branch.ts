/**
 * Represents a Git reference (branch) as returned by the GitHub API.
 * In Git, a branch is essentially a named pointer to a specific commit.
 */
export interface ProviderBranch {
  /** * The full git reference name.
   * @example "refs/heads/feature-login"
   */
  ref: string;

  /** * Global identifier used by GitHub's GraphQL API (v4).
   * Useful if you need to perform cross-API operations.
   */
  node_id: string;

  /** * The REST API endpoint URL for this specific reference.
   */
  url: string;

  /**
   * Information about the Git object that this branch points to.
   */
  object: {
    /** * The type of Git object. For branches, this is almost always "commit".
     */
    type: string;

    /** * The 40-character SHA-1 hash of the commit this branch is currently pointing to.
     */
    sha: string;

    /** * The REST API endpoint URL to fetch the full commit details for this SHA.
     */
    url: string;
  };
}
