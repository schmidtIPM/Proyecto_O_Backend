import express, { Request, Response, Router } from 'express';
import { TableroController } from '../controllers/tableroController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const tableroRouter: Router = express.Router();

tableroRouter.get('/', async (req, res) => {
  const [status, body] = await TableroController.getAll();
  const estado = status as number;
  res.status(estado).json(body);
});
tableroRouter.get('/id/:id', async (req, res) => {
  const [status, body] = await TableroController.getById(req.params.id);
  const estado = status as number;
  res.status(estado).json(body);
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir =  path.join(__dirname, '../documentos/audio');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
tableroRouter.post('/creartablero', upload.any(), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const fileMap: Record<string, string> = {};
    files.forEach((file) => {
      fileMap[file.fieldname] = file.path;
    });
    const data = JSON.parse(req.body.data);
    const [status, message] = await TableroController.createFull(data, fileMap);
    res.status(status).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al procesar el tablero' });
  }
});
tableroRouter.put('/actualizar', upload.any(), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const fileMap: Record<string, string> = {};
    files.forEach((file) => {
      fileMap[file.fieldname] = file.path;
    });
    const data = JSON.parse(req.body.data);
    const [status, body] = await TableroController.updateFull(data, fileMap);
    res.status(status).json(body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el tablero' });
  }
});
tableroRouter.delete('/eliminar/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const [status, body] = await TableroController.delete(id);
  const estado = status as number;
  res.status(estado).json(body);
});
