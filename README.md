# Discord Worker

A Discord bot built with Cloudflare Workers that provides various utility commands including Lunar New Year countdown, random number generation, and gacha systems.

## Features

- 🎊 **Lunar New Year Countdown**: Automatically updates a Discord voice channel name with days remaining until Tết
- 🎲 **Random Number Generator**: Generate truly random numbers using Random.org API
- 🎰 **Gacha System**: Customizable gacha lists for random item selection
- ⚡ **Serverless**: Runs on Cloudflare Workers for fast, global performance
- 🕐 **Scheduled Tasks**: Automatic daily channel updates via cron jobs

## Commands

### `/tet`

Updates the voice channel name with the countdown to Lunar New Year.

- Calculates days remaining until Tết
- Updates the configured voice channel name
- Returns confirmation message

### `/random [min] [max] [count]`

Generates truly random numbers using Random.org API.

- `min`: Minimum value (default: 1)
- `max`: Maximum value (default: 100)
- `count`: Number of random numbers (default: 1, max: 10)

### `/gacha [list]`

Randomly selects an item from a gacha list.

- `list`: Optional custom list name (uses default if not specified)

### `/gacha-list <subcommand>`

Manage custom gacha lists:

- `show [name]`: Display items in a gacha list
- `new <name> <options>`: Create a new custom list
- `add <name> <options>`: Add items to existing list
- `clear <name>`: Delete a custom list
- `lists`: Show all custom list names

## Setup

### Prerequisites

- Node.js (v18+)
- Discord Application with Bot permissions
- Cloudflare account
- Random.org API key (optional, for `/random` command)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd discord-worker
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in Cloudflare Workers:

```bash
# Required Discord secrets
wrangler secret put DISCORD_TOKEN
wrangler secret put DISCORD_PUBLIC_KEY
wrangler secret put DISCORD_APPLICATION_ID
wrangler secret put VOICE_CHANNEL_ID

# Optional for random number generation
wrangler secret put RANDOM_ORG_API_KEY
```

### Discord Application Setup

1. Create a Discord Application at https://discord.com/developers/applications
2. Go to the "Bot" section and create a bot
3. Copy the Bot Token for `DISCORD_TOKEN`
4. Go to "General Information" and copy:
   - Application ID for `DISCORD_APPLICATION_ID`
   - Public Key for `DISCORD_PUBLIC_KEY`
5. Enable the following bot permissions:
   - Send Messages
   - Use Slash Commands
   - Manage Channels (for voice channel name updates)

### Register Discord Commands

Register the slash commands with Discord:

```bash
npm run register
```

## Development

Start the development server:

```bash
npm run dev
```

The bot will be available at `http://localhost:8787`. For Discord webhook testing, you can use ngrok:

```bash
npm run ngrok
```

### Testing

Run the test suite:

```bash
npm test
```

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run publish
```

### Automatic Updates

The bot includes a scheduled task that runs daily at 5 PM UTC to automatically update the voice channel name with the Lunar New Year countdown.

## Project Structure

```
discord_worker/
├── src/
│   ├── server.js          # Main Cloudflare Worker entry point
│   ├── commands.js        # Discord command definitions
│   ├── register.js        # Command registration script
│   ├── lunarNewYear.js    # Lunar New Year countdown logic
│   ├── RandomApi.js       # Random.org API integration
│   └── GachaList.js       # Gacha system implementation
├── test/
│   └── server.test.js     # Test suite
├── wrangler.toml          # Cloudflare Workers configuration
└── package.json           # Node.js dependencies and scripts
```

## Configuration

### Environment Variables

| Variable                 | Description                                    | Required |
| ------------------------ | ---------------------------------------------- | -------- |
| `DISCORD_TOKEN`          | Discord bot token                              | Yes      |
| `DISCORD_PUBLIC_KEY`     | Discord application public key                 | Yes      |
| `DISCORD_APPLICATION_ID` | Discord application ID                         | Yes      |
| `VOICE_CHANNEL_ID`       | Discord voice channel ID for countdown updates | Yes      |
| `RANDOM_ORG_API_KEY`     | Random.org API key for true randomness         | No       |

### Scheduled Tasks

The bot runs a cron job daily at 17:00 UTC to update the voice channel name. This is configured in `wrangler.toml`:

```toml
[triggers]
crons = ["0 17 * * *"]
```

## Scripts

- `npm run dev` - Start development server
- `npm run start` - Start development server (alias)
- `npm run ngrok` - Expose local server via ngrok
- `npm test` - Run test suite
- `npm run lint` - Lint code
- `npm run fix` - Fix linting issues
- `npm run register` - Register Discord commands
- `npm run publish` - Deploy to Cloudflare Workers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `npm test` and `npm run lint`
6. Submit a pull request

## License

This project is licensed under the terms specified in the LICENSE file.

## Support

If you encounter any issues or have questions, please open an issue on the repository.
