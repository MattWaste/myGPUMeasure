FROM postgres:15

# Copy the CSV files from the public folder into the initialization directory
COPY ./public/GPU_power_draw_sql.csv /docker-entrypoint-initdb.d/
COPY ./public/electricity_prices.csv /docker-entrypoint-initdb.d/
COPY ./public/international_power_draw_6_2024.csv /docker-entrypoint-initdb.d/

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=postgres

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 \
  CMD pg_isready -U postgres -d postgres