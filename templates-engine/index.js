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

    res.render('home_ejemplo', {
        layout: 'ejemplo',
        data: {
            jsonObj,
        },
    });
});

app.get('/equipos/:id', (req, res) => {
    const equiposData = fs.readFileSync('./data/equipos.json');
    const jsonObj = JSON.parse(equiposData);
    const objEquipo = jsonObj.find(objeto => objeto.id === Number(req.param.id));

    res.render('index', {
        layout: 'principal',
        data: {
            id: objEquipo.id,
            pais: objEquipo.area.name,
            nombre: objEquipo.name,
            imagen: objEquipo.crestUrl,
            fundacion: objEquipo.founded,
            estadio: objEquipo.venue
        },
    });
});


app.listen(8080);
console.log(`Servidor en funcionamiento en: http://localhost:${PORT}`);
