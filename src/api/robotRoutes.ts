import { robots } from '../data/robotsData';
import { items } from '../data/itemsData';
import { intAsString } from '../utils';
import { Directions } from '../models/schema/action';
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { PositionSchema } from '../models/schema/position';

export const router = new OpenAPIHono();

export const zod400 = {
  content: {
    'application/json': {
      schema: z.object({
        success: z.boolean().openapi({
          example: false
        }),
        error: z
          .object({
            issues: z.array(
              z
                .object({
                  message: z
                    .string()
                    .openapi({ example: 'Expected string, received number' }),
                  code: z.string().openapi({ example: 'invalid_type' })
                })
                .passthrough()
            ),
            name: z.string().openapi({ example: 'ZodError' })
          })
          .optional()
          .openapi('ZodError')
      }),
      example: {
        success: false,
        error: {
          name: 'ZodError',
          issues: []
        }
      }
    }
  },
  description: 'ZodError'
};

const getRobotStatusRoute = createRoute({
  method: 'get',
  path: '/{id}/status',
  summary: 'Get robot status',
  description:
    'Returns the current status of the robot as JSON, including ID (id), position (position), energy level (energy), and inventory (inventory)',
  request: {
    params: z
      .object({
        id: intAsString
      })
      .openapi({
        param: {
          name: 'id',
          in: 'path'
        },
        example: {
          id: '1'
        }
      })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            position: PositionSchema.openapi('Position'),
            energy: z.number(),
            inventory: z.array(z.number()),
            links: z.object({
              self: z.string(),
              actions: z.string()
            })
          })
        }
      },
      description: 'Robot status successfully returned'
    },
    400: zod400,
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Robot with the specified ID not found'
    }
  }
});

router.openapi(getRobotStatusRoute, (c) => {
  const { id } = c.req.valid('param');
  const robot = robots.find((r) => r.id === id);

  if (!robot) {
    return c.json({ message: 'Robot with id ' + id + ' not found' }, 404);
  }

  return c.json(
    {
      id: robot.id,
      position: robot.position,
      energy: robot.energy,
      inventory: robot.inventory,
      links: {
        self: `/robot/${robot.id}/status`,
        actions: `/robot/${robot.id}/actions`
      }
    },
    200
  );
});

const moveRoute = createRoute({
  method: 'post',
  path: '/{id}/move',
  summary: 'Move the robot',
  description:
    'Moves the robot in the specified direction. The direction cannot be empty and must be one of the valid options up, down, left, or right.',
  request: {
    params: z.object({
      id: intAsString.openapi({
        param: {
          name: 'id',
          in: 'path'
        },
        example: '1'
      })
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            direction: Directions
          })
        }
      },
      required: true,
      description: 'The direction in which the robot should move'
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            position: PositionSchema.openapi('Position')
          })
        }
      },
      description: 'Robot successfully moved'
    },
    400: zod400,
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Robot with the specified ID not found'
    }
  }
});

router.openapi(moveRoute, (c) => {
  const { id } = c.req.valid('param');
  const robot = robots.find((r) => r.id === id);
  if (!robot) {
    return c.json({ message: 'Robot with id ' + id + ' not found' }, 404);
  }

  const { direction } = c.req.valid('json');
  robot.move(direction);

  return c.json(
    {
      message: 'Robot successfully moved',
      position: robot.position
    },
    200
  );
});

const postPickupItem = createRoute({
  method: 'post',
  path: '/{id}/pickup/{itemId}',
  summary: 'Pickup item',
  description:
    'The robot picks up an item with the specified ID. If successful, the item is added to its inventory.',
  request: {
    params: z.object({
      id: intAsString.openapi({
        param: {
          name: 'id',
          in: 'path'
        },
        example: '1'
      }),
      itemId: intAsString.openapi({
        param: {
          name: 'itemId',
          in: 'path'
        },
        example: '1'
      })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            inventory: z.array(z.number())
          })
        }
      },
      description: 'Item successfully picked up'
    },
    400: zod400,
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Robot or Item with the specified ID not found'
    },
    409: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Item already in Inventory of Robot'
    }
  }
});

router.openapi(postPickupItem, (c) => {
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
    return c.json(
      {
        message: `Item with id ${itemId} already in Inventory of Robot with id ${item.robotId}`
      },
      409
    );
  }

  item.setInInventory(robot.id);
  robot.pickup(item.id);
  return c.json(
    {
      message: `Item ${item.id} picked up`,
      inventory: robot.inventory
    },
    200
  );
});

