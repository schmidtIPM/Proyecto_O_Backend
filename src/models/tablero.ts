import { Tag as number } from './tag';

export class Tablero {
    id: number;
    nombre: string;
    filas: number;
    columnas: number;
    mainTag: number;
    listaTags: number[];

    constructor(id: number, nombre: string, filas: number, columnas: number, mainTag: number, listaTags: number[]){
        this.id = id;
        this.nombre = nombre;
        this.filas = filas;
        this.columnas = columnas;
        this.mainTag = mainTag;
        this.listaTags = listaTags;
    }
}