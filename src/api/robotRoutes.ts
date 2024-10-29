import express from 'express';

import { robots } from '../data/robotsData';
import { items } from '../data/itemsData';

export const router = express.Router();
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
router.get('/:id/status', (req, res) => {
  const robot = robots.find((r) => r.id === parseInt(req.params.id));
  if (!robot) {
    res
      .status(404)
      .json({ message: 'Robot with id ' + req.params.id + ' not found' });
    return;
  }

  res.json({
    id: robot.id,
    position: robot.position,
    energy: robot.energy,
    inventory: robot.inventory,
    links: {
      self: `/robot/${robot.id}/status`,
      actions: `/robot/${robot.id}/actions`
    }
  });
});

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
 *       - in: body
 *         name: body
 *         required: true
 *         description: The direction in which the robot should move
 *         schema:
 *           type: object
 *           properties:
 *             direction:
 *               type: string
 *               description: Direction in which the robot should move. Valid values are up, down, left, right.
 *               example: "up"
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
router.post('/:id/move', (req, res) => {
  const robot = robots.find((r) => r.id === parseInt(req.params.id));
  const { direction } = req.body;
  const validDirections = ['up', 'down', 'left', 'right'];

  if (!robot) {
    res
      .status(404)
      .json({ message: 'Robot with id ' + req.params.id + ' not found' });
    return;
  }

  if (!direction) {
    res.status(400).json({
      error: 'Invalid request body',
      message:
        'Direction cannot be empty. Please provide a valid direction (up, down, left, right).'
    });
    return;
  }

  if (!validDirections.includes(direction)) {
    res.status(422).json({
      error: 'Invalid input value for direction',
      message:
        'The body does not contain a valid direction (up, down, left, right).',
      received: direction
    });
    return;
  }
  robot.move(direction);
  res.json({ message: `Robot moved ${direction}`, position: robot.position });
});

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
router.post('/:id/pickup/:itemId', (req, res) => {
  const robot = robots.find((r) => r.id === parseInt(req.params.id));
  //const { itemId } = req.params;
  const item = items.find((r) => r.id === parseInt(req.params.itemId));

  if (!robot) {
    res
      .status(404)
      .json({ message: `Robot with id ${req.params.id} not found` });
    return;
  }

  if (!item) {
    res
      .status(404)
      .json({ message: `Item with id ${req.params.itemId} not found` });
    return;
  }

  if (item.robotId !== null) {
    res.status(400).json({
      message: `Item with id ${req.params.itemId} already in Inventory of Robot with id ${item.robotId}`
    });
    return;
  }

  item.setInInventory(robot.id);
  robot.pickup(item.id);
  res.json({
    message: `Item ${item.id} picked up`,
    inventory: robot.inventory
  });
});

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
router.post('/:id/putdown/:itemId', (req, res) => {
  const robot = robots.find((r) => r.id === parseInt(req.params.id));
  if (!robot) {
    res
      .status(404)
      .json({ message: 'Robot with id ' + req.params.id + ' not found' });
    return;
  }

  const item = items.find((r) => r.id === parseInt(req.params.itemId));
  if (!item) {
    res
      .status(404)
      .json({ message: `Item with id ${req.params.itemId} not found` });
    return;
  }

  const itemInInventory = robot.inventory.find((id) => id === item.id);
  if (!itemInInventory) {
    res.status(400).json({
      error: 'Item Not Found',
      message: `Item with id ${item.id} is not in the inventory of robot ${req.params.id}.`
    });
    return;
  }

  item.setNotInInventory(robot.position.x, robot.position.y);

  robot.putdown(item.id);
  res.json({ message: `Item ${item.id} put down`, inventory: robot.inventory });
});

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
router.patch('/:id/state', (req, res) => {
  const robot = robots.find((r) => r.id === parseInt(req.params.id));
  const { energy, position } = req.body;

  if (!robot) {
    res
      .status(404)
      .json({ message: 'Robot with id ' + req.params.id + ' not found' });
    return;
  }

  //TODO falsche Formatierung von body

  robot.updateState({ energy, position });
  res.json({ message: 'State updated', robot });
});

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
router.get('/:id/actions', (req, res) => {
  const robot = robots.find((r) => r.id === parseInt(req.params.id));
  if (!robot) {
    res
      .status(404)
      .json({ message: `Robot with id ${req.params.id} not found` });
    return;
  }

  if (
    req.query.page &&
    (typeof req.query.page !== 'string' || !isNaN(parseInt(req.query.page)))
  ) {
    res.status(400).json({
      error: 'Invalid query',
      message: 'Page must be a number'
    });
    return;
  }
  if (
    req.query.size &&
    (typeof req.query.size !== 'string' || !isNaN(parseInt(req.query.size)))
  ) {
    res.status(400).json({
      error: 'Invalid query',
      message: 'Size must be a number'
    });
    return;
  }

  // ?page=23

  const page = parseInt(req.query.page || '1') || 1;
  const size = parseInt(req.query.size || '5') || 5;
  const startIndex = (page - 1) * size;
  const paginatedActions = robot.actions.slice(startIndex, startIndex + size);

  res.json({
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
});

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
router.post('/:id/attack/:targetId', (req, res) => {
  const attacker = robots.find((r) => r.id === parseInt(req.params.id));
  const target = robots.find((r) => r.id === parseInt(req.params.targetId));

  if (!attacker || !target) {
    res
      .status(404)
      .json({ message: `Robot with id ${req.params.id} not found` });
    return;
  }

  try {
    attacker.attack(target);
    res.json({
      message: 'Attack executed',
      attackerEnergy: attacker.energy,
      targetEnergy: target.energy
    });
  } catch (error) {
    res.status(400).json({ message: (error as any).message });
  }
});
