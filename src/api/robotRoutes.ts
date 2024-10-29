import { robots } from '../data/robotsData';
import { items } from '../data/itemsData';
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { intAsString } from '../utils';
import { Directions, StateUpdateSchema } from '../models/schema/action';

export const router = new Hono();
/**
 * @swagger
 * /robot/{id}/status:
 *   get:
 *     summary: Get robot status
 *     description: Returns the current status of the robot as JSON, including ID (id), position (position), energy level (energy), and inventory (inventory).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the robot
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 position:
 *                   type: object
 *                   properties:
 *                     x:
 *                       type: integer
 *                       example: 5
 *                     y:
 *                       type: integer
 *                       example: 5
 *                 energy:
 *                   type: integer
 *                   example: 100
 *                 inventory:
 *                   type: array
 *                   items:
 *                     type: string
 *                 links:
 *                   type: object
 *                   properties:
 *                     self:
 *                       type: string
 *                     actions:
 *                       type: string
 *       404:
 *         description: Robot with id {id} not found
 */
router.get(
  '/:id/status',
  zValidator(
    'param',
    z.object({
      id: intAsString
    })
  ),
  (c) => {
    const { id } = c.req.valid('param');
    const robot = robots.find((r) => r.id === id);

    if (!robot) {
      return c.json({ message: 'Robot with id ' + id + ' not found' }, 404);
    }

    return c.json({
      id: robot.id,
      position: robot.position,
      energy: robot.energy,
      inventory: robot.inventory,
      links: {
        self: `/robot/${robot.id}/status`,
        actions: `/robot/${robot.id}/actions`
      }
    });
  }
);

/**
 * @swagger
 * /robot/{id}/move:
 *   post:
 *     summary: Move the robot
 *     description: Moves the robot in the specified direction. The direction cannot be empty and must be one of the valid options up, down, left, or right.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the robot
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       description: The direction in which the robot should move
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               direction:
 *                 type: string
 *                 description: Direction in which the robot should move. Valid values are up, down, left, right.
 *                 example: "up"
 *     responses:
 *       200:
 *         description: Robot successfully moved
 *       400:
 *         description: Invalid request body. Direction cannot be empty
 *       404:
 *         description: Robot with the specified ID not found
 *       422:
 *         description: Invalid input value for direction. Direction must be up, down, left or right
 */
router.post(
  '/:id/move',
  zValidator(
    'param',
    z.object({
      id: intAsString
    })
  ),
  zValidator(
    'json',
    z.object({
      direction: Directions
    })
  ),
  (c) => {
    const { id } = c.req.valid('param');
    const robot = robots.find((r) => r.id === id);
    if (!robot) {
      return c.json({ message: 'Robot with id ' + id + ' not found' }, 404);
    }

    const { direction } = c.req.valid('json');
    robot.move(direction);

    return c.json({
      message: `Robot moved ${direction}`,
      position: robot.position
    });
  }
);

/**
 * @swagger
 * /robot/{id}/pickup/{itemId}:
 *   post:
 *     summary: Pickup item
 *     description: The robot picks up an item with the specified ID. If successful, the item is added to its inventory.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the robot
 *         schema:
 *           type: integer
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: ID of the item
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item successfully picked up
 *       400:
 *         description: Item with id already in Inventory of Robot with id
 *       404:
 *         description: Robot or Item with id {id} not found
 */
router.post(
  '/:id/pickup/:itemId',
  zValidator(
    'param',
    z.object({
      id: intAsString,
      itemId: intAsString
    })
  ),
  (c) => {
    const { id, itemId } = c.req.valid('param');
    const robot = robots.find((r) => r.id === id);

    if (!robot) {
      return c.json({ message: `Robot with id ${id} not found` }, 404);
    }

    const item = items.find((r) => r.id === itemId);
    if (!item) {
      return c.json({ message: `Item with id ${itemId} not found` }, 404);
    }

    if (item.robotId !== null) {
      return c.json({
        message: `Item with id ${itemId} already in Inventory of Robot with id ${item.robotId}`
      });
    }

    item.setInInventory(robot.id);
    robot.pickup(item.id);
    return c.json({
      message: `Item ${item.id} picked up`,
      inventory: robot.inventory
    });
  }
);

/**
 * @swagger
 * /robot/{id}/putdown/{itemId}:
 *   post:
 *     summary: Put down item
 *     description: Puts down an item from the robot's inventory. When put down, the item is placed on the current field.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the robot
 *         schema:
 *           type: integer
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: ID of the item
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item successfully put down
 *       404:
 *         description: Robot or Item with id {id} not found
 */
