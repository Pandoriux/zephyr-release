# Changelog

## [0.9.0](https://github.com/Pandoriux/zephyr-release/compare/v0.8.0...v0.9.0) (2026-04-06)

### Features

- add signed tag support ([#32](https://github.com/Pandoriux/zephyr-release/issues/32)) ([b6fd10b](https://github.com/Pandoriux/zephyr-release/commit/b6fd10b759129d5b3de83441ac8512f9c959dc9c))
- auto-create changelog file if it does not exist ([#33](https://github.com/Pandoriux/zephyr-release/issues/33)) ([e0889b7](https://github.com/Pandoriux/zephyr-release/commit/e0889b7a9ddfcc9d2dc32ec95973e4366371a2f0))
- change default value for `DEFAULT_TAG_MESSAGE_TEMPLATE` ([a4dd31d](https://github.com/Pandoriux/zephyr-release/commit/a4dd31d7c0c0240bd0949ddb9a52a6a7be027564))
- handle git deletions and renames in prepare changes ([#34](https://github.com/Pandoriux/zephyr-release/issues/34)) ([87622c2](https://github.com/Pandoriux/zephyr-release/commit/87622c237b12445563b8085e37d98fc146983ace))
- prefer breaking change footer text in changelog generation ([#31](https://github.com/Pandoriux/zephyr-release/issues/31)) ([d57974d](https://github.com/Pandoriux/zephyr-release/commit/d57974dc4c1ab29bf81d0082034ae47721d65d27))
- rework exit behavior on non critical errors ([#29](https://github.com/Pandoriux/zephyr-release/issues/29)) ([ee6e6c6](https://github.com/Pandoriux/zephyr-release/commit/ee6e6c655ae94a6fe41a3dd7c33053e27fb22af8))
- synchronize pattern context and env vars after runtime override ([#30](https://github.com/Pandoriux/zephyr-release/issues/30)) ([ed19d09](https://github.com/Pandoriux/zephyr-release/commit/ed19d093b8a5c835cbb4ad7c96591e53bcbdf512))
- unify review labels into a single configuration object ([#28](https://github.com/Pandoriux/zephyr-release/issues/28)) ([d495a5f](https://github.com/Pandoriux/zephyr-release/commit/d495a5f9f776ad1b78975ccced251bad7083d9c8))

### Bug Fixes

- correct import path ([d92c5f3](https://github.com/Pandoriux/zephyr-release/commit/d92c5f314b1179ad7e5ee28cc74a46a59ab705ca))

## [0.8.0](https://github.com/Pandoriux/zephyr-release/compare/v0.7.0...v0.8.0) (2026-03-24)

### Features

- add safe exit when version is unchanged ([#26](https://github.com/Pandoriux/zephyr-release/issues/26)) ([01a544d](https://github.com/Pandoriux/zephyr-release/commit/01a544d86e3c1496eccebd439e698915fd540448))
- implement auto execution strategy ([#27](https://github.com/Pandoriux/zephyr-release/issues/27)) ([225b16c](https://github.com/Pandoriux/zephyr-release/commit/225b16cd7e1b1c14a8db62fb14454e7bd423fb7b))
- refactor config and core architecture ([#25](https://github.com/Pandoriux/zephyr-release/issues/25)) ([7b5ee04](https://github.com/Pandoriux/zephyr-release/commit/7b5ee04746a50c51b2c7725aa546ba744beefd2f))

## [0.7.0](https://github.com/Pandoriux/zephyr-release/compare/v0.6.0...v0.7.0) (2026-02-28)

### Features

- add format commit ref transformer ([#22](https://github.com/Pandoriux/zephyr-release/issues/22)) ([284fe0f](https://github.com/Pandoriux/zephyr-release/commit/284fe0f9ff0219fcb2424953f23eaa376a7d550e))
- add runtime config override support ([#24](https://github.com/Pandoriux/zephyr-release/issues/24)) ([13d8304](https://github.com/Pandoriux/zephyr-release/commit/13d8304834431f90b9735ff612a2fb1eb7360ef5))
- add update PR labels after release ([#23](https://github.com/Pandoriux/zephyr-release/issues/23)) ([746d7eb](https://github.com/Pandoriux/zephyr-release/commit/746d7ebbd509c83bb87c9635f9929c27e1ebcf7d))
- remove manage concurrency ([#21](https://github.com/Pandoriux/zephyr-release/issues/21)) ([ab96dc3](https://github.com/Pandoriux/zephyr-release/commit/ab96dc31c9c785c7322a254d5a6e0e1b833893d3))

## [0.6.0](https://github.com/Pandoriux/zephyr-release/compare/v0.5.0...v0.6.0) (2026-02-22)

### Features

- add multi cases support for config ([#18](https://github.com/Pandoriux/zephyr-release/issues/18)) ([c6aad3e](https://github.com/Pandoriux/zephyr-release/commit/c6aad3e2d3d579c4575f1d5f8396d255378c0878))
- add resolve commit limit support ([#17](https://github.com/Pandoriux/zephyr-release/issues/17)) ([a5f72d0](https://github.com/Pandoriux/zephyr-release/commit/a5f72d0d4139e0be79af3db35003921994314129))
- add upload release assets ([#20](https://github.com/Pandoriux/zephyr-release/issues/20)) ([433bd0b](https://github.com/Pandoriux/zephyr-release/commit/433bd0b61c594a66cc087d8eecf5149193f2d572))
- change inputs source mode keys from fixed to dynamic ([#19](https://github.com/Pandoriux/zephyr-release/issues/19)) ([b2d894c](https://github.com/Pandoriux/zephyr-release/commit/b2d894c3f99fe3d3e2573f4d4aac3095d9cc9d59))

## [0.5.0](https://github.com/Pandoriux/zephyr-release/compare/v0.4.0...v0.5.0) (2026-02-19)

### Features

- add create tag ([#14](https://github.com/Pandoriux/zephyr-release/issues/14)) ([2af4bdb](https://github.com/Pandoriux/zephyr-release/commit/2af4bdbeaf40c55364bbf5408dc65136a28aa870))
- add lightweight tag support ([#15](https://github.com/Pandoriux/zephyr-release/issues/15)) ([3d065f5](https://github.com/Pandoriux/zephyr-release/commit/3d065f5f888a4381a9062cd290045c5a7f9c2abd))
- create release ([#16](https://github.com/Pandoriux/zephyr-release/issues/16)) ([fb945ad](https://github.com/Pandoriux/zephyr-release/commit/fb945ad610cccf0e9675e5fbe8f2585fb1ffd6cd))

### Bug Fixes

- prevent skipped releases when killing concurrent workflows ([#13](https://github.com/Pandoriux/zephyr-release/issues/13)) ([abc4363](https://github.com/Pandoriux/zephyr-release/commit/abc4363e839a7d8d548e2962a7c02607b94787d1))

## [0.4.0](https://github.com/Pandoriux/zephyr-release/compare/v0.3.0...v0.4.0) (2026-02-10)

### Features

- add generate changelog ([#11](https://github.com/Pandoriux/zephyr-release/issues/11)) ([bc0a901](https://github.com/Pandoriux/zephyr-release/commit/bc0a901208c3381b11dcd53943678dd7cea1b194))
- modify files and commit create pull request ([#12](https://github.com/Pandoriux/zephyr-release/issues/12)) ([9740ba5](https://github.com/Pandoriux/zephyr-release/commit/9740ba5b48df96a94a2db1a858f6398085d0a040))
- revamp string templates and patterns ([#10](https://github.com/Pandoriux/zephyr-release/issues/10)) ([d4dffc0](https://github.com/Pandoriux/zephyr-release/commit/d4dffc047b66bd4ee4dbbe32878fc12e3ceda420))

## [0.3.0](https://github.com/Pandoriux/zephyr-release/compare/v0.2.0...v0.3.0) (2026-01-23)

### Features

- add calculate next version ([#6](https://github.com/Pandoriux/zephyr-release/issues/6)) ([389d9d4](https://github.com/Pandoriux/zephyr-release/commit/389d9d4369fc3d803c3a497a14a311729182f764))
- add extract version ([#9](https://github.com/Pandoriux/zephyr-release/issues/9)) ([3134c55](https://github.com/Pandoriux/zephyr-release/commit/3134c55e84979fdfe23d16086d954b128333854b))
- add formatting to logger ([#5](https://github.com/Pandoriux/zephyr-release/issues/5)) ([758ad4d](https://github.com/Pandoriux/zephyr-release/commit/758ad4dc542444c321a66068a136cbd68a20299f))
- add run commands ([#3](https://github.com/Pandoriux/zephyr-release/issues/3)) ([8d301ab](https://github.com/Pandoriux/zephyr-release/commit/8d301aba84c08df4381c16f0ae142982d545e1c5))
- support manage concurrency ([#7](https://github.com/Pandoriux/zephyr-release/issues/7)) ([89e7cbd](https://github.com/Pandoriux/zephyr-release/commit/89e7cbdc49e60916ed15029d83f14f3268e8c97e))
- update config schema ([#2](https://github.com/Pandoriux/zephyr-release/issues/2)) ([f05a0b4](https://github.com/Pandoriux/zephyr-release/commit/f05a0b43f79393f701acf17e7fa04cee715feb33))

## [0.2.0](https://github.com/Pandoriux/zephyr-release/compare/v0.1.0...v0.2.0) (2025-12-24)

### Features

- add inputs handling ([#1](https://github.com/Pandoriux/zephyr-release/issues/1)) ([574534f](https://github.com/Pandoriux/zephyr-release/commit/574534f680b56161e8448b540033eb2390d443c6))

## 0.1.0 (2025-10-02)

### Features

- initial code ([10cfb2c](https://github.com/Pandoriux/zephyr-release/commit/10cfb2c8dec417de87de0a75ba997a0bb451148e))
