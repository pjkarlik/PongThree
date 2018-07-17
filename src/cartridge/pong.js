import THREE from '../Three';
require('../shaders/fusion');

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
    this.particles = [];
    this.threshold = 0.25;
    this.strength = 0.85;
    this.radius = 0.75;

    this.game = {
      balls: 3,
      inPlay: false,
      hits: 0
    };
    this.box = {
      top: 3,
      left: -3,
      bottom: -3,
      right: 3,
      front: 3,
      back: -2.5
    };
    this.ball = {
      size: 0.25,
      x: 0,
      y: 0,
      z: -1,
      vx: 0,
      vy: 0,
      vz: 0,
      ref: null
    };

    this.setViewport();
    this.setRender();
    this.setEffects();
    this.holoDeck();
    this.renderLoop();
    window.addEventListener('mousemove', this.movePlayer, true);
    window.addEventListener('resize', this.resize, true);
    window.addEventListener('keyup', this.keyHandler, true);
    window.addEventListener('click', () => {
      console.log(this.camera.position);
    }, true);
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

    this.setCamera();
    this.skyBox();
    this.setLights();
  };

  setCamera = () => {
    this.camera = new THREE.PerspectiveCamera(
      this.viewAngle,
      this.aspect,
      this.near,
      this.far
    );
    this.camera.position.set(6.2, 0.45, -7.8);
    this.camera.lookAt(new THREE.Vector3());

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 0;
  };

  skyBox = () => {
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    const skybox = new THREE.CubeTextureLoader().load(urls);
    skybox.format = THREE.RGBFormat;
    skybox.mapping = THREE.CubeRefractionMapping;
    this.scene.background = skybox;
  };

  setLights = () => {
    // Set AmbientLight //
    let pointLight = new THREE.PointLight(0xAAAAAA);
    pointLight.position.set(12, 6, -19);
    this.scene.add(pointLight);
    pointLight = new THREE.PointLight(0x999999);
    pointLight.position.set(-12, 15, 16);
    this.scene.add(pointLight);
    let ambient = new THREE.AmbientLight(0xAAAAAA);
    ambient.position.set(0, 25, 20);
    this.scene.add(ambient);
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
  };

  keyHandler = (e) => {
    if(e.keyCode == 32){
      this.game.inPlay = true;
      this.ball.vx = Math.abs(Math.random() * 0.12);
      this.ball.vy = Math.abs(Math.random() * 0.12);
      this.ball.vz = 0.1 + Math.abs(Math.random() * 0.075);
    }
  };

  holoDeck = () => {
    let isWire = false;

    const texloader = new THREE.TextureLoader();
  
    const texture = texloader.load(grid, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(2, 2);
    });
  
    let material = new THREE.MeshPhongMaterial({
      map: texture,
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
        color:0xAA7700, // 0xAA7700
        specular:0x999999,
        transparent: true,
        opacity: 0.35
      })
    );

    this.player.position.set(0, 0, -3);
    this.scene.add(this.player);

    const ball = this.createBall(0, 0, -2);
    this.ball.ref = ball;
  };

  createBall = (dx, dy, dz, color = 0xFFFFFF) => {
    const geometry = new THREE.SphereGeometry(.25, 12, 12);
    const ball = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({ 
        color,
        specular: 0xFF0000
      })
    );
    ball.position.set(dx, dy, dz);
    this.scene.add(ball);

    return ball;
  };

  checkball = () => {
    const ball = this.ball;
    const player = this.player.position;

    if (this.ball.y > this.box.top + ball.size || this.ball.y < this.box.bottom - ball.size) {
      this.ball.vy = -this.ball.vy;
    }
   
    if (this.ball.x < this.box.left - ball.size || this.ball.x > this.box.right + ball.size) {
      this.ball.vx = -this.ball.vx;
    }
    
    const afd = 0.5;
    const isX = player.x <= this.ball.x + afd && player.x >= this.ball.x - afd;
    const isY = player.y <= this.ball.y + afd && player.y >= this.ball.y - afd;

    if (this.ball.z < this.box.back + ball.size && isX && isY ) {
      this.ball.vz = -this.ball.vz;  
      this.ball.vx = Math.random() * 0.12; // ((player.x - this.ball.x) * 0.61);
      this.ball.vy = Math.random() * 0.12;
    }

    if (this.ball.z < -4) {
      this.game.inPlay = false;
      this.ball.z = -1;
    }

    if (this.ball.z > this.box.front - ball.size) {
      this.ball.vz = -this.ball.vz;
    }


    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    this.ball.z += this.ball.vz;

    ball.ref.position.set(this.ball.x, this.ball.y, this.ball.z);
  
    if (this.frames % 5 === 0 && this.particles.length < 400 && this.game.inPlay) {
      const baller = this.createBall(this.ball.x, this.ball.y, this.ball.z, 0xFFFFFF);
      const trail = {
        size: this.ball.size * 2,
        life: 0,
        ref: baller
      };
      this.particles.push(trail);
    }
  };

  checkparticles() {
    this.particles.forEach((element, index) => {
      element.size -= (element.life * 0.00002);
      element.life++;
      element.ref.scale.x = element.size;
      element.ref.scale.y = element.size;
      element.ref.scale.z = element.size;
      if (element.size < 0.0) {
        element.ref.geometry.dispose();
        element.ref.material.dispose();
        this.scene.remove(element.ref);
        element = undefined;
        this.particles.splice(index, 1);
      }
    });
  };

  movePlayer = (e) => {
    const dir = this.camera.position.z;
    let x = dir < 0 ? ((this.width / 2) - e.clientX) * 0.02 : -((this.width / 2) - e.clientX) * 0.02;
    let y = ((this.height / 2) - e.clientY) * 0.02;
    if (y > this.box.top) {
      y = this.box.top;
    }
    if (y < this.box.bottom) {
      y = this.box.bottom;
    }
    if (x > this.box.right) {
      x = this.box.right;
    }
    if (x < this.box.left) {
      x = this.box.left;
    }
    this.player.position.set(x, y, -3);
    if (!this.game.inPlay) {
      const ball = this.ball.ref;
      ball.position.set(x, y, -2.5);
      this.ball.x = x;
      this.ball.y = y;
      // this.ball.z = -2.5;
    }
  };

  compositRender = () => {
    this.composer.render();
    // this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.frames ++;
    this.compositRender();
    if (this.game.inPlay) {
      this.checkball();
    }
    if (this.particles.length > 0) {
      this.checkparticles();
    }
    // this.rfrag.uniforms.time.value = this.frames * 0.01;
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}
