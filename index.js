const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PORT = 3000;
const logFile = path.join(__dirname, "visitors.log");
const backupFile = path.join(__dirname, "backup.log");


const routes = {
  "GET /updateUser": (req, res) => {
    const entry = `Visited at: ${new Date().toISOString()}\n`;

    fs.appendFile(logFile, entry, (err) => {
      if (err) return send(res, 500, { error: "Failed to update log" });
      send(res, 200, { message: "User logged" });
    });
  },

  "GET /saveLog": (req, res) => {
    fs.readFile(logFile, "utf8", (err, data) => {
      if (err) return send(res, 500, { error: "Cannot read log" });
      send(res, 200, { log: data });
    });
  },

  "POST /backup": (req, res) => {
    fs.copyFile(logFile, backupFile, (err) => {
      if (err) return send(res, 500, { error: "Backup failed" });
      send(res, 200, { message: "Backup created" });
    });
  },

  "PATCH /clearLog": (req, res) => {
    fs.writeFile(logFile, "", (err) => {
      if (err) return send(res, 500, { error: "Clear failed" });
      send(res, 200, { message: "Log cleared" });
    });
  },

  "GET /serverInfo": (req, res) => {
    send(res, 200, {
      platform: os.platform(),
      cpu: os.cpus().length,
      uptime: os.uptime(),
      memory: os.totalmem(),
      freeMemory: os.freemem(),
    });
  },
};
function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}


const server = http.createServer((req, res) => {
  const key = `${req.method} ${req.url}`;

  if (routes[key]) {
    routes[key](req, res);
  } else {
    send(res, 404, { error: "Route not found" });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
