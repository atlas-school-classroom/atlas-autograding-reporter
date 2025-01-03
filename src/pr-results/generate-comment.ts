import { context } from "@actions/github";

import { getActionUrl } from "./get-action-url";
import { getReportTag, getSha } from "./util";
import { getBody } from "./get-body";
import { Input } from "../types";
import { getCommitUrl } from "./get-commit-url";

const template = `
{{ tag }}

## {{ title }}

{{ body }}

<p>Report generated by <a href="{{ actionUrl }}">atlas-autograding-reporter</a> from <a href="{{ commitUrl }}">{{ sha }}</a></p>
`;

/**
 * Generates the body of the comment left on PR
 */
export async function generateComment(runnerResults: Input, prNumber?: number) {
  const actionUrl = (await getActionUrl()) ?? "";

  const report = insertArgs(template, {
    tag: getReportTag(prNumber?.toString() ?? ""),
    commitUrl: getCommitUrl(),
    sha: getSha().substr(0, 7),
    actionUrl: actionUrl,
    runId: context.runId,
    owner: context.repo.owner,
    repo: context.repo.repo,
    title: context.workflow,
    body: getBody(runnerResults),
  });

  return report;
}

const insertArgs = (
  text: string,
  args: Record<string, string | number | undefined>
) => {
  Object.keys(args).forEach(
    (argName) =>
      args[argName] !== undefined &&
      args[argName] !== null &&
      (text = text.replace(`{{ ${argName} }}`, args[argName] as string))
  );
  return text;
};
