const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente");
});

app.listen(4000, () => {
  console.log("Servidor corriendo en puerto 4000");
});