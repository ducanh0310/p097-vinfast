-- Dealers
INSERT INTO dealers (id, name, province, address, phone) VALUES
  ('d1000000-0000-0000-0000-000000000001','VinFast Mỹ Đình',   'Hà Nội',          'Vincom Mega Mall Mỹ Đình','024 3974 3888'),
  ('d1000000-0000-0000-0000-000000000002','VinFast Long Biên',  'Hà Nội',          'Vincom Long Biên',        '024 3974 3889'),
  ('d1000000-0000-0000-0000-000000000003','VinFast Quận 7',     'TP. Hồ Chí Minh', 'Vincom Mega Mall Q7',     '028 3974 3888'),
  ('d1000000-0000-0000-0000-000000000004','VinFast Đà Nẵng',    'Đà Nẵng',         'Vincom Đà Nẵng',          '0236 397 3888')
ON CONFLICT DO NOTHING;

-- Users (password placeholder — thay bằng bcrypt hash thật khi có auth)
INSERT INTO users (id, email, name, hashed_pw, role, dealer_id) VALUES
  ('u1000000-0000-0000-0000-000000000001','seller@abc.vn',    'Nguyễn Văn An', 'hashed_123456',   'seller',    'd1000000-0000-0000-0000-000000000001'),
  ('u1000000-0000-0000-0000-000000000002','warehouse@abc.vn', 'Lê Văn Cường',  'hashed_123456',   'warehouse', 'd1000000-0000-0000-0000-000000000001'),
  ('u1000000-0000-0000-0000-000000000003','admin@vinfast.vn', 'Admin VinFast', 'hashed_admin123', 'admin',     NULL)
ON CONFLICT DO NOTHING;

-- Vehicle prices
INSERT INTO vehicle_prices (model,version,color,color_hex,price,price_version,effective_from) VALUES
  ('VF3','Tiêu chuẩn','Trắng Tinh Khôi','#FFFFFF', 235000000,'2025-Q4-v1','2025-10-01'),
  ('VF3','Tiêu chuẩn','Đen Huyền Bí',   '#1a1a1a', 235000000,'2025-Q4-v1','2025-10-01'),
  ('VF5','Tiêu chuẩn','Trắng Tinh Khôi','#FFFFFF', 414000000,'2025-Q4-v1','2025-10-01'),
  ('VF5','Plus',      'Trắng Tinh Khôi','#FFFFFF', 458000000,'2025-Q4-v1','2025-10-01'),
  ('VF5','Plus',      'Đen Huyền Bí',   '#1a1a1a', 458000000,'2025-Q4-v1','2025-10-01'),
  ('VF5','Plus',      'Xanh Cổng Trời', '#4A90D9', 458000000,'2025-Q4-v1','2025-10-01'),
  ('VF6','Tiêu chuẩn','Trắng Tinh Khôi','#FFFFFF', 599000000,'2025-Q4-v1','2025-10-01'),
  ('VF6','Tiêu chuẩn','Đen Huyền Bí',   '#1a1a1a', 599000000,'2025-Q4-v1','2025-10-01'),
  ('VF6','Tiêu chuẩn','Xanh Cổng Trời', '#4A90D9', 599000000,'2025-Q4-v1','2025-10-01'),
  ('VF6','Plus',      'Trắng Tinh Khôi','#FFFFFF', 639000000,'2025-Q4-v1','2025-10-01'),
  ('VF6','Plus',      'Đen Huyền Bí',   '#1a1a1a', 639000000,'2025-Q4-v1','2025-10-01'),
  ('VF6','Plus',      'Xanh Cổng Trời', '#4A90D9', 639000000,'2025-Q4-v1','2025-10-01'),
  ('VF6','Plus',      'Xanh Rêu',       '#6B8F5E', 639000000,'2025-Q4-v1','2025-10-01'),
  ('VF6','Plus',      'Đỏ Rực Rỡ',      '#C0392B', 639000000,'2025-Q4-v1','2025-10-01'),
  ('VF6','Plus',      'Bạc Ánh Kim',    '#C0C0C0', 639000000,'2025-Q4-v1','2025-10-01'),
  ('VF7','Tiêu chuẩn','Trắng Tinh Khôi','#FFFFFF', 799000000,'2025-Q4-v1','2025-10-01'),
  ('VF7','Plus',      'Trắng Tinh Khôi','#FFFFFF', 859000000,'2025-Q4-v1','2025-10-01'),
  ('VF7','Plus',      'Đen Huyền Bí',   '#1a1a1a', 859000000,'2025-Q4-v1','2025-10-01'),
  ('VF7','Plus',      'Xanh Cổng Trời', '#4A90D9', 859000000,'2025-Q4-v1','2025-10-01'),
  ('VF8','Tiêu chuẩn','Trắng Tinh Khôi','#FFFFFF', 999000000,'2025-Q4-v1','2025-10-01'),
  ('VF8','Plus',      'Trắng Tinh Khôi','#FFFFFF',1059000000,'2025-Q4-v1','2025-10-01'),
  ('VF8','Plus',      'Đen Huyền Bí',   '#1a1a1a',1059000000,'2025-Q4-v1','2025-10-01'),
  ('VF9','Tiêu chuẩn','Trắng Tinh Khôi','#FFFFFF',1399000000,'2025-Q4-v1','2025-10-01'),
  ('VF9','Plus',      'Trắng Tinh Khôi','#FFFFFF',1499000000,'2025-Q4-v1','2025-10-01'),
  ('VF9','Plus',      'Đen Huyền Bí',   '#1a1a1a',1499000000,'2025-Q4-v1','2025-10-01')
