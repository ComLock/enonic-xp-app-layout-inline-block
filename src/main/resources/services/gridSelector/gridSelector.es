import {toStr} from '/lib/enonic/util';
import {forceArray} from '/lib/enonic/util/data';
import {getSiteConfig} from '/lib/xp/portal';


export function get(req) {
    const siteConfig = getSiteConfig();
    //log.info(toStr({req, siteConfig}));
    const grids = siteConfig ? forceArray(siteConfig.grids).map((grid, i) => ({
        id: i,
        displayName: grid.name || '',
        description: ''/*
        iconUrl
        icon*/
    })) : [];
    //req.params.ids
    //req.params.query
    const total = grids.length;
    const count = Math.min(req.params.count, total);
    const result = {
        total,
        count,
        hits: grids.slice(req.params.start || 0, count)
    };
    log.info(toStr({req, siteConfig, grids, result}));
    return {
        body: result,
        contentType: 'text/json; charset=utf-8'
    };
}
