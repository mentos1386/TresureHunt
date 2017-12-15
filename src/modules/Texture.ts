import Canvas from './Canvas';

export default class Texture {
  private texture: WebGLTexture;
  private image: HTMLImageElement;
  private coordinatesBuffer: WebGLBuffer;
  private itemSize: 2;

  constructor(
    private canvas: Canvas,
    private src: string,
    private coordinates: Float32Array,
  ) {
    this.texture = this.canvas.webgl.createTexture();
    this.image = new Image();
    this.initBuffer();
  }

  /**
   * Load image from src
   * @returns {Promise<void>}
   */
  public async load(): Promise<void> {
    // Wait for image to load
    await new Promise((resolve) => {
      this.image.onload = resolve;
      this.image.src = this.src;
    });

    this.canvas.webgl.pixelStorei(this.canvas.webgl.UNPACK_FLIP_Y_WEBGL, true);

    // Third texture usus Linear interpolation approximation with nearest Mipmap selection
    this.canvas.webgl.bindTexture(this.canvas.webgl.TEXTURE_2D, this.texture);

    this.canvas.webgl.texImage2D(
      this.canvas.webgl.TEXTURE_2D,
      0,
      this.canvas.webgl.RGBA,
      this.canvas.webgl.RGBA,
      this.canvas.webgl.UNSIGNED_BYTE,
      this.image);

    this.canvas.webgl.texParameteri(
      this.canvas.webgl.TEXTURE_2D,
      this.canvas.webgl.TEXTURE_MAG_FILTER,
      this.canvas.webgl.LINEAR);

    this.canvas.webgl.texParameteri(
      this.canvas.webgl.TEXTURE_2D,
      this.canvas.webgl.TEXTURE_MIN_FILTER,
      this.canvas.webgl.LINEAR);

    this.canvas.webgl.generateMipmap(this.canvas.webgl.TEXTURE_2D);

    this.canvas.webgl.bindTexture(this.canvas.webgl.TEXTURE_2D, null);
  }

  public draw() {
    // Activate texture
    this.canvas.webgl.activeTexture(this.canvas.webgl.TEXTURE0);
    // Bind texture
    this.canvas.webgl.bindTexture(this.canvas.webgl.TEXTURE_2D, this.texture);
    this.canvas.webgl.uniform1i(this.canvas.shaderProgram.samplerUniform, 0);

    this.canvas.webgl.bindBuffer(this.canvas.webgl.ARRAY_BUFFER, this.coordinatesBuffer);
    this.canvas.webgl.vertexAttribPointer(
      this.canvas.shaderProgram.textureCoordAttribute,
      3,
      this.canvas.webgl.FLOAT,
      false,
      0,
      0);
  }

  /**
   * Initiate buffer
   */
  private initBuffer() {
    this.coordinatesBuffer = this.canvas.webgl.createBuffer();
    this.canvas.webgl.bindBuffer(this.canvas.webgl.ARRAY_BUFFER, this.coordinatesBuffer);
    this.canvas.webgl.bufferData(
      this.canvas.webgl.ARRAY_BUFFER,
      this.coordinates,
      this.canvas.webgl.STATIC_DRAW);
  }
}