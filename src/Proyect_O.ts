import express, { Request, Response } from 'express';
import cors from 'cors';
import { tableroRouter } from './routes/tablero';
import { connectToDatabase } from './database/database';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

const whitelist = ['http://localhost:4200', 'https://miapp.com', 'https://proyecto-o.com', 'https://www.proyecto-o.com'];
connectToDatabase();
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send({ mensaje: 'Hola, bienvenido a la API de tableros' });
});

app.use('/tablero',tableroRouter);

app.use((err: Error, req: Request, res: Response, next: Function) => {
  if (err.message === 'No permitido por CORS') {
    res.status(403).send({ mensaje: 'Dominio no autorizado por CORS' });
  } else {
    next(err);
  }
});

app.use('/static/audio', express.static(path.join(__dirname, 'documentos/audio')));
app.use('/static/img', express.static(path.join(__dirname, 'documentos/img')));

app.use((req, res) => {
  res.status(404).send({ mensaje: 'Ruta no encontrada' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});