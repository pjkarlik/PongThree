import THREE from '../Three';

// Skybox image imports //
import xpos from '../../resources/images/line/posx.jpg';
import xneg from '../../resources/images/line/negx.jpg';
import ypos from '../../resources/images/line/posy.jpg';
import yneg from '../../resources/images/line/negy.jpg';
import zpos from '../../resources/images/line/posz.jpg';
import zneg from '../../resources/images/line/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;

    this.threshold = 0.3;
    this.strength = 1.2;
    this.radius = 0.45;

    this.setViewport();
    this.setRender();
    this.setEffects();
    this.holoDeck();
    this.renderLoop();
    window.addEventListener('mousemove', this.movePlayer, true);
    window.addEventListener('resize', this.resize, true);
  }

  setViewport = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.viewAngle = 60;
    this.aspect = this.width / this.height;
    this.near = 1;
    this.far = 1000;
    this.devicePixelRatio = window.devicePixelRatio;
  };
  
  setRender = () => {
    // Set Initial Render Stuff //
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.viewAngle,
      this.aspect,
      this.near,
      this.far
    );
    this.camera.position.set(0, 0, -13);
    this.camera.lookAt(new THREE.Vector3());

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 0;

    // Set AmbientLight //
    let pointLight = new THREE.PointLight(0xDDDDDD);
    pointLight.position.set(12, 6, -12);
    this.scene.add(pointLight);
    pointLight = new THREE.PointLight(0xEEEEEE);
    pointLight.position.set(-12, 15, -12);
    this.scene.add(pointLight);
    let ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(0, 25, -8);
    this.scene.add(ambient);

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    const skybox = new THREE.CubeTextureLoader().load(urls);
    skybox.format = THREE.RGBFormat;
    skybox.mapping = THREE.CubeRefractionMapping;
    this.scene.background = skybox;
  };

  setEffects = () => {
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.strength, this.radius, 1.0 - this.threshold
    );

    this.composer.addPass(this.bloomPass);

    const copyEffect = new THREE.ShaderPass(THREE.CopyShader);
    copyEffect.renderToScreen = true;
    this.composer.addPass(copyEffect);
  }

  holoDeck = () => {
    let geometry = new THREE.BoxGeometry(6, .2, 6, 6, 1, 6);
    let material = new THREE.MeshPhongMaterial(
      { color:0xFFFFFF, wireframe: isWire }
    );
    let isWire = true;
    let floor = new THREE.Mesh(
      geometry,
      material
    );
    floor.position.set(0, -3.5, 0);
    this.scene.add(floor);

    geometry = new THREE.BoxGeometry(6, 6, .2, 6, 6, 1);
    let wall = new THREE.Mesh(
      geometry,
      material
    );
    wall.position.set(0, 0, 3.5);
    this.scene.add(wall);

    geometry = new THREE.BoxGeometry(1, 1, .2, 1, 1, 1);
    this.player = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({ 
        color:0x00ff00, 
        wireframe: isWire,
        opacity: true
      })
    );
    this.player.position.set(0, 0, -3);
    this.scene.add(this.player);
  };

  resize = () => {
    this.setViewport();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };
  
  movePlayer = (e) => {
    const x = ((this.width / 2) - e.clientX) * 0.05;
    const y = ((this.height / 2) - e.clientY) * 0.05;
    
    this.player.position.set(x, y, -3);
  };

  compositRender = () => {
    this.composer.render();
    // this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.frames ++;
    this.compositRender();
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}
