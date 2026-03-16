# ConfigSchema — ASCII Tree

```text
ConfigSchema
│
│── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  (BaseConfigSchema spread)
│
├── name                                    : string?
├── timeZone                                : TimeZoneSchema (picklist of IANA zones), default "UTC"
├── mode                                    : enum(ExecutionModes) "review" | "auto", default "review"
│
├── commandHooks                            : CommandHooksSchema?, default {}
│   ├── base                                : CommandHookSchema?, default {}
│   │   ├── timeout                         : number | Infinity, default 60000
│   │   ├── continueOnError                 : boolean, default false
│   │   ├── pre                             : CommandSchema | CommandSchema[]?
│   │   │   └── (each CommandSchema)        : string | object
│   │   │       ├── cmd                     : string
│   │   │       ├── timeout                 : number | Infinity?
│   │   │       └── continueOnError         : boolean?
│   │   └── post                            : CommandSchema | CommandSchema[]?
│   │       └── (same as pre)
│   ├── prepare                             : CommandHookSchema?, default {}
│   │   └── (same as base)
│   └── publish                             : CommandHookSchema?, default {}
│       └── (same as base)
│
├── runtimeConfigOverride                   : RuntimeConfigOverrideSchema?
│   ├── path                                : string
│   └── format                              : enum(ConfigFileFormatsWithAuto), default "auto"
│
├── customStringPatterns                    : Record<string, unknown>?
│
├── initialVersion                          : string (semver regex), default "0.1.0"
│
├── versionFiles                            : VersionFileSchema | VersionFileSchema[] (nonEmpty)
│   └── (each VersionFileSchema)
│       ├── path                            : string
│       ├── format                          : enum(FileFormatsWithAuto), default "auto"
│       ├── extractor                       : enum(VersionFileExtractorsWithAuto), default "auto"
│       ├── selector                        : string
│       └── primary                         : boolean, default false
│
├── commitTypes                             : CommitTypeSchema[] (nonEmpty)?, default DEFAULT_COMMIT_TYPES
│   └── (each CommitTypeSchema)
│       ├── type                            : string (trimmed, lowercased)
│       ├── section                         : string?
│       └── hidden                          : boolean, default false
│
├── stopResolvingCommitAt                   : number | string?
│
├── allowedReleaseAsCommitTypes             : string | string[], default "<ALL>"
│
│── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  (end BaseConfigSchema)
│
├── bumpStrategy                            : BumpStrategyConfigSchema?, default {}
│   ├── major                               : BumpRuleCoreSchema, default DEFAULT_MAJOR_BUMP_STRATEGY
│   │   ├── types                           : string[] (nonEmpty)?
│   │   ├── countBreakingAs                 : enum(countBreakingAsOptions), default "none"
│   │   └── commitsPerBump                  : number | Infinity, default Infinity
│   ├── minor                               : BumpRuleCoreSchema, default DEFAULT_MINOR_BUMP_STRATEGY
│   │   └── (same as major)
│   ├── patch                               : BumpRuleCoreSchema, default DEFAULT_PATCH_BUMP_STRATEGY
│   │   └── (same as major)
│   ├── prerelease                          : BumpRuleExtensionSchema?, default {}
│   │   ├── enabled                         : boolean, default false
│   │   ├── override                        : (string | number)[] (nonEmpty)?  → string[]
│   │   ├── treatOverrideAsSignificant      : boolean, default false
│   │   └── extensions                      : SemverExtensionSchema[] (nonEmpty)?
│   │       └── (each SemverExtensionSchema — variant on "type")
│   │           ├── { type: "static" }
│   │           │   └── value               : string
│   │           ├── { type: "dynamic" }
│   │           │   ├── value               : string?
│   │           │   └── fallbackValue       : string?
│   │           ├── { type: "incremental" }
│   │           │   ├── initialValue        : number (safeInteger), default 0
│   │           │   └── resetOn             : enum | enum[], default "none"
│   │           ├── { type: "timestamp" }
│   │           │   └── unit                : "ms" | "s", default "ms"
│   │           └── { type: "date" }
│   │               ├── format              : "YYYYMMDD" | "YYYY-MM-DD", default "YYYYMMDD"
│   │               └── timeZone            : TimeZoneSchema?
│   ├── build                               : BumpRuleExtensionSchema?, default {}
│   │   └── (same as prerelease)
│   ├── bumpMinorForMajorPreStable          : boolean, default true
│   └── bumpPatchForMinorPreStable          : boolean, default false
│
├── changelog                               : ChangelogConfigSchema?, default {}
│   ├── writeToFile                         : boolean, default true
│   ├── path                                : string, default "CHANGELOG.md"
│   ├── fileHeaderTemplate                  : string, default DEFAULT_CHANGELOG_FILE_HEADER_TEMPLATE
│   ├── fileHeaderTemplatePath              : string?
│   ├── fileFooterTemplate                  : string?
│   ├── fileFooterTemplatePath              : string?
│   ├── releaseHeaderTemplate               : string (nonEmpty), default DEFAULT_CHANGELOG_RELEASE_HEADER_TEMPLATE
│   ├── releaseHeaderTemplatePath           : string?
│   ├── releaseSectionEntryTemplate         : string (nonEmpty), default DEFAULT_CHANGELOG_SECTION_ENTRY_TEMPLATE
│   ├── releaseSectionEntryTemplatePath     : string?
│   ├── releaseBreakingSectionHeading       : string, default "⚠ BREAKING CHANGES"
│   ├── releaseBreakingSectionEntryTemplate : string (nonEmpty)?
│   ├── releaseBreakingSectionEntryTemplatePath : string?
│   ├── releaseFooterTemplate               : string?
│   ├── releaseFooterTemplatePath           : string?
│   ├── releaseBodyOverride                 : string (nonEmpty)?
│   └── releaseBodyOverridePath             : string?
│
├── commit                                  : CommitConfigSchema?, default {}
│   ├── headerTemplate                      : string, default DEFAULT_COMMIT_HEADER_TEMPLATE
│   ├── headerTemplatePath                  : string?
│   ├── bodyTemplate                        : string?
│   ├── bodyTemplatePath                    : string?
│   ├── footerTemplate                      : string?
│   ├── footerTemplatePath                  : string?
│   └── localFilesToCommit                  : string | string[]?  → string[]?
│
├── pullRequest                             : PullRequestConfigSchema?, default {}
│   ├── branchNameTemplate                  : string, default "release/zephyr-release"
│   ├── label                               : CoreLabelSchema?, default {}
│   │   ├── onCreate                        : string | LabelSchema, default DEFAULT_LABEL_ON_CREATE
│   │   │   └── (resolved LabelSchema)
│   │   │       ├── name                    : string
│   │   │       ├── description             : string?
│   │   │       └── color                   : string (hexColor), default "#ededed"
│   │   └── onClose                         : string | LabelSchema, default DEFAULT_LABEL_ON_CLOSE
│   │       └── (same as onCreate)
│   ├── additionalLabel                     : AdditionalLabelSchema?, default {}
│   │   ├── onCreateAdd                     : string | string[]?  → string[]?
│   │   ├── onCloseAdd                      : string | string[]?  → string[]?
│   │   └── onCloseRemove                   : string | string[]?  → string[]?
│   ├── titleTemplate                       : string, default DEFAULT_PULL_REQUEST_TITLE_TEMPLATE
│   ├── titleTemplatePath                   : string?
│   ├── headerTemplate                      : string, default DEFAULT_PULL_REQUEST_HEADER_TEMPLATE
│   ├── headerTemplatePath                  : string?
│   ├── bodyTemplate                        : string, default DEFAULT_PULL_REQUEST_BODY_TEMPLATE
│   ├── bodyTemplatePath                    : string?
│   ├── footerTemplate                      : string, default DEFAULT_PULL_REQUEST_FOOTER_TEMPLATE
│   └── footerTemplatePath                  : string?
│
└── release                                 : ReleaseConfigSchema?, default {}
    ├── autoStrategy                        : AutoStrategySchema (variant on "type"), default DEFAULT_AUTO_RELEASE_STRATEGY
    │   ├── { type: "commit-types" }
    │   │   └── allowedTypes                : string | string[]?  → string[]?
    │   ├── { type: "commit-footer" }
    │   │   ├── token                       : string
    │   │   └── value                       : string?
    │   └── { type: "flag" }
    │       └── value                       : boolean, default false
    ├── createTag                            : boolean, default true
    ├── tagNameTemplate                      : string, default DEFAULT_TAG_NAME_TEMPLATE
    ├── tagType                              : enum(TagTypeOptions) "annotated" | "lightweight", default "annotated"
    ├── tagMessageTemplate                   : string, default DEFAULT_TAG_MESSAGE_TEMPLATE
    ├── tagMessageTemplatePath               : string?
    ├── tagger                               : TaggerSchema?
    │   ├── name                             : string
    │   ├── email                            : string (email)
    │   └── date                             : string? ("now" | "commit-date" | "author-date" | ISO 8601)
    ├── createReleaseNote                    : boolean, default true
    ├── prerelease                           : boolean, default false
    ├── draft                                : boolean, default false
    ├── setLatest                            : boolean, default true
    ├── titleTemplate                        : string, default DEFAULT_RELEASE_TITLE_TEMPLATE
    ├── titleTemplatePath                    : string?
    ├── bodyTemplate                         : string, default DEFAULT_RELEASE_BODY_TEMPLATE
    ├── bodyTemplatePath                     : string?
    └── assets                               : string | string[]?  → string[]?
```
