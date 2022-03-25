const cheerio = require('cheerio');
import request from 'request';
const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `username` input defined in action metadata file
  const username = core.getInput('username');
  console.log(`[*] Getting ${username}\'s GitHub email`);

  request({
        method: 'GET',
        url: `https://github.com/${username}`
        }, (err, res, body) => {

    console.log(body);
    const $ = cheerio.load(body);
  
    $('.u-email').each((i, element) => {
      const email = element.text();
      console.log(`[*] Found ${username}\'s email: ${email}`)
      core.setOutput("email", email);
    });
  });

} catch (error) {
  core.setFailed(error.message);
}