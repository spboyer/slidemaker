### Dockerfile + Azure Container Apps Deployment with CI/CD
**Author:** McManus (Backend Dev / DevOps) · **Date:** 2026-02-10 · **Issue:** #43

#### Dockerfile Build Strategy

Multi-stage Docker build using `node:22-alpine`:
1. **deps** — `npm ci` installs production + dev dependencies (needed for build).
2. **build** — Copies `node_modules` from deps, runs `npm run build`. Next.js `output: "standalone"` produces a self-contained `server.js` with only the required `node_modules` subset (~100MB vs ~500MB full).
3. **runtime** — Copies only `standalone/`, `.next/static/`, and `public/`. Final image contains no source code, no dev dependencies, no build tooling.

Added `output: "standalone"` to `next.config.ts` — the only source code change. `.dockerignore` excludes `node_modules`, `.next`, `.git`, tests, docs, and env files from build context.

`docker-compose.yml` provided for local dev with `.env.local` injection and `presentations/` volume mount.

#### Azure Resources (Bicep IaC)

`infra/main.bicep` provisions:
- **Azure Container Registry (ACR)** — Basic SKU, admin disabled, pull via managed identity.
- **Azure Container App** — Runs the Docker image with HTTP ingress on port 3000, scales 0–3 replicas based on concurrent requests.
- **Container App Environment + Log Analytics Workspace** — Centralized logging.
- **Azure Storage Account + blob container** (`presentations`) — For production file persistence.
- **User-assigned Managed Identity** — Granted ACR Pull and Storage Blob Data Contributor roles.

All resource names use `uniqueString(resourceGroup().id)` to avoid collisions. Parameters: `location` (default: resource group location), `resourcePrefix` (default: `slidemaker`), `containerImage`.

`infra/main.bicepparam` provides sensible defaults (eastus2, slidemaker prefix).

#### CI/CD Pipeline Flow

`.github/workflows/deploy.yml` triggers on push to `master` or manual dispatch:

1. **build-and-push** job:
   - Checks out code
   - Azure Login via OIDC (federated credentials, no stored secrets)
   - Deploys/updates infrastructure via `azure/arm-deploy` with Bicep
   - Logs into ACR via `az acr login`
   - Builds Docker image tagged with commit SHA + `latest`
   - Pushes both tags to ACR

2. **deploy** job (depends on build-and-push):
   - Azure Login via OIDC
   - Deploys new image to Container App via `azure/container-apps-deploy-action`

#### Required GitHub Secrets

| Secret | Description | How to set |
|--------|-------------|------------|
| `AZURE_CLIENT_ID` | App registration client ID for OIDC | Create in Entra ID → App registrations; add federated credential for `repo:spboyer/slidemaker:ref:refs/heads/master` |
| `AZURE_TENANT_ID` | Entra ID tenant ID | Found in Entra ID → Overview |
| `AZURE_SUBSCRIPTION_ID` | Target Azure subscription ID | Found in Azure Portal → Subscriptions |

The app registration's service principal needs **Contributor** on the resource group (`slidemaker-rg`) and **AcrPush** on the container registry. Create the resource group before first deploy: `az group create -n slidemaker-rg -l eastus2`.

No API keys or tokens are stored in the pipeline — OIDC federated credentials provide zero-secret auth to Azure.
