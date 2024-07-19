// Initialize Phaser
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let player;
let playerSpeed = 200;
let laserGroup;
let enemyGroup;
let emitter;
let score = 0;
let scoreText;
let lives = 3;
let livesText;
let laserSound;
let enemyDestroyedSound;
let playerDestroyedSound;

function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('laser', 'assets/laser.png');
  this.load.image('enemy', 'assets/enemy.png');
  this.load.image('explosion', 'assets/explosion.png', 'assets/explosion.json');
  this.load.audio('playerLaser', 'assets/sounds/laser_player.ogg');
  this.load.audio('playerDestroyed', 'assets/sounds/player_destroyed.ogg');
  this.load.audio('enemyDestroyed', 'assets/sounds/enemy_destroyed.ogg');
}

function create() {
  player = this.physics.add.sprite(300, 700, 'player');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  laserGroup = new LaserGroup(this);
  enemyGroup = new EnemyGroup(this);
  enemyGroup.getChildren().forEach(enemy => {
    move(enemy, this);
  });

  emitter = this.add.particles(0, 0, 'explosion',
    {
      frame: ['red', 'yellow', 'green', 'blue', 'purple'],
      lifespan: 1000,
      speed: { min: 50, max: 100 },
      emitting: false
    });
  // Check for overlap between lasers and enemies
  this.physics.add.overlap(laserGroup, enemyGroup, (laser, enemy) => {
    laserCollision(laser, enemy, this);
  });
  this.physics.add.overlap(player, enemyGroup, (player, enemy) => playerEnemyCollision(player, enemy, this));

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

  livesText = this.add.text(16, 50, 'Lives: 3', { fontSize: '32px', fill: '#fff' });
  laserSound = this.sound.add('playerLaser');
  enemyDestroyedSound = this.sound.add('enemyDestroyed');
  playerDestroyedSound = this.sound.add('playerDestroyed');

}

function update() {
  const cursor = this.input.keyboard.createCursorKeys();
  if (cursor.right.isDown) {
    player.setVelocityX(playerSpeed);
  } else if (cursor.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else {
    player.setVelocityX(0);
  }

  if (cursor.space.isDown && Phaser.Input.Keyboard.JustDown(cursor.space)) {
    if (lives > 0) {
      laserSound.play();
      fireLaser(laserGroup, player);
    }
  }

  checkOutOfBounds(laserGroup, this);
  enemyCheckOutOfBounds(enemyGroup, this);

}
function laserCollision(enemy, laser, scene) {
  enemyDestroyedSound.play();
  emitter.explode(20, enemy.x, enemy.y);
  laser.setActive(false);
  laser.setVisible(false);
  laser.disableBody(true, true);

  move(enemy, scene);
  score += 10;
  scoreText.setText('Score: ' + score);
}
function playerEnemyCollision(player, enemy, scene) {
  // Move each enemy in the enemyGroup to a new position
  playerDestroyedSound.play();
  enemyGroup.getChildren().forEach(enemy => {
    move(enemy, scene);
  });
  emitter.explode(40, player.x, player.y);
  emitter.explode(40, player.x, player.y);
  emitter.explode(40, player.x, player.y);
  // Decrease player's lives and update the text

  lives -= 1;
  livesText.setText('Lives: ' + lives);

  // Check if player is out of lives
  if (lives <= 0) {
    const gameOverText = scene.add.text(300, 400, 'Game Over', { fontSize: '48px', fill: '#FF0000' });
    gameOverText.setOrigin(0.5);
    // Handle game over (e.g., restart game or show game over screen)
    // Show game over text
    gameOverText.setVisible(true);

    // Make the player inactive, invisible, and disable its body
    player.setActive(false);
    player.setVisible(false);
    player.disableBody(true, true);
  } else {
    player.setPosition(300, 700);
  }
}