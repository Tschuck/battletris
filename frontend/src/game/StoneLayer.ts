import Konva from 'konva';

export default class StoneLayer extends Konva.Layer {
  rotationTween!: Konva.Tween|null;

  positionTween!: Konva.Tween|null;

  transitionRotate(rotation: number, duration: number) {
    this.handleTween('rotationTween', {
      node: this.children[0],
      duration,
      rotation,
    });
  }

  transitionMove(x: number, y: number, duration: number) {
    this.handleTween('positionTween', {
      node: this, duration, x, y,
    });
  }

  handleTween(key: 'rotationTween'|'positionTween', props: Konva.TweenConfig) {
    // use custom tween and not layer .to! .to will destroy the last tween, what will cause
    // stuttering
    this[key] = new Konva.Tween({
      easing: Konva.Easings.Linear,
      onFinish: () => {
        this.draw();
        this[key] = null;
      },
      ...props,
    });
    this[key]?.play();
  }

  remove() {
    super.remove();
    this.rotationTween?.destroy();
    this.positionTween?.destroy();
    return this;
  }
}
