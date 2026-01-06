INSERT INTO products (code, name, category, description, price, stock, imageurl) VALUES
('P001', 'Wireless Headphones', 'electronics', 'Over-ear wireless headphones with noise isolation.', 59.99, 20, '/images/headphones.jpg'),
('P002', 'Mechanical Keyboard', 'electronics', 'Compact mechanical keyboard with brown switches.', 79.90, 15, '/images/keyboard.jpg'),
('P003', 'Espresso Cup Set', 'home', 'Set of 4 ceramic espresso cups.', 14.50, 30, '/images/cups.jpg'),
('P004', 'Yoga Mat', 'sports', 'Non-slip yoga mat, 6mm thickness.', 19.99, 25, '/images/yoga-mat.jpg'),
('P005', 'Desk Lamp', 'home', 'LED desk lamp with adjustable brightness.', 24.99, 18, '/images/lamp.jpg'),
('P006', 'Water Bottle', 'sports', 'Stainless steel insulated bottle, 750ml.', 17.90, 40, '/images/bottle.jpg');

INSERT INTO users (username, password, role)
VALUES (
  'admin',
  '$2b$10$qNOAmMKyOVsVgYJD5Mh79uRDwzcPE.kJj3.czDamU9wIaC2OZ8BMO',
  'admin'
);

UPDATE users 
SET password = '$2b$10$qNOAmMKyOVsVgYJD5Mh79uRDwzcPE.kJj3.czDamU9wIaC2OZ8BMO'
WHERE username = 'admin';