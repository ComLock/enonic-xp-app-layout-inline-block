import {div, render, style} from 'render-js/src/class.es';
import {element} from 'render-js/src/class/element.es';
//import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
import {getComponent} from '/lib/xp/portal';


export function get(req) {
    const {config, regions} = getComponent(); //log.info(toStr({config, regions}));
    const list = forceArray(config.regions); //log.info(toStr({list}));
    const r = render(div(
        {
            _s: {
                fontFamily: 'zero-width'
            }
        }, list.map((item, i) => {
            //log.info(toStr({item}));
            const name = `inlineBlock${i + 1}`;
            const mediaQueries = item.mediaQueries ? forceArray(item.mediaQueries) : []; //log.info(toStr({mediaQueries}));
            const {components} = regions[name]; //log.info(toStr({name, components}));
            const media = {};
            mediaQueries.forEach((mediaQuery) => {
                //log.info(toStr({mediaQuery}));
                const mediaQueryMinWidth = mediaQuery.mediaQueryMinWidth || 0; //log.info(toStr({mediaQueryMinWidth}));
                const {
                    height, textAlign, verticalAlign, width
                } = mediaQuery; //log.info(toStr({height, textAlign, verticalAlign, width}));
                media[`minWidth${mediaQueryMinWidth}`] = {
                    height,
                    textAlign,
                    verticalAlign,
                    width
                };
            });
            const {
                height, textAlign, verticalAlign, width
            } = item;
            return element(item.elementTag || 'div', {
                dataPortalRegion: req.mode === 'edit' ? name : null,
                _s: {
                    display: 'inline-block',
                    fontFamily: 'initial',
                    height,
                    textAlign,
                    verticalAlign,
                    width
                },
                _m: media
            }, (components && components.length)
                ? components.map(c => `<!--# COMPONENT ${c.path} -->`)
                : '');
        }) // map
    ));
    return {
        body: r.html,
        contentType: 'text/html; charset=utf-8',
        pageContributions: {
            headEnd: [
                render(style(
                    {type: 'text/css'},
                    `@import url('//cdn.jsdelivr.net/font-zero-width/latest/zero-width.css');${r.css.join('')}`
                )).html
            ]
        }
    };
}