router.post(
  '/:id/putdown/:itemId',
  zValidator(
    'param',
    z.object({
      id: intAsString,
      itemId: intAsString
    })
  ),
  (c) => {
    const { id, itemId } = c.req.valid('param');
    const robot = robots.find((r) => r.id === id);
    if (!robot) {
      return c.json({ message: `Robot with id ${id} not found` }, 404);
    }

    const item = items.find((r) => r.id === itemId);
    if (!item) {
      return c.json({ message: `Item with id ${itemId} not found` }, 404);
    }

    const itemInInventory = robot.inventory.find((id) => id === item.id);
    if (!itemInInventory) {
      return c.json(
        {
          error: 'Item Not Found',
          message: `Item with id ${itemId} is not in the inventory of robot ${id}.`
        },
        404
      );
    }

    item.setNotInInventory(robot.position.x, robot.position.y);

    robot.putdown(item.id);
    return c.json({
      message: `Item ${item.id} put down`,
      inventory: robot.inventory
    });
  }
);

/**
 * @swagger
 * /robot/{id}/state:
 *   patch:
 *     summary: Update robot state
 *     description: Updates the state of the robot (e.g., energy level).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the robot
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               energy:
 *                 type: integer
 *                 description: New energy level of the robot
 *                 example: 90
 *               position:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: integer
 *                     example: 10
 *                   y:
 *                     type: integer
 *                     example: 20
 *     responses:
 *       200:
 *         description: State successfully updated
 *       404:
 *         description: Robot with id {id} not found
 */
router.patch(
  '/:id/state',
  zValidator(
    'param',
    z.object({
      id: intAsString
    })
  ),
  zValidator('json', StateUpdateSchema),
  (c) => {
    const { id } = c.req.valid('param');
    const robot = robots.find((r) => r.id === id);

    if (!robot) {
      return c.json({ message: `Robot with id ${id} not found` }, 404);
    }

    const { energy, position } = c.req.valid('json');
    robot.updateState({ energy, position });
    return c.json({ message: 'State updated', robot });
  }
);

/**
 * @swagger
 * /robot/{id}/actions:
 *   get:
 *     summary: Get robot actions
 *     description: Returns a list of all actions performed by the robot so far.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the robot
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page of action results
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: size
 *         required: false
 *         description: Number of actions per page
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Successful query of actions
 *       404:
 *         description: Robot with id {id} not found
 */
router.get(
  '/:id/actions',
  zValidator(
    'param',
    z.object({
      id: intAsString
    })
  ),
  zValidator(
    'query',
    z.object({
      page: intAsString
        .refine((num) => z.number().int().gte(1).safeParse(num).success)
        .default('1'),
      size: intAsString
        .refine((num) => z.number().int().gte(1).safeParse(num).success)
        .default('5')
    })
  ),
  (c) => {
    const { id } = c.req.valid('param');

    const robot = robots.find((r) => r.id === id);
    if (!robot) {
      return c.json({ message: `Robot with id ${id} not found` });
    }

    const { page, size } = c.req.valid('query');

    const startIndex = (page - 1) * size;
    const paginatedActions = robot.actions.slice(startIndex, startIndex + size);

    return c.json({
      page,
      size,
      totalActions: robot.actions.length,
      actions: paginatedActions,
      links: {
        self: `/robot/${robot.id}/actions?page=${page}&size=${size}`,
        next: `/robot/${robot.id}/actions?page=${page + 1}&size=${size}`,
        previous:
          page > 1
            ? `/robot/${robot.id}/actions?page=${page - 1}&size=${size}`
            : null
      }
    });
  }
);

/**
 * @swagger
 * /robot/{id}/attack/{targetId}:
 *   post:
 *     summary: Attack another robot
 *     description: Executes an attack on another robot.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the attacking robot
 *         schema:
 *           type: integer
 *       - in: path
 *         name: targetId
 *         required: true
 *         description: ID of the attacked robot
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attack successfully executed
 *       400:
 *         description: Not enough energy to attack
 *       404:
 *         description: Robot with id {id} not found
 */
router.post(
  '/:id/attack/:targetId',
  zValidator(
    'param',
    z.object({
      id: intAsString,
      targetId: intAsString
    })
  ),
  (c) => {
    const { id, targetId } = c.req.valid('param');
    const attacker = robots.find((r) => r.id === id);
    const target = robots.find((r) => r.id === targetId);

    if (!attacker || !target) {
      return c.json(
        { message: `Robot with id ${id} or id ${targetId} not found` },
        404
      );
    }

    try {
      attacker.attack(target);
      return c.json({
        message: 'Attack executed',
        attackerEnergy: attacker.energy,
        targetEnergy: target.energy
      });
    } catch (error) {
      return c.json({ message: (error as any).message }, 400);
    }
  }
);
