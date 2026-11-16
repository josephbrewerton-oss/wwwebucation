# Security Policy

## Supported Versions

St Joseph's Curriculum Portal is continuously deployed from `main` to GitHub Pages. Security patches and safeguarding updates are applied directly to the live production branch.

| Version / Branch | Supported          |
| ---------------- | ------------------ |
| `main` (Live)    | :white_check_mark: |
| Older snapshots  | :x:                |

## Zero-Egress Safeguarding Architecture

The St Joseph's Curriculum Portal is engineered as a zero-cloud-egress, client-side application:
- **Local Storage Only:** Student queries, answers, voice inputs, and progress records remain strictly inside the local browser sandbox (`IndexedDB` / Cache Storage) and never transit external servers.
- **On-Device AI & Deterministic Cartridges:** Where built-in browser AI (`LanguageModel`) is available, inference executes locally on the user's device and is constrained by deterministic S-expression AST rules.

## Reporting a Vulnerability

Please **do not** report security vulnerabilities or safeguarding concerns through public GitHub Issues, Discussions, or Pull Requests. Instead, report them privately:

1. **GitHub Private Vulnerability Reporting (Preferred):** Use the **"Report a vulnerability"** button under the **Security** tab of this repository.
2. **Direct Email:** If you cannot use GitHub's reporting tool, email **joseph.brewerton@gmail.com**.

### What to Include
- A clear description of the issue and potential safeguarding or security impact.
- Step-by-step reproduction instructions or a minimal proof of concept.
- Browser version, operating system, and hardware environment.

### Our Commitment
- We will acknowledge receipt of your report within **48 hours**.
- We will provide a triage update or remediation timeline within **7 business days**.
- Please allow us to deploy a fix before any public disclosure.
