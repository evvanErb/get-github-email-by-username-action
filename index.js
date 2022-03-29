import fetch from "node-fetch";
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
  // `username` input defined in action metadata file
  const usernameForEmail = core.getInput('github-username');
  console.log(`[*] Getting ${usernameForEmail}\'s GitHub email`);

  //fetch user's page
  fetch(`https://api.github.com/users/${usernameForEmail}/events/public`)
  .then(function(response) {

    // When the page is loaded convert it to text
    return response.text()
  })
  .then((apiData) => {

    const email = findEmail(apiData);

    if (email == null) {
      throw Error('[!] Could not find email in API Data');
    }

    console.log(`[*] Found ${usernameForEmail}\'s email: ${email}`)
    core.setOutput("email", email);
  })
  .catch((error) => {
    core.setFailed(error.message);
  });

} catch (error) {
  core.setFailed(error.message);
}