var ready_para_imprimir = false;
document.addEventListener("deviceready", function () {
  ready_para_imprimir = true;
}, false);

//  CALCULANDO LA SEMANA GALVEZ
var SEMANA = localStorage.getItem("semana") || 1;
var dia = (new Date()).getDay();
dia = util.cday[dia];

var f = new Date();
var hours = f.getHours();
var minutes = f.getMinutes();
var x = f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear();
var fecha = x + " " + hours + ":" + minutes;

function verifica_cuadre() {
  return new Promise(function (ok, fail) {
    var hoy = util.now().substr(0, 10);
    db.request(`
            select max(fecha) cuadre,min(fecha) no_cuadre
            from sales_cuadre
        `)
      .then(function (r) {
        if (!r.length) {
          ok(false);
        } else {
          var cuadre = r[0];
          if (cuadre.cuadre == null && cuadre.no_cuadre == null) {
            db.request(`
                        update sales_cuadre set fecha='${hoy}',enviado=0
                    `).then(function () {
              ok(false);
            });
          } else if (cuadre.cuadre == null && cuadre.no_cuadre != null) {
            db.request(`
                        update sales_cuadre set fecha='${cuadre.cuadre}',enviado=0
                    `).then(function () {
              ok(false);
            });
          } else {
            db.request(`
                        select count(1) sin_cuadrar from sales_cuadre where coalesce(cast(ruta as int),0)=1 and coalesce(visita,'')=''
                    `).then(function (r) {
              if (r[0].sin_cuadrar) {
                ok(false);
              } else {
                ok(true);
              }
            });
          }
        }
      });
  });
}

function numero_orden() {
  var n = new Date();
  var dia = n.getDate();
  if (dia < 10) dia = "0" + dia;

  var mes = n.getMonth() + 1;
  if (mes < 10) mes = "0" + mes;

  var hora = n.getHours();
  if (hora < 10) hora = "0" + hora;

  var minute = n.getMinutes();
  if (minute < 10) minute = "0" + minute;

  var segundo = n.getSeconds();
  if (segundo < 10) segundo = "0" + segundo;

  var mili = n.getMilliseconds();
  if (mili < 100) mili = "00" + mili;
  else if (mili < 10) mili = "0" + mili;

  return mes + "" + dia + "" + n.getFullYear() + "" + hora + "" + minute + "" +
    segundo + "" + mili;
}

var on_load = function () {
  return new Promise(function (ok, fail) {
    //  publica la conexion con sql server
    const_public("server", new DbLink());
    //  publica la conexion con websql
    const_public("db", new WebSql("main"))
      .on("db-created", function () {
        $("#ModalLoader").modal({ backdrop: "static", keyboard: false });

        carga_inicial()
          .then(function () {
            localStorage.setItem("sync_update", fecha);
            setTimeout(() => {
              location.reload();
            }, 200);
          })
          .catch(function (err) {
            console.log(err);
          });

        localStorage.setItem("db_created", true);
      });
    actualiza_sistema();
    ok();
  });
};
var Semana = class extends Table {
  constructor(x) {
    super(x || db, "sales_semana");
    this.text("codigo");
    this.int("semana");
    this.text("sync");
  }
};

var Cuadre = class extends Table {
  constructor(x) {
    super(x || db, "sales_cuadre");
    this.text("cliente");
    this.text("fecha");
    this.text("cobro");
    this.text("venta");
    this.text("visita");
    this.text("nota");
    this.bool("ruta");
    this.bool("enviado");
  }
};

var Cobro = class extends Table {
  constructor(x) {
    super(x || db, "sales_cobro");
    this.text("id").auto();
    this.text("numero").dfault(numero_orden);
    this.text("cliente");
    this.text("comentario");
    this.text("fecha");
    this.decs("valor");
    this.decs("efectivo");
    this.decs("cheque");
    this.decs("transferencia");
    this.bool("enviado");
    this.bool("cerrado");
    this.text("banco");
    this.text("referencia");
    this.int("cknumero");

    this.add(Cobrod, "sales_cobrod", "cobro");
  }
};

var Cobrod = class extends Table {
  constructor(x) {
    super(x || db, "sales_cobrod");
    this.text("id").auto();
    this.text("cobro");
    this.text("factura");
    this.decs("valor");
    this.bool("enviado");
    this.text("sync");
  }
};

