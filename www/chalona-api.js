const module={web:true};// esto evita el error de los archivos comunes entre el servidor y el browser

/**
*Descripcion:
*
*Esta retorna el tiempo actual en un formato que puede ser
interpretado por sistemas bases de datos como PostgresSQL
*
*@author Pedro Mateo
*
*@func util.now
*
*@example 
var time=chalona.util.now()
*
*@returns {string} fecha
*/
var util={};
util.now=function(){
	return (new Date()).toISOString();
}; 

/**
*Descripcion:
*
*Crea un "padding" al principio de un string 
padding siendo un caracter que se repite un numero determinado de veces.
*
*@author Pedro Mateo
*
*@func util.pad
*
*@param {string} text - El texto al que se va a aplicar el padding.
*
*@param {number} width - Es el numero de caracteres que tiene que tener el resultado
los caracteres que no sean cubiertos por text seran completados con el padding.
*
*@param {string} padding - El padding que se va a aplicar al texto(text).
*
*@example 
util.pad('pedro', 10, '0')
*
*@returns {string} fecha
*/
util.pad=function(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

/**
*Descripcion:
*
*Permite sustituir dentro del primer parametro de tipo string todas aquellas palabras que 
*comienzen con $ y hagan referencia una propiedad del segundo parametro que es un objeto
* 
*interpretado por sistemas bases de datos como PostgresSQL.
*
*@author Pedro Mateo
*
*@func util.now
*
*@example 
var time=chalona.util.now()
*
*@returns {string} fecha
*/
util.render=function(text,x){
	for(var i in x){
		text=text.replace(new RegExp('\\$\\b'+i+'\\b','g'),x[i]);
	}
	return text;
};


/**
*Descripcion:
*
*Este "clona" un objeto desde otra variable para evitar reutilizar la variable y crear conflictos
"clonar" consiste en crear un objeto nuevo a partir de un copia del "valor" de un variable
donde el "valor" es un Json.
*
*@author Pedro Mateo
*
*@func util.clone
*
*@example 
util.clone(nombre)
*
*@returns {object}
*/
util.clone=function(x){
	return JSON.parse(JSON.stringify(x));
};

/**
*Descripcion:
*
*Evalua si el primer parametro se encuentra en los demas que se ha especificado
*
*@author Pedro Mateo
*
*@func util.inlist
*
*@example 
var x='jose';
console.log(util.inlist(x,'pedro','juan','marcos'));			//	imprime true
console.log(util.inlist(x,'maria','jucas','bartolomeo'));		//	imprime false

*@returns {string} fecha
*/
util.inlist=function(){
	var x=Array.prototype.shift.call(arguments);
	return Array.prototype.indexOf.call(arguments,x)>-1;
};

/**
*Descripcion:
*
*Esta es una propiedad nueva creada para el objeto Array,la cual cubre la falta de una funcion
para eliminar el contenido de un Array.
*
*@author Pedro Mateo
*
*/
Object.defineProperty(Array.prototype,'empty',{writable:true,value:function(){
	while(this.length)this.shift();
	return this;

}});

/**
*Descripcion:
*
*Esta es una propiedad nueva creada para el objeto Array,la cual cubre la falta de una funcion
para adjuntar el contenido de un Array a el contenido de otro Array.
*
*@author Pedro Mateo
*
*/
Object.defineProperty(Array.prototype,'append',{writable:true,value:function(x){
	for(var i=0;i<x.length;i++){
		this.push(x[i]);
	}
	return this;
}});


util.date_diff= {

    inDays: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();

        return parseInt((t2-t1)/(24*3600*1000));
    },

    inWeeks: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();

        return parseInt((t2-t1)/(24*3600*1000*7));
    },

    inMonths: function(d1, d2) {
        var d1Y = d1.getFullYear();
        var d2Y = d2.getFullYear();
        var d1M = d1.getMonth();
        var d2M = d2.getMonth();

        return (d2M+12*d2Y)-(d1M+12*d1Y);
    },

    inYears: function(d1, d2) {
        return d2.getFullYear()-d1.getFullYear();
    }
}

util.cday=['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado']

util.date2str=function(x){
    var y=x.getFullYear();

    var m=x.getMonth()+1;
    if(m<10)m='0'+m;

    var d=x.getDate();
    if(d<10)d='0'+d;

    var h=x.getHours();
    if(h<10)h='0'+h;

    var mm=x.getMinutes();
    if(mm<10)mm='0'+mm;

    var s=x.getSeconds();
    if(s<10)s='0'+s;

    var ms=x.getMilliseconds()+''
    if(ms.length==1)ms='00'+ms;
    if(ms.length==2)ms='0'+ms;
    return y+'-'+m+'-'+d+'T'+h+':'+mm+':'+s+'.'+ms+'Z';

}

util.sync_time=function(){
    if(module.web){

        var r = new Date(new Date().valueOf()+parseInt(localStorage.getItem('server_time')||0));
        return util.date2str(r)
    } 
    return util.date2str(new Date())
}

util.unique_id=function() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "ABCDEF63630JKLMNOPQRSTUVWXYZ0123456789";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}


util.nformat=function(amount, decimals=2) {
     var negative=amount<0?'-':'';

     amount += ''; // por si pasan un numero en vez de un string
     amount = parseFloat(amount.replace(/[^0-9\.]/g, '')); // elimino cualquier cosa que no sea numero o punto


     // si no es un numero o es igual a cero retorno el mismo cero
     if (isNaN(amount) || amount === 0) 
          return parseFloat(0).toFixed(decimals);

     // si es mayor o menor que cero retorno el valor formateado como numero
     amount = '' + amount.toFixed(decimals);

     var amount_parts = amount.split('.'),
          regexp = /(\d+)(\d{3})/;

     while (regexp.test(amount_parts[0]))
          amount_parts[0] = amount_parts[0].replace(regexp, '$1' + ',' + '$2');

     return negative+amount_parts.join('.');
}
util.iformat=function(x) {
    return util.nformat(x,0)
}

util.dformat=function(x) {
    x=x.split('-');
    return x[2].substr(0,2)+'/'+x[1]+'/'+x[0];
}
util.tformat=function(x) {
    x=x.split('-');
    return x[2].substr(0,2)+'/'+x[1]+'/'+x[0]+' '+x[2].substr(3,8);
}


module.exports=util;

bind_params=function(source,fn){
	$('[paramOf='+source+']').each(function(i,x){
		var event='change';
		if($(x).is('[name=search]'))event='keyup';

		$(x).on(event,function(){
			fn();
		});
	});
};

get_params=function(source){
	var r={};
	$('[paramof='+source+']').each(function(i,x){
		var name=$(x).attr('name');
		if(!name)throw('get_params: Debe especificar el nombre del parametro en '+source);
		r[$(x).attr('name')]=$(x).val();

	});
	return r;
};

get_user=function(){
	return User.id
}

$.fn.capture=function(){
	var r={}
	$(this).children('[name]').each(function(i,x){
		var name=$(x).attr('name');
		var value=$(x).val();
		r[name]=value
	})
	return r; 
}

