# SPM Report Deliverables (T1–T12)

## Files created

- `reports/spm/SPM_Report_T1-T12.md` — complete editable academic report.
- `reports/spm/diagrams/wbs.mmd`
- `reports/spm/diagrams/activity_network.mmd`
- `reports/spm/diagrams/gantt_schedule.mmd`
- `reports/spm/diagrams/risk_matrix.mmd`
- `reports/spm/diagrams/architecture_data_flow.mmd`
- `reports/spm/diagrams/monitoring_dashboard.mmd`

## Validation status

- Report includes all required sections (1–21) and all tutorial headings T1–T12.
- Critical-path schedule includes ES/EF/LS/LF/float calculations.
- Cross-tutorial assumption consistency maintained through shared assumptions table.
- Repository claims are grounded in inspected paths.
- No application source code, dependencies, or runtime behavior were changed.

## Assumption policy used

All uncertain values are explicitly labeled as:
- `[Repository-derived estimate]`
- `[Academic assumption]`
- `[Proposed plan]`

Verified code facts are labeled `[Verified repository fact]`.

## Known measurement limits

- Backend test execution data unavailable (`server/package.json` test script is placeholder/failing by design).
- Historical project effort/cost/defect metrics are unavailable from repository artifacts.
- Monitoring and EVM examples are therefore clearly hypothetical.

## Optional conversion commands (no dependency changes made)

If Pandoc is available in your environment:

```bash
pandoc reports/spm/SPM_Report_T1-T12.md -o reports/spm/SPM_Report_T1-T12.docx
pandoc reports/spm/SPM_Report_T1-T12.md -o reports/spm/SPM_Report_T1-T12.pdf
```

If Mermaid rendering is needed before export, use any Mermaid-compatible markdown renderer or pre-render diagrams to SVG/PNG and embed them in the final document.
