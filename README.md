# ![GPU BIG](https://github.com/user-attachments/assets/021b2aa0-9936-4a23-b2a7-3c736d8bfbb1) 
# My GPU Measure

My GPU Measure is a GPU measurement application that allows users to get detailed information on GPU power draw, electricity costs, and carbon emissions based on specific usage and location. It supports both domestic (state-level) and international electricity price data and provides an interactive UI for exploring GPU metrics.


## Live Site
https://mygpupower.com/ 

## Features

- **GPU Power Analysis:** Displays power draw, cost (daily, monthly, annual), and carbon emissions for various GPU models.
- **Interactive UI:** Built with React and Tailwind CSS, featuring dark mode and dynamic gradient backgrounds based on the selected GPU company.
- **Real-time Data Fetching:** Utilizes [React Query](https://tanstack.com/query/latest) for efficient data fetching.
- **Server-Side API:** An Express-based API powered by PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/) to fetch GPU data.
- **Automated Data Updates:** Scripts to fetch and update electricity prices using external API data.
- **Containerized Database:** Uses a Dockerfile to initialize a PostgreSQL container with seed data.

## Project Structure

- **Client:** Located in `src/` (React application built with Vite).
- **Server:** Located in `src/index.ts` and runs an Express server.
- **Database:** Managed with PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/) (see [src/db/schema.ts](src/db/schema.ts)).
- **Data Scripts:** See [scripts/fetchElectricityPrices.ts](scripts/fetchElectricityPrices.ts) for external data fetching.
- **Docker Integration:** Configuration available in [Dockerfile](Dockerfile) for containerizing the database.
- **Deployment:** Managed via PM2 with configuration in [ecosystem.config.js](ecosystem.config.js).

## Getting Started

### Prerequisites

- Node.js and npm
- Docker
- PostgreSQL (using the containerized version is recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd myGPUMeasure
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environmental variables by creating a `.env` file:
   ```
   VITE_GPU_DB="file:gpu_db.db"
   VITE_EIA_API_KEY='your_eia_api_key'
   DATABASE_URL='postgres_url'
   DB_SSL=false
   POSTGRES_USER='your_user'
   POSTGRES_PASSWORD='your_password'
   POSTGRES_DB='your_db_name'
   ```
4. Run database migrations and seed data (if applicable):
   ```bash
   npm run migrate
   npm run seed
   ```

### Running the Application

- **Development Mode:**
  ```bash
  npm run dev
  ```
- **Production Build:**
  ```bash
  npm run build
  npm start
  ```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request. For major changes, open an issue first to discuss what you would like to change.



## Acknowledgments
- Ai was used in this project
- Thanks to all contributors and for open data from EIA.