//	FUNCION PARA INICIAR EL SISTEMA
const start=function(fn){
	window._start_=fn
}

//	PROCESO DE LOGUEAR
const check_login=function(){
	var x=localStorage.getItem('User');
	if(!x){
		if(current_page()!='login.html'){
			go('login.html')
		}
	}else{
		if(current_page()=='login.html'){
			go('index.html')
		}
		
		Object.defineProperty(window,'User',{value:JSON.parse(x)});
	}

}

const const_public=function(name,x){
	Object.defineProperty(window,name,{value:x});
	return x;
}

const logout = function(){
	localStorage.removeItem('User');
	location.reload()
}


setInterval(function(){
	server_time(new Date().valueOf())
	.then(function(r){
		localStorage.setItem('server_time',r.time)
	})
	.catch(function(){})
},5000)


/*	SECCCION OBJECT
	Contiene la definicion del objeto base de chalona y la funcion constructora
	de clases
*/
//	OBJETO OBJ
class Obj{
	constructor(){
		this.prop('errors',[]);         //  contiene los errores en operaciones
	}
	//  gestiona propiedades para el objeto
	prop(n,x,readonly){
		var instance=this;
		//  validaciones
		if(Object.getOwnPropertyDescriptors(this)[n]){
			throw 'prop: ya existe la propiedad '+n+' y contiene '+this[n];
		}

		//  esto es padfasdfasdasdfasdfsadf
		//asdfsafasfsadfsadfasdf/asdfsadf
		if(x!=null && (x instanceof Object||readonly)){
			Object.defineProperty(this,n,{value:x});
		}else{
			var set=function(v){return x=v;};
			var get=function(){return x;};
			var off=false;
			var event=false;
			Object.defineProperty(this,n,{
				get:function(){
					return get.call(instance,x);
				},
				set:function(v){
					if(off){
						x=v;
						return;  
					}
					off=true;
					x=set.call(instance,v);
					off=false;

					if(!event){
						event=true;
						instance.trigger(n+'.set');
						event=false;
					}

				},
			});
		}

		//  retorna el objeto
		return {set:function(fn){set=fn;return this;},get:function(fn){get=fn;return this;}};
	}

	//  carga eventos
	on(x,fn){
		//  validaciones
		if((typeof x)!='string')throw 'on: especifique el nombre de la funcion';
		if(!(fn instanceof Function))throw 'on: especifique la funcion';
		
		//  crea el contenedor de eventos
		if(!this.dataEvent)Object.defineProperty(this,'dataEvent',{value:{}});                       

		//  agrega el evento
		this.dataEvent[x]=this.dataEvent[x]||[];
		this.dataEvent[x].unshift(fn);

		//  agrega el elemento
		return this;
	}

	//  dispara eventos
	trigger(name,x){
		if(this.dataEvent && this.dataEvent[name]){
			for(var i in this.dataEvent[name]){
				if(this.dataEvent[name][i].call(this,x)===false)return false;
			}
		}
		return true;
	}

	//  ADD: para agregar objetos
	add(as,name,x){
		//  trata parametros
		if((typeof as)=='string'){
			name=as;
			as=Obj;
		}

		//  validaciones
		if((typeof name)!='string')throw 'add: especifique el nombre del objeto';
		if(!((as instanceof Function && as.prototype instanceof Obj) || as==Obj))throw 'add: especifique un clase que derive de Obj, '+as;
		if(this[name])throw 'add: este elemento '+name+' ya existe';

		//  define un contenedor de objetos
		if(!this.objs)Object.defineProperty(this,'objs',{value:{}});                     
		
		//  agrega el objeto como una propiedad
		this.prop(name,new as(name,x));

		//  agrega una referencia parent
		this[name].prop('parent',this);

		//  almacena el objeto en el contenedor
		this.objs[name]=this[name];

		//  retorna el objeto
		return this[name];
	}

	//  itera entre los objetos
	each(as,fn){
		//  trata los parametros
		if(as instanceof Function && !(as.prototype instanceof Obj)){
			fn=as;
			as=Obj;
		}

		//  validaciones
		if(!(fn instanceof Function))throw 'each: especifique la funcion';
		
		//  si no hay objetos agregados
		if(!this.objs)return this;

		//  recorre los objetos
		for(var i in this.objs){
			if(this.objs[i] instanceof as)fn.call(this,this.objs[i]);
		}

		//  retorna el objeto
		return this;
	}

	notify(type,msg){
		this.trigger('notify',type,msg);
	}

	//  PARA GENERAR ERRORES
	error(x){
		this.errors.push(x);
		this.notify('error',x);
	}

}

var EventFace=function(x){
	if(x.on)return;
	x.on=function(){
		return Obj.prototype.on.apply(x,arguments);
	};
	x.trigger=function(){
		return Obj.prototype.trigger.apply(x,arguments);
	};
};


module.exports=Obj;

if(!module.web){
	Obj=require('./obj.js');
}

class Db extends Obj{
	constructor(x){
		super();
	}
	request(){
		return Promise.reject('db: no ha implementado el metodo request')
	}
	table_update(){
		return Promise.reject('db: no ha implementado el metodo table_update')
	}
	table_exists(){
		return Promise.reject('db: no ha implementado el metodo table_exists')
	}

	last_update(x){
		return new Promise(function(ok,fail){
			this.request(`select max(sync) as sync from ${x}`)
			.then(function(r){
				if(!r.length)ok(null);
				else ok(r[0].sync)
			})
		})
	}

	get_updates(table,x){
		return this.request(`select * from ${table} where sync>'${x}'`)
	}
	
	table_request(x,tables){
		var result={};

		//	tarea que consulta
		var fn=function(table){
			return new Promise(function(ok,fail){
				this.request(`select *,${table.key} as _key from ${table.name} where ${table.ctrl}='${x}'`)
					.then(function(r){
						result[table.name]=r;
						ok();
					})
					.catch(fail);

			}.bind(this));
		}.bind(this);

		//	preparando una tarea para cada tabla especificada
		var task=[];
		while(tables.length){
			task.push(fn(tables.shift()));
		}

		//	returna la promesa resultado
		return new Promise(function(ok,fail){
			
			//	ejecuta todas las tareas
			Promise.all(task)

			//	si todo salio bien 
			.then(function(){
				ok(result);
			})

			//	si hubo un fallo
			.catch(fail);
		});

	}

	create_table(){
		return Promise.resolve()
	}

	login(){
		return Promise.reject('db: no ha implementado el metodo login')
	}

	get_sync_updates(table,key,time){
		return this.request(`select * from ${table} where '${time}'='' or sync>'${time}' order by sync`)
	}
	table(x){
		return new x(this);
	}	
}




module.exports=Db;

class DbLink extends Db{
	constructor(x='main'){
		super();
		this.prop('db',x,true)
	}
	//	PARA CONSULTAR LA BASE DE DATOS
	request(sql,args){
		return Promise.reject('No esta permitido realizar consultas remotas')
	}

