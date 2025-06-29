"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuzModel = exports.MovimientoModel = exports.AudioModel = exports.AccionModel = exports.AccionSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.AccionSchema = new mongoose_1.Schema({
    delay: { type: Number, default: 0 },
    tipo: { type: String, required: true, enum: ['audio', 'movimiento', 'luz'] },
}, { discriminatorKey: 'tipo', _id: false });
exports.AccionModel = mongoose_1.default.model('Accion', exports.AccionSchema);
exports.AudioModel = exports.AccionModel.discriminator('audio', new mongoose_1.Schema({
    archivo: { type: String, default: null },
}, { _id: false }));
exports.MovimientoModel = exports.AccionModel.discriminator('movimiento', new mongoose_1.Schema({
    direccion: { type: String, enum: ['arriba', 'abajo', 'izquierda', 'derecha'], default: 'arriba' },
}, { _id: false }));
exports.LuzModel = exports.AccionModel.discriminator('luz', new mongoose_1.Schema({
    color: { type: String, default: '#ffffff' },
    intervalo: { type: Number, default: 0 },
}, { _id: false }));
