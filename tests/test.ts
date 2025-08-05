jest.mock('../src/services/tableroService');

import request from 'supertest';
import app from '../src/Proyect_O';
import { TableroService } from '../src/services/tableroService';

describe('Tablero service ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / devuelve una lista de tableros', async () => {
    const mockTableros = { mensaje: "Hola, bienvenido a la API de tableros" };
    (TableroService.getAllTableros as jest.Mock).mockResolvedValue(mockTableros);

    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTableros);
  });
});