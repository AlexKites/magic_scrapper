const axios = require('axios');
const fs = require('fs');
const Jimp = require('jimp');
const csv = require('csvtojson');
const csvFilePath = './Magic.csv';


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

// const images = [];
// const json = require('./Magic.json');
// for (const card of json) {
//     images.push(card.Enlace);
// };

const objetoImages = {};

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

const downloader = async (id, field) => {
    Jimp.read(field)
        .then(function (image) {
            console.log(image)
            image.write(`./imagenes/${id}.jpg`);
        })
        .catch(function (err) {
            return console.log('error', err);
        });
};


const json = require('./listadefotosdef.json');
const funcionIteradora = async () => {
    try {
        for (const [id, url] of Object.entries(json)) {
            console.log(id);
            await downloader(id, url)
        }
    } catch (error) {
        console.log('error', error)
    }
}
funcionIteradora(json);

const imageDownloader = async (data = { id, imageUrl }) => {
    return new Promise((resolve, reject) => {
        try {
            const { id, imageUrl } = data;
            if (!imageUrl) {
                reject('Falta algo!' + data);
                return;
            }

            const imagenCardPromise = Jimp.read(imageUrl).catch(err => { console.log('ERROR'); console.log(err); return });

            Promise.all([imagenCardPromise])
                .then(async function (images) {
                    const imagenCard = images[0];
                    if (!imagenCard) {
                        throw new Error('No se pudo encontrar alguno de los componentes basicos de marker');
                    }
                    imagenCard
                        .getBuffer(Jimp.MIME_JPEG, async (err, buffer) => {
                            if (err) {
                                console.log(err); reject(err);
                            } else {
                                const imageFileName = `./imagenes/${id}.jpg`
                                fs.writeFileSync(imageFileName, buffer);
                                resolve(imageFileName);
                            };
                        });
                }).catch(err => { console.log('error creadorMarkerTotal'); console.log(err); reject(err); });
        } catch (e) {
            console.log('ERROR')
            console.log(e);
            resolve(er);
        }
    });
};
