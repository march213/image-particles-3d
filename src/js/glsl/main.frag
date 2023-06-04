uniform sampler2D uTexture;
uniform float uColumns;
uniform float uRows;

varying vec2 vTextureCoord;

float circle(vec2 uv, float border) {
  float radius = 0.5;
  float dist = radius - distance(uv, vec2(0.5));
  return smoothstep(0.0, border, dist);
}

void main() {
  vec2 uv = gl_PointCoord;

  uv.y *= -1.0;

  uv /= vec2(uColumns, uRows);

  float textureOffsetU = vTextureCoord.x / uColumns;
  float textureOffsetV = vTextureCoord.y / uRows;

  uv += vec2(textureOffsetU, textureOffsetV);
  uv += vec2(0.5);

  vec4 texture = texture2D(uTexture, uv);
  gl_FragColor = texture;
  gl_FragColor.a *= circle(gl_PointCoord, 0.2);
}