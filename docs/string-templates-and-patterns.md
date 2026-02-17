# String Templates and Patterns

Documentation for working with string templates and string patterns.

To inject values into your templates, put [patterns](#available-string-patterns) inside `{{ }}` brackets. You can also transform these values using  [transformers](#transformers) with the pipe symbol `|`.

Example:

- [Pr title template](./config-options.md#pull--title-template-optional): `chore: release {{ name | upper }} version {{version}}`
- [Tag template](./config-options.md#release--tag-name-template-optional): `v{{version}}`

<br/>

Under the hood, Zephyr Release uses **LiquidJS** as the template engine. For more advanced usages, refer to the [LiquidJS official documentation](https://liquidjs.com/tutorials/intro-to-liquid.html).

Zephyr Release engine options

```typescript
export const liquidEngine = new Liquid({ jsTruthy: true });
```

## Available String Patterns

### Fixed String Patterns  

These string patterns are resolved at runtime and remain fixed for the lifetime of the process.

#### Base

- `{{ name }}`: Project name (set via [name](./config-options.md#name-optional))
- `{{ host }}`: Repository host
- `{{ namespace }}`: Repository namespace (organization or user)
- `{{ repository }}`: Repository name
- `{{ commitPathPart }}`: the commit part of the url
- `{{ referencePathPart }}`: the reference part of the url

<br/>

- `{{ timeZone }}`: IANA time zone (set via [time-zone](./config-options.md#time-zone-optional))
- `{{ timestamp }}`: Timestamp, always UTC
- `{{ YYYY }}`, `{{ MM }}`, `{{ DD }}`, `{{ HH }}`, `{{ mm }}`, `{{ ss }}` — date/time components

#### Version (and tag)

- `{{ version }}`: The calculated next full semantic version (SemVer)
- `{{ versionCore }}`: The calculated next core part of the semantic version (major.minor.patch)
- `{{ versionPre }}`: The calculated next prerelease identifier of the semantic version
- `{{ versionBld }}`: The calculated next build metadata of the semantic version

<br/>

- `{{ tagName }}`: Tag name (set via [tag-name-template](./config-options.md#release--tag-name-template-optional))

#### Previous Version

- `{{ previousVersion }}`: The previous full semantic version (SemVer)
- `{{ previousVersionCore }}`: The previous core part of the semantic version (major.minor.patch)
- `{{ previousVersionPre }}`: The previous prerelease identifier of the semantic version
- `{{ previousVersionBld }}`: The previous build metadata of the semantic version

> Only available in "propose" operation. Can be undefined if the project has no version yet (calculated next version is initial version)

### Dynamic String Patterns

These string patterns are resolved dynamically at runtime and may change each time they are used.

#### Changelog

- `{{ changelogRelease }}`: In `propose` operation (managing pull request), the generated changelog content section is [release header](./config-options.md#changelog--release-header-template-optional) + body + release footer. In `release` operation (create tag and publish release), the value is the **pull request body** (this means any edits made to the pull request body will also be included)

- `{{ changelogReleaseBody }}`: The generated changelog release body. You can override it dynamically via [release-body-override](./config-options.md#changelog--release-body-override-optional) (or [release-body-override-path](./config-options.md#changelog--release-body-override-path-optional)).

### Special String Patterns

These are special patterns that are only available to certain templates. Make sure to check the template description to see which templates explicitly support these patterns.

#### Commit/Changelog Entries

Usage: [release-section-entry-template](./config-options.md#changelog--release-section-entry-template-optional)

- `{{ hash }}`: string
- `{{ type }}`: string
- `{{ scope }}`: string
- `{{ desc }}`: string
- `{{ body }}`: string
- `{{ footer }}`: string
- `{{ isBreaking }}`: boolean

## Transformers

Transformers modify or transform the values of string patterns using the pipe symbol `|`. You can apply transformers to format, manipulate, or process pattern values in your templates.

Usage: `{{ <value> | <transformers>: <arg1>, <arg2>, ...  }}`

### Zephyr Release Transformers

Our custom transformers.

- `md_link_compare_tag: tag1, tag2`: Wraps the current text in a markdown link that compares `tag1` with `tag2`
  - tag1: `string`
  - tag2: `string`

- `md_link_compare_tag_from_current_to_latest: skip`: Wraps the current text in a markdown link comparing the current tag to the latest tag.  
  - skip (optional): `positive integer`, `DEFAULT: 0`  
  how many tags back from the latest tag to compare against (`0` = latest tag, `1` = tag before the latest, etc.)

### LiquidJS built-in Transformers

As mentioned above, Zephyr Release uses LiquidJS under the hood. Therefore there are also built-in transformers (called **filters** in LiquidJS) you can use directly in templates.

Below are some commonly used built-in transformers:

- `slice(start, length)`: extract a substring  
  Usage: `{{ someString | slice: 0, 5 }}` → first 5 characters

- `upcase` / `downcase`: convert text to upper / lower case  
  Usage: `{{ name | upcase }}`

- `truncate(length, ellipsis)`: shorten long text and append an ellipsis (optional)  
  Usage: `{{ description | truncate: 30, "…" }}`

- `default(value)`: fallback value if the input is empty or nil  
  Usage: `{{ nickname | default: "n/a" }}`

- `date(format)`: format a date/time value  
  Usage: `{{ publishedAt | date: "%Y-%m-%d" }}`

- `replace(search, replace)` / `replace_first(search, replace)`: replace occurrences of a substring  
  Usage: `{{ text | replace: "foo", "bar" }}`

- `strip` / `strip_html`: remove surrounding whitespace or strip HTML tags  
  Usage: `{{ htmlContent | strip_html | strip }}`

- `json`: serialize a value as JSON (useful for debugging or embedding structured data)  
  Usage: `{{ obj | json }}`

- `join(separator)`: join array items into a string  
  Usage: `{{ items | join: ", " }}`

These built-in transformers cover many common needs. For the full list and syntax details, see: <https://liquidjs.com/filters/overview.html>.
