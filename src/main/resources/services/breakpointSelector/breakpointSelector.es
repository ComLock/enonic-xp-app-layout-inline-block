import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
import {getSiteConfig} from '/lib/xp/portal';


export function get(req) {
    log.info(toStr({req}));
    const siteConfig = getSiteConfig(); log.info(toStr({siteConfig}));
    const allHits = siteConfig.breakpoints ? forceArray(siteConfig.breakpoints).map(breakpoint => ({
        id: breakpoint.breakpointMinWidth,
        displayName: breakpoint.name,
        description: `min-width: ${breakpoint.breakpointMinWidth}px`
    })) : []; log.info(toStr({allHits}));

    let filteredHits = [];
    if (!!req.params.query && req.params.query.trim().length > 0) {
        const qRegex = new RegExp(req.params.query, 'i');
        filteredHits = allHits.filter(hit => qRegex.test(hit.displayName) || qRegex.test(hit.description) || qRegex.test(hit.id));
    } else {
        filteredHits = allHits;
    } log.info(toStr({filteredHits}));

    const result = {
        total: filteredHits.length,
        count: filteredHits.length,
        hits: filteredHits
    }; log.info(toStr({result}));
    return {
        body: result,
        contentType: 'text/json; charset=utf-8'
    };
}
