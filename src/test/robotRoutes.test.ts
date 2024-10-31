import { app } from '../../app';
import { robots } from '../data/robotsData';
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

    it("should return a 404 when robot with id 999 doesn't exist", async () => {
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
    it("should return a 404 when robot with id doesn't exist", async () => {
      const res = await app.request('/robot/999/pickup/1', { method: 'POST' });
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.message).toBe('Robot with ID 999 not found');
    });
    it("should return a 404 when item with id doesn't exist", async () => {
      const res = await app.request('/robot/1/pickup/999', { method: 'POST' });
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.message).toBe('Item with ID 999 not found');
    });
    it('should return a 409 when item with id is already in inventory', async () => {
      const robot1 = robots.find((r) => r.id == 1);

      robot1?.pickup(1);

      const res = await app.request('/robot/1/pickup/1', { method: 'POST' });
      expect(res.status).toBe(409);

      const body = await res.json();
      expect(body.message).toBe(
        'Item with ID 1 already in Inventory of Robot with ID 1'
      );
    });
  });

  describe('POST /robot/:id/putdown/:itemId', () => {
    it('should return a 200 when item is put down', async () => {
      const robot1 = robots.find((r) => r.id == 1);

      robot1?.pickup(1);

      const res = await app.request('/robot/1/putdown/1', { method: 'POST' });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.message).toBe('Item 1 put down');
    });
    it("should return a 404 when robot with id 999 doesn't exist", async () => {
      const res = await app.request('/robot/999/putdown/1', { method: 'POST' });
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.message).toBe('Robot with ID 999 not found');
    });
    it("should return a 404 when item with id 999 doesn't exist", async () => {
      const res = await app.request('/robot/1/putdown/999', { method: 'POST' });
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.message).toBe('Item with ID 999 not found');
    });
    it('should return a 409 when item with id 2 is not in inventory', async () => {
      const robot1 = robots.find((r) => r.id == 1);

      robot1?.pickup(1);

      const res = await app.request('/robot/1/putdown/2', { method: 'POST' });
      expect(res.status).toBe(409);

      const body = await res.json();
      expect(body.message).toBe(
        'Item with ID 2 is not in the inventory of robot with ID 1'
      );
    });
  });

  describe('PATCH /robot/:id/state', () => {
    it('should return a 200 when energy is updated', async () => {
      const res = await app.request('/robot/1/state', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ energy: 90 })
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.robot).toHaveProperty('energy', 90);
    });
    it('should return a 200 when position is updated', async () => {
      const res = await app.request('/robot/1/state', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position: { x: 90, y: 0 } })
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.robot.position).toHaveProperty('x', 90);
      expect(body.robot.position).toHaveProperty('y', 0);
    });
    it("should return a 404 when robot with id 999 doesn't exist", async () => {
      const res = await app.request('/robot/999/state', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position: { x: 90, y: 0 } })
      });

      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.message).toBe('Robot with ID 999 not found');
    });
    it('should return a 400 when position has an invalid value', async () => {
      const res = await app.request('/robot/999/state', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position: { x: 'invalid', y: 0 } })
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /robot/:id/actions', () => {
    it('should return a 200 when list of actions is returned', async () => {
      const res = await app.request('/robot/1/actions', {
        method: 'GET'
      });

      expect(res.status).toBe(200);
    });
    it('should return a 200 when list of actions page 1 size 5 is returned', async () => {
      const res = await app.request('/robot/1/actions?page=1&size=5', {
        method: 'GET'
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('page', 1);
      expect(body).toHaveProperty('size', 5);
    });
    it("should return a 404 when robot with id 999 doesn't exist", async () => {
      const res = await app.request('/robot/999/actions', {
        method: 'GET'
      });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /robot/:id/attack/:targetId', () => {
    it('should return a 200 when robot with id 1 attacks successfully id 2', async () => {
      const res = await app.request('/robot/1/attack/2', {
        method: 'POST'
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('Attack executed');
    });
    it("should return a 404 when robot with id 999 doesn't exist", async () => {
      const res = await app.request('/robot/999/attack/1', {
        method: 'GET'
      });

      expect(res.status).toBe(404);
    });
  });
});
