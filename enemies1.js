class EnemyGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.createMultiple({
      key: 'enemy', // Replace 'enemy' with your actual enemy sprite key
      frameQuantity: 200, // Adjust the number of enemies you want to create
      active: false,
      visible: false
    });
  }
}
function move(enemy, scene) {
  // Set enemy position to a random spot at the top of the screen
  enemy.setX(Math.floor(Math.random() * scene.game.config.width));
  enemy.setY(0);

  // Make the enemy active and visible
  enemy.setActive(true);
  enemy.setVisible(true);

  // Move the enemy down in a random direction
  const randomDirection = Math.random() < 0.5 ? -1 : 1;
  enemy.setVelocityX(Math.random() * 200 * randomDirection);
  enemy.setVelocityY(Math.random() * 200);
}
function enemyCheckOutOfBounds(enemyGrounp, scene) {

  enemyGroup.getChildren().forEach(enemy => {
    if (enemy.y > scene.game.config.height || enemy.x < 0 || enemy.x > scene.game.config.width) {
      move(enemy, scene);
    }
  });
}
