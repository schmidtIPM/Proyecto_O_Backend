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
  static buildAudioURL(localPath: string): string {
    const filename = path.basename(localPath);
    return `/static/audio/${filename}`;
  }
  static formatTablero(tablero: any) {
    const formatTag = (tag: any) => {
      tag.listaAcciones.forEach((accion: any) => {
        if (accion.tipo === 'audio' && accion.archivo) {
          accion.archivo = TableroController.buildAudioURL(accion.archivo);
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
        });
      const formatted = tableros.map(TableroController.formatTablero);
      return [200, formatted];
    } catch (err) {
      return [500, { error: 'Error al obtener tableros', details: err }];
    }
  }
  static async getById(id: number) {
    try {
      const tablero = await TableroModel.findOne({ id })
        .populate({
          path: 'mainTag',
          populate: { path: 'listaAcciones' },
        })
        .populate({
          path: 'listaTags',
          populate: { path: 'listaAcciones' },
        });
      if (!tablero) return [404, { error: 'Tablero no encontrado' }];
      return [200, TableroController.formatTablero(tablero)];
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
      const result = await TableroModel.deleteOne({ id });
      if (result.deletedCount === 0) {
        return [404, { error: 'Tablero no encontrado' }];
      }
      return [200, { message: 'Tablero eliminado' }];
    } catch (err) {
      return [500, { error: 'Error al eliminar tablero', details: err }];
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
