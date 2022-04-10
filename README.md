# Cracking the coding interview discord Bot
This project is a little pet project of mine to have some fun in the discord i'm usually in :). 

# Current Functionality
## Commands
`play {song}` 
Will play your song from youtube

`chugjug`
The bot will join your server and play chug jug for you.

`{name}`
If the name is someone that has emojis, it'll display those emojis.

# Local Development
You need to install 
- [NodeJS](https://nodejs.org/en/download/) 
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)
 before running this application.

After that (on windows): 
```
$ git clone https://github.com/linglon97/ctci-bot.git (or use github desktop)
Ask @linglong97 for .env for environment variables, and add it to src. 
$ yarn install
$ npx tsc -w (in another terminal window)
$ npm run start
```
If you make changes, you need to kill the server and run `npm run start` again. 
# Tests
I might want to write tests in the future...

# Deployment
The project is currently hosted on Heroku. Changes pushed to https://github.com/linglon97/ctci-bot are automatically deployed. Please ping @linglong97 for details.
