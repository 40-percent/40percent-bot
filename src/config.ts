import { config as dotenvConfig } from 'dotenv';
// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
dotenvConfig();

export default process.env;
