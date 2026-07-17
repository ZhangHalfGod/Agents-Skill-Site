# Agents

Standard governance roles. English playbooks: `docs/agents/standard/<Role>/`. Chinese SoT (MCP): `docs/zh/agents/standard/<Role>/`.

| # | Role | Summary | Status |
|:----:|------|------------|:----:|
| 1 | [ProductManager](/agents/standard/ProductManager/) | Scope boundaries, acceptance criteria, codegen range list, and red-record triggers | **ready** |
| 2 | [Architect](/agents/standard/Architect/) | Architecture constraints, interfaces and models, prompt architecture review | **ready** |
| 3 | [DevLead](/agents/standard/DevLead/) | Final prompts, small-batch generation, first-pass review and CR | **ready** |
| 4 | [TestEngineer](/agents/standard/TestEngineer/) | Test design and reports; release-gate evidence | **ready** |
| 5 | [SecurityEngineer](/agents/standard/SecurityEngineer/) | Security scanning, compliance, and remediation loop | **ready** |
| 6 | [OpsEngineer](/agents/standard/OpsEngineer/) | Version mapping, release, canary, and rollback | **ready** |
| 7 | [UIDesigner](/agents/standard/UIDesigner/) | UI specs, fidelity, and controlled asset generation | **ready** |
| 8 | [NmosEngineer](/agents/standard/NmosEngineer/) | NMOS IS-04/IS-05 checks, Registry injection verification, evidence freeze | **ready** |

In Cursor (English site): `@docs/agents/standard/<Role>/index.md`. MCP `source` still points at `docs/zh/...`.

<QuickJump />
