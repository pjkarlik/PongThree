import THREE from '../Three';
import { Howl } from 'howler';
require('../shaders/default');

// Skybox image imports //
import xpos from '../../resources/images/line/posx.jpg';
import xneg from '../../resources/images/line/negx.jpg';
import ypos from '../../resources/images/line/posy.jpg';
import yneg from '../../resources/images/line/negy.jpg';
import zpos from '../../resources/images/line/posz.jpg';
import zneg from '../../resources/images/line/negz.jpg';
// Texture imports //
import grid from '../../resources/images/grid_trans.png';
// Sound imports //
import beep1 from '../../resources/sound/BEEP1.mp3';
import beep2 from '../../resources/sound/BEEP2.mp3';
import beep3 from '../../resources/sound/BEEP3.mp3';
import beep4 from '../../resources/sound/BEEP4.mp3';
import beep5 from '../../resources/sound/BEEP5.mp3';
import beep6 from '../../resources/sound/BEEP6.mp3';
import PHASE from '../../resources/sound/PHASE.mp3';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;
    this.score = 0;
    this.ballsLeft = 10;
    this.particles = [];
    this.threshold = 0.25;
    this.strength = 0.85;
    this.radius = 0.75;
    this.display;
    this.ax = 0;
    this.ay = 0;
    this.game = {
      balls: 3,
      inPlay: false,
      autoMode: false,
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
    this.soundAssets = this.downloadAll();
    setTimeout(() => {
      this.assets['PHASE'].data._loop = true;
      this.assets['PHASE'].data.fade(0, 0.5, 6000);
      this.assets['PHASE'].data.play();
    }, 3000);
    this.setViewport();
    this.setRender();
    this.setEffects();
    this.holoDeck();
    this.renderLoop();
    this.injectDisplay();
    this.updateDisplay();
    window.addEventListener('mousemove', this.movePlayer, true);
    window.addEventListener('resize', this.resize, true);
    window.addEventListener('keyup', this.keyHandler, true);
    window.addEventListener('click', () => {
      console.log(this.camera.position);
    }, true);
  }

  getSoundLoader = (id, asset) => {
    console.log(id, asset.src);
    return new Promise((resolve, reject) => {
      const sound = new Howl({
        src: [asset.src],
        volume: asset.volume,
        onload: () => {
          this.assets[id].data = sound;
          resolve(sound);
        },
        onloaderror: (e) => { reject(e); },
      });
    });
  };

  downloadAll = () =>{
    const defaults = {
      type: 'sound',
      volume: 0.5,
      data: null
    };
    
    this.assets = {
      beep1: {
        src: beep1,
        ...defaults
      },
      beep2: {
        src: beep2,
        ...defaults
      },
      beep3: {
        src: beep3,
        ...defaults
      },
      beep4: {
        src: beep4,
        ...defaults
      },
      beep5: {
        src: beep5,
        ...defaults
      },
      beep6: {
        src: beep6,
        ...defaults
      },
      PHASE: {
        src: PHASE,
        ...defaults,
      }
    };
    
    return Promise.all(
      Object.keys(this.assets)
        .map((id) => (this.getSoundLoader(id, this.assets[id]))));
  };

  injectDisplay = () => {
    this.display = {};

    const display = document.createElement('div');
    const ballsLeft = document.createElement('div');
    const playerScore = document.createElement('div');
    display.className = 'display';
    ballsLeft.className = 'balls';
    playerScore.className = 'score';
    this.display = {
      parent: display,
      ballsLeft,
      playerScore
    };
    display.appendChild(ballsLeft);
    display.appendChild(playerScore);
    document.body.appendChild(display);
  };

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
    // this.rfrag.uniforms.time.value = this.frames;
    this.rfrag.renderToScreen = true;
    this.composer.addPass(this.rfrag);
  };

  keyHandler = (e) => {
    if (this.game.inPlay) return;
    if(e.keyCode == 32 && this.particles.length < 10){
      this.game.inPlay = true;
      this.ball.vx = Math.abs(Math.random() * 0.12);
      this.ball.vy = Math.abs(Math.random() * 0.12);
      this.ball.vz = 0.1 + Math.abs(Math.random() * 0.075);
      this.assets['beep5'].data.play();
    }
  };

  holoDeck = () => {
    let isWire = false;
    console.log(this.soundAssets);
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
      this.assets['beep6'].data.play();
    }
   
    if (this.ball.x < this.box.left - ball.size || this.ball.x > this.box.right + ball.size) {
      this.ball.vx = -this.ball.vx;
      this.assets['beep3'].data.play();
    }
    
    const afd = 0.5;
    const isX = player.x <= this.ball.x + afd && player.x >= this.ball.x - afd;
    const isY = player.y <= this.ball.y + afd && player.y >= this.ball.y - afd;

    if (this.ball.z < this.box.back && isX && isY ) {
      this.ball.vz = -this.ball.vz; 
      this.ball.z = this.box.back;
      this.ball.vx = !this.game.autoMode ? ((player.x - this.ball.x) * 0.12) :
        Math.abs(Math.random() * 0.12);
      this.ball.vy = !this.game.autoMode ? ((player.y - this.ball.y) * 0.12) :
        Math.abs(Math.random() * 0.12);
      this.assets['beep1'].data.play();
      this.score += 10;
    }

    if (this.ball.z < -4) {
      this.game.inPlay = false;
      this.ball.z = -1;
      this.assets['beep4'].data.play();
      this.ballsLeft -= 1;
    }

    if (this.ball.z > this.box.front - ball.size) {
      this.ball.vz = -this.ball.vz;
      this.assets['beep1'].data.play();
    }

    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    this.ball.z += this.ball.vz;

    ball.ref.position.set(this.ball.x, this.ball.y, this.ball.z);
  
    if (this.frames % 6 === 0 && this.particles.length < 400 && this.game.inPlay) {
      const baller = this.createBall(this.ball.x, this.ball.y, this.ball.z, 0xFFFFFF);
      const trail = {
        size: this.ball.size * 2.5,
        life: 0,
        ref: baller
      };
      this.particles.push(trail);
    }
    if(this.game.autoMode) {
      this.autoPlay();
    }
  };

  checkparticles() {
    this.particles.forEach((element, index) => {
      const decay = this.game.inPlay ? 0.00002 : 0.0003;
      element.size -= (element.life * decay);
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
    if (this.game.autoMode) return false;
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

  autoPlay = () => {
    const ball = this.ball.ref;
    // const testPosition = true; // ball.position.z < 0;
    const newX = ball.position.x;
    const newY = ball.position.y;
    this.ax = this.ax - (this.ax - newX) * 0.2;
    this.ay = this.ay - (this.ay - newY) * 0.2;
    this.player.position.set(this.ax, this.ay, -3);
  };

  updateDisplay = () => {
    this.display.playerScore.innerHTML = `score:${this.score}`;
    this.display.ballsLeft.innerHTML = `balls:${this.ballsLeft}`; 
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
    if (this.frames % 3 === 0) {
      this.updateDisplay();
    }
    this.rfrag.uniforms.time.value = this.frames * 0.003;
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}
