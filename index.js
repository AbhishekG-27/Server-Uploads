import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello from server" });
});

app.listen(8000, () => {
  console.log("Listening on port 8000");
});
