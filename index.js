const express = require("express");
const app = express();
const cors = require("cors");
// port
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Classic Hotel server is running");
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
