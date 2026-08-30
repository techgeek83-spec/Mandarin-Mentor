# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.1.6](https://github.com/techgeek83-spec/Mandarin-Mentor/compare/v0.1.5...v0.1.6) (2026-08-30)

### Features

* **client:** implemented recursive ReactMarkdown AST interceptor for dynamic pinyin hydration and TTS injection ([bc3a6e4](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/bc3a6e4a1971c779130f318e5a850f11ed605386))
* **supabase:** implemented history read-path and client-side hydration for session recovery ([1eb3f37](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/1eb3f378cce5a957a8dd7e702afc4a48a8bd9309))
* **ui:** map markdown blockquotes to sentence tts players and isolate inline pills ([ff278c6](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/ff278c69906d878bcaf42f20a51451e978e6e9be))
* **ui:** restrict inline tts player mounting strictly to bold markdown ast tokens ([32bebff](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/32bebff4f855e2c01b942b57dd5d689e5d67751c))
* **ui:** split multi-line blockquotes into isolated block tts players ([b9bf4ba](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/b9bf4baba421a5fd396448ecd0c1ef3891671d5c))

### Bug Fixes

* **backend:** bind session reset route to dynamic client uuid via pydantic schema ([7a4805c](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/7a4805cf1ae8970e0b1f48f2199af2aa5c58bae7))
* **backend:** strip html tag instructions from llm system prompt to unblock client ast parser ([4920491](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/4920491046589907bf1ae3e181d026207951c79d))
* **core:** resolve fk violations in chat_store and implement token-aware regex for naked ruby tags ([fd3a753](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/fd3a753c8e5ba645b55f9d40a27f3b12bcefeec8))
* **prompt:** forbid english text wrapping in audio tags and target exact flash hallucination in contrastive example ([29d253c](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/29d253cd12743c4861e5d554de8c93c9407f012c))
* **prompt:** implement contrastive syntax guards and explicit tone ratios ([44d3bc9](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/44d3bc9efa5181f58a01c2c86857801aa186c04e))
* **settings:** clean up duplicate object literal keys in reset session fetch ([3f3288c](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/3f3288c357214daafb48cc8eb7017049f2431deb))
* **ui:** eliminate duplicate border wrappers on blockquote tts players ([00d621e](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/00d621e06891bf819ea955137992b78d879444a4))
* **ui:** implement ast recursion guard and strip internal strong token spacing to fix double bubble and pill fragmentation ([0b76ff6](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/0b76ff6f2c85af787f4dd27818b6a14b46de598a))
* **ui:** resolve react.cloneelement typescript strict mode violation in ast hydrator ([259e8d8](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/259e8d851886f9ba13ec2e572c8b21f144c3602a))
* **ui:** resolve typescript strict mode violation in ast hydrator and clean up rogue diff text ([c4bddb3](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/c4bddb3bae527582b94219dac72421df4b895e6b))
* **ui:** split raw blockquote text by newline to render independent sentence tts players ([8dfae5e](https://github.com/techgeek83-spec/Mandarin-Mentor/commit/8dfae5eff1f0b3ecad63503f4f543109c450e3e2))
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