const postPutdownItem = createRoute({
  method: 'post',
  path: '/{id}/putdown/{itemId}',
  summary: 'Put item down',
  description:
    "Puts down an item from the robot's inventory. When put down, the item is placed on the current field",
  request: {
    params: z.object({
      id: intAsString.openapi({
        param: {
          name: 'id',
          in: 'path'
        },
        example: '1'
      }),
      itemId: intAsString.openapi({
        param: {
          name: 'itemId',
          in: 'path'
        },
        example: '1'
      })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            inventory: z.array(z.number())
          })
        }
      },
      description: 'Item successfully put down'
    },
    400: zod400,
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Robot or Item with the specified ID not found'
    },
    409: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Item is not in Inventory of Robot'
    }
  }
});

router.openapi(postPutdownItem, (c) => {
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
      409
    );
  }

  item.setNotInInventory(robot.position.x, robot.position.y);

  robot.putdown(item.id);
  return c.json(
    {
      message: `Item ${item.id} put down`,
      inventory: robot.inventory
    },
    200
  );
});

const patchRobotState = createRoute({
  method: 'patch',
  path: '/{id}/state',
  summary: 'Update robot state',
  description: 'Updates the state of the robot (e.g., energy level).',
  request: {
    params: z.object({
      id: intAsString.openapi({
        param: {
          name: 'id',
          in: 'path'
        },
        example: '1'
      })
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            energy: z.number().openapi({ example: 90 }),
            position: PositionSchema.openapi('Position')
          })
        }
      },
      required: true,
      description: 'New energy level or position of the robot'
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            robot: z
              .object({
                id: z.number(),
                position: PositionSchema.openapi('Position'),
                energy: z.number(),
                inventory: z.array(z.number())
              })
              .openapi('Robot')
          })
        }
      },
      description: 'Status succesfully updated'
    },
    400: zod400,
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Robot with the specified ID not found'
    },
    409: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Item is not in Inventory of Robot'
    }
  }
});

router.openapi(patchRobotState, (c) => {
  const { id } = c.req.valid('param');
  const robot = robots.find((r) => r.id === id);

  if (!robot) {
    return c.json({ message: `Robot with id ${id} not found` }, 404);
  }

  const { energy, position } = c.req.valid('json');
  robot.updateState({ energy, position });
  return c.json(
    {
      message: 'State updated',
      robot: {
        id: robot.id,
        position: robot.position,
        energy: robot.energy,
        inventory: robot.inventory
      }
    },
    200
  );
});

const getActionList = createRoute({
  method: 'get',
  path: '/{id}/actions',
  summary: 'Get list of robot actions',
  description: 'Returns a list of all actions performed by the robot so far',
  request: {
    params: z.object({
      id: intAsString.openapi({
        param: {
          name: 'id',
          in: 'path'
        },
        example: '1'
      })
    }),
    query: z.object({
      page: intAsString
        .refine((num) => z.number().int().gte(1).safeParse(num).success)
        .default('1'),
      size: intAsString
        .refine((num) => z.number().int().gte(1).safeParse(num).success)
        .default('5')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            page: z.number(),
            size: z.number(),
            totalActions: z.number(),
            actions: z.array(z.object({ action: z.string() })),
            links: z.object({
              self: z.string(),
              next: z.string(),
              previous: z.string().nullable()
            })
          })
        }
      },
      description: 'List of actions succesfully returned'
    },
    400: zod400,
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Robot with the specified ID not found'
    }
  }
});

router.openapi(getActionList, (c) => {
  const { id } = c.req.valid('param');

  const robot = robots.find((r) => r.id === id);
  if (!robot) {
    return c.json({ message: `Robot with id ${id} not found` }, 404);
  }

  const { page, size } = c.req.valid('query');

  const startIndex = (page - 1) * size;
  const paginatedActions = robot.actions.slice(startIndex, startIndex + size);

  return c.json(
    {
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
    },
    200
  );
});

const postAttackRobot = createRoute({
  method: 'post',
  path: '/{id}/attack/{targetId}',
  summary: 'Attack another robot',
  description: 'Executes an attack on another robot',
  request: {
    params: z.object({
      id: intAsString.openapi({
        param: {
          name: 'id',
          in: 'path'
        },
        example: '1'
      }),
      targetId: intAsString.openapi({
        param: {
          name: 'targetId',
          in: 'path'
        },
        example: '2'
      })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            attackerEnergy: z.number(),
            targetEnergy: z.number()
          })
        }
      },
      description: 'Robot successfully attacked'
    },
    400: zod400,
    404: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Robot with the specified ID not found'
    },
    409: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      },
      description: 'Not enough energy to attack'
    }
  }
});

router.openapi(postAttackRobot, (c) => {
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
    return c.json(
      {
        message: 'Attack executed',
        attackerEnergy: attacker.energy,
        targetEnergy: target.energy
      },
      200
    );
  } catch (error) {
    return c.json({ message: (error as any).message }, 409);
  }
});
