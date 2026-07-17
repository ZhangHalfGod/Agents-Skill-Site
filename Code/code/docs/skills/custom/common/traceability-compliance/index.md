---
title: "traceability-compliance"
description: "Traceability and compliance gates for merge and release"
---

# End-to-End Traceability & Compliance

AI-generated code must meet traceability, security compliance, and copyright compliance requirements.

## When to use

- When an agent commits AI-generated code
- When an agent releases AI-generated code to production

## Commit checklist

- [ ] Commit message includes: `[AI-generated] ModuleName-PromptVersion-VX.X`

## Pre-release checklist

- [ ] Security scan passed (no high-severity findings)
- [ ] Copyright / license check passed (no protocol conflicts)
- [ ] Test coverage ≥ 80%

## Traceability & compliance rules

- Retain Prompt version + code version + reviewer mapping for audit
- Do not generate malicious code or hard-code secrets
- Core / gateway / security / architecture changes must link the **Core Module AI Generation Red Record**

## Validation

Reject commit or release when traceability/compliance is incomplete; output a remediation list.

Missing Red Record for core or architecture code = traceability failure — reject commit/release.

## Related agents

- [Architect](/agents/standard/Architect/)
- [DevLead](/agents/standard/DevLead/)
- [TestEngineer](/agents/standard/TestEngineer/)
- [SecurityEngineer](/agents/standard/SecurityEngineer/)
- [OpsEngineer](/agents/standard/OpsEngineer/)

## Related roles (matrix reverse)

**Primary**

- [Architect](/agents/standard/Architect/)
- [DevLead](/agents/standard/DevLead/)
- [TestEngineer](/agents/standard/TestEngineer/)
- [SecurityEngineer](/agents/standard/SecurityEngineer/)
- [OpsEngineer](/agents/standard/OpsEngineer/)

**Recommended**

- [NmosEngineer](/agents/standard/NmosEngineer/)

## Use this skill in Cursor

1. `@` reference: `docs/skills/custom/common/traceability-compliance/index.md`
2. Or follow the checklist on this page (skill 2)

This site does not run model inference. MCP SoT remains under `docs/zh/...`.
