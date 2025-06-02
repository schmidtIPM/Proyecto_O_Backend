import { strict } from 'assert';
import { TableroModel } from '../models/tablero.model';
import { TagModel } from '../models/tag.model';
import fs from 'fs';
import path from 'path';
import { stringify } from 'querystring';
interface AccionInput {
  delay: number;
  tipo: 'audio' | 'movimiento' | 'luz';
  archivo?: string;
  direccion?: 'avanzar' | 'girar';
  color?: string;
  intervalo?: number;
}
interface TagInput {
  ID: number;
  listaAcciones: AccionInput[];
  fila: number;
  columna: number;
}
interface TableroFullInput {
  id: number;
  nombre: string;
  filas: number;
  columnas: number;
  mainTag: TagInput;
  listaTags: TagInput[];
}

export class TableroController {
  static formatTablero(tablero: any) {
    const formatTag = (tag: any) => {
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
  static async updateFull(data: TableroFullInput, fileMap: Record<string, string>): Promise<[number, any]> {
    try {
      const existing = await TableroModel.findOne({ id: data.id })
        .populate('mainTag')
        .populate('listaTags');
      if (!existing) return [404, { error: `Tablero con id ${data.id} no encontrado` }];
      const oldTags = [existing.mainTag, ...(existing.listaTags || [])];
      const oldAudioPaths: string[] = [];
      oldTags.forEach((tag: any, tagIndex) => {
        tag.listaAcciones.forEach((accion: any, accionIndex: number) => {
          if (accion.tipo === 'audio' && accion.archivo) {
            oldAudioPaths.push(accion.archivo);
          }
        });
      });
      data.mainTag.listaAcciones.forEach((accion, index) => {
        if (accion.tipo === 'audio') {
          const key = `mainTag-${index}`;
          if (fileMap[key]) {
            accion.archivo = fileMap[key];
          }
        }
      });
      data.listaTags.forEach((tag, tagIndex) => {
        tag.listaAcciones.forEach((accion, accionIndex) => {
          if (accion.tipo === 'audio') {
            const key = `tag-${tagIndex}-accion-${accionIndex}`;
            if (fileMap[key]) {
              accion.archivo = fileMap[key];
            }
          }
        });
      });
      await TagModel.deleteMany({ _id: { $in: oldTags.map(t => t._id) } });
      const mainTag = new TagModel(data.mainTag);
      await mainTag.save();
      const listaTagsDocs = await Promise.all(
        data.listaTags.map(async (tag) => {
          const tagDoc = new TagModel(tag);
          await tagDoc.save();
          return tagDoc._id;
        })
      );
      const updated = await TableroModel.findOneAndUpdate(
        { id: data.id },
        {
          nombre: data.nombre,
          filas: data.filas,
          columnas: data.columnas,
          mainTag: mainTag._id,
          listaTags: listaTagsDocs,
        },
        { new: true }
      );
      oldAudioPaths.forEach(path => {
        if (!Object.values(fileMap).includes(path) && fs.existsSync(path)) {
          fs.unlinkSync(path);
        }
      });
      return [200, updated];
    } catch (err) {
      return [500, { error: 'Error al actualizar tablero completo', details: err }];
    }
  }
  static async delete(id: number) {
    try {
      const tablero = await TableroModel.findOne({ id });
      if (!tablero) {
        return [404, { error: 'Tablero no encontrado' }];
      }
      const allTagIds = [
        tablero.mainTag,
        ...(tablero.listaTags || [])
      ];
      const tags = await TagModel.find({ _id: { $in: allTagIds } });
      for (const tag of tags) {
        for (const accion of tag.listaAcciones || []) {
          console.log(`Procesando acción: ${JSON.stringify(accion)}`);
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
  static async createFull(data: TableroFullInput, fileMap: Record<string, string>): Promise<[number, string]> {
    try {
      data.mainTag.listaAcciones.forEach((accion, index) => {
        if (accion.tipo === 'audio') {
          const key = `mainTag-${index}`;
          if (fileMap[key]) accion.archivo = fileMap[key];
        }
      });

      data.listaTags.forEach((tag, tagIndex) => {
        tag.listaAcciones.forEach((accion, accionIndex) => {
          if (accion.tipo === 'audio') {
            const key = `tag-${tagIndex}-accion-${accionIndex}`;
            if (fileMap[key]) accion.archivo = fileMap[key];
          }
        });
      });

      const mainTag = await new TagModel(data.mainTag).save();

      const listaTagsDocs = await Promise.all(
        data.listaTags.map(async (tag) => {
          const tagDoc = new TagModel(tag);
          await tagDoc.save();
          return tagDoc._id;
        })
      );

      await TableroModel.create({
        id: data.id,
        nombre: data.nombre,
        filas: data.filas,
        columnas: data.columnas,
        mainTag: mainTag._id,
        listaTags: listaTagsDocs,
      });

      return [200, 'Tablero creado con éxito'];
    } catch (err) {
      console.error(err);
      return [500, 'Error al crear el tablero'];
    }
  }
}