var Saldo = class extends Table {
  constructor() {
    super(db, "sales_saldo");
    this.text("id");
    this.text("documento");
    this.text("cliente");
    this.text("fecha");
    this.text("vence");
    this.decs("inicial");
    this.decs("balance");
    this.text("sync");
  }
};

var Usuario = class extends Table {
  constructor(x) {
    super(x || db, "sales_usuario");
    this.text("id");
    this.text("nombre");
    this.text("pass");
    this.bool("inactivo");
    this.int("sales_sync");

    this.on("create", function () {
      db.request("create view usuario as select * from sales_usuario");
      this.insert()
        .then(function () {
          this.id.value = "user";
          this.nombre.value = "user";
          this.pass.value = "123";
          return this.update();
        }.bind(this));
    });
  }
};

var Cliente = class extends Table {
  constructor(x) {
    super(x || db, "sales_cliente");
    this.text("codigo");
    this.text("vendedor");
    this.text("nombre");
    this.text("direccion");
    this.text("correo");
    this.text("telefono");
    this.text("dia");
    this.bool("semana1");
    this.bool("semana2");
    this.bool("semana3");
    this.bool("semana4");
    this.bool("semana5");
    this.bool("inactivo");
    this.text("sync");
    this.decs("balance");
    this.int("antiguedad");
    this.decs("incremento");
    this.text("listap");
    this.decs("timestamp");
  }
};

var Orden = class extends Table {
  constructor(x) {
    super(x || db, "orden");
    this.text("id").auto();
    this.text("numero").noempty().dfault(numero_orden);
    this.text("cliente").noempty();
    this.text("vendedor").noempty();
    this.text("fecha").noempty();
    this.text("comentario");
    this.bool("enviado");
    this.bool("cerrado");
    this.add(Detalle, "detalle", "orden");
  }
};

var Detalle = class extends Table {
  constructor(x) {
    super(x || db, "detalle");
    this.text("id").auto();
    this.text("orden").noempty();
    this.text("merc").noempty();
    this.decs("cantidad").decs(6);
    this.decs("precio");
  }
};

var Merc = class extends Table {
  constructor(x) {
    super(x || db, "sales_merc");
    this.text("codigo");
    this.text("nombre");
    this.text("referencia");
    this.bool("excento");
    this.decs("precio1");
    this.decs("precio2");
    this.decs("precio3");
    this.bool("inactivo");
    this.text("sales_sync");
    this.int("existe");
    this.decs("itasa");
    this.decs("timestamp");
    this.on("create", function () {
      db.request("create view merc as select * from sales_merc");
    });
  }
};
var Precios = class extends Table {
  constructor(x) {
    super(x || db, "precios");
    this.text("id");
    this.text("merc");
    this.text("control");
    this.decs("precio");
    this.decs("timestamp");
  }
};

var SolicitaCR = class extends Table {
  constructor(x) {
    super(x || db, "solicitacr");
    this.text("id").auto();
    this.text("vendedor").dfault(get_user);
    this.text("nombre").noempty();
    this.text("direccion").noempty();
    this.text("correo").noempty();
    this.text("telefono").noempty();
    this.text("empresa");
    this.text("documento").noempty();
    this.text("referencia1");
    this.text("referencia1tel");
    this.text("referencia2");
    this.text("referencia2tel");
    this.text("referencia3");
    this.text("referencia3tel");
    this.bool("enviado");
  }
};

//  actualiza con el servidor
var actualiza_cobros = function () {
  return new Promise(function (ok, fail) {
    //  instancia la tabla localmente
    var cobro_local = new Cobro(db);

    //  instancia la table remotamente
    var cobro_remoto = new Cobro(server);

    //  consulta las ordenes que no se han enviado
    db.request(`select id from sales_cobro where enviado=0`)
      .then(function (r) {
        //  funcion para recorrer los datos
        var recursivo = function () {
          //  obtiene una orden de los resultados
          var cobro = r.shift();

          //  si no vino orden terminamos
          if (!cobro) {
            ok();
            return;
          }

          //  gestionamos localmente la orden
          cobro_local.request(cobro.id)
            .then(function () {
              return cobro_remoto.insert(cobro_local);
            })
            .then(function () {
              console.log(cobro_remoto.buffer);
              return cobro_remoto.update();
            })
            .then(function () {
              cobro_local.enviado.value = true;
              return cobro_local.update();
            })
            .then(function () {
              recursivo();
            })
            .catch(fail);
        };

        recursivo();
      })
      .catch(fail);
  });
};

