import express, { Request, Response, Router } from 'express';
import { TableroController } from '../controllers/tagController';

export const tableroRouter: Router = express.Router();

tableroRouter.get('/', async (req: Request, res: Response) => {
    try {
        const tableros = await TableroController.getAll();
        res.json(tableros);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener tableros', details: err });
    }
});

tableroRouter.get('/id/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const tablero = await TableroController.getById(id);
        if (!tablero) {
                res.status(404).json({ error: 'Tablero no encontrado' });
                return;
            }
        res.json(tablero);
    } catch (err) {
        res.status(500).json({ error: 'Error al buscar tablero', details: err });
    }
});

tableroRouter.post('/creartablero', async (req: Request, res: Response) => {
    try {
        const tablero = await TableroController.create(req.body);
        res.status(201).json(tablero);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear tablero', details: err });
    }
});

tableroRouter.delete('/eliminar/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const result = await TableroController.delete(id);
        if (result.deletedCount === 0) {
            res.status(404).json({ error: 'Tablero no encontrado' });
            return;
        }
        res.json({ message: 'Tablero eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar tablero', details: err });
    }
});