ON CONFLICT DO NOTHING;

-- Battery prices
INSERT INTO battery_prices (model,buy_price,rent_price) VALUES
  ('VF3',        0,  700000),
  ('VF5', 50000000, 1490000),
  ('VF6', 60000000, 1690000),
  ('VF7', 80000000, 1990000),
  ('VF8',120000000, 2490000),
  ('VF9',180000000, 3490000)
ON CONFLICT (model) DO NOTHING;

-- Accessories
INSERT INTO accessories (code,name,price) VALUES
  ('ppf',            'Phim cách nhiệt PPF',  15000000),
  ('dashcam',        'Camera hành trình',      4500000),
  ('cam_360',        'Camera 360°',            8000000),
  ('floor_mat',      'Thảm lót sàn 3D',        3500000),
  ('screen_prot',    'Dán màn hình',           1500000),
  ('parking_sensor', 'Cảm biến lùi',           2500000)
ON CONFLICT (code) DO NOTHING;

-- Rolling costs
INSERT INTO rolling_costs (province,registration_rate,road_fee,inspection_fee,insurance_rate,plate_fee) VALUES
  ('Hà Nội',          0.12, 1560000, 340000, 0.015, 20000000),
  ('TP. Hồ Chí Minh', 0.10, 1560000, 340000, 0.015, 20000000),
  ('Đà Nẵng',         0.10, 1560000, 340000, 0.015,  2000000),
  ('Hải Phòng',       0.10, 1560000, 340000, 0.015,  2000000),
  ('Cần Thơ',         0.10, 1560000, 340000, 0.015,  2000000),
  ('Bình Dương',      0.10, 1560000, 340000, 0.015,  2000000),
  ('Tỉnh khác',       0.10, 1560000, 340000, 0.015,  2000000)
ON CONFLICT (province) DO NOTHING;

