/** Extracts PR from commit message and creates a GitHub Issue on Rollback of PR
  Created issue is assigned to original PR owner and reviewer.
  
  @param {!object}
    github enables querying for PR and also create issue using rest endpoint
    context has the commit message details in the payload
*/
module.exports = async ({github, context}) => {
  const rollback_commit = context.payload.head_commit.id;
  const pr_match_groups = context.payload.head_commit.message.match(/\Rollback of PR #(\d+).*/) || [];
  if (pr_match_groups.length != 2) {
    console.log(`PR Number not found in ${context.payload.head_commit.message}`);
    throw "Error extracting PR Number from commit message";
  }
  const pr_number = parseInt(pr_match_groups[1]);
  const owner = context.payload.repository.owner.name;
  const repo = context.payload.repository.name;
  console.log(`Original PR: ${pr_number} and Rollback Commit: ${rollback_commit}`);
  // Get the Original PR Details
  const pr_resp = await github.rest.pulls.get({
    owner,
    repo,
    pull_number: pr_number
  });
  if (pr_resp.status != 200 || pr_resp.data.state != 'closed') {
    console.log(`PR:{pr_number} is not found or closed.  Not a valid condition to create an issue.`);
    console.log(pr_resp);
    throw `PR:{pr_number} needs to be valid and closed (merged)`;
  }
  const pr_title = pr_resp.data.title;
  // Assign to PR owner and reviewers
  let assignees = pr_resp.data.assignees;
  assignees.push(pr_resp.data.user.login);
  // Create an new GH Issue and reference the Original PR
  const resp = await github.rest.issues.create({
    owner,
    repo,
    assignees,
    title: `Issue created for Rollback of PR #${pr_number}: ${pr_title}`,
    body: `Merged PR #${pr_number} is rolled back in ${rollback_commit}.
    Please follow up with the reviewer and close this issue once its resolved.`
  });
  console.log(`Issue created: ${resp.data.number} with Title: ${resp.data.title}`);
};
