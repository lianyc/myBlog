(function () {
  //封装方法，压缩之后减少文件大小
  function get_attribute(node, attr, default_value) {
    return node.getAttribute(attr) || default_value;
  }

  //封装方法，压缩之后减少文件大小
  function get_by_tagname(name) {
    return document.getElementsByTagName(name);
  }

  //获取配置参数
  function get_config_option() {
    var scripts = get_by_tagname("script"),
      script_len = scripts.length,
      script = scripts[script_len - 1]; //当前加载的script
    return {
      l: script_len, //长度，用于生成id用
      z: get_attribute(script, "zIndex", -1), //z-index
      o: get_attribute(script, "opacity", 0.5), //opacity
      c: get_attribute(script, "color", "0,0,0,1") //color
    };
  }

  //创建canvas标签
  var canvas = document.createElement("canvas"), //画布
    config = get_config_option(), //配置
    canvas_id = "c_n" + config.l, //canvas id
    ctx = canvas.getContext("2d"), canvas_width, canvas_height,
    frame_func = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (func) {
        window.setTimeout(func, 1000 / 60);
      };
  canvas.id = canvas_id;
  canvas.style.cssText = "position:fixed;top:0;left:0;z-index:" + config.z + ";opacity:" + config.o + ";background-color:rgba(" + config.c + ")";

  //将canvas标签添加到html中
  get_by_tagname("body")[0].appendChild(canvas);

  //设置canvas的高宽
  function set_canvas_size() {
    canvas_width = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    canvas_height = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }

  //初始化画布大小
  set_canvas_size();
  window.onresize = set_canvas_size;

  var mousePosition = {
    x: 30 * canvas.width / 100,
    y: 30 * canvas.height / 100
  };

  ctx.lineWidth = 0.3;
  ctx.strokeStyle = (new Color(150)).style;

  var dots = {
    nb: 750,
    distance: 50,
    d_radius: 100,
    array: []
  };

  function colorValue(min) {
    return Math.floor(Math.random() * 255 + min);
  }

  function createColorStyle(r, g, b) {
    return 'rgba(' + r + ',' + g + ',' + b + ', 0.8)';
  }

  function mixComponents(comp1, weight1, comp2, weight2) {
    return (comp1 * weight1 + comp2 * weight2) / (weight1 + weight2);
  }

  function averageColorStyles(dot1, dot2) {
    var color1 = dot1.color,
      color2 = dot2.color;

    var r = mixComponents(color1.r, dot1.radius, color2.r, dot2.radius),
      g = mixComponents(color1.g, dot1.radius, color2.g, dot2.radius),
      b = mixComponents(color1.b, dot1.radius, color2.b, dot2.radius);
    return createColorStyle(Math.floor(r), Math.floor(g), Math.floor(b));
  }

  function Color(min) {
    min = min || 0;
    this.r = colorValue(min);
    this.g = colorValue(min);
    this.b = colorValue(min);
    this.style = createColorStyle(this.r, this.g, this.b);
  }

  function Dot() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;

    this.vx = -.5 + Math.random();
    this.vy = -.5 + Math.random();

    this.radius = Math.random() * 2;

    this.color = new Color();
    console.log(this);
  }

  Dot.prototype = {
    draw: function () {
      ctx.beginPath();
      ctx.fillStyle = this.color.style;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fill();
    }
  };

  function createDots() {
    for (var i = 0; i < dots.nb; i++) {
      dots.array.push(new Dot());
    }
  }

  function moveDots() {
    for (var i = 0; i < dots.nb; i++) {

      var dot = dots.array[i];

      if (dot.y < 0 || dot.y > canvas.height) {
        dot.vx = dot.vx;
        dot.vy = -dot.vy;
      }
      else if (dot.x < 0 || dot.x > canvas.width) {
        dot.vx = -dot.vx;
        dot.vy = dot.vy;
      }
      dot.x += dot.vx;
      dot.y += dot.vy;
    }
  }

  function connectDots() {
    for (var i = 0; i < dots.nb; i++) {
      for (var j = 0; j < dots.nb; j++) {
        var i_dot = dots.array[i];
        var j_dot = dots.array[j];

        if ((i_dot.x - j_dot.x) < dots.distance && (i_dot.y - j_dot.y) < dots.distance && (i_dot.x - j_dot.x) > -dots.distance && (i_dot.y - j_dot.y) > -dots.distance) {
          if ((i_dot.x - mousePosition.x) < dots.d_radius && (i_dot.y - mousePosition.y) < dots.d_radius && (i_dot.x - mousePosition.x) > -dots.d_radius && (i_dot.y - mousePosition.y) > -dots.d_radius) {
            ctx.beginPath();
            ctx.strokeStyle = averageColorStyles(i_dot, j_dot);
            ctx.moveTo(i_dot.x, i_dot.y);
            ctx.lineTo(j_dot.x, j_dot.y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
    }
  }

  function drawDots() {
    for (var i = 0; i < dots.nb; i++) {
      var dot = dots.array[i];
      dot.draw();
    }
  }

  function animateDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveDots();
    connectDots();
    drawDots();
    frame_func(animateDots);
  }

  //添加鼠标事件监听
  window.onmousemove = function (e) {
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
  };

  window.onmouseout = function () {
    mousePosition.x = canvas.width / 2;
    mousePosition.y = canvas.height / 2;
  };

  createDots();
  setTimeout(function () {
    frame_func(animateDots);
  }, 100);
})();
