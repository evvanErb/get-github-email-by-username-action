import fetch from "node-fetch";
const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `username` input defined in action metadata file
  const username = core.getInput('username');
  console.log(`[*] Getting ${username}\'s GitHub email`);

  //fetch user's page
  fetch(`https://github.com/${username}`)
  .then(function(response) {

    // When the page is loaded convert it to text
    return response.json()
  })
  .then((data) => {
      console.log(data);
  });

} catch (error) {
  core.setFailed(error.message);
}