	//	PARA GRABAR EN UNA BASE DE DATOS
	table_update(x){
		return window[this.db+'_table_update'](x)
	}
	table_request(x,tables){
		return window[this.db+'_table_request'](x,tables)
	}

	get_sync_updates(table,key,time){
		return window[this.db+'_get_sync_updates'](table,key,time)
	}

	login(x){
		return window[this.db+'_login'](x)
	}

	
}



//	clase field de la que deriban todos los campos definidos en el sistema
class Type extends Obj{
	constructor(name,fn){ 

		//	llamo el constructor origina, en este caso el de Obj
		super();

		this.prop('name',name);

		this.prop('cast',fn);

		//	agrego la propiedad noempty, sirve para determinar si un campo
		//	puede estar vacio al momento de grabar
		this.prop('_noempty',false);
		
		//	para almacenar los errores
		this.prop('error',false)

		//	valor del campo
		this.prop('_value',undefined)
		this.prop('value')
			.set(function(v){
				this.set(fn(v))
				this.valid();
				this.trigger('refresh')
			}.bind(this))
			.get(function(v){
				return this.get(fn(v));
			}.bind(this));

		//	default del campo			
		this.prop('_dfault',null)
			.set((v)=>{
				if(v instanceof Function)return v; 
				return fn(v);
			})
			.get((v)=>{
				if(v instanceof Function){
					return fn(v());
				} 
				return fn(v);
			});

	}		

	get(v){
		if(!this.parent.data)return null
		return this.parent.data[this.name]
	}
	set(v){
		if(!this.parent.data)return;
		this.parent.data[this.name]=v;

	}

	//	determina si un campo esta vcio
	empty(){
		return !this.value||this.value==null||!this.value.length;
	}

	//	valida el campo
	valid(){

		this.error=false;
		if(this._noempty && this.empty()){
			this.trigger('error','Dato Requerido!');
			return false;
		}else this.trigger('ok');
		return true;
	}
	noempty(x){
		if(x===false)this._noempty=false;
		else this._noempty=true;
		return this;
	}
	ctrl(){
		this.parent.ctrl(this.name);
	}

	dfault(x){
		this._dfault=x;
		return this;
	}

};

class Integer extends Type{
	constructor(name){
		super(name,function(v){
			if(v==null||v==undefined)return 0;
			if(v=='')return 0;
			v=parseInt(v);
			if(isNaN(v))return 0;
			return v;
		});

	}	
}
class Text extends Type{
	constructor(name){
		super(name,function(v){
			if(v==null||v==undefined)return '';
			v=v+'';
			if(instance._upper)v=v.toUpperCase();
			return v;
		});
		var instance=this;
		this.prop('_upper',false);
	}
	upper(x){
		if(x===false)this._upper=false;
		else this._upper=true;
		return this;
	}
}


//	campo tipo decimal
class Bool extends Type{
	constructor(name){
		super(name,function(v){
			if(v==null)return false;
			if(v==true||v=='true')return true;
			if((typeof v)=='string' && v!='true' && v!='0') return false;
			return v?true:false;
		});
		this.dfault(false)
	}
};



//	campo tipo Date
class Dte extends Type{
	constructor(name){
		super(name,function(v){
			v=new Date(v).toJSON();
			if(v=='Invalid Date')return null;
			return v;
		});
	}
};

//	campo tipo decimal
class Decs extends Type{
	constructor(name){
		super(name,function(v){
			if(v==null)return 0;
			if(v=='')return 0;
			v=parseFloat(v);
			if(isNaN(v))return 0;
			return v.toFixed(instance._decs);
		});
		var instance=this;
		this.prop('_decs',2);
	}
	decs(x){
		this._decs=x||2;
		return this;
	}
};



//	campo tipo decimal
class List extends Type{
	constructor(name){
		super(name,function(v){
			if(!v||v==null)return null;
			if((typeof v)=='object')return null;
			return v+'';
		});
		this.prop('_source',false);
		this.dfault(null);
	}

	source(x){
		this._source=x;
	}
	
};






class Data extends Obj{
	constructor(){
		super();
		this.prop('data',false);
		this.data={};
	}

	check(){
		return new Promise(function(ok,fail){
			var error=[];
			this.each(Type,function(x){
				if(x.valid()===false)error.push(x.name+': '+x.error);
			}.bind(this));

			if(error.length)return fail(error);

			return ok()

		}.bind(this))
	}

	valid(){
		return Promise.resolve()
	}

	apply(){
		return new Promise(function(ok,fail){
			
			this.check()

			.then(function(){
				return this.valid()	
			}.bind(this))
			
			.then(function(){
				return this.done()
			}.bind(this))

			.then(function(){
				ok()
			})

		}.bind(this))
	}
	done(){}


	//	AGREGA UN CAMPO TEXT
	text(name){
		return this.add(Text,name);
	}
	//	AGREGA UN CAMPO TEXT
	int(name){
		return this.add(Integer,name);
	}
	//	AGREGA UN CAMPO TEXT
	bool(name){
		return this.add(Bool,name);
	}
	//	AGREGA UN CAMPO TEXT
	decs(name){
		return this.add(Decs,name);
	}
	list(name){
		return this.add(List,name);
	}

}

if(!module.web){
	const util=require('./util.js');
}

function field_set(v){
	if(!this.parent.data.length)return;
	
	//	realiza el cambio en la data almacenada
	var row=this.parent.data[this.parent.row];
	var buffer=this.parent.buffer;
	var key=this.parent.pkey

	row[this.name]=this.cast(v);
	row._status=row._status||'update';

	//	almacena los cambios en un buffer
	var n={};
	n[key]=row[key]
	buffer[row._key]=buffer[row._key]||n;
	buffer[row._key]._status=row._status;
	buffer[row._key][this.name]=row[this.name];

}

function field_get(){
	if(!this.parent.data.length)return null;
	return this.cast(this.parent.data[this.parent.row][this.name]);
}


//	campo tipo entero
class IntegerField extends Integer{
	get(){
		return field_get.call(this)
	}
	set(v){
		return field_set.call(this,v)
	}
};


//	campo tipo texto
class TextField extends Text{
	auto(){
		this.dfault(util.unique_id);
	}

	get(){
		return field_get.call(this)
	}
	
	set(v){
		return field_set.call(this,v)
	}

};
//	campo tipo decimal
class DecsField extends Decs{
	get(){
		return field_get.call(this)
	}
	set(v){
		return field_set.call(this,v)
	}
};
//	campo tipo decimal
class BoolField extends Bool{
	get(){return field_get.call(this)}
	set(v){return field_set.call(this,v)}
};

//	campo tipo Date
class DteField extends Dte{
	get(){
		return field_get.call(this)
	}
	set(v){
		return field_set.call(this,v)
	}
};

//	campo tipo decimal
class ListField extends List{
	get(){
		return field_get.call(this)
	}
	set(v){
		return field_set.call(this,v)
	}
};




