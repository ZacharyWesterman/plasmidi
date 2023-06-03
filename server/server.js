const express = require("express");
const multer = require("multer");
const path = require("path");
const { plasMIDI } = require("./middleware/plasMIDI");
const { plasmaUI } = require("./middleware/plasmaUI");
const { sendPlasmaTypes } = require("./middleware/sendPlasmaTypes");
const { createFile } = require("./services/files");

const PORT = process.env.PORT || 3001;

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(sendPlasmaTypes);

if (process.env.NODE_ENV === "production")
  app.use(express.static(path.join(__dirname, "../client/build")));

// Home page render
// app.get("/", (_req, res) =>
//   res.status(200).sendFile(path.join(__dirname, "../client/build/index.html"))
// );

// Serve the plasMIDI from a pre-hosted MIDI file
app.get("/api/process/:name", plasMIDI, (req, res) =>
  res.sendPlasMIDI(req.plasMIDI)
);

// Process the MIDI file using plasmidi.py and return the result
app.post("/api/process", upload.single("file"), plasMIDI, async (req, res) => {
  const path = __dirname + "/" + req.file.path;
  const name = req.file.originalname;
  const file = await createFile({ path, name });
  res.sendPlasMIDI(req.plasMIDI, file);
});

app.get("/plasma/:page", plasmaUI, (req, res) =>
  res.sendPlasmaUI(req.plasmaUI)
);

// TODO: Ask Gary why I seem to need this in Heroku
app.get("*", (_req, res) =>
  res.status(200).sendFile(path.join(__dirname, "../client/build/index.html"))
);

app.listen(PORT, () => {
  console.log(`Now listening on port ${PORT}`);
});
