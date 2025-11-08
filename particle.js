class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);

  const centers = [
      createVector(width * 0.3, height * 0.7),
      createVector(width * 0.8, height * 0.55),
      createVector(width * 0.5, height * 0.2)
    ];

    let closest = centers[0];
    let minDist = p5.Vector.dist(this.position, centers[0]);

    for (let i = 1; i < centers.length; i++) {
      let d = p5.Vector.dist(this.position, centers[i]);
      if (d < minDist) {
        minDist = d;
        closest = centers[i];
      }
    }

    this.target = closest;
  }
  

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(0.5)
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  direction(flowfield) {
    let i = floor(this.position.x / size);
    let j = floor(this.position.y / size);
    i = constrain(i, 0, cols - 1);
    j = constrain(j, 0, rows - 1);
    let force = createVector(flowfield[i][j].x, flowfield[i][j].y);
    this.applyForce(force);
  }

  attractToCenters() {
    let dir = p5.Vector.sub(this.target, this.position);
    let distance = dir.mag();
    distance = constrain(distance, 10, 300);
    let strength = map(distance, 10, 300, 0.2, 0.01);

    dir.normalize();
    dir.mult(strength);
    this.applyForce(dir);

    let tangent = createVector(-dir.y, dir.x); 
    tangent.mult(0.02);
    this.applyForce(tangent);
  }

displayOnLayer(pg, micLevel) {
  pg.noStroke();
  let sz = map(micLevel, 0, 0.05, 10, 20, true);
  pg.fill(255, 255, 255, 40);
  pg.ellipse(this.position.x, this.position.y, sz, sz);
}
  

  checkEdges() {
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }
}