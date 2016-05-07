var shape = icosahedron;
var paused = false;
var state = {
  paused = false,
  n = 0,
  locations = initLocations(shape),
  shape = shape
}
animate(state, initReneringFunction());

function webglAvailable() {
    try {
      var canvas = document.createElement( 'canvas' );
      return !!( window.WebGLRenderingContext && (
        canvas.getContext( 'webgl' ) ||
        canvas.getContext( 'experimental-webgl' ) )
      );
    } catch ( e ) {
      return false;
    }
}

function getRenderer() {
  if ( webglAvailable() ) {
    return new THREE.WebGLRenderer();
  } else {
    return new THREE.CanvasRenderer();
  }
}

function generation(state) {
  var lc = state.locations.map(x=>x.clone());
  var F = Math.floor;
  var center = new THREE.Vector3(0, 0, 0);
  for (var i = 0; i < locations.length; ++ i) {
    center.add(locations[i]);
  }             
  center.multiplyScalar(1/locations.length);
  var forces = []        
  for (var i = 0; i < locations.length; ++ i) {
    forces[i] = new THREE.Vector3(0, 0, 0);
    var g = graph[i];
    var v = locations[i];
    for (var k = 0; k < g.length; ++k) {
      var u = locations[g[k]].clone();
      u.sub(v);
      var l = u.length();
      u.normalize();
      u.multiplyScalar(0.1);
      forces[i].add(u);
    }
    for (var k = 0; k < locations.length; ++ k) {
      var u = locations[k].clone();
      u.sub(v);
      var l = u.length();
      u.normalize();
      u.multiplyScalar(-0.1);
      forces[i].add(u);
    }
  }        
  for (var i = 0; i < locations.length; ++ i) {
    var perturbation = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5);
    var decayingFactor = 0.01;
    perturbation.multiplyScalar(decayingFactor)
    locations[i].add(forces[i].clone().multiplyScalar(1));
    locations[i].add(perturbation)
  }
  for (var i = 0; i < locations.length; ++ i) {          
    locations[i].sub(center);
  }
  var sumLength = 0;
  for (var i = 0; i < locations.length; ++ i) {
    sumLength += locations[i].length();
  }        
  var avgLength = sumLength / locations.length;
  for (var i = 0; i < locations.length; ++ i) {          
    locations[i].multiplyScalar(1 / avgLength);
  }
  return {n: state.n + 1, locations: locations, shape: state.shape, 
}

function initLocations(shape) {
  var locations = [];
  for (var i in shape.graph) {
    locations[i] = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5).multiplyScalar(5)
    locations[i].normalize();
  }
  return locations;
}

function buildGeometry(shape, locations) {
  var geometry = new THREE.Geometry();
  var add = function(j) {
    geometry.vertices.push(locations[j].clone().multiplyScalar(15));           
  }
  for (var i =0 ; i< shape.order.length; ++i) {
      add(shape.order[i]);
  }
  return geometrstate
}

function initReneringFunction() {
  var container = document.getElementById( 'container' );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.set( 0, - 6, 100 );

  renderer = new THREE.CanvasRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
  window.document.body.addEventListener('click', function() { paused = !paused;})
  return function(scene) {
    renderer.render(scene, camera);
  }
}

function animate(locations, reneringFunction, shape) {
  
  render(locations, reneringFunction, shape);
  state = generation(state);
  if (!paused) {
    setTimeout(function() {
      requestAnimationFrame(function() {
        animate(state.locations, reneringFunction, shape)
      });
    }, 10);
  }

}

function render(locations, reneringFunction, shape) {

  var time = Date.now() * 0.0005;

  var scene = new THREE.Scene();  
  var geometry = buildGeometry(shape, locations);
  line = new THREE.Line(
    geometry, new THREE.LineBasicMaterial( { color: 0x00ff00, opacity: 0.5 }))
  //mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial( { overdraw: 0.5 } ) );
  //scene.add( mesh );
  line.rotation.x = time;
  line.rotation.y = time;
  scene.add( line );
  reneringFunction(scene);  
}
