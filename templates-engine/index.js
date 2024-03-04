const fs = require('fs');
const express = require('express');
const multer = require('multer');

const uploads = multer({dest: './uploads/imagenes'});

const exphbs = require('express-handlebars');

const PORT = 8080;
const app = express();
const hbs = exphbs.create();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(`${__dirname}/uploads`));


app.get('/equipos', (req, res) => {
    const equiposData = fs.readFileSync('./data/equipos.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(equiposData);
});

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

app.get('/equipos/:id/mirar', (req, res) => {
    const equiposData = fs.readFileSync('./data/equipos.json');
    const jsonObj = JSON.parse(equiposData);
    const objEquipo = jsonObj.find(objeto => objeto.id === Number(req.params.id));

    res.render('index', {
        layout: 'principal',
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

app.get('/form', (req, res) => {
    res.render('form_registro', {
        layout: 'vista_equipos',
    });
});

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

function idAleatorio(arr){
    let id = Math.ceil(Math.random() * 2000);
    while(arr.find(objeto => objeto.id === id)) {
        id = Math.ceil(Math.random() * 2000);
    }
    return id;
}

app.listen(8080);
console.log(`Servidor en funcionamiento en: http://localhost:${PORT}`);
