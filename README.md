## Setup

### Local development

1. Run the backend

    cd server && npm run develop

2. Run the client

    cd client && npm start

If authenticating over github, gatekeeper needs to be running too.

### Running nodemon

The default combination of nodemon and ts-node does not like esm import syntax, therefore another loader is used in the `npm start` script

    nodemon --watch 'src/**' --ext 'ts,json' --ignore 'src/**/*.spec.ts' --exec 'node --loader ts-node/esm src/api/index.ts'

### Linking the types file

To be able to use the common types in both `client` and `server` directories, the `boomerdog-types` package has to be packed via

    npm pack

in `boomerdog/types`. Then it can be copied into both `client` and `server` and installed via

    npm i ./boomerdog-types-1.0.0.tgz

### Deploy subfolder to heroku

See https://stackoverflow.com/questions/39197334/automated-heroku-deploy-from-subfolder
