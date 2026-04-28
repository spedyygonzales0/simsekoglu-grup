const { startServer } = require("next/dist/server/lib/start-server");

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || undefined;

startServer({
  dir: process.cwd(),
  port,
  allowRetry: true,
  isDev: true,
  hostname
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