-- Promotions
INSERT INTO promotions (name,description,model,province,discount_type,discount_value,start_date,end_date,is_active,usage_count) VALUES
  ('Ưu đãi tháng 10 - VF6', 'Giảm 30tr cho VF6 tháng 10',     'VF6', NULL,      'fixed',   30000000, '2025-10-01','2025-10-31', TRUE,  47),
  ('Tặng gói sạc - Mỹ Đình', 'Tặng gói sạc 1 năm tại Mỹ Đình', 'ALL','Hà Nội', 'fixed',    5000000, '2025-10-01','2025-12-31', TRUE,  21),
  ('Ưu đãi VF8 cuối năm',    'Giảm 50tr VF8 Plus Q4',          'VF8', NULL,      'fixed',   50000000, '2025-11-01','2025-12-31', TRUE,   0)
ON CONFLICT DO NOTHING;

-- Inventory
INSERT INTO inventory (dealer_id,model,version,color,color_hex,quantity,est_delivery) VALUES
  ('d1000000-0000-0000-0000-000000000001','VF6','Plus',      'Trắng Tinh Khôi','#FFFFFF',3,'Giao ngay'),
  ('d1000000-0000-0000-0000-000000000001','VF6','Plus',      'Đen Huyền Bí',   '#1a1a1a',1,'Giao ngay'),
  ('d1000000-0000-0000-0000-000000000001','VF6','Tiêu chuẩn','Xanh Cổng Trời', '#4A90D9',2,'3-5 ngày'),
  ('d1000000-0000-0000-0000-000000000001','VF7','Plus',      'Trắng Tinh Khôi','#FFFFFF',0,'2-3 tuần'),
  ('d1000000-0000-0000-0000-000000000001','VF7','Tiêu chuẩn','Bạc Ánh Kim',    '#C0C0C0',2,'Giao ngay'),
  ('d1000000-0000-0000-0000-000000000001','VF5','Plus',      'Đỏ Rực Rỡ',      '#C0392B',4,'Giao ngay'),
  ('d1000000-0000-0000-0000-000000000002','VF6','Plus',      'Trắng Tinh Khôi','#FFFFFF',2,'Giao ngay'),
  ('d1000000-0000-0000-0000-000000000003','VF6','Plus',      'Trắng Tinh Khôi','#FFFFFF',5,'Giao ngay'),
  ('d1000000-0000-0000-0000-000000000003','VF7','Plus',      'Đen Huyền Bí',   '#1a1a1a',2,'Giao ngay')
ON CONFLICT (dealer_id,model,version,color) DO NOTHING;

-- Sample leads
INSERT INTO leads (session_id,name,phone,province,interested_in,budget,status,dealer_id) VALUES
  ('sess_001','Nguyễn Văn An', '0912345678','Hà Nội',         'VF6 Plus',        800000000,'quoted',     'd1000000-0000-0000-0000-000000000001'),
  ('sess_002','Trần Thị Bình', '0987654321','TP. Hồ Chí Minh','VF7 Plus',        950000000,'new',        'd1000000-0000-0000-0000-000000000003'),
  ('sess_003','Lê Văn Cường',  '0901234567','Đà Nẵng',        'VF5 Tiêu chuẩn',  500000000,'contacted',  NULL),
  ('sess_004','Phạm Thị Dung', '0934567890','Hà Nội',         'VF6 Plus',        750000000,'closed_won', 'd1000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Sample quotes
INSERT INTO quotes (session_id,buyer_name,buyer_phone,model,version,color,battery,province,accessories,price_snapshot,price_version,final_price,status) VALUES
  ('sess_001','Nguyễn Văn An','0912345678','VF6','Plus','Trắng Tinh Khôi','buy','Hà Nội',
   ARRAY['ppf','cam_360'],
   '{"base_price":639000000,"battery_cost":60000000,"final_price":800165000}',
   '2025-Q4-v1', 800165000, 'pending'),
  ('sess_004','Phạm Thị Dung','0934567890','VF6','Plus','Xanh Cổng Trời','buy','Hà Nội',
   ARRAY[]::TEXT[],
   '{"base_price":639000000,"battery_cost":60000000,"final_price":772165000}',
   '2025-Q4-v1', 772165000, 'approved')
ON CONFLICT DO NOTHING;
