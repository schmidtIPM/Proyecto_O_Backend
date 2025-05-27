import express, { Request, Response } from 'express';
import { tableroRouter } from './src/routes/routes';
 
const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send(`
    <h1>Bienvenido a mi página web</h1>
    <p>Haz clic en el siguiente enlace para visitar un sitio web:</p>
    `);
});

app.use(express.json());
app.use('/', tableroRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});