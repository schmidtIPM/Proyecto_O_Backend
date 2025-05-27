import express, { Request, Response } from 'express';
import { tableroController } from '../controllers/tableroController'
import { tagController } from '../controllers/tagController'
import { accionController } from '../controllers/accionController'

export let tableroRouter = express.Router();

tableroRouter.get("/tableros",(req: Request, res: Response) => {
    res.json(tableroController.getTableros())
});

tableroRouter.get("/tags",(req: Request, res: Response) => {
    res.json(tagController.getTags())
});

tableroRouter.get("/acciones",(req: Request, res: Response) => {
    res.json(accionController.getAcciones())
});