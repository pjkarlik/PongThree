/**
* Basic Ball Class Object
**/
export default class Ball {
  constructor(config) {
    this.size = config.size || 0.0;
    this.ref = config.ref || null;
    this.life = 0;
    this.x = config.x || 0.0;
    this.y = config.y || 0.0;
    this.z = config.z || 0.0;
    const min = config.min || 5;
    const max = config.max || 10;
    this.vx = config.vx || (Math.abs(Math.random() * max) - min);
    this.vy = config.vy || (Math.abs(Math.random() * max) - min);
    this.vz = config.vz || (Math.abs(Math.random() * max) - min);
    
    this.settings = config.settings || { gravity: 0.0, bounce: 0.15 };
    this.box = config.box;
    this.update();
  }

  update = () => {
    const { gravity, bounce } = this.settings;
    if (this.y > this.box.top + this.size || this.y < this.box.bottom - this.size) {
      this.vy = -this.vy;
    }
   
    if (this.x < this.box.left - this.size || this.x > this.box.right + this.size) {
      this.vx = -this.vx;
    }

    if (this.z < this.box.back - this.size && || this.z > this.box.front + this.size) {
      this.vz = -this.vz;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;

    this.life++;
  }
}
