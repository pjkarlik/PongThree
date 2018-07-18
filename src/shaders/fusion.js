/* eslint-disable */
THREE.RenderFragment = {
  uniforms: {

    "tDiffuse": { value: null },
    "tSize":    { value: new THREE.Vector2( 512, 512 ) },
    "center":   { value: new THREE.Vector2( 0.5, 0.5 ) },
    "ratio":    { value: 1024.0 },
    "scale":    { value: 4.0 },
    "time":     { value: 0.0 },
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
      "vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * 20.0;",
      "return ( cos( point.x ) ) * 0.25;",
    "}",

    "void main() {",
      "vec2 q = vUv;",
      "float Pixels = ratio;",
      "float dx = scale * (1.0 / Pixels);",
      "float dy = scale * (1.0 / Pixels);",
      "vec2 Coord = vec2(dx * floor(q.x / dx), dy * floor(q.y / dy));",
      "vec4 color = texture2D( tDiffuse, Coord);",
      "vec4 overlay = texture2D( tDiffuse, q);",
      "gl_FragColor = vec4(",
        "color.r * (1.+q.y) + pattern(), color.g * (1.+q.x) + pattern(), color.b * (1.+q.y) + pattern(),",
        // "overlay.r, overlay.g + pattern(), overlay.b,",
        "overlay.a",
      ");",

    "}"

  ].join( "\n" )

};
