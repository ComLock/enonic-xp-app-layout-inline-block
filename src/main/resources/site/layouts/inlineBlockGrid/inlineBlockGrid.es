import {render, style} from 'render-js/src/class.es';
import {element} from 'render-js/src/class/element.es';
//import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
import {getComponent} from '/lib/xp/portal';


export function get(req) {
    const {config, regions} = getComponent(); //log.info(toStr({config, regions}));
    const list = forceArray(config.regions); //log.info(toStr({list}));

    const breakpointsHash = {};
    const containerMedia = {};
    const {breakpoints} = config;
    const columnsTotal = config.columnsTotal || 12;
    const gutterWidth = config.gutterWidth || 0;
    if (breakpoints) {
        forceArray(breakpoints).forEach((breakpoint) => {
            const {containerWidth/*, marginLeft, marginRight*/} = breakpoint || {};
            const breakpointMinWidth = breakpoint.breakpointMinWidth || 0;
            containerMedia[`minWidth${breakpointMinWidth}`] = {
                marginLeft: 'auto',
                marginRight: 'auto',
                width: `${containerWidth}px`
            };
            breakpointsHash[breakpointMinWidth] = {
                columnsTotal: breakpoint.columnsTotal || columnsTotal,
                gutterWidth: breakpoint.gutterWidth || gutterWidth
            };
        });
    }
    //log.info(toStr({breakpointsHash}));
    const {
        /*containerWidth, */marginLeft, marginRight
    } = config || {};
    const r = render(
        element(config.containerTag || 'div', {
            _s: {
                fontFamily: 'zero-width',
                marginLeft: `${marginLeft}px`,
                marginRight: `${marginRight}px`/*,
                width: containerWidth*/
            },
            _m: containerMedia
        }, list.map((item, i) => {
            //log.info(toStr({item}));
            //log.info(toStr({length: list.length, i}));
            const name = `inlineBlockGrid${i + 1}`;
            const mediaQueries = item.mediaQueries ? forceArray(item.mediaQueries) : []; //log.info(toStr({mediaQueries}));
            const {components} = regions[name]; //log.info(toStr({name, components}));
            const media = {};
            const columns = item.columns || columnsTotal;
            mediaQueries.forEach((mediaQuery) => {
                //log.info(toStr({mediaQuery}));
                const mediaQueryMinWidth = mediaQuery.mediaQueryMinWidth || 0; //log.info(toStr({mediaQueryMinWidth}));
                const mediaQueryColumns = mediaQuery.columns || columns;
                const mediaQueryColumnsTotal = breakpointsHash[mediaQueryMinWidth].columnsTotal;
                const mediaQueryGutterWidth = mediaQuery.gutterWidth || breakpointsHash[mediaQueryMinWidth].gutterWidth;
                const {
                    height, textAlign, verticalAlign
                } = mediaQuery; //log.info(toStr({height, textAlign, verticalAlign}));
                media[`minWidth${mediaQueryMinWidth}`] = {
                    height,
                    marginRight: i === (list.length - 1) ? null : `${mediaQueryGutterWidth}px`,
                    textAlign,
                    verticalAlign,
                    //width: `calc((${mediaQueryMinWidth - (mediaQueryGutterWidth * (columnsTotal - 1))}px) * ${mediaQueryColumns / mediaQueryColumnsTotal})`
                    width: `${
                        (mediaQueryMinWidth
                        - (mediaQueryGutterWidth * (columnsTotal - 1)) // gutters
                        ) * mediaQueryColumns / mediaQueryColumnsTotal
                    }px`
                };
            });
            const {
                height, textAlign, verticalAlign
            } = item;
            return element(item.elementTag || 'div', {
                dataPortalRegion: req.mode === 'edit' ? name : null,
                _s: {
                    display: 'inline-block',
                    fontFamily: 'initial',
                    height,
                    marginRight: i === (list.length - 1) ? null : `${gutterWidth}px`,
                    textAlign,
                    verticalAlign,
                    width: `calc((100vw - ${marginLeft + marginRight + (gutterWidth * (columnsTotal - 1))}px) * ${columns / columnsTotal})`
                },
                _m: media
            }, (components && components.length)
                ? components.map(c => `<!--# COMPONENT ${c.path} -->`)
                : '');
        })) // element
    ); // render
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
