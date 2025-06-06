const express = require("express");
const routes = require("./routes");
const path = require("path");

const app = express();
const PORT = process.env.PORT;

// Servir arquivos estáticos com MIME types corretos
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// Rotas para compatibilidade com /public/ no caminho
app.get('/public/css/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'css', req.params.filename);
  res.setHeader('Content-Type', 'text/css; charset=utf-8');
  res.sendFile(filePath);
});

app.get('/public/js/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'js', req.params.filename);
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.sendFile(filePath);
});

app.use('/', routes);

app.listen(PORT || 3001, () => {
  console.log('Servidor rodando: http://localhost:3001/');
});