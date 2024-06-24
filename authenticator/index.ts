import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

const prisma = new PrismaClient()
const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Register route
app.post("/register", async (req, res) => {
  try {
    const { address, name, authFlows, chain } = req.body;
    if (name && authFlows) {
      const record = await prisma.record.upsert({
        where: { name },
        update: { address, authFlows, chain },
        create: { address, name, authFlows, chain },
      });

      res.status(200).json({ address, authFlows: record.authFlows, chain, name });
    } else {
      res.status(400).send("Missing name or authFlows in request body");
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
    res.status(400).send("Invalid request body");
  }
});

// Authentication route
app.get("/auth/:name?", async (req, res) => {
  const name = req.params.name || req.query.name;
  if (name) {
    const record = await prisma.record.findUnique({
      where: { name: name as string },
    });
    if (record) {
      res.status(200).json({ address: record.address, authFlows: record.authFlows, name, chain: record.chain });
    } else {
      res.status(404).send("Record not found");
    }
  } else {
    res.status(400).send("Missing name parameter");
  }
});

// Handle 404 for other routes
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Start the server
app.listen(port, () => {
  console.log(`Authenticator service running at port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
