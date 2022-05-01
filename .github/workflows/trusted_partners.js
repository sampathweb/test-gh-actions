/** Extracts PR from commit message and creates a GitHub Issue on Rollback of PR
  Created issue is assigned to original PR owner and reviewer.

  @param {!object}
    github enables querying for PR and also create issue using rest endpoint
    context has the commit message details in the payload
  @return {string} Returns the issue number and title
*/

const get_partner = async ({github, context}) => {
  const user = await github.rest.users.getByUsername({
    username: context.actor
  });
  if (user.status >= 400) {
    console.log(user);
    throw "Error Getting user data";
  }
  const email = user.data.email;
  console.log(email);
  const domain = email.substring(email.lastIndexOf("@") +1);
  console.log(domain);
  return domain;
};


const intel_action = async ({github, context}) => {
  // Intel is a trusted parter and we want to auto-run tests and mark the PR as ready to pull
  // This allows us to reduce the delay to external partners
  // Add Labels - kokoro:force-run, ready to pull
  // The PR is also assigned to Mihai so it doesn't have to wait for assignment
  // Additional reviewers can be added manually based on PR contents
  const partner = get_partner({github, context});
  console.log("Partner");
  console.log(partner);
        
  const labels = ['bug', 'ready-to-pull'];
  const assignees = ['shobanavv'];
  const resp_label = await github.rest.issues.addLabels({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    labels: labels
  });
  if (resp_label.status >= 400) {
    console.log(resp_label);
    throw "Error adding labels to PR";
  }
  const resp_assign = await github.rest.issues.addAssignees({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    assignees: assignees
  });
  if (resp_assign.status >= 400) {
    console.log(resp_assign);
    throw "Error adding assignee to PR";
  }
  return `PR Updated successfully with Labels: ${labels} with Assignees: ${assignees}`;
};

module.exports = {
    intel: intel_action,
    get_partner
};
