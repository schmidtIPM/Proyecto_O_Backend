import mongoose, { Schema, Document, Types } from 'mongoose';
import { ITag } from './tag.model';

export interface ITablero extends Document {
  id: number;
  nombre: string;
  filas: number;
  columnas: number;
  mainTag: Types.ObjectId;
  listaTags: Types.ObjectId[];
  fondo: string;
  colorlineas: string;
}

const TableroSchema = new Schema<ITablero>({
  id: { type: Number, required: true },
  nombre: { type: String, required: true },
  filas: { type: Number, required: true },
  columnas: { type: Number, required: true },
  mainTag: { type: Schema.Types.ObjectId, ref: 'Tag', required: true },
  listaTags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  fondo: { type: String },
  colorlineas: { type: String, required: true },
}, { timestamps: true });

export const TableroModel = mongoose.model<ITablero>('Tablero', TableroSchema);