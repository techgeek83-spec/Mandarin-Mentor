# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.1.5](https://github.com/techgeek83-spec/Mandarin-Mentor/compare/v0.1.4...v0.1.5) (2026-08-28)

### Bug Fixes

* **api:** rebuild live stream endpoint and drop dead redis dependencies ([9ef4882](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/9ef4882972170e0dd1db0e6f589208ae26a33e49))
* **api:** strip dead redis rate limiter dependencies causing 4s tcp timeouts ([5cca353](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/5cca3536d92fc6ca82dabb2bce05eeacdbbe03a1))
* **api:** strip LLM html tags for regex ast compatibility and enforce sse network flush ([e9d70be](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/e9d70be7d7a606c49b536d2a31600e97aee911a1))
* **frontend:** harden reactmarkdown ast hanzi extraction for custom tts nodes ([2d63ff1](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/2d63ff1aa1cf3f06c956894f2b1f5d3f5861852d))
* **prompt:** implement contrastive syntax guards and frontend regex wrapper fallback ([f0bed2a](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/f0bed2adc8c156858c13b2525401db971578e30f))
* **prompt:** restore proven ast-injection system prompt with xml safety bounds ([b44fc4a](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/b44fc4aeeeb3ea203ff15d38e52779aa98450424))
## [0.1.4](///compare/v0.1.3...v0.1.4) (2026-08-28)

### Features

* **db:** integrate asyncpg connection pool into fastAPI asgi lifespan 860ec0d

### Bug Fixes

* **api:** restore missing StreamingResponse import for SSE chat endpoint 71feefd
* **db:** add connection string validation to prevent obscure driver crashes 23eb8da
* **db:** configure asyncpg ssl requirement and disable statement cache for supabase pooler e93be4b
* **db:** resolve syntax and indentation errors in database pool initializer 96ae1a3
## [0.1.3](///compare/v0.1.2...v0.1.3) (2026-08-28)
## [0.1.2](///compare/v0.1.1...v0.1.2) (2026-08-28)

### Features

* **gateway:** bind redis token-bucket rate limiter to chat, tts, and transcribe routes c431cc3
* **stt:** implement cross-platform webaudio pcm downsampler to bypass ios mediarecorder bugs 6a390f2

### Bug Fixes

* **gateway:** fail open with warning on redis connection failure during local dev 7b297e9
* **gateway:** resolve 422 pydantic validation error by refactoring rate limit dependencies 10bffbc
* **pwa:** correct service worker src path and migrate to scalable svg icon 8cc2bb9
* **security:** scrub env secrets and bytecode from index ec13132
* **stt:** hoist audiocontext instantiation to bypass ios safari synchronous gesture lock f6b191e
* **tts:** isolate edge-tts exception scope to guarantee fallback execution afefc2b
* **tts:** upgrade edge-tts error handling and add voice synthesis fallback 0e984a6
## 0.1.1 (2026-08-27)

### Features

* **docs:** setup automated release and changelog tooling e051dc5
