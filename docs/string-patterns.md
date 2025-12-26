# String Patterns

Available string patterns that can be used in various configuration fields.

For more information about configuration options, see [Configuration Options](./config-options.md).

## User-defined

These patterns are resolved based on user configuration.

- `${name}`: Project name [[→ name](./config-options.md#name-optional)].
- `${timeZone}`: IANA time zone [[→ time-zone](./config-options.md#time-zone-optional)].

<br/>

- `${tagName}`: Tag name [[→ tag-name-pattern](./config-options.md#release--tag-name-pattern-optional)].

## App-defined

These patterns are resolved based on the app code.

- `${repoOwner}`: GitHub repository owner (organization or user).
- `${repoName}`: GitHub repository name.

<br/>

- `${YYYY-MM-DD}`: Full date in ISO format (e.g., `2025-10-21`).
- `${DD-MM-YYYY}`: Full date in day-first format (e.g., `21-10-2025`).
- `${YYYY}`: Four-digit year (e.g., `2025`).
- `${MM}`: Two-digit month (01–12).
- `${DD}`: Two-digit day of the month (01–31).
- `${hh:mm:ss}`: Full time in 24-hour format (e.g., `14:37:05`).
- `${hh}`: Two-digit hour in 24-hour format (00–23).
- `${mm}`: Two-digit minute (00–59).
- `${ss}`: Two-digit second (00–59).

<br/>

- `${version}`: The full semantic version (SemVer) number.
- `${versionPri}`: The primary part of the semantic version (major.minor.patch).
- `${versionPre}`: The prerelease identifier of the semantic version.
- `${versionBld}`: The build metadata of the semantic version.

<br/>

- `${changelogContent}`: The generated changelog content section (→ [heading](./config-options.md#changelog--heading-pattern-optional) + [body](./config-options.md#changelog--body-pattern-optional)).
- `${changelogContentBody}`: The generated changelog body. You can override it with your own computed content [[→ content-body-override](./config-options.md#changelog--content-body-override-optional)].

<br/>

- `${<key>:mdLink(compare=tagPrev,prev=<N>)}`: Wraps the resolved `${key}` as a markdown-formatted GitHub compare link from the previous tag to the current tag.  
\- `<key>` must be either a pattern name (e.g. `tagName`) or a quoted literal label (`"Release v1.0"`).  
\- `<N>` is a positive integer, default `1`.

  - **Quoted literal:** `${"Release v1.0":mdLink(compare=tagPrev,prev=1)}` uses the literal text as the link label.  
    Resolved to `[Release v1.0](https://github.com/<owner>/<repo>/compare/<previous-1-tag>...<current-tag>)`.  
  - **Unquoted (pattern):** `${tagName:mdLink(compare=tagPrev,prev=1)}` resolves `tagName` from context.  
    Resolved to `[v2.0.0](https://github.com/<owner>/<repo>/compare/<previous-1-tag>...v2.0.0)`.  
  - If a compare URL cannot be constructed:  
    \- If the pattern cannot be resolved → returns an empty string.  
    \- If the tag or repository data cannot be found → returns plain text (without Markdown link formatting) instead of a broken link.

