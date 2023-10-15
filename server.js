const express = require("express");
const path = require("path");
const engine = require("./engine");
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.static(path.join(__dirname, "public"))); // add this line to serve static files
engine();
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "qr.png")); // update this line to send the file
});

app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`);
});
