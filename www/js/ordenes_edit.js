var viene_de_cambio_de_precio;
var detalle;
var b_merc;
var productos = {};
var args = go_data();
var ver_resumen_activo = false;
var cliente = args.data;

var guardar = function () {
  var orden = new Orden();
  orden.insert()
    .then(function () {
      orden.cliente.value = args.data.codigo;
      orden.comentario.value = $("[name=comentario]").val();
      orden.vendedor.value = User.id;
      orden.fecha.value = new Date().toJSON();

      var buffer = [];
      for (var i in productos) {
        if (productos[i].cantidad) {
          buffer.push({
            orden: orden.id.value,
            merc: i,
            cantidad: parseInt(productos[i].cantidad),
            precio: parseFloat(productos[i].precio),
          });
        }
      }
      return orden.detalle.insert(buffer);
    })
    .then(function () {
      return orden.update();
    })
    .then(function () {
      return db.request(`
            update sales_cuadre set visita='Efectiva',venta='SI'
            where cliente='${orden.cliente.value}'
        `);
    })
    .then(function () {
      $("#info_order").hide(500);
      $("#procesa_orden").hide();
      $("#info_order_processing").show(500);

      setTimeout(function () {
        go("rep_orden.html", { orden: orden.id.value });
      }, 3000);
    });
};

var ver_resumen = function () {
  ver_resumen_activo = true;
  $("[name=search]").val("");

  detalle.request_data({ limit: 99999, offset: 0, search: "" })
    .then(function (r) {
      detalle.trigger("request", r);
      var result = [];
      r.forEach(function (x) {
        if (parseFloat(x.cantidad) > 0) result.push(x);
      });

      detalle.empty();
      detalle.append(result);
      $("#ver_resumen").hide();
      $("#ver_todos").show(500);
      $("[name=search]").prop("disabled", true);
      $(".btnNavigation").prop("disabled", true);
      $("[name=comentario]").focus();
    });
};

var ver_todas_merc = function () {
  ver_resumen_activo = false;
  detalle.request();
  $("#ver_resumen").show(500);
  $("#ver_todos").hide();
  $("[name=search]").prop("disabled", false);
  $("[name=search]").focus();
  $(".btnNavigation").prop("disabled", false);
};

function procesando_orden() {
  setTimeout(function () {
    ver_resumen();
  }, 500);
  $("#confirmSendOrdenModal").modal({ backdrop: "static", keyboard: false });
}

