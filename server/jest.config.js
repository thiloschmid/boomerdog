/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

/* Added `npm install -D jest-ts-webcompat-resolver` as a resolver
 * to be able to import files with a .js extension since jest complains
 * otherwise.
 */
export default {
    preset: "ts-jest",
    testEnvironment: "jest-environment-node",
    transform: {},
    resolver: "jest-ts-webcompat-resolver",
};
