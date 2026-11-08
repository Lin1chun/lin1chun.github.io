# Security Policy

## Supported versions

Security fixes are applied to the current `main` branch and the latest tagged
release. Older snapshots may remain useful for rollback but are not actively
supported.

## Reporting a vulnerability

Report vulnerabilities privately through GitHub Security Advisories:

<https://github.com/Lin1chun/lin1chun.github.io/security/advisories/new>

Do not open a public issue containing credentials, personal data, or an
exploitable proof of concept. Include:

- the affected URL, commit, or dependency;
- reproduction steps and expected impact;
- any relevant browser or runtime information;
- a suggested mitigation when one is available.

## Repository protections

- Pull requests run the repository verification workflow.
- Dependabot monitors npm, GitHub Actions, and the pinned theme submodule.
- Deployment is restricted to the production `main` branch.
- Third-party licenses and asset restrictions are listed in
  [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
