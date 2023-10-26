 # OGADA-SWIFT-BANKING-BACKEND
 

An application solely for education purposes! This is a DEMO simple banking application that allows users to create accounts, deposit, withdraw, and transfer funds between accounts.

## Live links 🚀
- [DOCUMENTATION](https://documenter.getpostman.com/view/11253311/2s93z5842M#intro)
- [BASE URL => https://ogada-swift-banking-production.up.railway.app/api/v1](https://ogada-swift-banking-production.up.railway.app/api/v1)


### Unprotected endpoints ⛓ (For quick testing 🧪)
- [GET DEFAULT USER LOGIN](https://ogada-swift-banking-production.up.railway.app/api/v1/users/default-user-login)
- [GET ALL BANKS](https://ogada-swift-banking-production.up.railway.app/api/v1/banks)


#

## Usage

1. Run `git clone https://github.com/stanleyogada/OGADA-SWIFT-BANKING-BACKEND.git`
2. Run `cd OGADA-SWIFT-BANKING-BACKEND`
3. Run `npm i`
4. Run `npm run dev`

#

## VSCode Extensions

- Install `Prettier` extension.

#

## How to contribute

1. Create your branch with the of your current ticket e.g `git checkout -b ch-#675-add-pretier-configuration`.
2. Make your changes.
3. Stage and commit your changes. e.g. `git add . && git commit -m "ch-#675: setup prettier configuration"`.
4. Repeat **step 2 and 3** until you're done with your ticket tasks.
5. Pull from origin `main` branch to sync all changes online with your local branch `git pull origin main`.
6. Fix all conflict/s if any (You might need to consult help from the Engineer responsible for causing the conflict/s).
7. Push your changes on your current branch! eg. `git push origin ch-#5-add-pretier-configuration`
8. Create a **PR** in GitHub.
9. If any change/s is requested by your Code Reviewers, repeat **step 2 to 7** until your **PR** is approved.
10. Merge **PR**. 🚢

#

## Pull Request (**PR**)

#### Rules

1. Request an Engineer/s to review to your PR (to check if your code makes sense to merge to `dev` branch).
2. Assign yourself (for anyone to quickly identify you as the owner of the PR).
3. Don't Merge without approval from your Code reviewer/s!!! (This could deal some potential damage if you do this 🥴)
4. Merge after approval. 🚢

#### Format

- The **PR** title. eg. `[#675] Add prettier configuration`.
- The **PR** body: this should be the link to the ticket on trello. eg. `Trello: https://trello.com/c/XEv0yeTA`.
- **Below is screenshot example of the perfect PR**: take a look=>https://github.com/stanleyogada/Opay-Demo-Frontend/pull/3
  ![image](https://user-images.githubusercontent.com/104577296/221747744-f5a893cf-ae75-4a63-ba69-9016798e47a9.png)

#

## Branch / Commits Conventions

#### Branch

- Format `<ch|ft|bg>-#ticket-id-<ticket-title>`
- Example `ft-#675-add-button-component`

#### Commit

- Format `<ch|ft|bg>-#ticket-id: <short description>`
- Example `bg-#675: fix all failing links`
