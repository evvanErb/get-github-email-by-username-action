const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `username` input defined in action metadata file
  const username = core.getInput('username');
  console.log(`[*] Getting ${username}\'s GitHub email`);

  got(`https://github.com/${username}`).then(response => {
    const $ = cheerio.load(response.body);
  
    $('.u-email').each((i, element) => {
      const email = element.text();
      console.log(`[*] Found ${username}\'s email: ${email}`)
      core.setOutput("email", email);
    });
  });

} catch (error) {
  core.setFailed(error.message);
}