"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RotateCcw, Play, Pause, Box, AlertCircle } from "lucide-react";

interface CarViewer3DProps {
  /** Đường dẫn file model .glb (được nén DRACO) */
  modelUrl?: string | null;
  /** Tên dòng xe */
  modelName: string;
  /** Màu hex đang chọn (ví dụ: #FFFFFF, #1a1a1a, ...) */
  colorHex?: string;
  /** Component fallback 2D hiển thị khi không có model 3D */
  fallback2D?: React.ReactNode;
  className?: string;
}

export function CarViewer3D({
  modelUrl,
  modelName,
  colorHex,
  fallback2D,
  className = "",
}: CarViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // References cho Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const carPaintMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const modelRadiusRef = useRef<number>(2.5);

  const defaultCamPos = useRef(new THREE.Vector3(5.0, 1.2, 5.0));
  const defaultTarget = useRef(new THREE.Vector3(0, 0.45, 0));

  const hasModel = Boolean(modelUrl && modelUrl.trim() !== "");

  // Đặt lại góc nhìn
  const handleResetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.copy(defaultCamPos.current);
      controlsRef.current.target.copy(defaultTarget.current);
      controlsRef.current.update();
    }
  }, []);

  // Cập nhật màu sơn xe
  useEffect(() => {
    if (!colorHex || carPaintMaterialsRef.current.length === 0) return;
    const targetColor = new THREE.Color(colorHex);

    carPaintMaterialsRef.current.forEach((mat) => {
      mat.color.copy(targetColor);
      mat.needsUpdate = true;
    });
  }, [colorHex]);

  // Cập nhật chế độ tự động xoay
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Khởi tạo Three.js
  useEffect(() => {
    if (!hasModel) {
      setLoading(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setLoadProgress(0);
    setHasError(false);
    carPaintMaterialsRef.current = [];

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: FOV 28 độ chuẩn góc nhìn phối cảnh studio xe hơi
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 500);
    camera.position.copy(defaultCamPos.current);
    cameraRef.current = camera;

    // 3. Renderer: Nền hoàn toàn trong suốt (alpha: true) hiển thị liền mạch trên nền trắng
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0); // Trong suốt tuyệt đối
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.replaceChildren(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.0;
    // Giới hạn góc nhìn: giữ góc nhìn ngang tầm mắt quanh xe, không chìm dưới sàn hay nhìn từ đỉnh đầu
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minPolarAngle = Math.PI / 2.8; // ~64 độ
    controls.target.copy(defaultTarget.current);
    controls.update();

    // 5. Studio Showroom Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 1.1);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Key Light rọi chéo trước bên trái
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(6, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Fill Light làm mềm bóng
    const fillLight = new THREE.DirectionalLight(0xf1f5f9, 1.4);
    fillLight.position.set(-6, 6, -5);
    scene.add(fillLight);

    // Top Light phản chiếu nóc xe
    const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    // 6. Bóng đổ mềm tự nhiên dưới gầm xe (Fade out 100% về 0, không có viền mép)
    const shadowSize = 16;
    const shadowGeo = new THREE.PlaneGeometry(shadowSize, shadowSize);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Tâm bóng đổ hình oval mềm mại lan tỏa tự nhiên, biến mất hoàn toàn trước 70% bán kính
      const gradient = ctx.createRadialGradient(256, 256, 20, 256, 256, 220);
      gradient.addColorStop(0, "rgba(15, 23, 42, 0.40)");
      gradient.addColorStop(0.25, "rgba(15, 23, 42, 0.20)");
      gradient.addColorStop(0.55, "rgba(15, 23, 42, 0.04)");
      gradient.addColorStop(0.75, "rgba(15, 23, 42, 0)"); // Tan biến tuyệt đối về 0
      gradient.addColorStop(1.0, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
    }
    const shadowTexture = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.002;
    scene.add(shadowMesh);

    // 7. GLTFLoader + DRACOLoader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    let isDisposed = false;
    let modelScene: THREE.Group | null = null;

    // Hàm tính toán khoảng cách camera tự thích ứng (Responsive Frame Fitting)
    const fitCameraToModel = (radius: number, target: THREE.Vector3) => {
      if (!camera || !controlsRef.current) return;
      const fovY = THREE.MathUtils.degToRad(camera.fov);
      // Tính góc FOV theo chiều ngang dựa trên tỷ lệ khung hình thực tế
      const fovX = 2 * Math.atan(Math.tan(fovY / 2) * camera.aspect);
      // Góc nhìn hiệu dụng là góc nhỏ hơn giữa dọc và ngang
      const effectiveFov = Math.min(fovY, fovX);

      // Khoảng cách bao trọn toàn bộ xe vừa vặn, to đẹp và rõ nét (hệ số 1.08)
      const distance = (radius / Math.sin(effectiveFov / 2)) * 1.08;

      // Hướng góc chéo trước bên trái (Front 3/4 view kiểu showroom Tesla)
      const viewDir = new THREE.Vector3(1.15, 0.35, 1.1).normalize();
      const newPos = target.clone().addScaledVector(viewDir, distance);

      camera.position.copy(newPos);
      camera.lookAt(target);

      defaultCamPos.current.copy(newPos);
      defaultTarget.current.copy(target);

      controlsRef.current.target.copy(target);
      controlsRef.current.minDistance = distance * 0.55;
      controlsRef.current.maxDistance = distance * 2.2;
      controlsRef.current.update();
    };

    gltfLoader.load(
      modelUrl!,
      (gltf) => {
        if (isDisposed) return;
        modelScene = gltf.scene;

        // Tính Bounding Box nguyên bản của model
        const originalBox = new THREE.Box3().setFromObject(gltf.scene);
        const originalSize = originalBox.getSize(new THREE.Vector3());
        const originalCenter = originalBox.getCenter(new THREE.Vector3());

        // CHUẨN HÓA KÍCH THƯỚC XE (Scale Normalization):
        // Chuẩn hóa chiều dài xe về 4.0 đơn vị tiêu chuẩn
        const maxDimension = Math.max(originalSize.x, originalSize.y, originalSize.z);
        const targetLength = 4.0;
        const scaleFactor = targetLength / (maxDimension || 1);

        gltf.scene.scale.setScalar(scaleFactor);

        // Sau khi scale, đặt đáy xe chạm đúng sàn y = 0, tâm xe nằm tại (0, z_center)
        gltf.scene.position.x = -originalCenter.x * scaleFactor;
        gltf.scene.position.y = -originalBox.min.y * scaleFactor;
        gltf.scene.position.z = -originalCenter.z * scaleFactor;

        // Tìm kiếm các vật liệu vỏ xe để đổi màu ngoại thất
        const detectedPaintMaterials: THREE.MeshStandardMaterial[] = [];
        const ignoredNames = [
          "glass", "window", "tire", "licplate", "led", "interior",
          "leather", "seat", "brake", "disk", "mirror", "chrome", "wheel"
        ];

        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const matList = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            matList.forEach((rawMat) => {
              if (rawMat && "color" in rawMat) {
                const mat = rawMat as THREE.MeshStandardMaterial;
                const matName = (mat.name || "").toLowerCase();
                const meshName = (mesh.name || "").toLowerCase();

                const isIgnored = ignoredNames.some(
                  (ign) => matName.includes(ign) || meshName.includes(ign)
                );

                const isPaint =
                  !isIgnored &&
                  (matName.includes("paint") ||
                    matName.includes("v?_xe") ||
                    matName.includes("v__xe") ||
                    matName.includes("vo_xe") ||
                    matName.includes("body") ||
                    matName.includes("car") ||
                    matName.includes("white") ||
                    matName.includes("primary"));

                if (isPaint) {
                  mat.roughness = Math.min(mat.roughness ?? 0.22, 0.3);
                  mat.metalness = Math.max(mat.metalness ?? 0.35, 0.4);
                  if (colorHex) {
                    mat.color.setStyle(colorHex);
                  }
                  detectedPaintMaterials.push(mat);
                }
              }
            });
          }
        });

        // Fallback nếu không khớp tên
        if (detectedPaintMaterials.length === 0 && colorHex) {
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
              if (mat && "color" in mat && !mat.transparent) {
                const mName = (mat.name || "").toLowerCase();
                if (!ignoredNames.some((ign) => mName.includes(ign))) {
                  detectedPaintMaterials.push(mat);
                }
              }
            }
          });
          if (detectedPaintMaterials[0]) {
            detectedPaintMaterials[0].color.setStyle(colorHex);
          }
        }

        carPaintMaterialsRef.current = detectedPaintMaterials;
        scene.add(gltf.scene);

        // TÍNH BÁN KÍNH VÀ CĂN CHỈNH CAMERA BAO TRỌN XE HOÀN HẢO
        const scaledBox = new THREE.Box3().setFromObject(gltf.scene);
        const sphere = scaledBox.getBoundingSphere(new THREE.Sphere());
        modelRadiusRef.current = sphere.radius;
        const modelCenter = new THREE.Vector3(0, sphere.center.y, 0);

        fitCameraToModel(sphere.radius, modelCenter);

        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        console.error("Lỗi khi tải 3D model:", err);
        setHasError(true);
        setLoading(false);
      }
    );

    // 8. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Observer: Cập nhật kích thước renderer full 100% và fit lại khoảng cách camera
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      if (modelScene) {
        fitCameraToModel(modelRadiusRef.current, defaultTarget.current);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);

      controls.dispose();
      dracoLoader.dispose();

      if (modelScene) {
        scene.remove(modelScene);
      }

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.remove();
      }
    };
  }, [modelUrl, hasModel]);

  // TRƯỜNG HỢP: Mẫu xe không có model 3D hoặc load bị lỗi -> hiển thị liền mạch trên nền trắng
  if (!hasModel || hasError) {
    return (
      <div className={`relative flex h-full w-full flex-col items-center justify-center p-6 ${className}`}>
        {/* Thông báo thanh lịch theo đúng yêu cầu */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
          <AlertCircle size={15} className="text-amber-500" />
          <span>Hiện chưa có bản xem trước</span>
        </div>

        {/* Hiển thị ảnh 2D liền mạch trên nền trắng */}
        <div className="relative w-full max-w-[680px]">
          {fallback2D}
          <div className="pointer-events-none mx-auto h-4 w-3/4 -translate-y-2 rounded-full bg-slate-900/10 blur-md" />
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Mô hình 3D cho dòng xe <span className="font-medium text-slate-600">{modelName}</span> đang được hoàn thiện.
        </p>
      </div>
    );
  }

  // TRƯỜNG HỢP: Mẫu xe có model 3D (Hiển thị 3D Three.js tràn full 100% không gian)
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* Khung hiển thị Three.js: Lấp đầy 100% chiều rộng và chiều cao */}
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Hiệu ứng đang tải (Loading nhẹ nhàng) */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
          <div className="relative mb-3 flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-3 border-slate-200 border-t-slate-900" />
            <Box size={18} className="text-slate-800" />
          </div>
          <p className="text-xs font-medium text-slate-700">
            Đang tải mô hình 3D... {loadProgress > 0 ? `${loadProgress}%` : ""}
          </p>
        </div>
      )}

      {/* Bộ điều khiển tối giản ở góc dưới bên phải */}
      <div className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 p-0.5 shadow-sm backdrop-blur-md xl:bottom-4 xl:right-5 xl:p-1">
        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          title={autoRotate ? "Tạm dừng tự xoay" : "Bật tự xoay 360°"}
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition xl:h-8 xl:w-8 ${
            autoRotate
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {autoRotate ? <Pause size={12} /> : <Play size={12} />}
        </button>

        <button
          type="button"
          onClick={handleResetCamera}
          title="Đặt lại góc nhìn xe"
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 xl:h-8 xl:w-8"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Gợi ý nhẹ nhàng dưới đáy */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 text-[10px] font-medium text-slate-400 xl:bottom-4 xl:text-[11px]">
        Xoay 360° để xem mọi góc cạnh
      </div>
    </div>
  );
}
