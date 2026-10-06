export const VEHICLES = {
  "VF3": {
    label: "VF 3",
    model3d: "/cars/models/vinfast-vf3.glb",
    image: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb882e2eb/images/vf3/vf3-white.png",
    versions: [
      { id: "vf3_base", label: "Tiêu chuẩn", price: 235000000 },
    ],
    colors: [
      { id: "white", label: "Trắng Tinh Khôi", hex: "#FFFFFF" },
      { id: "black", label: "Đen Huyền Bí",    hex: "#1a1a1a" },
      { id: "silver", label: "Bạc Ánh Kim",    hex: "#C0C0C0" },
    ],
    battery: { buy: 0, rent: 700000 },
  },
  "VF5": {
    label: "VF 5",
    model3d: "/cars/models/vinfast-vf5.glb",
    image: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/images/vf5/vf5-white.png",
    versions: [
      { id: "vf5_base", label: "Tiêu chuẩn", price: 414000000 },
      { id: "vf5_plus", label: "Plus",        price: 458000000 },
    ],
    colors: [
      { id: "white",  label: "Trắng Tinh Khôi", hex: "#FFFFFF" },
      { id: "black",  label: "Đen Huyền Bí",    hex: "#1a1a1a" },
      { id: "blue",   label: "Xanh Cổng Trời",  hex: "#4A90D9" },
      { id: "silver", label: "Bạc Ánh Kim",     hex: "#C0C0C0" },
    ],
    battery: { buy: 50000000, rent: 1490000 },
  },
  "VF6": {
    label: "VF 6",
    model3d: "/cars/models/vinfast-vf6.glb",
    image: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/images/vf6/vf6-white.png",
    versions: [
      { id: "vf6_base", label: "Tiêu chuẩn", price: 599000000 },
      { id: "vf6_plus", label: "Plus",        price: 639000000 },
    ],
    colors: [
      { id: "white",  label: "Trắng Tinh Khôi", hex: "#FFFFFF" },
      { id: "black",  label: "Đen Huyền Bí",    hex: "#1a1a1a" },
      { id: "blue",   label: "Xanh Cổng Trời",  hex: "#4A90D9" },
      { id: "green",  label: "Xanh Rêu",        hex: "#6B8F5E" },
      { id: "red",    label: "Đỏ Rực Rỡ",       hex: "#C0392B" },
      { id: "silver", label: "Bạc Ánh Kim",     hex: "#C0C0C0" },
    ],
    battery: { buy: 60000000, rent: 1690000 },
  },
  "VF7": {
    label: "VF 7",
    model3d: "/cars/models/vinfast-vf7.glb",
    image: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/images/vf7/vf7-white.png",
    versions: [
      { id: "vf7_base", label: "Tiêu chuẩn", price: 799000000 },
      { id: "vf7_plus", label: "Plus",        price: 859000000 },
    ],
    colors: [
      { id: "white",  label: "Trắng Tinh Khôi", hex: "#FFFFFF" },
      { id: "black",  label: "Đen Huyền Bí",    hex: "#1a1a1a" },
      { id: "blue",   label: "Xanh Cổng Trời",  hex: "#4A90D9" },
      { id: "silver", label: "Bạc Ánh Kim",     hex: "#C0C0C0" },
    ],
    battery: { buy: 80000000, rent: 1990000 },
  },
  "VF8": {
    label: "VF 8",
    model3d: "/cars/models/vinfast-vf8.glb",
    image: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/images/vf8/vf8-white.png",
    versions: [
      { id: "vf8_base", label: "Tiêu chuẩn", price: 999000000 },
      { id: "vf8_plus", label: "Plus",        price: 1059000000 },
    ],
    colors: [
      { id: "white",  label: "Trắng Tinh Khôi", hex: "#FFFFFF" },
      { id: "black",  label: "Đen Huyền Bí",    hex: "#1a1a1a" },
      { id: "blue",   label: "Xanh Cổng Trời",  hex: "#4A90D9" },
      { id: "silver", label: "Bạc Ánh Kim",     hex: "#C0C0C0" },
      { id: "red",    label: "Đỏ Rực Rỡ",       hex: "#C0392B" },
    ],
    battery: { buy: 120000000, rent: 2490000 },
  },
  "VF9": {
    label: "VF 9",
    model3d: "/cars/models/vinfast-vf9.glb",
    image: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/images/vf9/vf9-white.png",
    versions: [
      { id: "vf9_base", label: "Tiêu chuẩn", price: 1399000000 },
      { id: "vf9_plus", label: "Plus",        price: 1499000000 },
    ],
    colors: [
      { id: "white",  label: "Trắng Tinh Khôi", hex: "#FFFFFF" },
      { id: "black",  label: "Đen Huyền Bí",    hex: "#1a1a1a" },
      { id: "silver", label: "Bạc Ánh Kim",     hex: "#C0C0C0" },
    ],
    battery: { buy: 180000000, rent: 3490000 },
  },
  "VFWILD": {
    label: "VF Wild",
    model3d: null, // Mẫu concept bán tải chưa có model 3D -> sẽ hiển thị "hiện chưa có bản xem trước"
    image: "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/images/vf7/vf7-white.png",
    versions: [
      { id: "wild_concept", label: "Bản Concept", price: 850000000 },
    ],
    colors: [
      { id: "silver", label: "Bạc Kim Loại", hex: "#A8A9AD" },
      { id: "black",  label: "Đen Nhám",     hex: "#1F2022" },
    ],
    battery: { buy: 0, rent: 2200000 },
  },
};

export const PROVINCES: Record<string, { label: string; registrationRate: number; plateFee: number }> = {
  "HN":  { label: "Hà Nội",          registrationRate: 0.12, plateFee: 20000000 },
  "HCM": { label: "TP. Hồ Chí Minh", registrationRate: 0.10, plateFee: 20000000 },
  "DN":  { label: "Đà Nẵng",         registrationRate: 0.10, plateFee: 2000000  },
  "HP":  { label: "Hải Phòng",       registrationRate: 0.10, plateFee: 2000000  },
  "CT":  { label: "Cần Thơ",         registrationRate: 0.10, plateFee: 2000000  },
  "BDH": { label: "Bình Dương",      registrationRate: 0.10, plateFee: 2000000  },
  "BD":  { label: "Bình Định",       registrationRate: 0.10, plateFee: 2000000  },
  "OTHER":{ label: "Tỉnh khác",      registrationRate: 0.10, plateFee: 2000000  },
};

export const ACCESSORIES = [
  { id: "ppf",         label: "Phim cách nhiệt PPF",    price: 15000000 },
  { id: "dashcam",     label: "Camera hành trình",      price: 4500000  },
  { id: "360cam",      label: "Camera 360°",            price: 8000000  },
  { id: "floor_mat",   label: "Thảm lót sàn 3D",       price: 3500000  },
  { id: "screen_prot", label: "Dán màn hình",           price: 1500000  },
  { id: "parking_sensor", label: "Cảm biến lùi",       price: 2500000  },
];

export type VehicleKey = keyof typeof VEHICLES;