start(function () {
  $("#nombre").html(args.data.nombre);

  b_merc = function (x) {
    console.log(cliente);
    x.search = x.search.replace(/ /g, "%");
    return db.request(`
        select * from (
            select merc.codigo, merc.nombre
                ,precio  as precio1 
                ,precio as precio2 
                ,precio as precio3 
                ,0 as cantidad,0 as valor,0 as itbis,
                0 as total,excento,existe,referencia,
                1 as tipo_precio
                ,merc.itasa 
            from merc 
            inner join sales_cliente as clientes on clientes.codigo='${cliente.codigo}'
            inner join precios on precios.merc=merc.codigo and precios.control=clientes.listap
            
           where 
            merc.inactivo=0 and 
            (
                merc.nombre like '%${x.search}%'
                or merc.referencia like '%${x.search}%'
                or merc.codigo like '%${x.search}%'
            )
            ) as gg 
            order by ${x.order} ${x.torder}
            
            limit ${x.limit}
            offset ${x.offset}

        `);
  };

  // $(document).on("click", ".precio", function () {
  //   //  obteniendo la mercancia
  //   if (isMobile.any) {
  //     var rid = $(this).parent().parent().parent().parent().parent().attr(
  //       "rid",
  //     );
  //   } else {
  //     var rid = $(this).parent().parent().attr("rid");
  //   }
  //   var merc = detalle[rid];
  //   merc.tipo_precio++;
  //   if (merc.tipo_precio == 4) merc.tipo_precio = 1;

  //   $(".cantidad", $(this).parent().parent().parent().parent().parent())
  //     .trigger("change");

  //   $(".tipo_precio", $(this).parent().parent().parent().parent().parent())
  //     .html(merc.tipo_precio);
  //   merc.precio = merc["precio" + merc.tipo_precio];
  //   $(".precio_mostrar", $(this).parent().parent().parent().parent().parent())
  //     .html(util.nformat(merc.precio * 1.18));
  //   return false;
  // });

  $(document).on("keyup", ".cantidad", function () {
    $(this).trigger("change");
  });
  $(document).on("change", ".cantidad", function () {
    //  obteniendo la mercancia
    if (isMobile.any) {
      var rid = $(this).parent().parent().parent().parent().attr("rid");
    } else {
      var rid = $(this).parent().parent().attr("rid");
    }

    var merc = detalle[rid];

    merc.precio = merc["precio" + merc.tipo_precio];

    //  almacenando en un objeto
    var x = productos[merc.codigo] = productos[merc.codigo] ||
    {
      precio: parseFloat(merc.precio),
      tipo_precio: parseInt(merc.tipo_precio),
      itasa: parseInt(merc.itasa),
    };
    productos[merc.codigo].tipo_precio = merc.tipo_precio;
    productos[merc.codigo].precio = merc.precio;
    x.cantidad = this.value;
    if (x.cantidad == "") x.cantidad = "0";
    x.cantidad = parseFloat(x.cantidad);
    x.valor = x.cantidad * parseFloat(merc.precio) / (1 + (x.itasa / 100));
    if (!merc.excento) x.itbis = x.valor * x.itasa / 100;
    else x.itbis = 0;
    x.total = x.valor + x.itbis;

    //  simplificando
    var valor = 0;
    var itbis = 0;
    var total = 0;

    for (var i in productos) {
      valor += productos[i].valor;
      itbis += productos[i].itbis;
      total += productos[i].total;
    }

    $(this).parent().parent().children(".valor").html(util.nformat(x.total, 2));
    $("#valor").html(util.nformat(valor, 2));
    $("#itbis").html(util.nformat(itbis, 2));
    $("#total").html(util.nformat(total, 2));

    if (!ver_resumen_activo) {
      if (total > 0) {
        $("#ver_resumen").show();
        $("#procesaOrdenBtn").prop("disabled", false);
      } else {
        $("#ver_resumen").hide();
        $("#procesaOrdenBtn").prop("disabled", true);
      }
    }
  });
  if (isMobile.any) {
    detalle = $("#detalle_movil").search(
      "b_merc",
      { limit: 10, order: "nombre" },
    );
  } else {
    detalle = $("#detalle").search("b_merc");
  }

  detalle.on("request", function (r) {
    var merc;
    for (var i = 0; i < r.length; i++) {
      merc = r[i];

      if (productos[merc.codigo]) {
        merc.cantidad = productos[merc.codigo].cantidad || 0;
        merc.valor = productos[merc.codigo].valor || 0;
        merc.tipo_precio = productos[merc.codigo].tipo_precio || 1;
      }

      merc.precio = merc["precio" + merc.tipo_precio];

      merc.iprecio = merc.precio;
    }
  });

  $(document).ready(function () {
    (function (global) {
      if (typeof (global) === "undefined") {
        throw new Error("window is undefined");
      }

      var _hash = "!";
      var noBackPlease = function () {
        global.location.href += "#";

        // making sure we have the fruit available for juice (^__^)
        global.setTimeout(function () {
          global.location.href += "!";
        }, 50);
      };

      global.onhashchange = function () {
        if (global.location.hash !== _hash) {
          global.location.hash = _hash;
        }
      };

      global.onload = function () {
        noBackPlease();

        // disables backspace on page except on input fields and textarea..
        document.body.onkeydown = function (e) {
          var elm = e.target.nodeName.toLowerCase();
          if (e.which === 8 && (elm !== "input" && elm !== "textarea")) {
            e.preventDefault();
          }
          // stopping event bubbling up the DOM tree..
          e.stopPropagation();
        };
      };
    })(window);

    $("[name=search]").focus();
  });
});
