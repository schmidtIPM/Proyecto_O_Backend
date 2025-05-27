import { TableroModel } from '../models/tablero.model';
import mongoose from 'mongoose';

export class TableroController {
    static async getAll() {
        return await TableroModel.find()
            .populate({
                path: 'mainTag',
                populate: { path: 'listaAcciones' }
            })
            .populate({
                path: 'listaTags',
                populate: { path: 'listaAcciones' }
            });
    }

    static async getById(id: number) {
        return await TableroModel.findOne({ id })
            .populate({
                path: 'mainTag',
                populate: { path: 'listaAcciones' }
            })
            .populate({
                path: 'listaTags',
                populate: { path: 'listaAcciones' }
            });
    }

    static async create(tableroData: {
        id: number;
        nombre: string;
        filas: number;
        columnas: number;
        mainTag: mongoose.Types.ObjectId;
        listaTags: mongoose.Types.ObjectId[];
    }) {
        return await TableroModel.create(tableroData);
    }

    static async delete(id: number) {
        return await TableroModel.deleteOne({ id });
    }
}