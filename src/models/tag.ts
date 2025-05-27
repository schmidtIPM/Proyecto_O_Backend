import { Accion } from './accion';

export class Tag {
    ID: number;
    listaAcciones: number[];
    posterior: number | null;; // ID posterior o null si es el ultimo tag

    constructor(ID: number, listaAcciones: number[], posterior: number | null) {
        this.ID = ID;
        this.listaAcciones = listaAcciones;
        this.posterior = posterior;
    }
}
