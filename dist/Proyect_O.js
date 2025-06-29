"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const tablero_1 = require("./routes/tablero");
const database_1 = require("./database/database");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
const whitelist = ['http://localhost:4200', 'https://miapp.com'];
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
app.use((req, res) => {
    res.status(404).send({ mensaje: 'Ruta no encontrada' });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
