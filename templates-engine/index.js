const fs = require('fs');
const express = require('express');
const multer = require('multer');

//https://expressjs.com/en/resources/middleware/multer.html
//Guarda la Imagen en el disco con el nombre propio de la imagen. 
const storadge = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/imagenes');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploads = multer({storage: storadge});

const exphbs = require('express-handlebars');
const path = require('path');

const PORT = 8080;
const app = express();
const hbs = exphbs.create();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(`${__dirname}/uploads`));

//Muestra el objeto de los equipos
app.get('/equipos', (req, res) => {
    const equiposData = fs.readFileSync('./data/equipos.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(equiposData);
});

//Muestra Listado de equipos. En layout vista_equipos.handlebars y en home.handlebars se utiliza tambien
app.get('/', (req, res) => {
    const equipos = fs.readFileSync('./data/equipos.json');
    const jsonObj = JSON.parse(equipos);

    res.render('home', {
        layout: 'vista_equipos',
        data: {
            jsonObj,
        },
    });
});

//Hace render de los valores para mostrarlos en index.handlebar por medio del layout principalBody.handlebars
app.get('/equipos/:id/mirar', (req, res) => {
    const equiposData = fs.readFileSync('./data/equipos.json');
    const jsonObj = JSON.parse(equiposData);
    const objEquipo = jsonObj.find(obj => obj.id === Number(req.params.id));

    res.render('index', {
        layout: 'principalBody',
        data: {
            id: objEquipo.id,
            pais: objEquipo.area.name,
            nombre: objEquipo.name,
            imagen: objEquipo.crestUrl,
            fundacion: objEquipo.founded,
            estadio: objEquipo.venue,
            nombreCorto: objEquipo.shortName,
            abreviatura: objEquipo.tla,
            direccion: objEquipo.address,
            telefono: objEquipo.phone,
            web: objEquipo.website,
            colores: objEquipo.clubColors,
        },
    });
});

//hace render de vista_equipos cuando se pasa /form
app.get('/form', (req, res) => {
    res.render('form_registro', {
        layout: 'vista_equipos',
    });
});

//recibe por POST los datos enviados desde el formulario de form_registro
app.post('/form', uploads.single('imagen'), (req, res) => {
    let equipos = fs.readFileSync('./data/equipos.json');
    let jsonObj = JSON.parse(equipos);

    jsonObj.push({
        "id": idAleatorio(jsonObj),
        "crestUrl": "/imagenes/" + req.file.filename,
        "name": req.body.nombre,
        "shortName": req.body.nombreCorto, 
        "tla": req.body.abreviatura,
        "clubColors": req.body.colores, 
        "area": {"name": req.body.pais},
        "address": req.body.direccion,
        "venue": req.body.estadio,
        "phone": req.body.telefono,
        "website": req.body.web,
        "founded": req.body.fundacion,
    })

    fs.writeFileSync('./data/equipos.json', JSON.stringify(jsonObj));
    res.redirect('/');
});

// Funcion creadora de un numero random que es asignado al ID del equipo nuevo
function idAleatorio(a){
    let id = Math.ceil(Math.random() * 2000);
    while(a.find(objeto => objeto.id === id)) {
        id = Math.ceil(Math.random() * 2000);
    }
    return id;
}

// Agarra el formulario de form_registo.handlebars
app.get('/form/:id/editar', (req, res) => {
    res.render('form_editor', {
        layout: 'editarBody',
        data: {
            id: req.params.id,
        },
    });
});

// Capturas los datos por el metodo POST que se van a cambiar y hace el cambio
app.post('/equipo/:id/editar', uploads.single('imagen'), (req, res) => {
    const equipo = fs.readFileSync('./data/equipos.json');
    const jsonObj = JSON.parse(equipo);
    const i = jsonObj.findIndex(obj => obj.id === Number(req.params.id));

    if (i !== -1) { 
        if (req.file !== undefined){
            jsonObj[i].crestUrl = "/imagenes/" + req.file.filename;
        }
        if (req.body.nombre !== ""){
            jsonObj[i].name = req.body.nombre;
        }
        if(req.body.nombreCorto !== ""){
            jsonObj[i].shortName = req.body.nombreCorto;
        }
        if(req.body.abreviatura !== ""){
            jsonObj[i].tla = req.body.abreviatura;
        }
        if(req.body.colores !== ""){
            jsonObj[i].clubColors = req.body.colores;
        }
        if (req.body.direccion !== ""){
            jsonObj[i].address = req.body.direccion;
        }
        if (req.body.pais !== ""){
            jsonObj[i].area.name = req.body.pais;
        }
        if(req.body.estadio !== ""){
            jsonObj[i].venue = req.body.estadio;
        }
        if (req.body.telefono !== ""){
            jsonObj[i].phone = req.body.telefono;
        }
        if (req.body.web !== ""){
            jsonObj[i].website = req.body.web;
        }
        if(req.body.fundacion !== ""){
            jsonObj[i].founded = req.body.fundacion;
        }
}

    fs.writeFileSync('./data/equipos.json', JSON.stringify(jsonObj));
    res.redirect('/');
})

// Ruta para borrar un dato seleccionado
app.get('/borrar/:id', (req, res) => {
    const idToDelete = Number(req.params.id);

    // Leer el archivo JSON que contiene los datos
    const equiposJson = fs.readFileSync('./data/equipos.json');
    let equipos = JSON.parse(equiposJson);

    // Filtrar los datos para eliminar el equipo correspondiente al ID proporcionado
    const filteredEquipos = equipos.filter(equipo => equipo.id !== idToDelete);

    // Guardar el nuevo arreglo de datos en el archivo JSON
    fs.writeFileSync('./data/equipos.json', JSON.stringify(filteredEquipos));

    // Obtener el nombre del archivo de imagen a eliminar basado en el ID del equipo
    const imageName = filteredEquipos.find(equipo => equipo.id === idToDelete)?.crestUrl;

    // Si se encontró un nombre de imagen correspondiente al ID del equipo
    if (imageName) {
        // Extraer el nombre del archivo de la cadena crestUrl
        const filename = imageName.substring(imageName.lastIndexOf('/') + 1);

        // Construir la ruta completa al archivo de imagen
        const imagePath = path.join(__dirname, 'public', 'imagenes', filename);
        console.log(imagePath);
        // Verificar si la imagen existe
        if (fs.existsSync(imagePath)) {
            // Eliminar la imagen del directorio
            fs.unlinkSync(imagePath);
        }
    }

    res.redirect('/');
});





    //Borra un dato seleccionado
// app.get('/borrar/:id', (req, res) => {
//     const equipo = fs.readFileSync('./data/equipos.json');
//     const jsonObj = JSON.parse(equipo);
//     const arr = jsonObj.filter(obj => obj.id !== Number(req.params.id));
//     fs.writeFileSync('./data/equipos.json', JSON.stringify(arr)); 
//     res.redirect('/');
// });


app.listen(8080);
console.log(`Servidor en funcionamiento en: http://localhost:${PORT}`);
