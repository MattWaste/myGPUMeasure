CREATE TABLE IF NOT EXISTS gpu_power_readings (
    manufacturer TEXT NOT NULL,
    card_name TEXT NOT NULL,
    tdp INTEGER NOT NULL
);

-- Import data from your CSV
INSERT INTO gpu_power_readings (manufacturer, card_name, tdp) VALUES
('Nvidia', 'GeForce RTX 4090', 315),
('Nvidia', 'GeForce RTX 4080 SUPER', 246),
('Nvidia', 'GeForce RTX 4080', 251),
('Nvidia', 'GeForce RTX 4070 Ti SUPER', 226),
('Nvidia', 'GeForce RTX 4070 Ti', 226),
('Nvidia', 'GeForce RTX 4070 SUPER', 200),
('Nvidia', 'GeForce RTX 4070', 186),
('Nvidia', 'GeForce RTX 4060 Ti', 140),
('Nvidia', 'GeForce RTX 4060', 110),
('Nvidia', 'GeForce RTX 3090 Ti', 450),
('Nvidia', 'GeForce RTX 3090', 350),
('Nvidia', 'GeForce RTX 3080 Ti', 350),
('Nvidia', 'GeForce RTX 3080 (12 GB)', 350),
('Nvidia', 'GeForce RTX 3080', 320),
('Nvidia', 'GeForce RTX 3070 Ti', 290),
('Nvidia', 'GeForce  RTX 3070', 220); 