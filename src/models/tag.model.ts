import mongoose, { Schema } from 'mongoose';

const TagSchema = new Schema({
    ID: Number,
    listaAcciones: [{
        type: Schema.Types.ObjectId,
        ref: 'Accion'
    }],
    posterior: {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
        default: null
    },
});

export const TagModel = mongoose.model('Tag', TagSchema);