if(!module.web){
	//var Obj=require('./obj.js')
}
var Table;
(function(){	//	AMBIENTE PRIVADO TABLE

	//	CLASE TABLE
	Table=class extends Obj{
		/*	CONSTRUCTOR
			db: 	recibe la base de datos a la que pertence, es instancia de DateBase
			name: 	recibe en nombre de la base de datos
		*/
		constructor(db,name){
			//	inicia el constructor de Obj
			super();
		
			//	verifica el parametro name
			if(!name)throw 'Table.constructor: especifique el nombre de la tabla';

			this.prop('db',db);					//	base de datos
			this.prop('name',name,true);		//	crea la propiedad name
			this.prop('autosave',false);		//	determina si los cambios se guarda automaticamente
			this.prop('data',[]);				//	almacena los datos
			this.prop('row',0);					//	almacena registro actual
			this.prop('_ctrl',false);			//	campo control de la tabla
			this.prop('buffer',false);			//	almacena los cambios		
			this.buffer={};
			this.prop('buffer_row',false);		//	mantiene un buffer del buffer
			this.prop('_created',false)			//	indica que la tabla esta creada
			this.prop('_counterkey',0)
			this.prop('pkey',false)
		}
		
		create(){
			if(this._created) return Promise.resolve();
			
			return new Promise(function(ok,fail){
				var struct={}
				this.each(Type,function(x){
					struct[x.name]={}
					if(x instanceof Text){
						struct[x.name].type='varchar'
					}else if(x instanceof Decs){
						struct[x.name].type=`decimal(15,${x._decs})`
					}else if(x instanceof Bool){
						struct[x.name].type=`boolean`
					}else if(x instanceof Dte){
						struct[x.name].type=`date`
					}else if(x instanceof List){
						struct[x.name].type=`varchar`
					}else if(x instanceof Integer){
						struct[x.name].type=`int`
					}
					struct[x.name].opt=[]
					if(x.name==this.pkey)struct[x.name].opt.push('primary key');
				}.bind(this))

				this.db.create_table(this.name,struct)
				.then(function(create){
					this._created=true;
					if(create)this.trigger('create')
					ok()
				}.bind(this))
				.catch(fail);

			}.bind(this))
		}		

		//	SCANEA LOS DATOS
		scan(fn){
			
			if(fn instanceof Function){

				var r=this.row;
				for(var i=0;i<this.data.length;i++){
					this.row=i;
					if(fn()===false)return;
				}
				this.row=r;
			}
		}

		//	INSERTA DATOS EN LA TABLA
		insert(x){
			return new Promise(function(ok,fail){
				this.create()

				.then(function(){
					


					//	si es una tabla maestro vacia sus detalles y se limpia ella
					if(!(this.parent instanceof Table)){
						this.empty()
						this.each(Table,function(t){
							t.empty()
						})
					}


					//	tratando inserciones de tabla
					if(x instanceof this.__proto__.constructor){
						var table=x;
						x=util.clone(table.data)
						table.each(Table,function(t){
							console.log(t.name)
							this[t.name].insert(t)
						}.bind(this))
						
					}
					
					x=x||{};

					if(!(x instanceof Array))x=[x];

					for(var i=0;i<x.length;i++){

						//	agrega el elemento al contenedor de datos
						this.data.push({_status:'insert',_key:'#'+this._counterkey++});

						//	ubica row en el ultimo registro
						this.row=this.data.length-1;

						//	asigna los valores a cada campo
						this.each(Type,function(f){

							//	poniendo valor por defecto
							f.value=f._dfault;
							f.trigger('ok')

						/*	
							//	modificando el defecto con la informacion que se desea insertar
							if(x[i][f.name]!=undefined){
								f.value=x[i][f.name];
							}
						*/
						});

						this.set(x[i]);
					}





					this.trigger('insert');

					if(this.autosave){
						this.trigger('refresh');
						return this.update();
					}

					this.trigger('refresh');
					ok()

				}.bind(this))

				.catch(fail)

			}.bind(this))
		}

		//	ACTUALIZA LA BASE DE DATOS CON LOS CAMBIOS REALIZADOS
		update(){
			return new Promise(function(ok,fail){
				
				//	realiza validaciones de la instancia
				this.valid()

				//	procede ha hacer validaciones regulares
					.then(realiza_validaciones_regulares.bind(this))

				//	guarda los datos
					.then(function(){
						var x={};
						this.for_update(x);

						this.each(Table,function(t){
							t.for_update(x);
						});
						if(!x.has_changes)return Promise.resolve();
						delete x.has_changes;

						return this.db.table_update(JSON.stringify(x));
					}.bind(this))
					.then(function(){
						this.buffer={};					
						this.trigger('update');
						ok();
					}.bind(this))

				//	captura los fallos
					.catch(function(err){
						this.error(err);
						fail(err);
					}.bind(this));


			}.bind(this));
		}

		//	AGREGA UN CAMPO TEXT
		text(name){
			return this.add(TextField,name);
		}
		//	AGREGA UN CAMPO TEXT
		int(name){
			return this.add(IntegerField,name);
		}
		//	AGREGA UN CAMPO TEXT
		bool(name){
			return this.add(BoolField,name);
		}
		//	AGREGA UN CAMPO TEXT
		decs(name){
			return this.add(DecsField,name);
		}
		list(name){
			return this.add(ListField,name);
		}
		dte(name){
			return this.add(DteField,name);
		}

		//	REESCRITO PARA AGREGAR CONFIGURACIONES AUTOMATICAS
		add(as,name,x){
			var r;
			if((as.prototype instanceof Table) ){
				if(!x)throw 'Debe especificar cual es el campo control del '+name+' en '+this.name
				r=new as(this.db,name);
				this.prop(name,r)
				r.prop(name,r)
				this.objs[name]=r
				r.ctrl(x)
				return r;
			}

			r=super.add(as,name,x);
			if((as.prototype instanceof Type) && !this.pkey){
				this.pkey=name;
				this._ctrl=name;
				if(name=='sync'){
					r.dfault(util.sync_time)
				}
			}
			

			return r;
		}

		//	CONSULTA LOS DATOS
		request(x){
			return new Promise(function(ok,fail){

				this.create()
				.then(function(){

					//	prepara la consulta con esta tabla
					var tables=[{name:this.name,key:this.pkey,ctrl:this._ctrl}];
					
					//	adjunta las tablas detalle
					this.each(Table,function(x){
						tables.push({name:x.name,key:x.pkey,ctrl:x._ctrl});
					});
					return this.db.table_request(x,util.clone(tables))


				}.bind(this))
				
				//	si tuvo exito
				.then(function(r){

					this.load(r[this.name]);
					this.each(Table,function(x){
						x.load(r[x.name]);
					});
					ok();
				}.bind(this))

				//	si fallo 
				.catch(function(err){
					this.error(err);
					fail(err);
				}.bind(this));

			}.bind(this));
		}

		//	CARGA LA TABLA CON DATOS
		load(r){
			this.buffer={};					

			this.data.empty();
			this.data.append(r);
			this.trigger('refresh');

		}
		//	OBTIENE LOS CAMBIOS DE LA TABLA CON LA ESTRUCTURA IDEAL PARA ENVIAR LOS DATOS
		for_update(x){
			var action;
			var data={};
			var buffer=this.buffer;
			var n;
			for(var i in buffer){
				action=buffer[i]._status;
				data[action]=data[action]||[];
				data.key=this.pkey
				n=util.clone(buffer[i]);
				delete n._status;
				delete n._key;
				data[action].push(n);
				x.has_changes=true;
			}

			x[this.name]=data;
		}

		edit(x){
			return new Promise(function(ok,fail){
				//	si es una tabla detalle no consulta los datos en el servidor
				if(this.parent){
					this.row=x;
					var kf=this[this.pkey]
					this.buffer_row={row:clone(this.data[x])};
					if(this.buffer[kf.value])this.buffer_row.buffer=clone(this.buffer[kf.value]);
					this.trigger('refresh');

					this.trigger('edit');
					ok();
					return;
				}
				
				//	consulta los datos el servidor
				this.request(x)
					.then(function(){
						this.trigger('edit');
						ok();
					}.bind(this));
			}.bind(this));
		}
		undo(){
			var kf=this[this.pkey]
			this.data[this.row]=clone(this.buffer_row.row);
			if(this.buffer_row.buffer)this.buffer[kf.value]=clone(this.buffer_row.buffer);
		}
		empty(){
			this.data.empty();
			this.buffer={};
			this.each(Table,function(t){
				t.empty()
			})
		}
		_status(){
			if(!this.data.length)return undefined;
			return this.data[this.row]._status||'normal';
		}

		is_inserted(){
			return this._status()=='insert';
		}
		is_updated(){
			return this._status()=='update';
		}

		has_changes(){
			return inlist(this._status(),'update','insert');
		}


		//	DISPONIBLE PARA SER REESCRITO POR EL USUARIO
		//	PARA HACER VALIDACIONES ANTES DE GRABAR
		valid(){
			return Promise.resolve();
		}

		//	asigna un grupo de valores a un registro de la tabla
		set(x){
			for(var i in x){
				if(this[i] instanceof Type){
					this[i].value=x[i];
				}
			}
			return this;
		}
		ctrl(x){
			this._ctrl=x;
			return this;
		}

		table_exists(){
			return this.db.table_exists(this.name)
		}

		sync_from(remote){
			return new Promise(function(ok,fail){
				
				var corte=util.sync_time();
				var now=localStorage.getItem(this.name+'_last_up_sync')||'';


				remote.get_sync_updates(this.name,this.pkey,now)
				.then(function(r){
					
					return this.insert(r)
				}.bind(this))

				.then(function(){
					return this.update()
				}.bind(this))

				.then(function(){
					localStorage.setItem(this.name+'_last_up_sync',corte);
					ok()

				}.bind(this))

				.catch(fail)

			}.bind(this))

		}
	};

	///////////////////////////////////////////////////////////////
	/*	SECCION DE PROCESOS
		algunos funciones contienen varios proceso asincronos
		por esta razon y para hacer mas sensillo el codigo 
		he creado una seccion privada para la clase tabla
		donde  poner esos subprocesos
	*/
	///////////////////////////////////////////////////////////////


	//	REEALIZA VALIDACIONES REGULARES DE LOS CAMPOS
	var realiza_validaciones_regulares=function(){

		//	resetea la lista de errores de la tabla
		this.errors.empty();

		//	se prepara para almacenar posibles errores
		var error=[];

		//	validando los cambios				
		this.scan(function(){

			//	hace una verificacion campo a campo
			this.each(Type,function(x){
				if(x.valid()===false)error.push(x.name+': '+x.error);
			}.bind(this));
		
		}.bind(this));

		//	verificando resultados
		if(error.length){
			this.error(error);
			return Promise.reject(error);
		}
		//	todo salio bien
		return Promise.resolve();
	};

	/*
	//	SE OCUPA DE QUE NO SE REPITAN LAS CLAVES UNICAS
	var check_unique=function(){
		return new Promise(function(ok,fail){
			//	obtiene el listado de elementos unicos
			var unique=[];
			
			for(var i in this.indexes){
				if(this.indexes[i].unique)unique.push({name:i,expr:this.indexes[i].expr});
			}
			if(!unique.length){
				ok();
				return;
			}

			//	obtiene el paquete de datos a verificar
			var paquete=[];
			this.scan(function(x){
				if(this.has_changes()){
					for(var i in unique){
						var n={id:this._id(),name:unique[i].name,data:{table:this.name}};
						for(var c in unique[i].expr){
							n.data[unique[i].expr[c]]=this[unique[i].expr[c]].value;
						}
						paquete.push(n);
					}
				}
			}.bind(this));

			if(!paquete.length){
				ok();
				return;
			}

			//	realiza la verificacion				
			var check=function(){
				var x=paquete.shift();
				
				if(!x){
					ok();
					return;
				}

				//	consulta por apariciones previas de los datos
				this.db.api.find({selector:x.data,fields:['_id']})

				//	si tuvo exito la consulta verifica los resultados
					.then(function(r){

					//	verifica coincidencia
						if(r.docs.length && r.docs[0]._id!=x.id){
							var error='El elemento '+x.name+' no debe repetirse '+JSON.stringify(x.data);
							paquete.empty();
							this.error(error);
							fail.call(this,error);
						}else check();							

					}.bind(this));

			}.bind(this);
			check();

		}.bind(this));
	};
	*/


})();	//FIN AMBIENTE PRIVADO TABLE

