# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### 1.14.1

## Changed

- Get user subscription type dynamically [(#118)](https://github.com/plotwist-app/plotwist-backend/pull/118)

### 1.14.0

## Added

- Improve collection search [(#117)](https://github.com/plotwist-app/plotwist-backend/pull/117)

### 1.13.2

- Add list progress endpoint [(#115)](https://github.com/plotwist-app/plotwist-backend/pull/115)

### Added

- Add hasBanner query param to get lists [(#114)](https://github.com/plotwist-app/plotwist-backend/pull/114)

## 1.12.7

### Changed

- Update deploy to use us-east-1 region [(#113)](https://github.com/plotwist-app/plotwist-backend/pull/113)

## 1.12.6

### Fixed

- Docker build [(#112)](https://github.com/plotwist-app/plotwist-backend/pull/112)
- Fix user items pagination [(#111)](https://github.com/plotwist-app/plotwist-backend/pull/111)

### Added

- Improve get user items service [(#109)](https://github.com/plotwist-app/plotwist-backend/pull/109)

## 1.12.5

### Fixed

- Fix user best reviews [(#107)](https://github.com/plotwist-app/plotwist-backend/pull/107)
- Add recommendations cron job [(#105)](https://github.com/plotwist-app/plotwist-backend/pull/105)

## 1.12.1

### Fixed

- Fix search users [(#106)](https://github.com/plotwist-app/plotwist-backend/pull/106)

## 1.12.0

### Added

- Add search users by username endpoint [(#104)](https://github.com/plotwist-app/plotwist-backend/pull/104)

## 1.11.1

### Fixed

- Fix user network activities [(#103)](https://github.com/plotwist-app/plotwist-backend/pull/103)

## 1.11.0

### Fixed

- Filter characters that are voiced [(#102)](https://github.com/plotwist-app/plotwist-backend/pull/102)

## 1.10.4

- Make possible login with email or username [(#101)](https://github.com/plotwist-app/plotwist-backend/pull/101)
- Add user network activities [(#100)](https://github.com/plotwist-app/plotwist-backend/pull/100)

### Changed

- Filter characters that are voiced [(#102)](https://github.com/plotwist-app/plotwist-backend/pull/102)

## 1.10.4

### Fixed

- Fix user episode activity [(#99)](https://github.com/plotwist-app/plotwist-backend/pull/99)

## 1.10.3

### Fixed

- Fix user episode activity [(#95)](https://github.com/plotwist-app/plotwist-backend/pull/98)

## 1.10.2

### Added

- Add user activities delete service methods and tests [(#95)](https://github.com/plotwist-app/plotwist-backend/pull/95)

### Changed

- Moved user activities to controllers to respect SOLID principles [(#95)](https://github.com/plotwist-app/plotwist-backend/pull/95)

## 1.10.1

### Changed

- Add season and episode number to user activities [(#94)](https://github.com/plotwist-app/plotwist-backend/pull/94)
- Add season and episode number to reviews [(#94)](https://github.com/plotwist-app/plotwist-backend/pull/94)

## 1.10.0

### Changed

- Move third party services to adapters [(#90)](https://github.com/plotwist-app/plotwist-backend/pull/90)

### Added

- Add service to run in docker compose file too [(#88)](https://github.com/plotwist-app/plotwist-backend/pull/89)
- Add review summary [(#87)](https://github.com/plotwist-app/plotwist-backend/pull/87)
- Consume SQS messages [(#71)](https://github.com/plotwist-app/plotwist-backend/pull/71)

### Fixed

- Add missing consumer envs [(#92)](https://github.com/plotwist-app/plotwist-backend/pull/92)

## 1.9.0

### Added

- Add user preferences [(#86)](https://github.com/plotwist-app/plotwist-backend/pull/86)

## 1.8.7

### Changed

- Set TMDB cache to 30 days [(#85)](https://github.com/plotwist-app/plotwist-backend/pull/85)

## 1.8.6

### Changed

- Disable certs in prod [(#83)](https://github.com/plotwist-app/plotwist-backend/pull/83)

## 1.8.1

## Fixed

- pnpm lock file [(#82)](https://github.com/plotwist-app/plotwist-backend/pull/82)

## 1.8.0

### Added

- Added cert feature flag [(#81)](https://github.com/plotwist-app/plotwist-backend/pull/81)
- Add mtls [(#80)](https://github.com/plotwist-app/plotwist-backend/pull/80)
- Delete user activity route [(#79)](https://github.com/plotwist-app/plotwist-backend/pull/79)

## 1.7.5

### Changed

- Add cors [(#78)](https://github.com/plotwist-app/plotwist-backend/pull/78)

## 1.7.4

### Fixed

- Chore add missing deploy envs [(#77)](https://github.com/plotwist-app/plotwist-backend/pull/77)

## 1.7.1

### Changed

- Comment SQS startup in main file [(#76)](https://github.com/plotwist-app/plotwist-backend/pull/76)

## 1.7.0

### Added

- Send imports to SQS using Localstack for local developments [(#69)](https://github.com/plotwist-app/plotwist-backend/pull/69)
- Add metadata field to save raw import [(#72)](https://github.com/plotwist-app/plotwist-backend/pull/72)
- Get user items pagination [#73](https://github.com/plotwist-app/plotwist-backend/pull/73)

### Changed

- Update `get-user-by-username` query to handle capitalized usernames [#70](https://github.com/plotwist-app/plotwist-backend/pull/70)

## 1.5.5

- Remove docker cache from pulumi [(#68)](https://github.com/plotwist-app/plotwist-backend/pull/68)

## 1.5.0

### Added

- Save imported itens into DB [(#64)](https://github.com/plotwist-app/plotwist-backend/pull/64)
- Finished My anime list provider import [(#64)](https://github.com/plotwist-app/plotwist-backend/pull/64)
- Update and Get import services [(#64)](https://github.com/plotwist-app/plotwist-backend/pull/64)
- Update List item position endpoint [(#61)](https://github.com/plotwist-app/plotwist-backend/pull/61)

## 1.4.0

- Add droppped user item status ([#66])(https://github.com/plotwist-app/plotwist-backend/pull/66)
- Add user activities [#62](https://github.com/plotwist-app/plotwist-backend/pull/62)
- Add update list item position endpoint [(#61)](https://github.com/plotwist-app/plotwist-backend/pull/61)

## 1.3.0

### Added

- AWS SQS setup [(#57)](https://github.com/plotwist-app/plotwist-backend/pull/57)
- Add followers endpoints [(#58)](https://github.com/plotwist-app/plotwist-backend/pull/58/)

### Changed

- Organized project envs to use as config in the project [(#57)](https://github.com/plotwist-app/plotwist-backend/pull/57)

## 1.2.2

### Fixed

- Ci file not pushing to AWS [(#55)](https://github.com/plotwist-app/plotwist-backend/pull/52/)

### 1.2.0

### Added

- Infra in AWS with pulumi [(#52)](https://github.com/plotwist-app/plotwist-backend/pull/52/)
- Adds endpoint to create image [(#54)](https://github.com/plotwist-app/plotwist-backend/pull/54/)
- Adds case-insensitive indexes to user email and username [(#53)](https://github.com/plotwist-app/plotwist-backend/pull/53/)
- Add user best reviews and items status [(#50)](https://github.com/plotwist-app/plotwist-backend/pull/51/)
- Add user watched countries stats [(#49)](https://github.com/plotwist-app/plotwist-backend/pull/49)
- Add user reviews count and vitest coverage [(#47)](https://github.com/plotwist-app/plotwist-backend/pull/47)
- Add simple user stats (watched items total and following/followers total) [(#43)](https://github.com/plotwist-app/plotwist-backend/pull/43)
- Add likeCount and userLike in select list by id [(#42)](https://github.com/plotwist-app/plotwist-backend/pull/42)
- Add operations for like [(#40)](https://github.com/plotwist-app/plotwist-backend/pull/40)
- Add operations for user episodes. [(#39)](https://github.com/plotwist-app/plotwist-backend/pull/39)
- Add CRUD operations for social links. [(#37)](https://github.com/plotwist-app/plotwist-backend/pull/37)
- Add CRUD operations for Review Replies. [(#28)](https://github.com/plotwist-app/plotwist-backend/pull/28)

### Changed

- Set CORS to use env variable [(#42)](https://github.com/plotwist-app/plotwist-backend/pull/42)
- Do not show swagger in production environment [(#42)](https://github.com/plotwist-app/plotwist-backend/pull/42)
- Format files with BiomeJs. [(#28)](https://github.com/plotwist-app/plotwist-backend/pull/28)

## 1.0.0

### Added

- Create unique endpoint de update user public information. [(#35)](https://github.com/plotwist-app/plotwist-backend/pull/35)
- Create legacy user login flow. [(#34)](https://github.com/plotwist-app/plotwist-backend/pull/34)
- Create GET detailed reviews route. [(#33)](https://github.com/plotwist-app/plotwist-backend/pull/33)
- Create reviews POST, GET, PUT and DELETE routes. [(#32)](https://github.com/plotwist-app/plotwist-backend/pull/32)
- Create `is_legacy` field in database [(#31)](https://github.com/plotwist-app/plotwist-backend/pull/31)
- Create subscription webhook [(#27)](https://github.com/plotwist-app/plotwist-backend/pull/27)
- Create list items create, read, update and delete endpoints [(#26)](https://github.com/plotwist-app/plotwist-backend/pull/26)
- Create get list endpoint [(#22)](https://github.com/plotwist-app/plotwist-backend/pull/22)
- Create edit list endpoint [(#21)](https://github.com/plotwist-app/plotwist-backend/pull/21)
- Create delete list endpoint [(#20)](https://github.com/plotwist-app/plotwist-backend/pull/20)
- Create reviews endpoint [(#19)](https://github.com/plotwist-app/plotwist-backend/pull/19)

### Changed

- Changed createdAt field convention name in database only [(#30)](https://github.com/plotwist-app/plotwist-backend/pull/30)
- improve folders structure [(#24)](https://github.com/plotwist-app/plotwist-backend/pull/24)
- Move domain folder to src root [(#23)](https://github.com/plotwist-app/plotwist-backend/pull/23)
- Set some review fields on schema as required [(#19)](https://github.com/plotwist-app/plotwist-backend/pull/19)

## 0.1.0

### Added

- create and get lists endpoint [(#18)](https://github.com/plotwist-app/plotwist-backend/pull/18)
- health check endpoint [(#16)](https://github.com/plotwist-app/plotwist-backend/pull/16)

### Changed

- refactor service and routes [(#10)](https://github.com/plotwist-app/plotwist-backend/pull/10)
- split layers and create repositories and services [(#10)](https://github.com/plotwist-app/plotwist-backend/pull/10)
- improve Docker compose file to create dev and test databases [(#5)](https://github.com/plotwist-app/plotwist-backend/pull/5)
- improve Drizzle migrations [(#1)](https://github.com/plotwist-app/plotwist-backend/pull/1)
- init Drizzle migrations [(#1)](https://github.com/plotwist-app/plotwist-backend/pull/1)

### Added

- remove profiles table and change relations to users table [(#14)](https://github.com/plotwist-app/plotwist-backend/pull/14)
- added response schemas in login and users routes [(#13)](https://github.com/plotwist-app/plotwist-backend/pull/13)
- relations to users table and indexes [(#11)](https://github.com/plotwist-app/plotwist-backend/pull/11)
- check username and email route [(#9)](https://github.com/plotwist-app/plotwist-backend/pull/9)
- remove either and handle errors manually [(#8)](https://github.com/plotwist-app/plotwist-backend/pull/8)
- setup register user and login route [(fdb6c89)](https://github.com/plotwist-app/plotwist-backend/pull/7)
- add PR template File [(#4)](https://github.com/plotwist-app/plotwist-backend/pull/4)
- add changelog File [(#3)](https://github.com/plotwist-app/plotwist-backend/pull/3)
- remove unused stuffs [(#12e87f0)](https://github.com/plotwist-app/plotwist-backend/commit/12e87f05c6a7f804057535c373bb8788a7520459)
- add base schema relations for authentication entities [(#b2d5390)](https://github.com/plotwist-app/plotwist-backend/commit/b2d53907af46d5961329966642455f1b37922465)
- setup initial register review route [(#f31e178)](https://github.com/plotwist-app/plotwist-backend/commit/f31e1781f9dcf3a68b929f3761405c23cf192ffd)
- change vite file to vitest [(#252fd5f)](https://github.com/plotwist-app/plotwist-backend/commit/252fd5f7e2e02c7cfbe8ab2e14125f2cd8afaa56)
- init project base structure [(#21f7ae5)](https://github.com/plotwist-app/plotwist-backend/commit/21f7ae544d6057bbc42e8c68df5cfdae9c0273c9)

### Removed

- email and username from profiles schema [(#11)](https://github.com/plotwist-app/plotwist-backend/pull/11)
- we've removed an template/unused route[(#2)](https://github.com/plotwist-app/plotwist-backend/pull/2)
- template/unused route[(#2)](https://github.com/plotwist-app/plotwist-backend/pull/2)
