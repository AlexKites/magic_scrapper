const axios = require('axios');
const fs = require('fs');
const Jimp = require('jimp');
const csv = require('csvtojson');
const csvFilePath = './Magic.csv';

// 1. Tocar la función para guardar las imagenes recortadas, de manera que sólo aparece la imagen de la carta.
// 2. Tocar el .csv de Magic para añadir tres nuevas columnas, Imagen, Imagen recortada y ID.



// Para convertir el csv en json y añadirle un id a cada carta.
// csv()
// .fromFile(csvFilePath)
// .then((jsonObj)=>{
//     console.log(jsonObj);
//     jsonObj.forEach((element, i) => {
//         element.id = i;
//     });
//     fs.writeFile('magicConIds.json', JSON.stringify(jsonObj), (err) => {
//         if (err) throw err;
//         console.log('The file has been saved!');
//     });
// })

// Para extraer las imagenes de las cartas.
// const images = [];
// const json = require('./Magic.json');
// for (const card of json) {
//     images.push(card.Enlace);
// };

// Crear un json con las imagenes de las cartas.
const objetoImages = {};

// Extrae las imagenes de las cartas mediante peticiones HTTP.
const extractor = async (json) => {
    try {
        const response = await axios({
            method: 'get',
            url: json.Enlace,
        })
        const total = response.data.split('card-image');
        const parte1 = total.pop();
        const total2 = parte1.split('</div>')[0]
        const total3 = total2.split('jpg')[0];
        const total4 = total3.split('static')[1];
        const totalFinal = 'https://static' + total4 + 'jpg'
        return totalFinal;
    } catch (e) {
    }
};

// Itera sobre el json de las cartas y extrae las imagenes con extractor().
const iterador = async (json) => {
    let j = 0;
    for (const card of json) {
        try {
            j++;
            console.log(j);
            await new Promise(resolve => setTimeout(resolve, 1600));
            const result = await extractor(card);
            objetoImages[card.id] = result;
            console.log(result);
        } catch (error) {
            console.log('Error!');
            console.log(error);
            continue;
        }
    };
    fs.writeFileSync('./listadefotosdef.json', JSON.stringify(objetoImages));
};
// const json = require('./magicConIds.json');
// iterador(json)

// Descarga las imagenes de las cartas y las guarda en la carpeta imagenes.
const imageDownloader = async (id, field) => {
    return new Promise((resolve, reject) => {
        Jimp.read(field)
            .then(function (image) {
                image.write(`./imagenes/${id}.jpg`);
                resolve();
            })
            .catch(function (err) {
                console.log('error', err);
                reject(err);
            })
    })
};

// Descarga las imagenes de las cartas y las guarda en la carpeta imagenes_recortadas.
const croppedImagesDownloader = async (id, field) => {
    return new Promise((resolve, reject) => {
        Jimp.read(field)
            .then(function (image) {
                image.resize(255, 361)
                image.crop(15, 36, 224, 165);
                image.write(`./imagenes_recortadas/${id}_cropped.jpg`);
                resolve();
            })
            .catch(function (err) {
                console.log('error', err);
                reject(err);
            })
    })
};

// Iterar sobre el json de las imagenes y descargarlas.
const json = require('./listadefotosdef.json');
const funcionIteradora = async () => {
    for (const [id, url] of Object.entries(json)) {
        try {
            console.log(id);
            await imageDownloader(id, url);
            await croppedImagesDownloader(id, url);
        } catch (error) {
            console.log('error', error);
            continue;
        }
    }
};
funcionIteradora(json);
