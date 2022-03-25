# get-github-email-by-username-action
GitHub Actions Plugin to get a GitHub user's email based on their username

## Usage

Takes in a username as a required input, queries Github's API to find all public event related to a user, then finds their email in the API response and returns it. The user must have made a commit to a public repo and have their email exposed to the public in their settings

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
        uses: evvanErb/get-github-email-by-username-action@v1.16
        with:
          github-username: 'evvanErb' # This is the input username
          
      # Use the output from the `test` step
      - name: Print the found email
        run: echo "The email is ${{ steps.test.outputs.email }}" # Example of how to access output email
```
