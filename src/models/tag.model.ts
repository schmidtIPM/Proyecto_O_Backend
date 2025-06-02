import mongoose, { Schema, Document, Types } from 'mongoose';
import { AccionSchema, IAccion } from './accion.model';

export interface ITag extends Document {
  ID: number;
  fila: number;
  columna: number;
  listaAcciones: IAccion[];
  posterior?: Types.ObjectId | null;
}
const TagSchema = new Schema<ITag>({
  ID: { type: Number, required: true },
  fila: { type: Number, required: true },
  columna: { type: Number, required: true },
  listaAcciones: { type: [AccionSchema], default: [] },
  posterior: { type: Schema.Types.ObjectId, ref: 'Tag', default: null },
}, { timestamps: true });

export const TagModel = mongoose.model<ITag>('Tag', TagSchema);
