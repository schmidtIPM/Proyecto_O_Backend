import mongoose, { Schema } from 'mongoose';

const TableroSchema = new Schema({
    id: Number,
    nombre: String,
    filas: Number,
    columnas: Number,
    mainTag: {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
    },
    listaTags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag',
    }],
});

export const TableroModel = mongoose.model('Tablero', TableroSchema);
