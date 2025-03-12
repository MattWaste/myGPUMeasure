# My GPU Measure

My GPU Measure is a GPU measurement application that allows users to get detailed information on GPU power draw, electricity costs, and carbon emissions based on specific usage and location. It supports both domestic (state-level) and international electricity price data and provides an interactive UI for exploring GPU metrics.

## Features

- **GPU Power Analysis:** Displays power draw, cost (daily, monthly, annual), and carbon emissions for various GPU models.
- **Interactive UI:** Built with React and Tailwind CSS, featuring dark mode and dynamic gradient backgrounds based on the selected GPU company.
- **Real-time Data Fetching:** Utilizes [React Query](https://tanstack.com/query/latest) for efficient data fetching.
- **Server-Side API:** An Express-based API powered by PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/) to fetch GPU data.
- **Automated Data Updates:** Scripts to fetch and update electricity prices using external API data.
- **Containerized Database:** Uses a Dockerfile to initialize a PostgreSQL container with seed data.

## Project Structure

- **Client:** Located in `src/` (React application using Vite).
- **Server:** Located in `src/index.ts` which runs an Express server.
- **Database:** PostgreSQL database managed with [Drizzle ORM](https://orm.drizzle.team/) (see [src/db/schema.ts](src/db/schema.ts)).
- **Data Scripts:** See [scripts/fetchElectricityPrices.ts](scripts/fetchElectricityPrices.ts) for fetching external electricity data.
- **Docker Integration:** See [Dockerfile](Dockerfile) for containerizing the database.
- **Deployment:** Managed via PM2 with configuration in [ecosystem.config.js](ecosystem.config.js).

## Getting Started

### Prerequisites

- Node.js and npm
- Docker
- PostgreSQL (containerized via Docker is recommended)

### Installation

1. Clone the repository.
2. Install dependencies:

   npm install
      
4. Environmental Variable setup:
# .env
VITE_GPU_DB="file:gpu_db.db"
VITE_EIA_API_KEY='your_eia_api_key'
DATABASE_URL='post_gres_url_
DB_SSL=false
POSTGRES_USER='your_user'
POSTGRES_PASSWORD='your_password'
POSTGRES_DB='your_db_name'



