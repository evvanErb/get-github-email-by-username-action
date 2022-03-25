import fetch from "node-fetch";
const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `username` input defined in action metadata file
  const username = core.getInput('username');
  console.log(`[*] Getting ${username}\'s GitHub email`);

  //fetch user's page
  const success = fetch(`https://api.github.com/users/${username}/events/public`)
  .then(function(response) {

    // When the page is loaded convert it to text
    return response.text()
  })
  .then((apiData) => {

    const position = apiData.indexOf("\"email\":\"");

    if (position < 0) {
        throw Error('[!] Could not find email in API Data');
    }

    const email = apiData.substring((position + 9), (position + 9 + (apiData.substring(position + 9).indexOf('\"'))));

    console.log(`[*] Found ${username}\'s email: ${email}`)
    core.setOutput("email", email);

    return 1;
  })
  .catch((error) => {
    core.setFailed(error.message);
  });

} catch (error) {
  core.setFailed(error.message);
}