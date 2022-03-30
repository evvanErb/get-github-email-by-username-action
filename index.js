import fetch from "node-fetch";
const request = request.defaults({jar: true})
const cheerio = require('cheerio');
const core = require('@actions/core');

function findEmailInAPI(apiData) {

  const emailPosition = apiData.indexOf("\"email\":\"");

  if (emailPosition < 0) {
    return null;
  }

  const email = apiData.substring((emailPosition + 9), (emailPosition + 9 + (apiData.substring(emailPosition + 9).indexOf('\"'))));

  //if found a bot email, continue searching
  if (email.indexOf("users.noreply.github.com") >= 0) {
    return findEmailInAPI(apiData.substring(emailPosition + 9));
  }
  else {
    return email;
  }
}

function findEmailInUserPage(html) {

  let $ = cheerio.load(html);

  let email = $('.u-email');

  if (email.text() == "" || email.text() == null) {
    return null;
  }
  return email.text();
}

try {
  //inputs defined in action metadata file
  const usernameForEmail = core.getInput('github-username');
  const usernameForLogin = core.getInput('login-username');
  const passwordForLogin = core.getInput('login-password');
  console.log(`[*] Getting ${usernameForEmail}\'s GitHub email`);

  //try to login to github with provided credentials
  console.log(`[*] Trying to login as ${usernameForLogin} to get ${usernameForEmail}\'s GitHub email`);
  request.post({
    url: 'https://github.com/login',
    form: {"login":`${usernameForLogin}`, "password":`${passwordForLogin}`}
  }, function(error, response, body){

    let headers = {}
    if (response != null) {
      headers = response.headers;
      console.log(`[*] ${usernameForLogin} Authentication successful`);
    }
    else {
      console.log(`[!] ${usernameForLogin} Authentication failed`);
    }

    //Get the desired user's page even if login failed
    request.get({
        url:`https://github.com/${usernameForEmail}`,
        header: headers
    },function(error, response, body){

        // Search the full html of the page for the email
        const emailUserpage = findEmailInUserPage(body);

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

            const emailAPI = findEmailInAPI(apiData);

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