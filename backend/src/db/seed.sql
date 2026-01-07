PRAGMA foreign_keys = OFF;

-- Reset data (order matters if you have foreign keys)
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM sessions;
DELETE FROM products;
DELETE FROM users;

-- (Optional) reset AUTOINCREMENT counters in SQLite
DELETE FROM sqlite_sequence WHERE name IN ('users','products','orders','order_items','sessions');

-- Admin user (bcrypt hash already generated)
INSERT INTO users (username, password, role, full_name, address, phone)
VALUES (
  'admin',
  '$2b$10$qNOAmMKyOVsVgYJD5Mh79uRDwzcPE.kJj3.czDamU9wIaC2OZ8BMO',
  'admin',
  'Admin User',
  '123 Admin St, Admin City',
  '123-456-7890'
), 
(
  'paula',
  '$2b$10$HSC4wFSfKs.8.cgrjIzUvOK1Nr6EFmQ6z4aeupMwJR/H3O9lu9kfG',
  'user',
  'Paula Gómez Lucas',
  '456 User Ave, User Town',
  '987-654-3210'
),
(
  'anyi',
  '$2b$10$HSC4wFSfKs.8.cgrjIzUvOK1Nr6EFmQ6z4aeupMwJR/H3O9lu9kfG',
  'user',
  'Anyi Lin',
  '789 Customer Rd, Client City',
  '654-321-0987'
);

INSERT INTO products (code, name, category, description, price, stock, imageurl) VALUES

-- =========================
-- Core Work Devices
-- =========================
('RWD-CORE-ULTRA14', 'Ultrabook 14" – Remote Work Edition', 'core-work',
 'Lightweight 14-inch ultrabook optimized for productivity, portability, and long battery life.', 
 1199.00, 8, '/images/ultrabook-14.jpg'),

('RWD-CORE-ULTRA16', 'Ultrabook 16" – Multitasking Pro', 'core-work',
 'High-performance 16-inch laptop designed for heavy multitasking and extended remote sessions.', 
 1499.00, 5, '/images/ultrabook-16.jpg'),

('RWD-CORE-MON15', 'Portable Monitor 15.6" USB-C', 'core-work',
 'Slim portable monitor providing a second screen anywhere with a single USB-C cable.', 
 229.00, 12, '/images/portable-monitor.jpg'),

('RWD-CORE-TAB11', 'Tablet 11" with Keyboard Case', 'core-work',
 'Compact tablet with detachable keyboard, ideal as a secondary or backup work device.', 
 499.00, 10, '/images/tablet-11.jpg'),

-- =========================
-- Ergonomics & Health
-- =========================
('RWD-ERGO-STAND', 'Foldable Aluminum Laptop Stand', 'ergonomics',
 'Adjustable foldable laptop stand to improve posture while working remotely.', 
 39.90, 25, '/images/laptop-stand.jpg'),

('RWD-ERGO-KEY65', 'Compact Mechanical Keyboard 65%', 'ergonomics',
 'Wireless 65% mechanical keyboard designed for travel-friendly ergonomic typing.', 
 89.00, 15, '/images/keyboard-65.jpg'),

('RWD-ERGO-MOUSE', 'Travel Mouse (Bluetooth + USB)', 'ergonomics',
 'Compact travel mouse supporting both Bluetooth and USB wireless connections.', 
 34.90, 30, '/images/travel-mouse.jpg'),

('RWD-ERGO-LUMBAR', 'Inflatable Lumbar Support Cushion', 'ergonomics',
 'Portable inflatable lumbar cushion for ergonomic support in any chair.', 
 19.90, 40, '/images/lumbar-cushion.jpg'),

-- =========================
-- Connectivity & Power
-- =========================
('RWD-CONN-HUB8', 'USB-C Hub 8-in-1', 'connectivity',
 'Multiport USB-C hub with HDMI, Ethernet, USB-A, and power delivery support.', 
 59.00, 20, '/images/usb-c-hub.jpg'),

('RWD-CONN-ROUTER', 'Travel Wi-Fi Router', 'connectivity',
 'Compact travel router for creating secure and reliable Wi-Fi networks on the go.', 
 79.00, 14, '/images/travel-router.jpg'),

('RWD-CONN-PBANK', 'Power Bank 20000mAh USB-C PD', 'connectivity',
 'High-capacity power bank capable of charging laptops, tablets, and phones.', 
 69.90, 18, '/images/power-bank.jpg'),

('RWD-CONN-CHG100', 'Universal GaN Charger 100W', 'connectivity',
 'High-efficiency GaN charger with multiple USB-C ports for all devices.', 
 89.00, 16, '/images/gan-charger.jpg'),

-- =========================
-- Audio & Communication
-- =========================
('RWD-AUDIO-NCOVER', 'Noise-Canceling Over-Ear Headphones', 'audio',
 'Over-ear headphones with active noise cancellation for focus and calls.', 
 199.00, 10, '/images/nc-headphones.jpg'),

('RWD-AUDIO-ONMIC', 'On-Ear Headset with Microphone', 'audio',
 'Lightweight on-ear headset with integrated microphone for frequent video calls.', 
 79.90, 20, '/images/on-ear-headset.jpg'),

('RWD-AUDIO-WEBCAM', '1080p Webcam with Privacy Shutter', 'audio',
 'Full HD webcam with built-in privacy shutter for professional remote meetings.', 
 59.90, 22, '/images/webcam.jpg'),

('RWD-AUDIO-MIC', 'Compact USB Microphone', 'audio',
 'Portable USB microphone delivering clear voice quality for calls and recordings.', 
 69.00, 18, '/images/usb-microphone.jpg'),

-- =========================
-- Backup & Safety
-- =========================
('RWD-SAFE-SSD1', 'External SSD 1TB USB-C', 'backup',
 'Fast and reliable 1TB external SSD for backups and project files.', 
 129.00, 15, '/images/ssd-1tb.jpg'),

('RWD-SAFE-SSD2', 'External SSD 2TB USB-C', 'backup',
 'High-capacity 2TB external SSD designed for creators and heavy file storage.', 
 199.00, 10, '/images/ssd-2tb.jpg'),

('RWD-SAFE-PRIV14', 'Privacy Screen Filter 14"', 'backup',
 'Privacy screen filter to protect sensitive information in public workspaces.', 
 39.90, 20, '/images/privacy-filter.jpg'),

('RWD-SAFE-SURGE', 'Travel Surge Protector Adapter', 'backup',
 'Compact surge protector and travel adapter with multiple USB ports.', 
 49.90, 25, '/images/surge-adapter.jpg');

PRAGMA foreign_keys = ON;
