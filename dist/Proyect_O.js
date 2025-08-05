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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const tablero_1 = require("./routes/tablero");
const database_1 = require("./database/database");
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv.config();
const app = (0, express_1.default)();
const port = 3000;
const whitelist = ['http://localhost:4200', 'https://miapp.com', 'https://proyecto-o.com', 'https://www.proyecto-o.com'];
(0, database_1.connectToDatabase)();
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('No permitido por CORS'));
        }
    }
}));
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send({ mensaje: 'Hola, bienvenido a la API de tableros' });
});
app.use('/tablero', tablero_1.tableroRouter);
app.use((err, req, res, next) => {
    if (err.message === 'No permitido por CORS') {
        res.status(403).send({ mensaje: 'Dominio no autorizado por CORS' });
    }
    else {
        next(err);
    }
});
app.use('/static/audio', express_1.default.static(path_1.default.join(__dirname, 'documentos/audio')));
app.use('/static/img', express_1.default.static(path_1.default.join(__dirname, 'documentos/img')));
app.use('/static/imgPag', express_1.default.static(path_1.default.join(__dirname, 'documentos/imgPag')));
app.get('/static/imgPag', (req, res) => {
    fs_1.default.readdir(path_1.default.join(__dirname, 'documentos/imgPag'), (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'No se pudo leer el directorio' });
        }
        res.json(files);
    });
});
app.use((req, res) => {
    res.status(404).send({ mensaje: 'Ruta no encontrada' });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
exports.default = app;
