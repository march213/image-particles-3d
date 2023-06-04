uniform float uPointSize;
uniform float scale;

void main() {
	#include <begin_vertex>
	#include <project_vertex>

	gl_PointSize = uPointSize;
}