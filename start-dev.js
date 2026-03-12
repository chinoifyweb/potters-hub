process.chdir(__dirname);
const port = process.env.PORT || 3000;
process.argv = [process.argv[0], 'dev', '-p', String(port)];
require('./node_modules/next/dist/bin/next');