//  actualiza con el servidor
var actualiza_ordenes = function () {
  return new Promise(function (ok, fail) {
    actualizando = true;

    //  instancia la tabla localmente
    var orden_local = new Orden(db);

    //  instancia la table remotamente
    var orden_remoto = new Orden(server);

    //  consulta las ordenes que no se han enviado
    db.table_exists("orden")
      .then(function () {
        return db.table_exists("detalle");
      })
      .then(function () {
        return db.request(`select id from orden where enviado=0`);
      })
      .then(function (r) {
        //  funcion para recorrer los datos
        var recursivo = function () {
          //  obtiene una orden de los resultados
          var orden = r.shift();

          //  si no vino orden terminamos
          if (!orden) {
            ok();
            actualizando = false;
            return;
          }

          //  gestionamos localmente la orden
          orden_local.request(orden.id)
            .then(function () {
              return orden_remoto.insert(orden_local);
            })
            .then(function () {
              return orden_remoto.update();
            })
            .then(function () {
              orden_local.enviado.value = true;
              return orden_local.update();
            })
            .then(function () {
              recursivo();
            })
            .catch(fail);
        };

        recursivo();
      })
      .catch(fail);
  });
};

var actualiza_usuarios = function () {
  var usuario = new Usuario();
  return usuario.sync_from(server);
};

var actualiza_semana = function () {
  return new Promise(function (ok, fail) {
    var semana = new Semana();
    semana.sync_from(server)
      .then(function () {
        return db.request("select * from sales_semana");
      })
      .then(function (r) {
        SEMANA = r[0].semana;
        localStorage.setItem("semana", SEMANA);
        ok();
      });
  });
};

var actualiza_saldo = function () {
  return new Promise(function (ok, fail) {
    var saldo = new Saldo();
    saldo.sync_from(server)
      .then(function () {
        return db.request("delete from sales_saldo where balance=0");
      })
      .then(function () {
        ok();
      })
      .catch(function (err) {
        console.log(err);
        ok();
      });
  });
};

// var actualiza_clientes = function () {
//   return new Promise(function (ok, fail) {
//     var cliente = new Cliente();
//     actualiza_semana()
//       .then(function () {
//         return cliente.sync_from(server);
//       })
//       .then(function () {
//         return db.request(`
//                 insert into sales_cuadre(cliente,ruta)
//                 select codigo, 
//                      case when semana${SEMANA}=1 and trim(dia)='${dia}' 
//                        then 1 else 0 end 
//                 from sales_cliente 
//                 left join sales_cuadre on sales_cuadre.cliente=sales_cliente.codigo
//                 where sales_cuadre.cliente is null
//             `);
//       })
//       .then(ok)
//       .catch(fail);
//   });
// };

var actualiza_mercs = function () {
  var merc = new Merc();
  return merc.sync_from(server);
};

//  actualiza con el servidor
var actualiza_solicitacr = function () {
  return new Promise(function (ok, fail) {
    //  instancia la tabla localmente
    var solicitacr_local = new SolicitaCR(db);

    //  instancia la table remotamente
    var solicitacr_remoto = new SolicitaCR(server);

    //  consulta las ordenes que no se han enviado
    db.table_exists("solicitacr")
      .then(function () {
        return db.request(`select id from solicitacr where enviado=0`);
      })
      .then(function (r) {
        //  funcion para recorrer los datos
        var recursivo = function () {
          //  obtiene una solicitud de credito de los resultados
          var solicitacr = r.shift();

          //  si no vino solicitud terminamos
          if (!solicitacr) {
            ok();
            return;
          }

          //  gestionamos localmente la solicitud
          solicitacr_local.request(solicitacr.id)
            .then(function () {
              return solicitacr_remoto.insert(solicitacr_local);
            })
            .then(function () {
              return solicitacr_remoto.update();
            })
            .then(function () {
              solicitacr_local.enviado.value = true;
              return solicitacr_local.update();
            })
            .then(function () {
              recursivo();
            })
            .catch(function (err) {
              console.log(err);
            });
        };

        recursivo();
      })
      .catch(fail);
  });
};

