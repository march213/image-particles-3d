uniform float uPointSize;
uniform float uProgress;
uniform float uFrequency;
uniform float uTime;
uniform float scale;

varying vec2 vTextureCoord;

attribute vec3 initialPosition;

const float amplitude = 5.0;

void main() {
	#include <begin_vertex>

  transformed = initialPosition + ((position - initialPosition) * uProgress);
  transformed.z += sin(transformed.x * uFrequency + uTime) * amplitude;
  transformed.z += sin(transformed.y * uFrequency + uTime) * amplitude;

	#include <project_vertex>

	gl_PointSize = uPointSize;

  vTextureCoord = position.xy;
}