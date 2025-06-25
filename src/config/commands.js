/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const TET = {
  name: 'tet',
  description: 'Countdown day to Tết!',
};

export const GACHA = {
  name: 'gacha',
  description: 'Gacha Gacha',
  options: [
    {
      type: 3, // STRING
      name: 'list',
      description: 'Use a custom gacha list (optional)',
      required: false,
    },
  ],
};

export const GACHA_LIST = {
  name: 'gacha-list',
  description: 'Manage gacha lists',
  options: [
    {
      type: 1, // SUB_COMMAND
      name: 'show',
      description: 'Show a gacha list',
      options: [
        {
          type: 3, // STRING
          name: 'name',
          description: 'Name of the custom list (leave empty for default list)',
          required: false,
        },
      ],
    },
    {
      type: 1, // SUB_COMMAND
      name: 'new',
      description: 'Create a new custom gacha list',
      options: [
        {
          type: 3, // STRING
          name: 'name',
          description: 'Name of the new list',
          required: true,
        },
        {
          type: 3, // STRING
          name: 'options',
          description:
            'Comma-separated list of options (e.g., "opt1, opt2, opt3")',
          required: true,
        },
      ],
    },
    {
      type: 1, // SUB_COMMAND
      name: 'add',
      description: 'Add options to an existing custom gacha list',
      options: [
        {
          type: 3, // STRING
          name: 'name',
          description: 'Name of the existing list',
          required: true,
        },
        {
          type: 3, // STRING
          name: 'options',
          description: 'Comma-separated list of new options to add',
          required: true,
        },
      ],
    },
    {
      type: 1, // SUB_COMMAND
      name: 'clear',
      description: 'Clear/delete a custom gacha list',
      options: [
        {
          type: 3, // STRING
          name: 'name',
          description: 'Name of the list to clear',
          required: true,
        },
      ],
    },
    {
      type: 1, // SUB_COMMAND
      name: 'lists',
      description: 'Show all custom gacha lists',
    },
  ],
};

export const RANDOM = {
  name: 'random',
  description: 'Generate random numbers using Random.org API',
  options: [
    {
      type: 4, // INTEGER
      name: 'min',
      description: 'Minimum value (default: 1)',
      required: false,
    },
    {
      type: 4, // INTEGER
      name: 'max',
      description: 'Maximum value (default: 100)',
      required: false,
    },
    {
      type: 4, // INTEGER
      name: 'count',
      description: 'Number of random numbers to generate (default: 1, max: 10)',
      required: false,
    },
  ],
};

export const MANG = {
  name: 'mang',
  description: 'mắng dũng',
  options: [
    {
      type: 6, // USER
      name: 'member',
      description: 'Member to target',
      required: false,
    },
  ],
};
