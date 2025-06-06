import * as clc from "colorette";

import { ensure } from "../../ensureApiEnabled";
import { FirebaseError, isBillingError } from "../../error";
import { logLabeledBullet, logLabeledSuccess } from "../../utils";
import { checkServiceAgentRole, ensureServiceAgentRole } from "../../gcp/secretManager";
import { getProject, ProjectInfo } from "../../management/projects";
import { assertExhaustive } from "../../functional";
import { cloudbuildOrigin } from "../../api";
import * as backend from "./backend";
import { getDefaultServiceAccount } from "../../gcp/computeEngine";

const FAQ_URL = "https://firebase.google.com/support/faq#functions-runtime";

const metadataCallCache: Map<string, Promise<ProjectInfo>> = new Map();

/**
 *  By default:
 *    1. GCFv1 uses App Engine default service account.
 *    2. GCFv2 (Cloud Run) uses Compute Engine default service account.
 */
export async function defaultServiceAccount(e: backend.Endpoint): Promise<string> {
  let metadataCall = metadataCallCache.get(e.project);
  if (!metadataCall) {
    metadataCall = getProject(e.project);
    metadataCallCache.set(e.project, metadataCall);
  }
  const metadata = await metadataCall;
  if (e.platform === "gcfv1") {
    return `${metadata.projectId}@appspot.gserviceaccount.com`;
  } else if (e.platform === "gcfv2") {
    return await getDefaultServiceAccount(metadata.projectNumber);
  }
  assertExhaustive(e.platform);
}

function nodeBillingError(projectId: string): FirebaseError {
  return new FirebaseError(
    `Cloud Functions deployment requires the pay-as-you-go (Blaze) billing plan. To upgrade your project, visit the following URL:

https://console.firebase.google.com/project/${projectId}/usage/details

For additional information about this requirement, see Firebase FAQs:

${FAQ_URL}`,
    { exit: 1 },
  );
}

function nodePermissionError(projectId: string): FirebaseError {
  return new FirebaseError(`Cloud Functions deployment requires the Cloud Build API to be enabled. The current credentials do not have permission to enable APIs for project ${clc.bold(
    projectId,
  )}.

Please ask a project owner to visit the following URL to enable Cloud Build:

https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=${projectId}

For additional information about this requirement, see Firebase FAQs:
${FAQ_URL}
`);
}

function isPermissionError(e: { context?: { body?: { error?: { status?: string } } } }): boolean {
  return e.context?.body?.error?.status === "PERMISSION_DENIED";
}

/**
 * Checks for various warnings and API enablements needed based on the runtime
 * of the deployed functions.
 *
 * @param projectId Project ID upon which to check enablement.
 */
export async function cloudBuildEnabled(projectId: string): Promise<void> {
  try {
    await ensure(projectId, cloudbuildOrigin(), "functions");
  } catch (e: any) {
    if (isBillingError(e)) {
      throw nodeBillingError(projectId);
    } else if (isPermissionError(e)) {
      throw nodePermissionError(projectId);
    }

    throw e;
  }
}

/**
 * Returns a mapping of all secrets declared in a stack to the bound service accounts.
 */
async function secretsToServiceAccounts(b: backend.Backend): Promise<Record<string, Set<string>>> {
  const secretsToSa: Record<string, Set<string>> = {};
  for (const e of backend.allEndpoints(b)) {
    // BUG BUG BUG? Test whether we've resolved e.serviceAccount to be project-relative
    // by this point.
    const sa = e.serviceAccount || ((await module.exports.defaultServiceAccount(e)) as string);
    for (const s of e.secretEnvironmentVariables || []) {
      const serviceAccounts = secretsToSa[s.secret] || new Set();
      serviceAccounts.add(sa);
      secretsToSa[s.secret] = serviceAccounts;
    }
  }
  return secretsToSa;
}

/**
 * Ensures that runtime service account has access to the secrets.
 *
 * To avoid making more than one simultaneous call to setIamPolicy calls per secret, the function batches all
 * service account that requires access to it.
 */
export async function secretAccess(
  projectId: string,
  wantBackend: backend.Backend,
  haveBackend: backend.Backend,
  dryRun?: boolean,
) {
  const ensureAccess = async (secret: string, serviceAccounts: string[]) => {
    logLabeledBullet(
      "functions",
      `ensuring ${clc.bold(serviceAccounts.join(", "))} access to secret ${clc.bold(secret)}.`,
    );
    if (dryRun) {
      const check = await checkServiceAgentRole(
        { name: secret, projectId },
        serviceAccounts,
        "roles/secretmanager.secretAccessor",
      );
      if (check.length) {
        logLabeledBullet(
          "functions",
          `On your next deploy, ${clc.bold(serviceAccounts.join(", "))} will be granted access to secret ${clc.bold(secret)}.`,
        );
      }
    } else {
      await ensureServiceAgentRole(
        { name: secret, projectId },
        serviceAccounts,
        "roles/secretmanager.secretAccessor",
      );
    }
    logLabeledSuccess(
      "functions",
      `ensured ${clc.bold(serviceAccounts.join(", "))} access to ${clc.bold(secret)}.`,
    );
  };

  const wantSecrets = await secretsToServiceAccounts(wantBackend);
  const haveSecrets = await secretsToServiceAccounts(haveBackend);

  // Remove secret/service account pairs that already exists to avoid unnecessary IAM calls.
  for (const [secret, serviceAccounts] of Object.entries(haveSecrets)) {
    for (const serviceAccount of serviceAccounts) {
      wantSecrets[secret]?.delete(serviceAccount);
    }
    if (wantSecrets[secret]?.size === 0) {
      delete wantSecrets[secret];
    }
  }

  const ensure = [];
  for (const [secret, serviceAccounts] of Object.entries(wantSecrets)) {
    ensure.push(ensureAccess(secret, Array.from(serviceAccounts)));
  }
  await Promise.all(ensure);
}
