export class MarkerPill {
  private canvas: HTMLCanvasElement;
  public width: number = 200;
  public height: number = 24;
  public data: Uint8Array;
  private context: CanvasRenderingContext2D | null = null;
  private map: maplibregl.Map;
  private currentText: string = '$19';

  // Shadow and padding constants
  private readonly SHADOW_BLUR = 6;
  private readonly SHADOW_OFFSET = 3;
  private readonly PADDING = 16;
  private readonly LINE_HEIGHT = 16;

  constructor(map: maplibregl.Map) {
    this.map = map;
    this.canvas = document.createElement('canvas');
    // Get device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;
    // Scale canvas dimensions
    this.canvas.width = this.width * pixelRatio;
    this.canvas.height = this.height * pixelRatio;
    // Scale canvas style dimensions
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.data = new Uint8Array(this.width * this.height * 4);
  }

  private drawPill() {
    if (!this.context) return;

    // Clear with extra space for shadow
    this.context.clearRect(
      -this.SHADOW_BLUR,
      -this.SHADOW_BLUR,
      this.width + this.SHADOW_BLUR * 2,
      this.height + this.SHADOW_BLUR * 2 + this.SHADOW_OFFSET
    );

    // Shadow settings
    this.context.shadowColor = 'rgba(0, 0, 0, 0.35)';
    this.context.shadowBlur = this.SHADOW_BLUR;
    this.context.shadowOffsetY = this.SHADOW_OFFSET;

    // Draw pill shape
    const radius = this.height / 2;
    this.context.beginPath();
    this.context.moveTo(radius, 0);
    this.context.lineTo(this.width - radius, 0);
    this.context.arcTo(this.width, 0, this.width, radius, radius);
    this.context.arcTo(
      this.width,
      this.height,
      this.width - radius,
      this.height,
      radius
    );
    this.context.lineTo(radius, this.height);
    this.context.arcTo(0, this.height, 0, radius, radius);
    this.context.arcTo(0, 0, radius, 0, radius);
    this.context.closePath();

    // Fill and stroke
    this.context.fillStyle = '#417d77';
    this.context.fill();

    this.context.shadowColor = 'transparent';
    this.context.strokeStyle = '#313E40';
    this.context.lineWidth = 1;
    this.context.stroke();
  }

  render(text: string = '$19') {
    if (!this.context) return false;
    this.currentText = text;
    const pixelRatio = window.devicePixelRatio || 1;

    // Calculate dimensions
    this.context.font = 'bold 14px Supreme-Regular';
    const words = text.split(' ');
    const lines = this.calculateLines(words);

    // Update canvas size with shadow padding
    this.height = 24 + (lines.length - 1) * this.LINE_HEIGHT;
    const textWidth = Math.max(
      ...lines.map(line => this.context!.measureText(line).width)
    );
    this.width = Math.max(100, textWidth + this.PADDING * 2);

    // Resize canvas with pixel ratio
    this.canvas.width = (this.width + this.SHADOW_BLUR * 2) * pixelRatio;
    this.canvas.height =
      (this.height + this.SHADOW_BLUR * 2 + this.SHADOW_OFFSET) * pixelRatio;
    this.canvas.style.width = `${this.width + this.SHADOW_BLUR * 2}px`;
    this.canvas.style.height = `${this.height + this.SHADOW_BLUR * 2 + this.SHADOW_OFFSET}px`;

    // Scale context for high DPI displays
    this.context.scale(pixelRatio, pixelRatio);

    // Move context to account for shadow space
    this.context.translate(this.SHADOW_BLUR, this.SHADOW_BLUR);

    // Draw background
    this.drawPill();

    // Draw text
    this.context.fillStyle = '#ffffff';
    this.context.font = 'bold 14.5px Supreme-Regular';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';

    const startY =
      (this.height - lines.length * this.LINE_HEIGHT) / 2 +
      this.LINE_HEIGHT / 2;
    lines.forEach((line, i) => {
      this.context!.fillText(
        line,
        this.width / 2,
        startY + i * this.LINE_HEIGHT
      );
    });

    // Reset transform
    this.context.setTransform(1, 0, 0, 1, 0, 0);

    this.data = new Uint8Array(
      this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      ).data
    );

    this.map.triggerRepaint();
    return true;
  }

  private calculateLines(words: string[]): string[] {
    if (!this.context) return [];
    const maxWidth = this.width - this.PADDING * 2;
    let line = '';
    const lines = [];

    for (let word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = this.context.measureText(testLine);

      if (metrics.width > maxWidth && line !== '') {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    return lines;
  }

  onAdd(): HTMLCanvasElement {
    this.context = this.canvas.getContext('2d', { alpha: true });
    // Scale initial context
    const pixelRatio = window.devicePixelRatio || 1;
    if (this.context) {
      this.context.scale(pixelRatio, pixelRatio);
    }
    return this.canvas;
  }
}
