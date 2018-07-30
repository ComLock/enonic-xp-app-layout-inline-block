import {render, style} from 'render-js/src/class.es';
import {element} from 'render-js/src/class/element.es';
//import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
import {getComponent} from '/lib/xp/portal';


function fnOneColumnWidth({containerWidth, gutterWidth, divisions}) {
    return (
        containerWidth
        - (gutterWidth
            * (divisions - 1)
        )
    ) / divisions;
}


function fnRegionWidthInPercent({
    columns = 1,
    divisions = 12,
    containerWidth = 1,
    gutterWidth = 0
} = {}) {
    const oneColumnWidth = fnOneColumnWidth({containerWidth, gutterWidth, divisions});
    const widthOfColumnsNotCountingGutters = oneColumnWidth * columns;
    const guttersInsideCell = (columns - 1) * gutterWidth;
    const regionWidth = widthOfColumnsNotCountingGutters + guttersInsideCell;
    const regionWidthInPercent = `${regionWidth / containerWidth * 100}%`;
    return regionWidthInPercent;
}


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
                containerWidth,
                gutterWidth: breakpoint.gutterWidth || gutterWidth
            };
        });
    }
    //log.info(toStr({breakpointsHash}));
    const {
        /*containerWidth, */marginLeft, marginRight
    } = config || {};
    const widthOfVerticalScrollbar = '100vw - 100%';
    const containerWidth = `100vw - (${widthOfVerticalScrollbar}) - ${marginLeft + marginRight}px`; // Must be calculated
    const r = render(
        element(config.containerTag || 'div', {
            _s: {
                boxSizing: 'border-box',
                fontFamily: 'zero-width',
                marginLeft: `${marginLeft}px`,
                marginRight: `${marginRight}px`,
                width: `calc(${containerWidth})`
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
                    height, offset, textAlign, verticalAlign
                } = mediaQuery; //log.info(toStr({height, textAlign, verticalAlign}));
                media[`minWidth${mediaQueryMinWidth}`] = {
                    height,
                    marginLeft: offset
                        ? (fnOneColumnWidth({
                            containerWidth: breakpointsHash[mediaQueryMinWidth].containerWidth,
                            gutterWidth: mediaQueryGutterWidth,
                            divisions: mediaQueryColumnsTotal
                        }) + mediaQueryGutterWidth) * offset
                        : '0',
                    marginRight: i === (list.length - 1) ? null : `${mediaQueryGutterWidth}px`,
                    textAlign,
                    verticalAlign,
                    width: fnRegionWidthInPercent({
                        columns: mediaQueryColumns,
                        divisions: mediaQueryColumnsTotal,
                        containerWidth: breakpointsHash[mediaQueryMinWidth].containerWidth,
                        gutterWidth: mediaQueryGutterWidth
                    })
                };
            });
            const {
                height, offset, textAlign, verticalAlign
            } = item;

            // Width
            const allGutters =  `${gutterWidth * (columnsTotal - 1)}px`; // Static
            const oneColumnWidth = `(100% - ${allGutters}) / ${columnsTotal}`;
            const guttersInsideRegion = `${gutterWidth * (columns - 1)}px`; // Static
            const regionWidth = `(${oneColumnWidth} * ${columns}) + ${guttersInsideRegion}`;

            // Offset
            const oneColumnAndGutter = `(${oneColumnWidth}) + ${gutterWidth}px`;
            const regionOffset = `(${oneColumnAndGutter}) * ${offset}`;

            return element(item.elementTag || 'div', {
                dataPortalRegion: req.mode === 'edit' ? name : null,
                _s: {
                    boxSizing: 'border-box',
                    display: 'inline-block',
                    fontFamily: 'initial',
                    height,
                    marginLeft: offset ? `calc(${regionOffset})` : null,
                    marginRight: i === (list.length - 1) ? null : `${gutterWidth}px`,

                    /*
                     The vw unit doesn't take the overflow-y scrollbar into account when overflow-y is set to auto.
                     Change it to overflow-y: scroll; and the vw unit will be the viewport without the scrollbar.
                     Only downside to take into account. If the content fits into the screen, the scrollbar is shown anyway.
                     Possible solution is to change from auto to scroll in javascript.
                    //overflowY: 'scroll',*/

                    textAlign,
                    verticalAlign,
                    width: `calc(${regionWidth})`
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
