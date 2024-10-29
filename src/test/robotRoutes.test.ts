import { app } from '../../app';

import supertest from 'supertest';
//const baseURL = "http://localhost:3000"

describe('Robot API', () => {
  describe('GET /robot/:id/status', () => {
    it('should return a 200 when robot exists', async () => {
      await supertest(app).get('/robot/1/status').expect(200);
    });
    it("should return a 400 when robot doesn't exist", async () => {
      await supertest(app).get('/robot/999/status').expect(404);
    });
  });
});

// npm i -g bun

/*describe('GET /robot/:id/status', () => {
    it('should return the status of the robot when robot exists', async () => {
        const response = await request(baseURL).get('/robot/1/status'); // Testen für Roboter mit ID 1

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', 1);
        expect(response.body).toHaveProperty('position');
        expect(response.body).toHaveProperty('energy');
        expect(response.body).toHaveProperty('inventory');
    });

    it('should return 404 when robot does not exist', async () => {
        const response = await request(baseURL).get('/robot/999/status'); // Roboter-ID 999 existiert nicht

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Robot with id 999 not found');
    });
});*/