var actualiza_sistema = function () {
  var db_created = localStorage.getItem("db_created");
  if (!db_created) return;
  actualiza_usuarios();
};

var carga_inicial = function () {
  return Promise.all([
    actualiza_usuarios(),
    // actualiza_mercs(),
    // actualiza_clientes(),
    // actualiza_saldo(),
  ]);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var user = JSON.parse(localStorage.getItem("User"));

function actualiza_mercancias() {

  return new Promise(function (ok, fail) {
    function recursivo() {
      db.request("select max(timestamp) timestamp from sales_merc")
        .then(function (r) {
          var timestamp = 0;
          if (r.length && r[0].timestamp != null) {
            timestamp = r[0].timestamp;
          }

          $.ajax(
            {
              url: http_server + "/sync_merc",
              data: { timestamp },
            },
          )
            .done(function (r) {
              if (!r.length) {
                console.log('Actualizacion de mercancias completada!!')
                return ok();
              }
              console.log('actualiza mercs', r)

              var xmerc = new Merc();
              xmerc.insert(r)
                .then(function () {
                  return xmerc.update();
                })
                .then(() => {
                  recursivo();
                })
                .catch((e) => {
                  return fail();
                });
            })
            .fail(function (e) {
              fail();
            });

        })

    }
    recursivo();
  });
}

function actualiza_clientes() {

  return new Promise(function (ok, fail) {
    function recursivo() {

      db.request("select max(timestamp) timestamp from sales_cliente")
        .then(function (r) {
          var timestamp = 0;
          if (r.length && r[0].timestamp != null) {
            timestamp = r[0].timestamp;
          }

          $.ajax(
            {
              url: http_server + "/sync_cliente",
              data: { timestamp },
            },
          )
            .done(function (r) {
              if (!r.length) {
                console.log('Actualizacion de clientes completada!!')
                return ok();
              }
              console.log('actualiza clientes', r)

              var xmerc = new Cliente();
              xmerc.insert(r)
                .then(function () {
                  return xmerc.update();
                })
                .then(() => {
                  recursivo();
                })
                .catch((e) => {
                  return fail();
                });
            })
            .fail(function (e) {
              fail();
            });

        })

    }
    recursivo();
  });
}

function actualiza_precios() {

  return new Promise(function (ok, fail) {
    function recursivo() {
      db.request("select max(timestamp) timestamp from precios")
        .then(function (r) {
          var timestamp = 0;
          if (r.length && r[0].timestamp != null) {
            timestamp = r[0].timestamp;
          }

          $.ajax(
            {
              url: http_server + "/sync_precios",
              data: { timestamp },
            },
          )
            .done(function (r) {
              if (!r.length) {
                console.log('Actualizacion de precios completada!!')
                return ok();
              }
              console.log('actualiza precios', r)

              var xmerc = new Precios();
              xmerc.insert(r)
                .then(function () {
                  return xmerc.update();
                })
                .then(() => {
                  recursivo();
                })
                .catch((e) => {
                  return fail();
                });
            })
            .fail(function (e) {
              fail();
            });

        })

    }
    recursivo();
  });
}

function actualizar() {

  console.log("actualizando....");
  $("#sync2").show();
  return actualiza_ordenes()
    .then(function () {
      return actualiza_mercancias()
    })
    .then(function () {
      return actualiza_precios();
    })
    .then(function () {
      return actualiza_clientes();
    })
    .then(function () {
      localStorage.setItem("primera_carga", "lista");
    })
    .catch(function (e) {
      console.log(e);
    });
}

// if (localStorage.getItem("primera_carga")) {
function recursivo_actualizar() {
  //  prendelo aqui
  $('.sync').css('color', '#D81B60');
  actualizar()
    .finally(function () {
      //  apagalo aqui
      $('.sync').css('color', '#66BB6A');
      setTimeout(recursivo_actualizar, 1000 * 30);
    });
}
setTimeout(recursivo_actualizar, 1000 * 5);
// }
