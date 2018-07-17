/* eslint-disable */
THREE.RenderFragment = {
  uniforms: {

    "tDiffuse": { value: null },
    "tSize":    { value: new THREE.Vector2( 256, 256 ) },
    "center":   { value: new THREE.Vector2( 0.5, 0.5 ) },
    "ratio":    { value: 512.0 },
    "scale":    { value: 2.0 },
    "frenz":    { value: 1024.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    "uniform vec2 center;",
    "uniform float scale;",
    "uniform float ratio;",
    "uniform vec2 tSize;",
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",
    "varying float frenz;",

    "float pattern() {",
      "vec2 q = vUv;",
      "float s = sin( 1.57 ), c = cos( 1.57 );",
      "vec2 tex = vUv * tSize - center;",
      "vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * 8.0;",
      "return ( cos( point.x ) ) * 0.25;",
    "}",

    "void main() {",
      "vec2 q = vUv;",
      "float Pixels = ratio;",
      "float dx = scale * (1.0 / Pixels);",
      "float dy = scale * (1.0 / Pixels);",
      "float Dist = sqrt(((q.x - 0.5) * (q.x - 01.5) + (q.y - 0.5) * (q.y - 0.5)));",
      "vec2 Coord = vec2(dx * floor(q.x / dx), dy * floor(q.y / dy));",
      "vec4 color = texture2D( tDiffuse, Coord);",
      "vec2 Coord2 = vec2(sin(q.x * 0.98), q.y);",
      "vec4 color2 = texture2D( tDiffuse, Coord2 / Dist);",
      "vec4 overlay = texture2D( tDiffuse, q);",
      "float v1 = 0.15; float v2 = 0.15; float v3 =0.65;",
      "gl_FragColor = vec4(",
      // "(color.r * v1) + (color2.r * v2) + (overlay.r * v3),",
      // "(color.g * v1) + (color2.g * v2) + (overlay.g * v3),",
      // "(color.b * v1) + (color2.b * v2) + (overlay.b * v3),",
      // "(color.r * 0.35) + (overlay.r * ( q.x * 15.0 * sin(q.x * 0.75) ) ),",
      // "(color.g * 0.35) + (overlay.g * ( q.x * 15.0 * sin(q.x * 0.5) ) ),",
      // "(color.b * 0.35) + (overlay.b * ( q.x * 15.0 * sin(q.x * 0.25) ) ),",
        // "(overlay.r),",
        // "(overlay.g),",
        // "(overlay.b),",
        // "color.r, color.g + pattern(), color.b,",
        "overlay.r, overlay.g + pattern(), overlay.b,",
        "overlay.a",
      ");",

    "}"

  ].join( "\n" )

};
