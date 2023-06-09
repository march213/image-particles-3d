import {
  Color,
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  BufferGeometry,
  BufferAttribute,
  AxesHelper,
  Points,
  ShaderMaterial,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats-js';
import LoaderManager from '@/js/managers/LoaderManager';
import GUI from 'lil-gui';
import vertexShader from '@/js/glsl/main.vert';
import fragmentShader from '@/js/glsl/main.frag';
import { randFloat } from 'three/src/math/MathUtils';
import { gsap } from 'gsap';

export default class MainScene {
  canvas;
  renderer;
  scene;
  camera;
  controls;
  stats;
  width;
  height;
  guiObj = {
    progress: 0,
    frequency: 0.18,
  };

  constructor() {
    this.canvas = document.querySelector('.scene');

    this.init();
  }

  init = async () => {
    // Preload assets before initiating the scene
    const assets = [
      {
        name: 'image',
        texture: './img/img-2.jpg',
      },
    ];

    await LoaderManager.load(assets);

    this.setStats();
    this.setGUI();
    this.setScene();
    this.setRender();
    this.setCamera();
    this.setControls();
    this.setAxesHelper();

    this.setParticlesGrid();
    this.animateIn();

    this.handleResize();

    // start RAF
    this.events();
  };

  /**
   * Our Webgl renderer, an object that will draw everything in our canvas
   * https://threejs.org/docs/?q=rend#api/en/renderers/WebGLRenderer
   */
  setRender() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
  }

  /**
   * This is our scene, we'll add any object
   * https://threejs.org/docs/?q=scene#api/en/scenes/Scene
   */
  setScene() {
    this.scene = new Scene();
    this.scene.background = new Color(0x000000);
  }

  animateIn() {
    gsap.fromTo(this.material.uniforms.uProgress, {
      value: 0,
    }, {
      value: 1,
      duration: 4,
      ease: 'Power4.easeOut',
    });
  }

  /**
   * Our Perspective camera, this is the point of view that we'll have
   * of our scene.
   * A perscpective camera is mimicing the human eyes so something far we'll
   * look smaller than something close
   * https://threejs.org/docs/?q=pers#api/en/cameras/PerspectiveCamera
   */
  setCamera() {
    const aspectRatio = this.width / this.height;
    const fieldOfView = 60;
    const nearPlane = 0.1;
    const farPlane = 10000;

    this.camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    this.camera.position.y = 0;
    this.camera.position.x = 0;
    this.camera.position.z = 250;
    this.camera.lookAt(0, 0, 0);

    this.scene.add(this.camera);
  }

  /**
   * Threejs controls to have controls on our scene
   * https://threejs.org/docs/?q=orbi#examples/en/controls/OrbitControls
   */
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    // this.controls.dampingFactor = 0.04
  }

  /**
   * Axes Helper
   * https://threejs.org/docs/?q=Axesh#api/en/helpers/AxesHelper
   */
  setAxesHelper() {
    const axesHelper = new AxesHelper(3);
    this.scene.add(axesHelper);
  }

  setParticlesGrid() {
    const geometry = new BufferGeometry();

    const multiplier = 18;
    const columns = 16 * multiplier;
    const rows = 9 * multiplier;

    const vertices = [];
    const initialPositions = [];

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i - columns / 2;
        const y = j - rows / 2;

        const point = [x, y, 0];
        vertices.push(...point);

        const initialPoint = [x, y, randFloat(0, 500)];
        initialPositions.push(...initialPoint);
      }
    }

    const vertices32 = new Float32Array(vertices);
    const initialPositions32 = new Float32Array(initialPositions);

    geometry.setAttribute( 'position', new BufferAttribute(vertices32, 3 ) );
    geometry.setAttribute( 'initialPosition', new BufferAttribute(initialPositions32, 3 ) );

    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      vertexShader,
      fragmentShader,
      uniforms: {
        uPointSize: {
          value: 8,
        },
        uTexture: {
          value: LoaderManager.assets['image'].texture,
        },
        uColumns: {
          value: columns,
        },
        uRows: {
          value: rows,
        },
        uProgress: {
          value: this.guiObj.progress,
        },
        uFrequency: {
          value: this.guiObj.frequency,
        },
        uTime: {
          value: 0,
        },
      },
    });
    const mesh = new Points( geometry, material );

    this.material = material;
    this.scene.add(mesh);
  }

  /**
   * Build stats to display fps
   */
  setStats() {
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
  }

  setGUI() {
    const gui = new GUI();
    gui.add(this.guiObj, 'progress', 0, 1)
      .onChange(() => {
        this.material.uniforms.uProgress.value = this.guiObj.progress;
      });
    gui.add(this.guiObj, 'frequency', 0, 1)
      .onChange(() => {
        this.material.uniforms.uFrequency.value = this.guiObj.frequency;
      });
  }

  /**
   * List of events
   */
  events() {
    window.addEventListener('resize', this.handleResize, {
      passive: true,
    });
    this.draw(0);
  }

  // EVENTS

  /**
   * Request animation frame function
   * This function is called 60/time per seconds with no performance issue
   * Everything that happens in the scene is drawed here
   * @param {Number} now
   */
  draw = (time) => {
    // now: time in ms
    this.stats.begin();

    if (this.controls) this.controls.update(); // for damping
    this.renderer.render(this.scene, this.camera);

    this.material.uniforms.uTime.value = time * 0.001;

    this.stats.end();
    this.raf = window.requestAnimationFrame(this.draw);
  };

  /**
   * On resize, we need to adapt our camera based
   * on the new window width and height and the renderer
   */
  handleResize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Update camera
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;

    this.renderer.setPixelRatio(DPR);
    this.renderer.setSize(this.width, this.height);
  };

}
