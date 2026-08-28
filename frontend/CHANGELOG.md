# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

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
