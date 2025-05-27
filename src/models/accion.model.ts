import mongoose, { Schema } from 'mongoose';

const options = { discriminatorKey: 'tipo', collection: 'acciones' };

const AccionSchema = new Schema({
    id: Number,
    tipo: { type: String, required: true },
}, options);

export const AccionModel = mongoose.model('Accion', AccionSchema);

export const AudioModel = AccionModel.discriminator('audio',
    new Schema({}, options)
);

export const MovimientoModel = AccionModel.discriminator('movimiento',
    new Schema({}, options)
);

export const LuzModel = AccionModel.discriminator('luz',
    new Schema({}, options)
);