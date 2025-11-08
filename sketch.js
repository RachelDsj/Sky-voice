let cols, rows;
let size = 50;
let arrows = [];
let r = size / 2;
let xoff = 0, yoff = 0, zoff = 0, increment = 0.1;
let particles = [];
let num = 300;

let mic;
let micLevel = 0;
let flock;
let cloudLayer;

let state = "start"; 
let nextState = null;
let fading = false;
let fadeAlpha = 0;
let fadeSpeed = 8;
let fadeColor;

let startButton, endButton;
let endTimer = 0;
let endDuration = 5000;

function setup() {
  createCanvas(900, 1200);
  angleMode(DEGREES);

  cloudLayer = createGraphics(width, height);
  cloudLayer.clear();

  mic = new p5.AudioIn();
  mic.start();

  createScene();

  startButton = createButton("Start");
  startButton.addClass("ui-button start-btn");
  startButton.position(width / 2 - 60, height / 2 +160);
  startButton.mousePressed(() => switchState("live"));

  endButton = createButton("End");
  endButton.addClass("ui-button end-btn");
  endButton.position(width / 2 - 50, height / 2 + 340);
  endButton.mousePressed(() => switchState("end"));
  endButton.hide();

  titleElement = createDiv("Voice & Sky");
  titleElement.addClass("ui-title");

  subtitleElement = createDiv("Speak to paint the clouds in your own sky");
  subtitleElement.addClass("ui-subtitle");
}

function draw() {
  if (state === "start") {
    micLevel = map(sin(frameCount * 0.02), -1, 1, 0.005, 0.02);
    drawScene();
    drawStartUI();
  titleElement.show();
  subtitleElement.show();
  } 
  else if (state === "live") {
    micLevel = mic.getLevel();
    drawScene();
    endButton.show();
    startButton.hide();
    titleElement.hide();
    subtitleElement.hide();
  } 
  else if (state === "end") {
    drawEndPose();
    titleElement.show();
    subtitleElement.hide();
  }

  handleFade();
}

// 核心绘制函数
function drawScene() {
  background(135, 206, 235);

  cloudLayer.fill(135, 206, 235, 10);
  cloudLayer.noStroke();
  cloudLayer.rect(0, 0, width, height);

  xoff = 0;
  for (let i = 0; i < cols; i++) {
    arrows[i] = [];
    yoff = 0;
    for (let j = 0; j < rows; j++) {
      let angle = map(noise(xoff, yoff, zoff), 0, 1, 0, 360);
      arrows[i][j] = createVector(cos(angle), sin(angle));
      yoff += increment;
    }
    xoff += increment;
  }
  zoff += 0.001;

  for (let p of particles) {
    p.checkEdges();
    p.direction(arrows);
    p.attractToCenters();
    p.update();
    p.displayOnLayer(cloudLayer, micLevel);
  }
  image(cloudLayer, 0, 0);

  flock.run();
}


// Start界面
function drawStartUI() {
  startButton.show();
  endButton.hide();
}


// End界面
function drawEndPose() {
  endButton.hide();


  image(cloudLayer, 0, 0);
  for (let b of flock.boids) {
    b.render();
  }

  textAlign(CENTER);
  textFont("Playfair Display");
  fill(255);
  textSize(18);
  text("The sky remembers your voice.", width / 2, height - 120);

  if (millis() - endTimer > endDuration) {
    switchState("start");
  }
}

// 状态切换与渐变
function switchState(target) {
  if (!fading) {
    if (state === "live" && target === "end") fadeColor = color(200, 230, 255);
    else fadeColor = color(135, 206, 235);
    
    if (target === "end") {
      titleElement.html(" ");
    } 
    else if (target === "start") {
      titleElement.html("Voice & Sky");
    }
    
    nextState = target;
    fading = true;
  }
}

function handleFade() {
  if (fading) {
    fill(fadeColor.levels[0], fadeColor.levels[1], fadeColor.levels[2], fadeAlpha);
    noStroke();
    rect(0, 0, width, height);

    fadeAlpha += fadeSpeed;

    if (fadeAlpha >= 255) {
      fadeAlpha = 255;
      if (nextState) {
        state = nextState;
        nextState = null;
        if (state === "live") createScene();
        if (state === "start") createScene();
        if (state === "end") endTimer = millis();
        fadeSpeed = -Math.abs(fadeSpeed);
      }
    }

    if (fadeAlpha <= 0 && fadeSpeed < 0) {
      fadeAlpha = 0;
      fadeSpeed = Math.abs(fadeSpeed);
      fading = false;
    }
  }
}

// 场景重建函数
function createScene() {
  cloudLayer = createGraphics(width, height);
  cloudLayer.clear();

  cols = width / size;
  rows = height / size;

  // 粒子
  particles = [];
  for (let i = 0; i < num; i++) {
    let clusterIndex = int(random(3));
    let centers = [
      createVector(width * 0.3, height * 0.85),
      createVector(width * 0.8, height * 0.55),
      createVector(width * 0.45, height * 0.15)
    ];
    let c = centers[clusterIndex];
    let x = c.x + random(-100, 100);
    let y = c.y + random(-70, 70);
    particles.push(new Particle(x, y));
  }

  // 鸟群
  flock = new Flock();
  for (let i = 0; i < 40; i++) {
    flock.addBoid(new Boid(random(width), random(height / 2)));
  }

  background(135, 206, 235);
}

function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY));
}