module.exports=Table


//	plugin repeat
$.fn.repeat=function(data){
	var dom=this;
	//	recibe el arreglo contenido o lo crea si no vino
	data=data||[];

	//	hace el objeto sensible a eventa
	if(!data.on)EventFace(data);

	var no_trigger=false;
	//	reescribe las funciones array
	['pop','shift','push','unshift','splice','sort','reverse'].forEach(function(i){
		data[i]=function(){
			Array.prototype[i].apply(data,arguments);
			if(!no_trigger) data.trigger('fill-dom');
			return data;
		};	
	});

	data.empty=function(){
		no_trigger=true;
		Array.prototype.empty.apply(data,arguments);
		no_trigger=false;
		return data;
	};

    
	data.append=function(){
		no_trigger=true;
		Array.prototype.append.apply(data,arguments);
		no_trigger=false;
		data.trigger('fill-dom');
		return data;
	};
	
	//	tratando los parametros
	$(this).each(function(i,x){
		var html=$(x).html();
		var n;

		//	cargando evento
		var fn=function(){
			$(x).empty();
			for(var i=0;i<data.length;i++){
				n=$(util.render(html,data[i])).appendTo(x).attr('rid',i)	;
			}
			$(dom).format()
			data.trigger('repeat',$(x).children());
		};

		data.on('fill-dom',fn);
		if(data.length)fn();
	});
	data.trigger('fill-dom');
	return data;
};

