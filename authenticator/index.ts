import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import http from "http";
import url from "url";

const prisma = new PrismaClient()

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Max-Age', 2592000); // 30 days
  res.setHeader('Access-Control-Allow-Headers', 'content-type');

  const parsedUrl = url.parse(req.url!, true);

  if (parsedUrl.pathname?.startsWith("/auth")) {
    const { query } = parsedUrl;
    const { address } = query;

    if (address) {
      const record = await prisma.record.findUnique({
        where: {
          address: address as string,
        },
      });

      if (record) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          address: record.address,
          authFlows: record.authFlows,
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Record not found');
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing domain or address query parameters');
    }

    return;
  }

  // Wrong pathname 404 Not Found
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Authenticator service running at port ${port}`);
});

server.on('close', async () => {
  await prisma.$disconnect();
});
