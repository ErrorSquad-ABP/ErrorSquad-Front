const express = require("express");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT;

app.use(express.static('public'));

app.use('/', routes);

app.listen(PORT || 3000, () => {
  console.log('Servidor rodando');
})