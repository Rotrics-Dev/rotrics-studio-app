import {Parser as XMLParser} from 'xml2js'
import SvgPath from 'svgpath';

const getSvgFont = async (url) => {
    return await fetch(url).then(response => response.text());
}
/**
 * from npm svgfont2js
 * */
const getGlyphs = async (url) => {
    // console.time('getSvgFont')
    const xml = await getSvgFont(url);
    // console.timeEnd('getSvgFont')
    const glyphs = {};
    new XMLParser({async: false}).parseString(xml, (err, root) => {
        if (err) {
            throw err;
        }
        // Read http://www.w3.org/TR/SVG/fonts.html for SVG font spec
        let _iteratorNormalCompletion = true;
        let _didIteratorError = false;
        let _iteratorError = undefined;

        try {
            for (let _iterator = root.svg.defs[0].font[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                let font = _step.value;

                let face = font["font-face"][0];
                let em = +face.$["units-per-em"] || 1000; // size of the em square
                let ascent = +face.$.ascent; // unaccented height of font above x-axis
                let hox = +font.$["horiz-origin-x"] || 0; // x origin of font coordinates
                let hoy = +font.$["horiz-origin-y"] || 0; // y origin of font coordinates
                let hdx = +font.$["horiz-adv-x"] || em; // width of glyph
                let vdy = +font.$["vert-adv-y"] || em; // height of glyph

                let _iteratorNormalCompletion2 = true;
                let _didIteratorError2 = false;
                let _iteratorError2 = undefined;

                try {
                    for (let _iterator2 = font.glyph[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        let g = _step2.value;

                        let path = ''
                        if (g.$.d) {
                            path = new SvgPath(g.$.d)
                                .translate(-hox, -hoy) // move to origin (0, 0) in font coordinates
                                .translate(0, -ascent) // move below x-axis
                                .scale(1, -1) // invert y-axis (font coordinates -> initial coordinates)
                                .round(1).toString();
                        }
                        const unicode_hex = g.$.unicode.charCodeAt(0).toString(16)
                        glyphs[unicode_hex] = {
                            font_id: font.$.id,
                            font_family: face.$["font-family"],
                            name: g.$["glyph-name"],
                            unicode: g.$.unicode,
                            unicode_hex: unicode_hex,
                            path: path,
                            width: +g.$["horiz-adv-x"] || hdx,
                            height: +g.$["vert-adv-y"] || vdy
                        };
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                            _iterator2["return"]();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    });
    return glyphs;
}
const textToSvgFromSvgFont = async (fontUrl, text, options) => {
    if (!text) return;
    text = text.trim();
    if (text.length === 0) return;
    const glyphs = await getGlyphs(fontUrl);
    const {fontSize, tracking} = options;
    let commonFontHeight = 1000;
    const fontTracking = fontSize * tracking / commonFontHeight;
    const scale = fontSize / commonFontHeight;
    let paths = '';
    let height = fontSize;
    let width = 0;

    for (const c of text) {
        const glyph = glyphs[c.charCodeAt(0).toString(16)];
        const translateX = width === 0 ? width : width + fontTracking;
        if (!glyph) {//path of none supported character
            paths += '<path fill="none" stroke="#000000" stroke-width="1" d="' +
                new SvgPath('M 100 300  L 400 300 L 400 700 L 100 700 L100 300 L400 700 M 100 700 L 400 300')
                    .scale(scale, scale)
                    .translate(translateX, 0)
                    .toString()
                + '"/>';
            width = translateX + 500 * scale;
            continue;
        }
        if (glyph.path) {
            paths += '<path fill="none" stroke="#000000" stroke-width="1" d="' +
                new SvgPath(glyph.path)
                    .scale(scale, scale)
                    .translate(translateX, 0)
                    .toString()
                + '"/>';
        }
        width = translateX + glyph.width * scale;
    }
    const start = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" \>`
    const end = '</svg>'
    const svg = start + paths + end;
    return svg;
}
export default textToSvgFromSvgFont;