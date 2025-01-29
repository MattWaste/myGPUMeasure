DROP TABLE IF EXISTS gpus;

CREATE TABLE gpus (
    id SERIAL PRIMARY KEY,
    manufacturer TEXT NOT NULL,
    name TEXT NOT NULL,
    tdp INTEGER
);

COPY gpus(manufacturer, name, tdp)
FROM '/docker-entrypoint-initdb.d/GPU_power_draw_sql.csv'
DELIMITER ','
CSV HEADER;