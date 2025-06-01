import mongoose, { Schema, Document } from 'mongoose';

export type TipoAccion = 'audio' | 'movimiento' | 'luz';

export interface IAccion extends Document {
  delay: number;
  tipo: TipoAccion;
}

export const AccionSchema = new Schema<IAccion>(
  {
    delay: { type: Number, default: 0 },
    tipo: { type: String, required: true, enum: ['audio', 'movimiento', 'luz'] },
  },
  { discriminatorKey: 'tipo', _id: false }
);

export const AccionModel = mongoose.model<IAccion>('Accion', AccionSchema);

export interface IAudio extends IAccion {
  archivo?: string; // URL o nombre de archivo
}

export const AudioModel = AccionModel.discriminator<IAudio>(
  'audio',
  new Schema<IAudio>({
    archivo: { type: String, default: null },
  }, { _id: false })
);

export interface IMovimiento extends IAccion {
  direccion: 'avanzar' | 'girar';
}

export const MovimientoModel = AccionModel.discriminator<IMovimiento>(
  'movimiento',
  new Schema<IMovimiento>({
    direccion: { type: String, enum: ['avanzar', 'girar'], default: 'avanzar' },
  }, { _id: false })
);

export interface ILuz extends IAccion {
  color: string;
  intervalo: number;
}

export const LuzModel = AccionModel.discriminator<ILuz>(
  'luz',
  new Schema<ILuz>({
    color: { type: String, default: '#ffffff' },
    intervalo: { type: Number, default: 0 },
  }, { _id: false })
);
