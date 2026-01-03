# String Patterns

Available string patterns (like `${version}`) that can be used in string templates (like `"version-${version}"`) within various configuration fields.

**Terminology:**
- **String pattern**: A placeholder like `${version}` or `${name}` that gets replaced with a value.
- **String template**: A complete string like `"version-${version}"` or `"Release ${tagName}"` that contains one or more string patterns.

For more information about configuration options, see [Configuration Options](./config-options.md).

## User-defined

These string patterns are resolved based on user configuration.

- `${name}`: Project name [[→ name](./config-options.md#name-optional)].
- `${timeZone}`: IANA time zone [[→ time-zone](./config-options.md#time-zone-optional)].

<br/>

- `${tagName}`: Tag name [[→ tag-name-template](./config-options.md#release--tag-name-template-optional)].

## Operation-defined

These string patterns are resolved based on where or how the operation is run.

- `${namespace}`: Repository namespace (organization or user).
- `${repository}`: Repository name.

<br/>

- `${YYYY-MM-DD}`: Full date in ISO format (e.g., `2025-10-21`).
- `${DD-MM-YYYY}`: Full date in day-first format (e.g., `21-10-2025`).
- `${YYYY}`: Four-digit year (e.g., `2025`).
- `${MM}`: Two-digit month (01–12).
- `${DD}`: Two-digit day of the month (01–31).
- `${HH:mm:ss}`: Full time in 24-hour format (e.g., `14:37:05`).
- `${HH}`: Two-digit hour in 24-hour format (00–23).
- `${mm}`: Two-digit minute (00–59).
- `${ss}`: Two-digit second (00–59).

<br/>

- `${version}`: The full semantic version (SemVer) number.
- `${versionPri}`: The primary part of the semantic version (major.minor.patch).
- `${versionPre}`: The prerelease identifier of the semantic version.
- `${versionBld}`: The build metadata of the semantic version.

<br/>

- `${changelogContent}`: The generated changelog content section (→ [heading](./config-options.md#changelog--heading-template-optional) + [body](./config-options.md#changelog--body-template-optional)).
- `${changelogContentBody}`: The generated changelog body. You can override it with your own computed content [[→ content-body-override](./config-options.md#changelog--content-body-override-optional)].

<br/>

- `${<key>:mdLink(compare=tagPrev,prev=<N>)}`: Wraps the resolved `${key}` as a markdown-formatted GitHub compare link from the previous tag to the current tag.  
\- `<key>` must be either a string pattern name (e.g. `tagName`) or a quoted literal label (`"Release v1.0"`).  
\- `<N>` is a positive integer, default `1`.

  - **Quoted literal:** `${"Release v1.0":mdLink(compare=tagPrev,prev=1)}` uses the literal text as the link label.  
    Resolved to `[Release v1.0](https://github.com/<namespace>/<repository>/compare/<previous-1-tag>...<current-tag>)`.  
  - **Unquoted (string pattern):** `${tagName:mdLink(compare=tagPrev,prev=1)}` resolves the `tagName` string pattern from context.  
    Resolved to `[v2.0.0](https://github.com/<namespace>/<repository>/compare/<previous-1-tag>...v2.0.0)`.  
  - If a compare URL cannot be constructed:  
    \- If the string pattern cannot be resolved → returns an empty string.  
    \- If the tag or repository data cannot be found → returns plain text (without Markdown link formatting) instead of a broken link.

