import fetch from "node-fetch";
const request = require('request');
const core = require('@actions/core');

function findEmailInAPI(apiData) {

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

function findEmailInUserPage(html) {
  return html;
}

try {
  // `username` input defined in action metadata file
  const usernameForEmail = core.getInput('github-username');
  const usernameForLogin = core.getInput('login-username');
  const passwordForLogin = core.getInput('login-password');
  console.log(`[*] Getting ${usernameForEmail}\'s GitHub email`);

  //try to login to github and get 
  console.log(`[*] Trying to login as ${usernameForLogin} to get ${usernameForEmail}\'s GitHub email`);
  request.post({
    url: 'https://exampleurl.com/login',
    form: {"login":`${usernameForLogin}`, "password":`${passwordForLogin}`}
  }, function(error, response, body){

    //try to get the desired user's page
    let headers = {}
    if (response != null) {
      headers = response.headers;
    }
    request.get({
        url:`https://github.com/${usernameForEmail}`,
        header: headers
    },function(error, response, body){

        // The full html of the authenticated page
        const emailUserpage = findEmailInUserPage(body);

        //Could not login to Github, fallback to old method to attempt email retrieval
        if (emailUserpage == null) {
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
        else {
          console.log(`[*] Found ${usernameForEmail}\'s email: ${emailUserpage}`)
          core.setOutput("email", emailUserpage);
        }

    });
  });

} catch (error) {
  core.setFailed(error.message);
}