const web = require('./lib/web');
const app = web();

app.listen(process.argv[2], () => console.log(`Local server running on ${process.argv[2]}`));