const ch_bind=function(campo,dom){
	if(!campo) throw 'bind: el campo esta llegando indefinido para '+$(dom).html()
	if(!campo.parent)return 
	dom=$(dom);
	//	funcion para refreshcar 
	var refresh=function(){
		dom.each(function(i,x){
			if($(x).is('[type=checkbox]')){
				$(x).prop('checked',campo.value);
			}else $(x).val(campo.value);

		});
	};

	//	actualiza el control con los datos del campo
	campo.parent.on('refresh',refresh);
	campo.on('refresh',refresh);
	
	//	habilita para mostrar errores
	$(dom).parent().append('<span class="help-block"></span>');
	
	campo.on('error',function(x){
		
		$(dom).parent().children('.help-block').html(x);
		dom.parent().addClass('has-error');
	});
	
	campo.on('ok',function(){
		$(dom).parent().children('.help-block').html('');
		$(dom).parent().removeClass('has-error');
	});

	//	actualiza el campo con los cambios en el control
	$(dom).change(function(){
		if($(this).is('[type=checkbox]')){
			campo.value=$(this).prop('checked');
		}else campo.value=this.value;
		refresh();
	});
	refresh();

};


$.fn.text=function(campo){ch_bind(campo,this);};
$.fn.check=function(campo){ch_bind(campo,this);};
$.fn.pass=function(campo){$(this).text(campo);};

$.fn.edit=function(tabla){
	var dom=this;
	if(!(tabla instanceof Table)){
		if(!(tabla instanceof Function)||!(tabla.prototype instanceof Table)){
			throw('edit: Debe especificar una clase que derive de tabla');
		}
		tabla=new tabla();
	}
	
	//	todos los campos de texto
	$('input[name][type=text],input[name][type=password],input[name][type=number],textarea[name]',this).each(function(i,x){
		var name=$(x).attr('name');
		if(tabla[name] instanceof Type ){
			$(x).text(tabla[name]);
		}
	});

	//	todos los campos de texto
	$('input[name][type=checkbox]',this).each(function(i,x){
		var name=$(x).attr('name');
		if(tabla[name] instanceof Type ){
			$(x).check(tabla[name]);
		}
	});


	$('select[name]',this).each(function(i,x){
		var name=$(x).attr('name');
		if(tabla[name] instanceof List){
			$(x).list(tabla[name]._source,tabla[name]);
		}else{
			ch_bind(tabla[name],x);
		}
	});

	$('button[save]',this).click(function(){
		tabla.update()
			.then(function(){
				if($(dom).is('.modal')){
					$(dom.modal('hide'));
				}else{
					go_back();
				}
			});
	});
	
	$('button[continue-add]',this).click(function(){
		tabla.update()
		.then(function(){
			tabla.empty()
			tabla.insert();
		});
	});

	$('button[cancel]',this).click(function(){
		go_back();
	});

	$('button[save-row]',this).click(function(){
		tabla.data.trigger('fill-dom');
		$(dom).modal('hide');
	});

	$('button[cancel-row]',this).click(function(){
		tabla.undo();
		tabla.data.trigger('fill-dom');
		$(dom).modal('hide');
	});

	if(!$(dom).is('.modal')){
		var args=go_data();
		if(args){
			if(args.data && args.data.id)tabla.edit(args.data.id);
			else {
				tabla.empty()
				tabla.insert();
			}
		}
	}

	tabla.each(Table,function(x){
		$('#'+x.name).repeat(x.data)
			.on('repeat',function(dom){
				dom.click(function(){
					x.edit($(this).attr('rid'))
						.then(function(){
							$('#'+x.name+'Modal').modal();						
						});
				});
			});

		$('#'+x.name+'Modal').edit(x);

	});

	return tabla;


};

$.fn.list=function(source,campo,parametrizada){
	var dom=this;
	var fn=window[source];

	if(!(fn instanceof Function))throw('list: Especifique una funcion para obtener los datos');
	$(this).append('<option value="$id">$nombre</option>');


	var data=$(this).repeat();
	Object.defineProperty(data,'request',{value:function(){
		return new Promise(function(ok,fail){
			var args=undefined;
			if(parametrizada){
				args=get_params(source);
			}

			fn(args)
				.then(function(r){
					data.empty();
					data.append(r);
					ok();
				});

		});
	}});

	if(parametrizada){
		bind_params(source,data.request);
	}

	data.request();

	data.request()
		.then(function(){
			if(campo)ch_bind(campo,dom);
		});

	return data;
};


$.fn.format=function(){
	$('[nformat]',this).each(function(i,x){
		if($(x).is('input')){
			$(x).val(util.nformat($(x).val(),2))
		}else{
			$(x).html(util.nformat($(x).html(),2))
		}
	})
	$('[iformat]',this).each(function(i,x){
		if($(x).is('input')){
			$(x).val(util.nformat($(x).val(),0))
		}else{
			$(x).html(util.nformat($(x).html(),0))
		}
	})

	$('[dformat]',this).each(function(i,x){
		if($(x).is('input')){
			$(x).val(util.dformat($(x).val(),2))
		}else{
			$(x).html(util.dformat($(x).html(),2))
		}
	})

};

class Form extends Data{


}

class Login extends Form{
	constructor(dom){
		super();
		this.text('user').noempty();
		this.text('pass').noempty();
		this.text('acceso').value='comercial';
	}

	on_login(){
		return Promise.resolve()
	}


	done(){
		//	intento loguearme
		db.login(this.data)

		.then(function(r){

			//	si no vino resultado entonces notifico que esta mal la contrasena
			if(!r.length){
				this.pass.trigger('error','Contraseña invalida!')
			}else {

				//	registro el usuario
				localStorage.setItem('User',JSON.stringify(r[0]))
				Object.defineProperty(window,'User',{value:r[0]});

				//	corro el evento de verificacion adicional
				this.on_login()

				//	si todo va bien  ingreso al sistema
				.then(()=>{
					location.assign('index.html')
				})

				//	si no entonces notifico el error
				.catch(function(err){
					this.pass.trigger('error',err)

				}.bind(this))
			}
			
			/*

			if(!r.length){
				
				r=null
			}else{
				
				r=r[0].id
			}
			//console.log(r)
			
			//	si no vino resultado entonces notifico que esta mal la contrasena
			if(r==null){
				this.pass.trigger('error','Contraseña invalida!')
			}else {
				r=r[0]
				console.log(r)
				//	registro el usuario
				localStorage.setItem('User',JSON.stringify(r))
				Object.defineProperty(window,'User',{value:r});

				//	corro el evento de verificacion adicional
				this.on_login()

				//	si todo va bien  ingreso al sistema
				.then(()=>{
					//location.assign('index.html')
				})

				//	si no entonces notifico el error
				.catch(function(err){
					this.pass.trigger('error',err)

				}.bind(this))
			}*/
		}.bind(this))
	}
}


