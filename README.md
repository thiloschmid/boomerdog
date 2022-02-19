## Setup

### Running nodemon

The default combination of nodemon and ts-node does not like esm import syntax, therefore another loader is used in the `npm start` script

    nodemon --watch 'src/**' --ext 'ts,json' --ignore 'src/**/*.spec.ts' --exec 'node --loader ts-node/esm src/api/index.ts'

### Linking the types file

To be able to use the common types in both `client` and `server` directories, the `boomerdog-types` package has to be linked via

    npm link ../types