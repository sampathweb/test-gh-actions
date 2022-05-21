/** Get the domain of the user's email

  @param {!object}
    github enables querying for PR and also create issue using rest endpoint
    context has the commit message details in the payload
  @return {string} Return the domain name of the user's email. Empty string if not found
*/

const get_email_domain = async ({github, username}) => {
  const user = await github.rest.users.getByUsername({
    username
  });
  if (user.status >= 400) {
    console.log(user);
    throw `Error Getting user data for ${username}`;
  }
  const email = user.data.email;
  let domain = "";
  if (email && email.lastIndexOf("@") != -1)
    domain = email.substring(email.lastIndexOf("@") +1);
  console.log(domain);
  return domain;
};


/** For trusted parters like intel, we want to auto-run tests and mark the PR as ready to pull
    This allows us to reduce the delay to external partners
    Add Labels - kokoro:force-run, ready to pull
    The PR is also assigned to Mihai so it doesn't have to wait for assignment
    Additional reviewers can be added manually based on PR contents
  @param {!object}
    github enables querying for PR and also create issue using rest endpoint
    context has the commit message details in the payload
  @return {string} Returns the message with labels attached and assignees added
*/
const intel_action = async ({github, context}) => {
  const labels = ['bug', 'ready-to-pull'];
  const assignees = ['shobanavv'];
  console.log("BEGIN");
  console.log(context.issue);
  const title = context.payload.pull_reques && context.payload.pull_request.title;
  if (title && title.toLowerCase().includes("onednn"))
    console.log("Found ONE DNN");
  else 
    console.log("NOT FOUND");              
  console.log(context.payload.pull_request);
  console.log(context);
  console.log("END");
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
  get_email_domain
};
