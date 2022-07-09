const tickrate = 30;
const canvasSize = 800;
const particleLifetime = 4; // In seconds

class ParticleSystem {

  angle = 0;
  particlesActive = [];
  particlesPerTick = 2;
  particlesStorage = new Array(tickrate*this.particlesPerTick*particleLifetime).fill().map(e => new Particle()); // Init all necessary particles

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  update() {
    // Adjust to mouse pos
    this.angle = Math.atan2(this.x - mousePos.x, this.y - mousePos.y);
    // Add particles
    for (let i = 0; i < this.particlesPerTick; i++) {
      let p = this.particlesStorage[0];
      p.resetData(this.x, this.y, this.angle);
      this.particlesActive.push(p);
      this.particlesStorage.splice(0, 1);
    }
    // Update alive particles
    for (let i = 0; i < this.particlesActive.length; i++) {
      this.particlesActive[i].update();
    }
    // Remove dead particles
    for (let i = this.particlesActive.length - 1; i >= 0; i--) {
      if (!this.particlesActive[i].isDead) continue;
      this.particlesStorage.push(this.particlesActive[i]);
      this.particlesActive.splice(i, 1);
    }
  }

  draw() {
    for (let i = this.particlesActive.length - 1; i >= 0; i--) {
      this.particlesActive[i].draw();
    }
  }

}

class Particle {

  lifetime = tickrate*particleLifetime;
  // Movement
  movementSpeed = 2.5;
  minSpeed = 0;
  speedDeaccel = 0.99;
  // Size
  startSize = 40;
  finalSize = 80;
  maxSizeTime = 0.8;
  // Fade
  spawnFadeIn = 0.1;
  startFadeOut = 0.6;
  // Rotation
  rotation = Math.PI*Math.random();
  rotationSpeed = 0.0001;
  rotationDeaccel = 0.995;
  // Misc
  isDead = false;

  constructor() {
    this.initLifetime = this.lifetime;
    this.initMovementSpeed = this.movementSpeed;
    this.initRotationSpeed = this.rotationSpeed;
  }

  resetData(x, y, angle) {
    this.x = x;
    this.y = y;
    this.isDead = false;
    this.lifetime = this.initLifetime;
    this.movementSpeed = this.initMovementSpeed;
    this.rotationSpeed = this.initRotationSpeed;
    // Randomize
    let aSpread = Math.PI/8;
    this.angle = angle + getRandomInt(-aSpread, aSpread);
    let mSpread = this.movementSpeed*0.05;
    this.movementSpeed = this.movementSpeed + getRandomInt(-mSpread, mSpread);
    if (Math.random() > 0.5) this.rotationSpeed = -this.rotationSpeed;
  }

  update() {
    // Position
    this.x += Math.sin(this.angle - Math.PI) * this.movementSpeed;
    this.y += Math.cos(this.angle - Math.PI) * this.movementSpeed;
    // Rotation
    this.rotation += this.rotationSpeed;
    this.rotationSpeed *= this.rotationDeaccel;
    // Decrease movementSpeed
    this.movementSpeed *= this.speedDeaccel;
    if (this.movementSpeed < this.minSpeed) this.movementSpeed = this.minSpeed;
    // Heat effect
    let heatPower = this.getLifetimeProgress()*(this.initMovementSpeed/2);
    this.y -= heatPower;
    // Lifetime
    this.lifetime -= 1;
    if (this.lifetime == 0) this.isDead = true;
  }

  draw() {
    let progress = this.getLifetimeProgress();
    // Set alpha
    let alpha = 1;
    if (progress < this.spawnFadeIn) alpha = (progress/this.spawnFadeIn);
    else if (progress > this.startFadeOut) alpha -= 1*((progress-this.startFadeOut)/(1-this.startFadeOut));
    alpha *= 0.4; // Base alpha
    // Set size
    let size = progress / (this.maxSizeTime);
    if (size > 1) size = 1;
    size = this.startSize + (this.finalSize-this.startSize)*size;
    // Draw
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation * (180/Math.PI));
    ctx.globalAlpha = alpha;
    ctx.drawImage(smokeImage, -size/2, -size/2, size, size);
    ctx.restore();
  }

  getLifetimeProgress() {
    return (1 - (this.lifetime/this.initLifetime));
  }

}

let ps = new ParticleSystem(canvasSize / 2, canvasSize / 2);
let smokeImage = document.getElementById("smoke");
let myCanvas, ctx;
let mousePos = {x: canvasSize, y: canvasSize*0.25 };
// Start
setup();
// Update loop
setInterval(() => { ps.update(); }, 1000/tickrate);
// Track mouse
document.onmousemove = function(e) { mousePos = {x: e.clientX, y: e.clientY}; }

function getRandomInt(min, max) {
  return (Math.random() * (max - min) + min);
}

function setup() {
  myCanvas = document.getElementById("myCanvas");
  myCanvas.width = canvasSize;
  myCanvas.height = canvasSize;
  myCanvas.style = `width: ${canvasSize}px; height: ${canvasSize}px;`;
  ctx = myCanvas.getContext('2d');
  draw();
}

function draw() {
  ctx.fillStyle = "#DDD";
  ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);
  ps.draw();
  window.requestAnimationFrame(draw);
}
