import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useKeyboard } from '../hooks/useKeyboard';
import { puzzles, Puzzle } from '../data/puzzles';
import PuzzleOverlay from './PuzzleOverlay';

export default function MazeGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameAborted, setGameAborted] = useState(false); // Time ran out
  const [showRegistration, setShowRegistration] = useState(false); // Registration form
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes countdown
  const [elapsedTime, setElapsedTime] = useState(0); // Time taken to complete
  const [showInstructions, setShowInstructions] = useState(true);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState<number[]>([]);
  const [collectedKeys, setCollectedKeys] = useState<string[]>([]);
  const solvedPuzzlesRef = useRef<number[]>([]);
  const collectedKeysRef = useRef<string[]>([]);
  const setActivePuzzleRef = useRef<(p: Puzzle | null) => void>((p) => setActivePuzzle(p));

  // Professional movement hooks
  const keys = useKeyboard();
  const keysRef = useRef(keys);
  const headBob = useRef({ phase: 0, amplitude: 0.02 });

  // Keep keysRef updated with latest keys
  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  // Keep puzzle refs updated
  useEffect(() => {
    solvedPuzzlesRef.current = solvedPuzzles;
  }, [solvedPuzzles]);

  // Keep collected keys ref updated
  useEffect(() => {
    collectedKeysRef.current = collectedKeys;
  }, [collectedKeys]);

  useEffect(() => {
    if (!isPlaying) return;

    let animationId: number;
    const scene = new THREE.Scene();
    // Morning sky color
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

    // Camera - First Person Setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    // Set initial camera position and rotation for first-person view
    camera.position.set(1.5, 0.5, 1.5); // Start at ground level
    camera.rotation.order = 'YXZ'; // Proper rotation order for FPS camera
    camera.rotation.set(0, 0, 0); // Start looking forward (no pitch/yaw)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Professional player state - based on 3D Maze Master
    const player = {
      position: new THREE.Vector3(1.5, 0.2, 1.5),
      rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
      velocity: new THREE.Vector3(0, 0, 0),
      moveState: {
        up: 0, down: 0, left: 0, right: 0,
        forward: 0, back: 0,
        pitchUp: 0, pitchDown: 0,
        yawLeft: 0, yawRight: 0
      },
      height: 0.3,
      radius: 0.4,
    };

    // Professional movement constants
    let isLocked = false;
    const movementSpeed = 2.0; // units/second
    const playerRadius = 0.3; // collision radius
    const startTime = Date.now();
    const countdownDuration = 45 * 60; // 45 minutes in seconds

    // Complex Maze with Dead Ends, Loops, Puzzle Gates and Locked Final Doors (41x41)
    // 0 = path, 1 = wall, 2 = goal, 3-7 = puzzle gates (puzzles 1-5), 8 = locked door (needs all keys)
    const maze = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 4, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 5, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 6, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 7, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 8, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    // Morning lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Sun light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    scene.add(sunLight);

    // Soft fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.4);
    fillLight.position.set(-5, 10, -5);
    scene.add(fillLight);

    // Perfect 3D Block System - Minecraft Style
    const blockSize = 1;
    const wallHeight = 2.5;

    // Create perfect stone brick texture
    const createStoneTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;

      // Stone base color
      ctx.fillStyle = '#696969';
      ctx.fillRect(0, 0, 64, 64);

      // Add stone texture details
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        const size = Math.random() * 2 + 1;
        const brightness = Math.random() * 0.3 + 0.7;

        ctx.fillStyle = `rgb(${Math.floor(105 * brightness)}, ${Math.floor(105 * brightness)}, ${Math.floor(105 * brightness)})`;
        ctx.fillRect(x, y, size, size);
      }

      // Add some darker spots
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        const size = Math.random() * 3 + 1;

        ctx.fillStyle = '#555555';
        ctx.fillRect(x, y, size, size);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      return texture;
    };

    // Create perfect grass texture
    const createGrassTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;

      // Grass base color
      ctx.fillStyle = '#228B22';
      ctx.fillRect(0, 0, 64, 64);

      // Add grass blade details
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        const size = Math.random() * 2 + 1;

        const grassColors = ['#32CD32', '#228B22', '#006400', '#90EE90'];
        ctx.fillStyle = grassColors[Math.floor(Math.random() * grassColors.length)];
        ctx.fillRect(x, y, size, size);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, 8);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      return texture;
    };

    // Create materials
    const stoneTexture = createStoneTexture();
    const grassTexture = createGrassTexture();

    const wallMaterial = new THREE.MeshStandardMaterial({
      map: stoneTexture,
      roughness: 0.9,
      metalness: 0.0,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 0.8,
      metalness: 0.0,
    });

    // Create individual wall blocks for perfect placement
    const createWallBlocks = () => {
      const wallGroup = new THREE.Group();

      // Puzzle gate colors (different color for each puzzle)
      const puzzleColors = [
        0xff4444, // Puzzle 1 - Red
        0xff8800, // Puzzle 2 - Orange
        0xffff00, // Puzzle 3 - Yellow
        0x00aaff, // Puzzle 4 - Blue
        0xff00ff, // Puzzle 5 - Purple
      ];

      maze.forEach((row, z) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            // Create individual wall block
            const wallGeometry = new THREE.BoxGeometry(blockSize, wallHeight, blockSize);
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);

            // Position centered in grid cell
            wall.position.set(x + 0.5, wallHeight / 2, z + 0.5);
            wall.castShadow = true;
            wall.receiveShadow = true;

            wallGroup.add(wall);
          } else if (cell >= 3 && cell <= 7) {
            // Puzzle gate - glowing door
            const puzzleId = cell - 2; // 3->1, 4->2, 5->3, 6->4, 7->5
            const gateGeometry = new THREE.BoxGeometry(blockSize, wallHeight, blockSize);
            const gateMaterial = new THREE.MeshStandardMaterial({
              color: puzzleColors[puzzleId - 1],
              emissive: puzzleColors[puzzleId - 1],
              emissiveIntensity: 0.5,
              transparent: true,
              opacity: 0.85,
              metalness: 0.3,
              roughness: 0.4,
            });
            const gate = new THREE.Mesh(gateGeometry, gateMaterial);
            gate.position.set(x + 0.5, wallHeight / 2, z + 0.5);
            gate.castShadow = true;
            gate.receiveShadow = true;
            gate.userData = { isPuzzleGate: true, puzzleId: puzzleId, gridX: x, gridZ: z };
            wallGroup.add(gate);

            // Add light for puzzle gate
            const gateLight = new THREE.PointLight(puzzleColors[puzzleId - 1], 1, 5);
            gateLight.position.set(x + 0.5, 1.5, z + 0.5);
            wallGroup.add(gateLight);
          } else if (cell === 8) {
            // Locked final door - requires all 5 keys
            const doorGeometry = new THREE.BoxGeometry(blockSize, wallHeight, blockSize);
            const doorMaterial = new THREE.MeshStandardMaterial({
              color: 0xffd700, // Gold
              emissive: 0xffd700,
              emissiveIntensity: 0.7,
              transparent: true,
              opacity: 0.9,
              metalness: 0.6,
              roughness: 0.2,
            });
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(x + 0.5, wallHeight / 2, z + 0.5);
            door.castShadow = true;
            door.receiveShadow = true;
            door.userData = { isLockedDoor: true, gridX: x, gridZ: z };
            wallGroup.add(door);

            // Add golden light for locked door
            const doorLight = new THREE.PointLight(0xffd700, 2, 6);
            doorLight.position.set(x + 0.5, 1.5, z + 0.5);
            wallGroup.add(doorLight);
          }
        });
      });

      return wallGroup;
    };

    // Add perfect wall blocks to scene
    const wallBlocks = createWallBlocks();
    scene.add(wallBlocks);

    // Create goal with advanced effects
    let goal: THREE.Mesh;
    let goalParticles: THREE.Points;

    maze.forEach((row, z) => {
      row.forEach((cell, x) => {
        if (cell === 2) {
          // Advanced goal design
          const goalGroup = new THREE.Group();

          // Main goal crystal
          const goalGeometry = new THREE.OctahedronGeometry(0.4, 2);
          const goalMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff44,
            emissive: 0x00ff44,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.3,
          });
          goal = new THREE.Mesh(goalGeometry, goalMaterial);
          goal.position.set(0, 1, 0);
          goalGroup.add(goal);

          // Particle system for goal
          const particleGeometry = new THREE.BufferGeometry();
          const particleCount = 50;
          const positions = new Float32Array(particleCount * 3);

          for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2;
            positions[i + 1] = Math.random() * 2;
            positions[i + 2] = (Math.random() - 0.5) * 2;
          }

          particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

          const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ff44,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
          });

          goalParticles = new THREE.Points(particleGeometry, particleMaterial);
          goalGroup.add(goalParticles);

          // Goal light with better settings
          const goalLight = new THREE.PointLight(0x00ff44, 2, 10);
          goalLight.position.set(0, 1, 0);
          goalLight.castShadow = true;
          goalLight.shadow.mapSize.width = 512;
          goalLight.shadow.mapSize.height = 512;
          goalGroup.add(goalLight);

          // Position goal group centered in cell
          goalGroup.position.set(x + 0.5, 0, z + 0.5);
          scene.add(goalGroup);

          // Enhanced goal animation
          const animateGoal = () => {
            const time = Date.now() * 0.001;

            // Rotate crystal
            goal.rotation.y += 0.02;
            goal.rotation.x = Math.sin(time) * 0.1;

            // Float up and down
            goal.position.y = 1 + Math.sin(time * 2) * 0.2;

            // Animate particles
            const positions = goalParticles.geometry.attributes.position.array as Float32Array;
            for (let i = 1; i < positions.length; i += 3) {
              positions[i] += 0.01;
              if (positions[i] > 3) {
                positions[i] = 0;
              }
            }
            goalParticles.geometry.attributes.position.needsUpdate = true;

            // Pulse light intensity
            goalLight.intensity = 2 + Math.sin(time * 3) * 0.5;
          };
          (goal as any).userData.animate = animateGoal;
        }
      });
    });

    // Floor covering entire maze area
    const floorGeometry = new THREE.PlaneGeometry(maze[0].length, maze.length);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(maze[0].length / 2, 0, maze.length / 2); // Center floor on maze grid
    floor.receiveShadow = true;
    scene.add(floor);

    // Add some decorative elements
    const addDecorations = () => {
      maze.forEach((row, z) => {
        row.forEach((cell, x) => {
          if (cell === 0 && Math.random() > 0.95) {
            // Add small grass tufts
            const grassGeometry = new THREE.ConeGeometry(0.05, 0.2, 6);
            const grassMaterial = new THREE.MeshStandardMaterial({
              color: 0x228B22,
              roughness: 0.9,
            });
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            grass.position.set(
              x + 0.5 + (Math.random() - 0.5) * 0.8,
              0.1,
              z + 0.5 + (Math.random() - 0.5) * 0.8
            );
            grass.castShadow = true;
            scene.add(grass);
          }
        });
      });
    };

    addDecorations();

    // Simple and reliable grid-based collision detection
    const isWall = (x: number, z: number): boolean => {
      const gridX = Math.floor(x);
      const gridZ = Math.floor(z);

      // Out of bounds = wall
      if (gridX < 0 || gridX >= maze[0].length || gridZ < 0 || gridZ >= maze.length) {
        return true;
      }

      const cellValue = maze[gridZ][gridX];

      // Regular wall
      if (cellValue === 1) return true;

      // Puzzle gate (3-7) - check if solved
      if (cellValue >= 3 && cellValue <= 7) {
        const puzzleId = cellValue - 2;
        return !solvedPuzzlesRef.current.includes(puzzleId);
      }

      // Locked door (8) - requires all 5 keys
      if (cellValue === 8) {
        return collectedKeysRef.current.length < 5;
      }

      return false;
    };

    // Check if player is near a puzzle gate
    const checkPuzzleTrigger = (x: number, z: number) => {
      const gridX = Math.floor(x);
      const gridZ = Math.floor(z);

      // Check surrounding cells for puzzle gates
      const checkRadius = 1;
      for (let dz = -checkRadius; dz <= checkRadius; dz++) {
        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
          const checkX = gridX + dx;
          const checkZ = gridZ + dz;

          if (checkX >= 0 && checkX < maze[0].length && checkZ >= 0 && checkZ < maze.length) {
            const cellValue = maze[checkZ][checkX];
            if (cellValue >= 3 && cellValue <= 7) {
              const puzzleId = cellValue - 2;
              if (!solvedPuzzlesRef.current.includes(puzzleId)) {
                // Calculate distance to gate center
                const gateCenterX = checkX + 0.5;
                const gateCenterZ = checkZ + 0.5;
                const distance = Math.sqrt((x - gateCenterX) ** 2 + (z - gateCenterZ) ** 2);

                if (distance < 1.5) {
                  // Trigger puzzle
                  const puzzle = puzzles.find(p => p.id === puzzleId);
                  if (puzzle) {
                    setActivePuzzleRef.current(puzzle);
                    document.exitPointerLock();
                  }
                  return;
                }
              }
            }
          }
        }
      }
    };

    // Check collision at position with player radius
    const checkCollision = (x: number, z: number): boolean => {
      // Check 4 corners of player bounding box
      return (
        isWall(x - playerRadius, z - playerRadius) ||
        isWall(x + playerRadius, z - playerRadius) ||
        isWall(x - playerRadius, z + playerRadius) ||
        isWall(x + playerRadius, z + playerRadius)
      );
    };

    // Try to move and handle collision with wall sliding
    const tryMove = (deltaX: number, deltaZ: number) => {
      const currentX = camera.position.x;
      const currentZ = camera.position.z;

      // Try full movement first
      const newX = currentX + deltaX;
      const newZ = currentZ + deltaZ;

      if (!checkCollision(newX, newZ)) {
        camera.position.x = newX;
        camera.position.z = newZ;
        return;
      }

      // Try X movement only (wall sliding)
      if (!checkCollision(newX, currentZ)) {
        camera.position.x = newX;
      }

      // Try Z movement only (wall sliding)
      if (!checkCollision(camera.position.x, newZ)) {
        camera.position.z = newZ;
      }
    };

    // Check win condition using simple grid coordinates
    const checkWin = () => {
      const gridX = Math.floor(camera.position.x);
      const gridZ = Math.floor(camera.position.z);

      // Check if we're at the goal position (maze is 41x41)
      if (gridX >= 0 && gridX < maze[0].length && gridZ >= 0 && gridZ < maze.length) {
        return maze[gridZ][gridX] === 2;
      }
      return false;
    };

    // Minimap functionality
    const updateMinimap = () => {
      const canvas = minimapCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cellSize = 8;
      canvas.width = maze[0].length * cellSize;
      canvas.height = maze.length * cellSize;

      // Clear canvas
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Puzzle gate colors for minimap
      const puzzleGateColors = ['#ff4444', '#ff8800', '#ffff00', '#00aaff', '#ff00ff'];

      // Draw maze
      maze.forEach((row, z) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            // Wall
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x * cellSize, z * cellSize, cellSize, cellSize);
          } else if (cell === 2) {
            // Goal
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(x * cellSize, z * cellSize, cellSize, cellSize);
          } else if (cell >= 3 && cell <= 7) {
            // Puzzle gate
            const puzzleId = cell - 2;
            if (solvedPuzzlesRef.current.includes(puzzleId)) {
              // Solved - show as path
              ctx.fillStyle = '#90EE90';
            } else {
              // Unsolved - show gate color
              ctx.fillStyle = puzzleGateColors[puzzleId - 1];
            }
            ctx.fillRect(x * cellSize, z * cellSize, cellSize, cellSize);
          } else if (cell === 8) {
            // Locked door
            if (collectedKeysRef.current.length >= 5) {
              // Unlocked - show as path
              ctx.fillStyle = '#90EE90';
            } else {
              // Locked - show as gold
              ctx.fillStyle = '#FFD700';
            }
            ctx.fillRect(x * cellSize, z * cellSize, cellSize, cellSize);
          } else {
            // Path
            ctx.fillStyle = '#90EE90';
            ctx.fillRect(x * cellSize, z * cellSize, cellSize, cellSize);
          }
        });
      });

      // Draw player using simple grid coordinates
      const playerX = camera.position.x * cellSize;
      const playerZ = camera.position.z * cellSize;

      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(playerX, playerZ, cellSize / 3, 0, 2 * Math.PI);
      ctx.fill();

      // Draw player direction using camera rotation
      const dirX = Math.sin(camera.rotation.y) * cellSize / 2;
      const dirZ = Math.cos(camera.rotation.y) * cellSize / 2;

      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playerX, playerZ);
      ctx.lineTo(playerX + dirX, playerZ + dirZ);
      ctx.stroke();
    };

    // Mouse sensitivity constant
    const mouseSensitivity = 0.002;

    // Professional mouse controls from 3D Maze Master
    const applyRotation = (rotationVector: THREE.Vector3, scaleFactor: number = 1) => {
      const tmpEulerAngle = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');

      tmpEulerAngle.y += rotationVector.y * scaleFactor;
      tmpEulerAngle.x += rotationVector.x * scaleFactor;

      // Clamp pitch to prevent gimbal lock (±88.2°)
      tmpEulerAngle.x = Math.max(-Math.PI * 0.49, Math.min(Math.PI * 0.49, tmpEulerAngle.x));

      camera.quaternion.setFromEuler(tmpEulerAngle);
      camera.rotation.setFromQuaternion(camera.quaternion, camera.rotation.order);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked) return;

      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      const rotationVector = new THREE.Vector3(-movementY, -movementX, 0);
      applyRotation(rotationVector, mouseSensitivity);
    };

    const onPointerLockChange = () => {
      isLocked = document.pointerLockElement === renderer.domElement;
      if (isLocked) {
        setShowInstructions(false);
      }
    };

    const onClick = () => {
      if (!isLocked) {
        renderer.domElement.requestPointerLock();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    renderer.domElement.addEventListener('click', onClick);

    // Animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Update countdown timer
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);
      const remaining = Math.max(0, countdownDuration - elapsed);
      setTimeRemaining(remaining);

      // Check if time ran out
      if (remaining <= 0) {
        setGameAborted(true); // Time ran out - game over
        cancelAnimationFrame(animationId);
        document.exitPointerLock();
        return;
      }

      // 3D Maze Master movement system
      let moveVector = new THREE.Vector3(0, 0, 0);

      if (isLocked) {
        // Update move state based on keyboard input (using ref to avoid re-renders)
        const currentKeys = keysRef.current;
        player.moveState.forward = currentKeys.forward ? 1 : 0;
        player.moveState.back = currentKeys.backward ? 1 : 0;
        player.moveState.left = currentKeys.left ? 1 : 0;
        player.moveState.right = currentKeys.right ? 1 : 0;

        // Calculate movement vector in local space
        moveVector = new THREE.Vector3(
          -player.moveState.left + player.moveState.right,
          0, // no vertical movement in maze
          -(player.moveState.forward) + player.moveState.back
        );

        // Normalize movement vector to prevent faster diagonal movement
        if (moveVector.length() > 1) {
          moveVector.normalize();
        }

        // Apply movement with proper delta time
        const delta = 1 / 60; // Assume 60fps for consistent movement
        const moveMult = delta * movementSpeed;

        // Apply movement relative to camera orientation with collision detection
        if (moveVector.length() > 0) {
          // Get camera forward and right vectors (in world space)
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
          const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

          // Calculate world-space movement
          const worldMoveX = (right.x * moveVector.x + forward.x * -moveVector.z) * moveMult;
          const worldMoveZ = (right.z * moveVector.x + forward.z * -moveVector.z) * moveMult;

          // Use collision-safe movement
          tryMove(worldMoveX, worldMoveZ);

          // Check for puzzle triggers
          checkPuzzleTrigger(camera.position.x, camera.position.z);
        }

        // Update player position to match camera
        player.position.copy(camera.position);

        // Update head bob for walking animation
        if (moveVector.length() > 0.001) {
          headBob.current.phase += delta * 8; // Walking speed
        }
      }

      // Update minimap
      updateMinimap();

      // Check win condition
      if (checkWin()) {
        setGameWon(true);
        cancelAnimationFrame(animationId);
        document.exitPointerLock();
        return;
      }

      // Professional first-person camera sync with head bob
      const movementDistance = moveVector.length();
      const bobOffset = movementDistance > 0.001 ? Math.sin(headBob.current.phase) * headBob.current.amplitude * 0.5 : 0;

      // Maintain ground-level camera height with subtle head bob effect
      const groundHeight = 0.5; // Fixed ground-level camera height
      camera.position.y = groundHeight + bobOffset;

      // Animate goals
      scene.traverse((obj) => {
        if ((obj as any).userData.animate) {
          (obj as any).userData.animate();
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Window resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    // Store ref for cleanup
    const currentMount = mountRef.current;

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('resize', onResize);

      if (currentMount && renderer.domElement.parentNode) {
        currentMount.removeChild(renderer.domElement);
      }

      renderer.dispose();

      // Dispose of textures and materials
      stoneTexture.dispose();
      grassTexture.dispose();
      wallMaterial.dispose();
      floorMaterial.dispose();

      // Dispose of geometries
      floorGeometry.dispose();

      // Dispose of wall blocks
      wallBlocks.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, [isPlaying]); // Only restart when play state changes, not on key presses

  if (!isPlaying) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
          fontFamily: "'Trebuchet MS', sans-serif",
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '50px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            border: '3px solid #4169E1',
            boxShadow: '0 0 60px rgba(65, 105, 225, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.5)',
            maxWidth: '600px',
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              margin: '0 0 10px 0',
              color: '#4169E1',
              textShadow: '0 0 30px #4169E1, 0 0 60px #1E90FF',
              letterSpacing: '4px',
              fontWeight: 'bold',
            }}
          >
            MORNING MAZE
          </h1>
          <p
            style={{
              fontSize: '20px',
              color: '#2F4F4F',
              marginBottom: '40px',
              letterSpacing: '1px',
            }}
          >
            Navigate the sunny garden maze
          </p>
          <button
            onClick={() => {
              setShowRegistration(true); // Show registration form first
            }}
            style={{
              padding: '20px 60px',
              fontSize: '24px',
              background: 'linear-gradient(135deg, #4169E1 0%, #1E90FF 100%)',
              color: '#fff',
              border: '3px solid #4169E1',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: "'Trebuchet MS', sans-serif",
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(65, 105, 225, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'linear-gradient(135deg, #1E90FF 0%, #4169E1 100%)';
              target.style.transform = 'translateY(-4px) scale(1.05)';
              target.style.boxShadow = '0 10px 30px rgba(65, 105, 225, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'linear-gradient(135deg, #4169E1 0%, #1E90FF 100%)';
              target.style.transform = 'translateY(0) scale(1)';
              target.style.boxShadow = '0 6px 20px rgba(65, 105, 225, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.2)';
            }}
          >
            Start Game
          </button>
          <div
            style={{
              marginTop: '40px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '10px',
              border: '2px solid #4169E1',
            }}
          >
            <p style={{ color: '#2F4F4F', fontSize: '16px', margin: '8px 0' }}>
              <strong style={{ color: '#4169E1' }}>W A S D</strong> or{' '}
              <strong style={{ color: '#4169E1' }}>Arrow Keys</strong> - Move
            </p>
            <p style={{ color: '#2F4F4F', fontSize: '16px', margin: '8px 0' }}>
              <strong style={{ color: '#4169E1' }}>Mouse</strong> - Look around
            </p>
            <p style={{ color: '#2F4F4F', fontSize: '16px', margin: '8px 0' }}>
              <strong style={{ color: '#4169E1' }}>Goal</strong> - Find the glowing green marker!
            </p>
          </div>
        </div>

        {/* Registration Form Overlay - shown on start screen */}
        {showRegistration && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              fontFamily: "'Trebuchet MS', sans-serif",
            }}
          >
            <div
              style={{
                textAlign: 'center',
                padding: '30px',
                background: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '20px',
                border: '4px solid #4169E1',
                boxShadow: '0 0 60px rgba(65, 105, 225, 0.5)',
                maxWidth: '700px',
                width: '90%',
              }}
            >
              <h2 style={{ color: '#4169E1', marginBottom: '20px', fontSize: '28px' }}>
                📝 Register to Start
              </h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Please fill out the form below, then click "Start Game"
              </p>
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLScpaiG3cHfoVUMSBklPvvMOJ2-9Gae-166hsIF6NRfpQXTz8g/viewform?embedded=true"
                width="100%"
                height="500"
                style={{ border: 'none', borderRadius: '10px' }}
                title="Registration Form"
              >
                Loading…
              </iframe>
              <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setShowRegistration(false);
                    setIsPlaying(true);
                    setGameWon(false);
                    setGameAborted(false);
                    setTimeRemaining(45 * 60);
                    setElapsedTime(0);
                    setSolvedPuzzles([]);
                    setCollectedKeys([]);
                  }}
                  style={{
                    padding: '15px 40px',
                    fontSize: '18px',
                    background: 'linear-gradient(135deg, #00cc44 0%, #00aa33 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(0, 204, 68, 0.4)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'translateY(-2px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  🎮 Start Game
                </button>
                <button
                  onClick={() => setShowRegistration(false)}
                  style={{
                    padding: '15px 30px',
                    fontSize: '18px',
                    background: '#666',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = '#888';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = '#666';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Helper function to format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to format elapsed time for victory
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}m ${secs}s ${ms}ms`;
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Countdown Timer - Top Center */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '15px 40px',
          background: timeRemaining < 300 ? 'rgba(255, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          color: timeRemaining < 300 ? '#fff' : '#4169E1',
          fontFamily: "'Courier New', monospace",
          fontSize: '36px',
          fontWeight: 'bold',
          borderRadius: '15px',
          border: timeRemaining < 300 ? '3px solid #ff3333' : '3px solid #4169E1',
          boxShadow: timeRemaining < 300 ? '0 4px 20px rgba(255, 50, 50, 0.5)' : '0 4px 15px rgba(65, 105, 225, 0.3)',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        ⏱ {formatTime(timeRemaining)}
      </div>

      {/* Minimap */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '10px',
          border: '3px solid #4169E1',
          boxShadow: '0 4px 15px rgba(65, 105, 225, 0.3)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            color: '#4169E1',
            fontFamily: "'Courier New', monospace",
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '5px',
            textAlign: 'center',
          }}
        >
          MAP
        </div>
        <canvas
          ref={minimapCanvasRef}
          style={{
            border: '2px solid #4169E1',
            borderRadius: '5px',
            display: 'block',
          }}
        />
        <div
          style={{
            color: '#2F4F4F',
            fontFamily: "'Courier New', monospace",
            fontSize: '10px',
            marginTop: '5px',
            textAlign: 'center',
          }}
        >
          🔴 You | 🟢 Goal
        </div>
      </div>

      {/* Instructions overlay */}
      {showInstructions && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '30px 50px',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#4169E1',
            fontFamily: "'Trebuchet MS', sans-serif",
            fontSize: '24px',
            fontWeight: 'bold',
            borderRadius: '15px',
            border: '3px solid #4169E1',
            boxShadow: '0 0 40px rgba(65, 105, 225, 0.4)',
            textAlign: 'center',
          }}
        >
          🖱️ CLICK TO START 🖱️
        </div>
      )}

      {/* Controls hint */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          padding: '15px 20px',
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#2F4F4F',
          fontFamily: "'Courier New', monospace",
          fontSize: '14px',
          borderRadius: '8px',
          border: '2px solid #4169E1',
          pointerEvents: 'none',
          lineHeight: '1.8',
        }}
      >
        <div>
          <strong style={{ color: '#4169E1' }}>W/↑</strong> - Forward
        </div>
        <div>
          <strong style={{ color: '#4169E1' }}>S/↓</strong> - Backward
        </div>
        <div>
          <strong style={{ color: '#4169E1' }}>A/←</strong> - Left
        </div>
        <div>
          <strong style={{ color: '#4169E1' }}>D/→</strong> - Right
        </div>
        <div>
          <strong style={{ color: '#4169E1' }}>Mouse</strong> - Look
        </div>
        <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
          Click to lock cursor
        </div>
      </div>

      {/* Puzzle progress indicator */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          padding: '15px 20px',
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#2F4F4F',
          fontFamily: "'Courier New', monospace",
          fontSize: '14px',
          borderRadius: '8px',
          border: '2px solid #4169E1',
          pointerEvents: 'none',
        }}
      >
        <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#4169E1' }}>
          🔑 KEYS COLLECTED
        </div>
        <div>
          {collectedKeys.length} / 5 Keys
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', lineHeight: '1.4' }}>
          {collectedKeys.length > 0 ? (
            collectedKeys.map((key, i) => (
              <div key={i} style={{ color: '#00ff88' }}>{key}</div>
            ))
          ) : (
            <div style={{ color: '#888' }}>Solve puzzles to earn keys!</div>
          )}
        </div>
        {collectedKeys.length >= 5 && (
          <div style={{ marginTop: '8px', color: '#ffd700', fontWeight: 'bold' }}>
            🚪 Final doors unlocked!
          </div>
        )}
      </div>

      {/* Puzzle overlay */}
      {activePuzzle && (
        <PuzzleOverlay
          puzzle={activePuzzle}
          onSolve={(keyName: string) => {
            setSolvedPuzzles(prev => [...prev, activePuzzle.id]);
            setCollectedKeys(prev => [...prev, keyName]);
            setActivePuzzle(null);
          }}
          onClose={() => setActivePuzzle(null)}
        />
      )}

      {/* Victory Overlay */}
      {gameWon && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            fontFamily: "'Trebuchet MS', sans-serif",
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '50px 80px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 248, 255, 0.98) 100%)',
              borderRadius: '25px',
              border: '4px solid #4169E1',
              boxShadow: '0 0 100px rgba(65, 105, 225, 0.6), 0 0 200px rgba(0, 255, 136, 0.3)',
            }}
          >
            <h1
              style={{
                fontSize: '64px',
                margin: '0 0 20px 0',
                color: '#4169E1',
                textShadow: '0 0 30px #4169E1',
                letterSpacing: '4px',
              }}
            >
              🏆 VICTORY! 🏆
            </h1>
            <p style={{ fontSize: '24px', color: '#2F4F4F', marginBottom: '15px' }}>
              You escaped the maze!
            </p>
            <div
              style={{
                fontSize: '20px',
                color: '#666',
                marginBottom: '30px',
              }}
            >
              <p style={{ margin: '10px 0' }}>⏱ <strong>Time Taken:</strong></p>
              <p
                style={{
                  fontSize: '42px',
                  color: '#00cc44',
                  fontWeight: 'bold',
                  margin: '10px 0',
                }}
              >
                {formatElapsedTime(elapsedTime)}
              </p>
            </div>
            <button
              onClick={() => {
                // Open Google Form with prefilled time
                const timeStr = formatTime(elapsedTime);
                window.open(`https://docs.google.com/forms/d/e/1FAIpQLSetfH5GhS5QvTRcQDb0y3oBnHKverKQOdk4hvY958GFHZj68A/viewform?usp=pp_url&entry.2039261618=${timeStr}`, '_blank');
              }}
              style={{
                padding: '18px 60px',
                fontSize: '22px',
                background: 'linear-gradient(135deg, #00cc44 0%, #00aa33 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 6px 25px rgba(0, 204, 68, 0.4)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '3px',
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'translateY(-4px) scale(1.05)';
                target.style.boxShadow = '0 10px 35px rgba(0, 204, 68, 0.6)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'translateY(0) scale(1)';
                target.style.boxShadow = '0 6px 25px rgba(0, 204, 68, 0.4)';
              }}
            >
              ✓ SUBMIT
            </button>
          </div>
        </div>
      )}

      {/* Game Aborted Overlay - Time Ran Out */}
      {gameAborted && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            fontFamily: "'Trebuchet MS', sans-serif",
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '50px 80px',
              background: 'linear-gradient(135deg, rgba(255, 50, 50, 0.98) 0%, rgba(200, 30, 30, 0.98) 100%)',
              borderRadius: '25px',
              border: '4px solid #ff3333',
              boxShadow: '0 0 100px rgba(255, 50, 50, 0.6)',
            }}
          >
            <h1
              style={{
                fontSize: '56px',
                margin: '0 0 20px 0',
                color: '#fff',
                textShadow: '0 0 30px rgba(0,0,0,0.5)',
                letterSpacing: '4px',
              }}
            >
              ⏰ TIME'S UP! ⏰
            </h1>
            <p style={{ fontSize: '24px', color: '#ffcccc', marginBottom: '15px' }}>
              You ran out of time!
            </p>
            <div
              style={{
                fontSize: '20px',
                color: '#ffaaaa',
                marginBottom: '30px',
              }}
            >
              <p style={{ margin: '10px 0' }}>Total Time: <strong>45:00</strong></p>
            </div>
            <button
              onClick={() => {
                // Open Google Form with prefilled 45:00
                window.open('https://docs.google.com/forms/d/e/1FAIpQLSedwaApArTj1A0xtfRmh-yy86ap12XF8l1ahMv0vmPxLPKVug/viewform?usp=pp_url&entry.2039261618=45:00', '_blank');
              }}
              style={{
                padding: '18px 60px',
                fontSize: '22px',
                background: 'linear-gradient(135deg, #fff 0%, #eee 100%)',
                color: '#cc3333',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 6px 25px rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '3px',
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'translateY(-4px) scale(1.05)';
                target.style.boxShadow = '0 10px 35px rgba(255, 255, 255, 0.6)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'translateY(0) scale(1)';
                target.style.boxShadow = '0 6px 25px rgba(255, 255, 255, 0.4)';
              }}
            >
              ✓ SUBMIT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}