$.fn.form=function(x){
	var dom=this;

	var form=new x();


	//	todos los campos de texto
	$('input[name][type=text],input[name][type=email],input[name][type=password],input[name][type=number]',this).each(function(i,x){
		var name=$(x).attr('name');
		if(form[name] instanceof Type)$(x).text(form[name]);
	});

	//	todos los campos de texto
	$('input[name][type=checkbox]',this).each(function(i,x){
		var name=$(x).attr('name');
		if(form[name] instanceof Type)$(x).check(form[name]);
	});


	$('select[name]',this).each(function(i,x){
		var name=$(x).attr('name');
		if(form[name] instanceof Type) return;

		var source=$(x).attr('source')
		if(!source)source=form[name]._source

		if(source){
			$(x).list(source,form[name]);
		}else{
			bind(form[name],x);
		}
	});


	$('button[accept]',this).click(function(){
		form.apply()
	});


	/*

	
	$('button[continue-add]',this).click(function(){
		tabla.update()
		.then(function(){
			tabla.empty()
			tabla.insert();
		});
	});

	$('button[cancel]',this).click(function(){
		go_back();
	});

	$('button[save-row]',this).click(function(){
		tabla.data.trigger('fill-dom');
		$(dom).modal('hide');
	});

	$('button[cancel-row]',this).click(function(){
		tabla.undo();
		tabla.data.trigger('fill-dom');
		$(dom).modal('hide');
	});

	if(!$(dom).is('.modal')){
		var args=go_data();
		if(args){
			if(args.data && args.data.id)tabla.edit(args.data.id);
			else {
				tabla.empty()
				tabla.insert();
			}
		}
	}

	tabla.each(Table,function(x){
		$('#'+x.name).repeat(x.data)
			.on('repeat',function(dom){
				dom.click(function(){
					x.edit($(this).attr('rid'))
						.then(function(){
							$('#'+x.name+'Modal').modal();						
						});
				});
			});

		$('#'+x.name+'Modal').edit(x);

	});
	*/
	return form;


};

$.fn.search=function(source,args){
	var dom=this;
	if(!dom.length){
		throw('search: No se encuentra la etiqueta especificada o no se ha usado $(document).ready');
	}

	fn=window[source];

	//	tratando los parametros
	var set=$.extend({
		limit:10,
		offset:0,
		order:1,
		torder:'asc'
	},args);

	//	data que ca a contener los resultados
	var data=[];


	//	conectando las tablas  con la data
	this.each(function(i,x){
		var row=$($(x).html());
		/*
		//	configurando las columnas para que se pueda organizar por ellas
		$('thead>tr:last>th',$(x).parent()).each(function(i,x){
		
		//	asigna el nombre a cada titulo
			var name=$(x).attr('cname');


			if(!name)name=$($('td',row)[i]).html().trim().replace('$','');
			
			$(x).attr('cname',name);

			$(x).click(function(){

				if(set.order==name){
					if(set.torder=='asc')set.torder='desc';
					else set.torder='asc';
				}else{
					set.order=name;
					set.torder='asc';
				}
				$(dom).each(function(i,x){
					$('.fa-sort-asc',$(x).parent()).remove();
					$('.fa-sort-desc',$(x).parent()).remove();
				});
				$(dom).each(function(i,x){
					if(set.torder=='asc'){
						$('[cname='+name+']',$(x).parent()).append('<i style="margin-left:5px" class="fa fa-sort-asc"><i>');
					}else{
						$('[cname='+name+']',$(x).parent()).append('<i style="margin-left:5px" class="fa fa-sort-desc"><i>');
					} 

				});

				data.request();
			});
			

		});
		*/
		//	aplicando el plugin repeat
		$(x).repeat(data);

	});

	//	tratando los elementos agregados
	data.on('repeat',function(x){
		var event='dblclick'
		if(isMobile.any)event='click'
		x[event](function(){
			data.trigger('detail',data[$(this).attr('rid')]);
		});
	});

	Object.defineProperty(data,'edit',{value:function(x){
	
		if(x instanceof Function){
		//	instancia la tabla
			var tabla=new x();

			//	instancia modal
			var modal=$('#'+tabla.name+'Modal');
		
			//	conecta modal con la tabla
			modal.edit(tabla);

			//	hace que cada vez que se consulte la tabla se habra el modal
			tabla.on('update',function(){
				data.request();
			});

			//	hace que cada vez que se le de click a un detalle 
			//	se edite la tabla
			data.on('detail',function(x){
				tabla.edit(x.id)
					.then(function(){
						modal.modal();
					});
			});

			$('[add='+source+']').click(function(){
				tabla.empty()
				tabla.insert()
				.then(function(){
					modal.modal();
				});
			});

		}else{
			var page=x;
			//	hace que cada vez que se le de click a un detalle 
			//	se edite la tabla
			data.on('detail',function(x){
				go(page,{id:x.id});
			});
			$('[add='+source+']').click(function(){
				go(page);
			});

		}

	}});

	Object.defineProperty(data,'request_data',{value:function(x){
		var dfault=util.clone(set)
		return fn($.extend(dfault,x,get_params(source)))
	}});


	//	request
	Object.defineProperty(data,'request',{value:function(x){
		return new Promise(function(ok,fail){
			data.request_data(x)
				.then(function(r){
					if(!r.length && set.offset>0){
						set.offset-=set.limit;
						ok();
						return;
					}
					data.empty();
					data.trigger('request',r)
					data.append(r);
					ok();
				});
		});
	}});

	Object.defineProperty(data,'next',{value:function(){
		return new Promise(function(){
			set.offset+=set.limit;
			data.request()
				.then(function(r){
					if(!data.length)data.back();
				});
		});
	}});

	Object.defineProperty(data,'back',{value:function(){
		return new Promise(function(){
			set.offset-=set.limit;
			if(set.offset<0)set.offset=0;
			data.request()
				.then(function(r){
					if(!data.length)data.back();
				});
		});
	}});

	bind_params(source,data.request);

	//	botones de navegacion
	$('[next-page='+source+']').click(function(){
		data.next();
	});
	$('[back-page='+source+']').click(function(){
		data.back();
	});




	data.request();
	return data;
};


current_page=function(){
	return location.href.split('/').pop();
};

go=function(page,x){
	var set={
		from:current_page(),
		data:x
	};
	sessionStorage.setItem(`go-${page}`,JSON.stringify(set));

	location.assign(page);
};
go_data=function(){
	var page=current_page();
	var data=sessionStorage.getItem(`go-${page}`);
	if(!data)return false;
	return JSON.parse(data);
};

go_back=function(x){
	var data=go_data();
	if(!data || data.from==current_page())return location.assign('index.html');
	location.assign(data.from);
};


if(!module.web){
	Db=require('./sql.js')
}

class WebSql extends Db{
	constructor(x){
		super()

		this.prop('client',openDatabase(x, '1.0', '', 100 * 1024 * 1024,function(){
			load_struct()
			.then(function(){
				this.trigger('db-created')
			}.bind(this))
		}.bind(this)));

	}

