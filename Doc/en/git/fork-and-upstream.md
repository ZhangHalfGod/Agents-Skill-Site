# Fork and upstream guide (English)

**Language:** [English](fork-and-upstream.md) | [中文](../../git/fork-and-upstream.md)

## Quick path

1. Fork `ZhangHalfGod/Agents-Skill-Site` on GitHub  
2. Clone your fork  
3. `git remote add upstream https://github.com/ZhangHalfGod/Agents-Skill-Site.git`  
4. Customize `Code/code/docs/zh/**` (Chinese SoT) and/or English stubs under `docs/**`  
5. `cd Code/code && npm run generate`  
6. Sync: `git fetch upstream && git merge upstream/main`  

## Notes

- Governance body lives in this repo (no external `standards/` sync for daily work)  
- Prefer editing Chinese SoT under `docs/zh/**`; keep English stubs in sync when publishing externally  
- Full Chinese guide: [`../../git/fork-and-upstream.md`](../../git/fork-and-upstream.md)
