import fetch from "node-fetch";
const core = require('@actions/core');
const github = require('@actions/github');

function findEmail(jsonData) {

}

try {
  // `username` input defined in action metadata file
  const username = core.getInput('username');
  console.log(`[*] Getting ${username}\'s GitHub email`);

  //fetch user's page
  fetch(`https://api.github.com/users/${username}/events/public`)
  .then(function(response) {

    // When the page is loaded convert it to text
    return response.text()
  })
  .then((apiData) => {

    const position = apiData.indexOf("\"email\":\"");

    console.log(position);
    console.log((apiData.substring(position + 10).indexOf('\"')));

    const email = apiData.substring(position, (position + 20));

    console.log(`[*] Found ${username}\'s email: ${email}`)
    core.setOutput("email", email);
  })

} catch (error) {
  core.setFailed(error.message);
}