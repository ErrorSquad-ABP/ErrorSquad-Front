const express = require("express");
const router = express.Router();
const path = require('path');

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});

router.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../adm/home.html'));
});

router.get('/docentes', (req, res) => {
  res.sendFile(path.join(__dirname, '../adm/docentes.html'));
});

router.get('/grade', (req, res) => {
  res.sendFile(path.join(__dirname, '../adm/grade-horarios.html'));
});

router.get('/mapa-interativo', (req, res) => {
  res.sendFile(path.join(__dirname,  '../adm/mapa-interativo.html'));
});

router.get('/mapa-interativo/Terreo', (req, res) => {
  res.sendFile(path.join(__dirname,  '../adm/mapas/andar-0.html'));
});

router.get('/mapa-interativo/1° Andar', (req, res) => {
  res.sendFile(path.join(__dirname,  '../adm/mapas/andar-1.html'));
});

router.get('/mapa-interativo/2° Andar', (req, res) => {
  res.sendFile(path.join(__dirname,  '../adm/mapas/andar-2.html'));
});

router.get('/semestres', (req, res) => {
  res.sendFile(path.join(__dirname, '../adm/semestres.html'));
});

router.get('/disciplinas', (req, res) => {
  res.sendFile(path.join(__dirname, '../adm/disciplinas.html'));
});

router.get('/cursos', (req, res) => {
  res.sendFile(path.join(__dirname, '../adm/cursos.html'));
});

router.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../adm/admin.html'));
});

module.exports = router;