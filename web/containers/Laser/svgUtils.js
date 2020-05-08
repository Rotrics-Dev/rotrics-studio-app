import TextToSVG from 'text-to-svg';

const generateSvg = async (config_text) => {
    const {text, font, font_size} = config_text.children;
    const fontUrl = "http://localhost:3002/fonts/" + font.default_value;
    let promise = new Promise((resolve, reject) => {
        TextToSVG.load(fontUrl, (err, textToSVG) => {
            const attributes = {fill: 'black', stroke: 'black'};
            const options = {
                tracking: 100,
                x: 0,
                y: 0,
                fontSize: font_size.default_value,
                anchor: 'top',
                attributes: attributes
            };
            const svg = textToSVG.getSVG(text.default_value, options);
            resolve(svg);
        });
    });

    let svg = await promise;
    return svg;
};

export {generateSvg};


