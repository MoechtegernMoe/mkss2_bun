import { app } from '../../app';
//const baseURL = "http://localhost:3000"

describe('Robot API', () => {
  describe('GET /robot/:id/status', () => {
    it('should return a 200 when robot with id 1 exists', async () => {
      const res = await app.request('/robot/1/status', {
        method: 'GET'
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('id', 1);
      expect(body).toHaveProperty('position');
      expect(body).toHaveProperty('energy');
      expect(body).toHaveProperty('inventory');
    });

    it("should return a 400 when robot with id 999 doesn't exist", async () => {
      const res = await app.request('/robot/999/status', {
        method: 'GET'
      });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /robot/:id/move', () => {
    it('should return a 200 when robot moves up', async () => {
      const res = await app.request('/robot/1/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ direction: 'up' })
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.message).toBe('Robot moved up');
    });

    it('should return a 400 when invalid input value for direction', async () => {
      const res = await app.request('robot/1/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ direction: 'invalid' })
      });

      expect(res.ok).toBe(false);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body).toBeTruthy();
    });

    it("should return a 404 when robot with id 999 doesn't exist", async () => {
      const res = await app.request('/robot/999/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ direction: 'up' })
      });
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.message).toBe('Robot with id 999 not found');
    });
  });

  describe('POST /robot/:id/pickup/:itemId', () => {
    it('should return a 200 when item is picked up', async () => {
      const res = await app.request('/robot/1/pickup/1', { method: 'POST' });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.message).toBe('Item 1 picked up');
    });
  });
});

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
