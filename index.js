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
    return response.text()
  })
  .then(function(html) {

    console.log(`${ html }`);
    console.log("BREAK");

    // Initialize the DOM parser
    const jsdom = require("jsdom");
    //Parse the HTML text
    const dom = new jsdom.JSDOM(html);

    // Get Email from DOM by class
    console.log(`${ dom.window.document }`);
    console.log("BREAK");
    console.log(`${ dom.window.document.getElementsByClassName("u-email") }`);
    const email = dom.window.document.getElementsByClassName("u-email")[0].innerHTML;

    console.log(`[*] Found ${username}\'s email: ${email}`)
    core.setOutput("email", email);
  })

} catch (error) {
  core.setFailed(error.message);
}