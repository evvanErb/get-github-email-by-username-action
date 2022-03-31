import fetch from "node-fetch";
import { Octokit, App } from "octokit";
const request = require('request');
const core = require('@actions/core');

function findEmail(apiData) {

  const emailPosition = apiData.indexOf("\"email\":\"");

  if (emailPosition < 0) {
    return null;
  }

  const email = apiData.substring((emailPosition + 9), (emailPosition + 9 + (apiData.substring(emailPosition + 9).indexOf('\"'))));

  //if found a bot email, continue searching
  if (email.indexOf("users.noreply.github.com") >= 0) {
    return findEmail(apiData.substring(emailPosition + 9));
  }
  else {
    return email;
  }
}

try {
  //inputs defined in action metadata file
  const usernameForEmail = core.getInput('github-username');
  const token = core.getInput('token');
  console.log(`[*] Getting ${usernameForEmail}\'s GitHub email`);

  let userAPIData = await request('GET /users/:username', {
    username: username,
    headers: {
        Authorization: `bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
    },
  });

  console.log(userAPIData);

  // Search the full html of the page for the email
  const emailUserpage = findEmail(userAPIData);

  //email not found on page, fallback to old method to attempt email retrieval
  if (emailUserpage == null) {

    console.log(`[*] Falling back to old API retrieval method`);
    //fetch user's page
    fetch(`https://api.github.com/users/${usernameForEmail}/events/public`)
    .then(function(response) {

      // When the page is loaded convert it to text
      return response.text()
    })
    .then((apiData) => {

      const emailAPI = findEmail(apiData);

      if (emailAPI == null) {
        throw Error('[!!!] Could not find email in API Data');
      }

      console.log(`[*] Found ${usernameForEmail}\'s email: ${emailAPI}`)
      core.setOutput("email", emailAPI);
    })
    .catch((error) => {
      core.setFailed(error.message);
    });
  }

} catch (error) {
  core.setFailed(error.message);
}