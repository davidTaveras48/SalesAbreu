var detalle=[]
var orden_actual;
var imprimir=function(){
    go('rep_orden_copia.html',{orden:orden_actual})
}
start(function(){
 
    window.b_orden=function(x){
        return db.request(`
            select orden.id,cliente.nombre as cliente
            ,fecha
            ,total
            ,numero
            from orden inner join sales_cliente as cliente on cliente.codigo=orden.cliente
            inner join (select orden,sum(cantidad*precio) as total from detalle group by orden ) as detalle
            on detalle.orden=orden.id
            where  cliente like '%${x.search}%' or numero like '%${x.search}%'
            order by ${x.order} ${x.torder} limit ${x.limit} offset ${x.offset}
        `)
    }

    detalle=$('#detalle').repeat()

    $('#ruta').search('b_orden',{order:'fecha',torder:'desc'})
    .on('detail',function(x){
        orden_actual=x.id
        db.request(`select codigo,nombre,cantidad,precio,cantidad*precio as total from detalle inner join merc on merc.codigo=detalle.merc where orden='${x.id}'`)
        .then(function(r){
            detalle.empty()
            $('#modaldetalle_ord').modal();
            detalle.append(r)
        })
    })




    $(document).ready(function () {
;(function (global) { 

            if(typeof (global) === "undefined") {
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
                    if (e.which === 8 && (elm !== 'input' && elm  !== 'textarea')) {
                        e.preventDefault();
                    }
                    // stopping event bubbling up the DOM tree..
                    e.stopPropagation();
                };          
            }

        })(window);
        
        var url = window.location.pathname;
        var filename = url.substring(url.lastIndexOf('/')+1);
        
        $('.windowTitle').html('Mis Ordenes');
        $('#misordenes').addClass("active");
        $('[name=search]').focus()    
    })


})