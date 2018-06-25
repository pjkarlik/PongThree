import THREE from '../Three';
import Ball from './libs/Ball';
require('../shaders/pixel');

// Skybox image imports //
import xpos from '../../resources/images/line/posx.jpg';
import xneg from '../../resources/images/line/negx.jpg';
import ypos from '../../resources/images/line/posy.jpg';
import yneg from '../../resources/images/line/negy.jpg';
import zpos from '../../resources/images/line/posz.jpg';
import zneg from '../../resources/images/line/negz.jpg';

import grid from '../../resources/images/grid_trans.png';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;

    this.threshold = 0.16;
    this.strength = 0.75;
    this.radius = 0.75;

    this.setViewport();
    this.setRender();
    this.setEffects();
    this.holoDeck();
    this.renderLoop();
    window.addEventListener('mousemove', this.movePlayer, true);
    window.addEventListener('resize', this.resize, true);
    // window.addEventListener('click', () => {
    //   console.log(this.camera.position);
    // }, true);
  }

  setViewport = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.viewAngle = 60;
    this.aspect = this.width / this.height;
    this.near = 1;
    this.far = 1000;
    this.devicePixelRatio = window.devicePixelRatio;
    this.ball;
  };
  
  resize = () => {
    this.setViewport();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
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
    this.camera.position.set(-2.2, 2.5, -9.5);
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
    this.composer.addPass(copyEffect);

    this.rfrag = new THREE.ShaderPass(THREE.RenderFragment);
    this.rfrag.renderToScreen = true;
    this.composer.addPass(this.rfrag);
  }

  holoDeck = () => {
    let isWire = false;

    const texloader = new THREE.TextureLoader();
  
    const texture = texloader.load(grid, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(1, 1);
    });
  
    let material = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    let geometry = new THREE.BoxGeometry(6, .2, 6, 6, 1, 6);
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
        color:0xAA7700, 
        specular:0x999999,
        transparent: true,
        opacity: 0.35
      })
    );
    this.player.position.set(0, 0, -3);
    this.scene.add(this.player);

    // Set up Pong Ball //

    geometry = new THREE.SphereGeometry(.25, 12, 12);
    const ball = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ 
        color:0xFFFFFF
      })
    );
    ball.position.set(0, 0, -2);
    this.scene.add(ball);

    this.ball = new Ball({
      size: 0.25,
      x: 0,
      y: 0,
      z: -1,
      vx: 0.08,
      vy: 0.05,
      vz: 0.1,
      size: 0.25,
      box: {
        top: 3,
        left: -3,
        bottom: -3,
        right: 3,
        front: 3,
        back: -2.5
      },
      ref: ball
    });
  };

  movePlayer = (e) => {
    const x = ((this.width / 2) - e.clientX) * 0.02;
    const y = ((this.height / 2) - e.clientY) * 0.02;
    
    this.player.position.set(x, y, -3);
  };

  checkball = () => {
    this.ball.update();
    const ball = this.ball.ref;
    ball.position.set(this.ball.x, this.ball.y, this.ball.z);
    // this.player.position.set(this.ball.x, this.ball.y, -3);
  };

  compositRender = () => {
    this.composer.render();
    // this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.frames ++;
    this.compositRender();
    this.checkball();
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}
