# get-github-email-by-username-action
GitHub Actions Plugin to get a GitHub user's email based on their username

## Usage

Takes in a username as a required input and a Github personal access token (https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) as an optional input. If a personal access token (does not matter whose) is provided, it queries Github's Users API to find the public info available for the provided username in order to get their email. If this fails, or no auth token is provided, it attempts to search all public events related to the provided username, then tries to find their email in the API response and return it (fallback / no auth token method). For the fallback / no auth token method, the user it's searching for must have made a commit to a public repo during the current calendar year and had their email exposed to the public in their settings when they made the commit. Was originally created to email the author of a pull request if the build triggered in another repo (triggered by repository_dispatch) succeeded or failed. The PR author's username is obtained using ${{github.event.pull_request.user.login}}, this plugin then finds their email, their email gets passed in the repository_dispatch, an email is then sent to them about the status of the other pipeline using https://github.com/marketplace/actions/send-email.

## Example
```
name: Test Get Email from Github Username
on:
  workflow_dispatch:

jobs:
  get_user_email:
    runs-on: ubuntu-latest
    name: A job to get a users email
    steps:
      - name: get email
        id: test
        uses: evvanErb/get-github-email-by-username-action@v1.25
        with:
          github-username: evvanErb
          allow-anonymous: false
          token: null
          
      # Use the output from the `test` step
      - name: Print the found email
        run: echo "The email is ${{ steps.test.outputs.email }}" # Example of how to access output email
```

## Inputs
| Input               | Type    | Required | Description                                                    |
|---------------------|---------|----------|----------------------------------------------------------------|
| **github-username** | String  | *        | Search email for provided username                             |
| **allow-anonymous** | Boolean |          | Allow capture anonymous GitHub emails. By default set to false |
| **token**           | String  |          | Use the GitHub API token to retrieve the email                 |

## Outputs
| Output              | Type    | Description                                       |
|---------------------|---------|---------------------------------------------------|
| **email**           | String  | The email address that was found for the username |
