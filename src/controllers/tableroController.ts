import { strict } from 'assert';
import { TableroModel } from '../models/tablero.model';
import { TagModel } from '../models/tag.model';
import fs from 'fs';
import path from 'path';

interface AccionInput {
  delay: number;
  tipo: 'audio' | 'movimiento' | 'luz';
  archivo?: string;
  direccion?: 'arriba' | 'abajo' | 'izquierda' | 'derecha';
  color?: string;
  intervalo?: number;
}
interface TagInput {
  ID: number;
  listaAcciones: AccionInput[];
  fila: number;
  columna: number;
  fondo?: string;
}
interface TableroFullInput {
  id: number;
  nombre: string;
  filas: number;
  columnas: number;
  mainTag: TagInput;
  listaTags: TagInput[];
  colorlineas: string;
  fondo?: string;
}

export class TableroController {
  static formatTablero(tablero: any) {
    if(tablero.fondo && TableroController.isFilePath(tablero.fondo)){
      const normalizedPath = path.normalize(tablero.fondo);
      const filename = path.basename(normalizedPath);
      tablero.fondo = `/static/img/${filename}`;
    }
    const formatTag = (tag: any) => {
      const tagJson = JSON.parse(JSON.stringify(tag));
      if(tagJson.fondo && TableroController.isFilePath(tagJson.fondo)){
        const normalizedPath = path.normalize(tagJson.fondo);
        const filename = path.basename(normalizedPath);
        tag.fondo = `/static/img/${filename}`;
      }
      if (!Array.isArray(tag.listaAcciones)) { tag.listaAcciones = []; }
      tag.listaAcciones.forEach((accion: any) => {
        if (accion && accion.tipo === 'audio') {
          const accionJson = JSON.parse(JSON.stringify(accion));
          if (accionJson.archivo) {
            const normalizedPath = path.normalize(accionJson.archivo);
            const filename = path.basename(normalizedPath);
            accion.archivo = `/static/audio/${filename}`;
          } else {
            console.warn('Archivo de audio no es una cadena:', accionJson.archivo);
          }
        }
      });
      return tag;
    };
    tablero.mainTag = formatTag(tablero.mainTag);
    tablero.listaTags = tablero.listaTags.map(formatTag);
    return tablero;
  }
  static isFilePath(fondo: string): boolean {
    return /\.(png|jpg|jpeg|gif|webp)$/i.test(fondo);
  }
  static moveImageFile(tempPath: string, fileName: string): string {
    const ext = path.extname(tempPath);
    const destDir = path.join(__dirname, '..', 'documentos', 'img');
    const destPath = path.join(destDir, fileName);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(tempPath, destPath);
    return `./documentos/img/${fileName}`;
  }
  static async getAll() {
    try {
      const tableros = await TableroModel.find()
        .populate({
          path: 'mainTag',
          populate: { path: 'listaAcciones' },
        })
        .populate({
          path: 'listaTags',
          populate: { path: 'listaAcciones' },
        }).lean();
      const formatted = tableros.map(TableroController.formatTablero);
      return [200, formatted];
    } catch (err) {
      return [500, { error: 'Error al obtener tableros', details: err }];
    }
  }
  static async getById(id: string) {
    try {
      const tablero = await TableroModel.findOne({ _id: id })
        .populate({
          path: 'mainTag',
          populate: { path: 'listaAcciones' },
        })
        .populate({
          path: 'listaTags',
          populate: { path: 'listaAcciones' },
        }).lean();
      if (!tablero) return [404, { error: 'Tablero no encontrado' }];
      const tableroForm = await TableroController.formatTablero(tablero);
      return [200, tableroForm];
    } catch (err) {
      return [500, { error: 'Error al buscar tablero', details: err }];
    }
  }
  static async delete(id: number) {
    try {
      const tablero = await TableroModel.findOne({ id });
      if (!tablero) {
        return [404, { error: 'Tablero no encontrado' }];
      }
      if(tablero.fondo && TableroController.isFilePath(tablero.fondo)){
          const archivo = tablero.fondo;
          if (archivo) {
            fs.unlinkSync(archivo);
          }
        }
      const allTagIds = [
        tablero.mainTag,
        ...(tablero.listaTags || [])
      ];
      const tags = await TagModel.find({ _id: { $in: allTagIds } });
      for (const tag of tags) {
        if(tag.fondo && TableroController.isFilePath(tag.fondo.toString())){
          const archivo = tag.fondo;
          if (archivo) {
            fs.unlinkSync(archivo.toString());
          }
        }
        for (const accion of tag.listaAcciones || []) {
          const accionJson = JSON.parse(JSON.stringify(accion));
          if (accion.tipo === 'audio' && accionJson.archivo) {
            const archivo = accionJson.archivo;
            if (archivo) {
              fs.unlinkSync(archivo);
            }
          }
        }
        await TagModel.deleteOne({ _id: tag._id });
      }
      const result = await TableroModel.deleteOne({ id });
      return [200, { message: 'Tablero y datos asociados eliminados' }];
    } catch (err) {
      return [500, { error: 'Error al eliminar tablero y datos relacionados', details: err }];
    }
  }
  static async createFull(data: any, fileMap: Record<string, string>) {
    try {
      if (fileMap['tablero-fondo']) {
        data.fondo = fileMap['tablero-fondo'];
      }
      if (fileMap['mainTag-fondo']) {
        data.mainTag.fondo = fileMap['mainTag-fondo'];
      }
      if (data.mainTag.listaAcciones) {
        data.mainTag.listaAcciones.forEach((accion: any, index: number) => {
          const fieldKey = `mainTag-${index}`;
          if (fileMap[fieldKey]) {
            accion.archivo = fileMap[fieldKey];
          }
        });
      }
      if (data.listaTags) {
        data.listaTags.forEach((tag: any, tagIndex: number) => {
          const tagKey = `tag-${tagIndex}-fondo`;
          if (fileMap[tagKey]) {
            tag.fondo = fileMap[tagKey];
          }
          if (tag.listaAcciones) {
            tag.listaAcciones.forEach((accion: any, accionIndex: number) => {
              const accionKey = `tag-${tagIndex}-accion-${accionIndex}`;
              if (fileMap[accionKey]) {
                accion.archivo = fileMap[accionKey];
              }
            });
          }
        });
      }
      const allTags = [data.mainTag, ...(data.listaTags || [])];
      const savedTags = [];
      for (const tag of allTags) {
        const tagDoc = new TagModel(tag);
        const savedTag = await tagDoc.save();
        savedTags.push(savedTag);
      }
      console.log("hola ", (data))
      const tableroFinal = new TableroModel({
        ...data,
        mainTag: savedTags[0]._id,
        listaTags: savedTags.slice(1).map((t) => t._id),
      });
      await tableroFinal.save();

      return [200, 'Tablero guardado con éxito'];
    } catch (error) {
      console.error('Error en createFull:', error);
      return [500, 'Error al guardar el tablero'];
    }
  }
  static async updateFav(tableroId: string, ponerFavorito: boolean) {
    try {
      const tablero = await TableroModel.findById({ _id: tableroId });
      if (!tablero) {
        return [404, 'Tablero no encontrado'];
      }
      tablero.favoritos = ponerFavorito;
      await tablero.save();

      return [200, 'Estado de favoritos actualizado'];
    } catch (error) {
      return [500, 'Error al actualizar favoritos'];
    }
  }
}