	//	PARA CONSULTAR LA BASE DE DATOS
	request(sql,args){
		args=args||[]
		return new Promise(function(ok,fail){
			this.client.transaction(function (tr) {
				tr.executeSql(sql,args,function(tr,r){
					var result=[];
					for(var i=0;i<r.rows.length;i++)result.push(r.rows[i]);
					ok(result);	
				},function(tr,err){
					fail('sql: '+err.message+'\n'+sql)
				})
			});
		}.bind(this))
	}

	//	PARA GRABAR EN UNA BASE DE DATOS
	table_update(x){
		return new Promise(function(ok,fail){
			x=JSON.parse(x) 

			var list=[]
			var n,fields,values,set
			var sql;
			for(var i in x){
				n=x[i]
				if(n.insert){
					for(var r in n.insert){
						fields=Object.keys(n.insert[r]).join(',')
						//values="'"+Object.values(n.insert[r]).join("','")+"'"
						values=[];
						var row=n.insert[r]
						for(var c in row){
							if(row[c]==null){
								values.push('null')
							}else if((typeof row[c])=='string'){
								
								values.push("'"+row[c].replace(/\'/g,'')+"'")
							}else if((typeof row[c])=='boolean'){
								values.push(row[c]?1:0)
							}else{
								values.push(row[c])
							}
						}
						values=values.join(',')


						list.push(`insert into ${i}(${fields}) values(${values})`);
					}
					
				}
				if(n.update){
					for(var r in n.update){
						set=[];
						var row=n.update[r]
						for(var c in row){

							if(c!=n.key){
								set.push(`${c}='${row[c]}'`)
	
								if(row[c]==null){
									set.push(`${c}=null'`)
								}else if((typeof row[c])=='string'){
									set.push(`${c}='${row[c]}'`)
								}else if((typeof row[c])=='boolean'){
									set.push(`${c}=${row[c]?1:0}`)
								}else{
									set.push(`${c}='${row[c]}'`)
								}
							}

						}

						list.push(`update ${i} set ${set.join(',')} where ${n.key}='${row[n.key]}'`);
					}
				}

			}
			this.client.transaction(function(tr){
				var recursivo=function(){
					sql=list.shift()
					if(!sql)return ok()
					tr.executeSql(sql,[],function(tr,r){
						recursivo()
					},function(tr,err){
						fail('sql: '+err.message+'\n'+sql)
						//	realizando rollback
						return true;
					})
				}
				recursivo()
			})


		}.bind(this))
		
	}

	create_table(name,x){
		
		return new Promise(function(ok,fail){
			
			this.request(`select 1 from sqlite_master where type='table' AND name=$1`,[name])
			.then(function(r){
				if(r.length)return ok(false);
	
				var create=[]
				for(var i in x){

					if(x[i].opt[0]=='primary key'){
						x[i].opt[0]+=' on conflict replace '
					}

					
					create.push(`${i} ${x[i].type} ${x[i].opt.join(' ')}`)
				}
				create=`create table if not exists ${name}(${create.join(',')})`;
				this.request(create)
				.then(function(){
					ok(true)
				})
			}.bind(this))


		}.bind(this))

	}

	login(x){
		return new Promise(function(ok,fail){
			var usuario=new Usuario();
			usuario.create()
			.then(function(){
				return this.request('select id,nombre from usuario where lower(id) = lower($1) and pass = $2',[x.user,x.pass])
			}.bind(this))
			.then(function(r){
				ok(r)
			})
		}.bind(this))
	}

	table_exists(x){
		return new Promise(function(ok,fail){
			this.request(`select 1 from sqlite_master where type='table' AND name=$1`,[x])
			.then(function(r){
				if(r.length)ok()
				else fail()
			}.bind(this))
		}.bind(this))

	}
	
}

//	CREA TODAS LAS TABLAS DEFINIDAS 
function load_struct(){
	
	//	procede a crear la tablas... 
	var create_task=[];
	for(var i in window){
		
		if(util.inlist(i,'webkitStorageInfo','applicationCache'))continue
	    
	    if(window[i] instanceof Function && window[i].prototype instanceof Table){
			var t=new window[i]()
			create_task.push(t.create())
	    }
	}
	return Promise.all(create_task)
};


module.exports=WebSql;
check_login();


$(document).ready(function(){
	if(!window._start_)throw 'Debe iniciar el programa con start';

	//	para gestionar servidor
	var get_http_server=function(){
		return new Promise(function(ok,fail){


			if(location.protocol=='file:')window.http_server=localStorage.getItem('http_server');
			else window.http_server=location.protocol+'//'+location.host

			if(!http_server){
				while(true){
					http_server='abreu.chalonasoft.com'
					if(http_server==null || http_server.length==0)continue
					http_server='http://'+http_server
					ping().then(ok)
					break;
				}
			}else{
				ok()
			}
		})
	}

	//	gestionar servidor
	get_http_server()

	.then(function(){
		

		var instalado=localStorage.getItem('_6r5vy716xsh8r7qbm')

		if(instalado || http_server!='http://dbm.chalonasoft.com'){
			return Promise.resolve()
		}

		return new Promise(function(ok,fail){
			var serial=prompt()
			serial_instalacion(serial)
			.then(function(x){
				if(x && x.ok){
					localStorage.setItem('_6r5vy716xsh8r7qbm',true)
					return ok();

				}
				else fail()
			})
		})
	})

	.then(function(){
		localStorage.setItem('http_server',http_server)

		if(window.on_load) return on_load()
		else return Promise.resolve()
	})

	.then(function(){
		window._start_()
	})

	.catch(function(err){
		
	})



})



var fn_request=function(url,args){
			return new Promise(function(ok,fail){
				var x=[];
				for(var i=0;i<args.length;i++)x.push(args[i]);

				x=JSON.stringify(x);

				$.ajax(http_server+'/'+url,{dataType:'json',type:'POST',data:{args:x}})
					.done(function(r){
						if(r && r.error)return fail(r.msg||'Fallo la consulta al servidor: '+url);
						else ok(r);
					})
					.fail(function(){
						fail()
					});
			});
		}
	var ping=function(){
		return fn_request('ping',arguments)
	}
	
	
	var server_time=function(){
		return fn_request('server_time',arguments)
	}
	
	
	var main_request=function(){
		return fn_request('main_request',arguments)
	}
	
	
	var main_table_update=function(){
		return fn_request('main_table_update',arguments)
	}
	
	
	var main_table_request=function(){
		return fn_request('main_table_request',arguments)
	}
	
	
	var main_table_exists=function(){
		return fn_request('main_table_exists',arguments)
	}
	
	
	var main_get_sync_updates=function(){
		return fn_request('main_get_sync_updates',arguments)
	}
	
	
	var main_login=function(){
		return fn_request('main_login',arguments)
	}
	
	
	var serial_instalacion=function(){
		return fn_request('serial_instalacion',arguments)
	}
	
	
	var envia_correo_cierre=function(){
		return fn_request('envia_correo_cierre',arguments)
	}
	
	