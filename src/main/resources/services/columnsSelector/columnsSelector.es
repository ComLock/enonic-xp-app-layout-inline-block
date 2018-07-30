import {toStr} from '/lib/enonic/util';
//import {forceArray} from '/lib/enonic/util/data';
import {getSiteConfig} from '/lib/xp/portal';


export function get(req) {
    //log.info(toStr({req}));
    /* Giving up on this!
    let ids;
    try {
        ids = JSON.parse(req.params.ids);
    } catch (e) {
        log.warning(`Invalid parameter ids: ${req.params.ids}, using []`);
    }
    if (ids) {
        const id = ids[0];
        log.info(toStr({id}));
        const result = {
            total: 1,
            count: 1,
            hits: [{
                id,
                displayName: id
            }]
        };
        log.info(toStr({params: req.params, result}));
        return result;
    }*/

    const siteConfig = getSiteConfig();
    //log.info(toStr({req, siteConfig}));
    const columns = siteConfig.columns || 12;
    const allHits = [];
    for (let i = columns; i > 0; i -= 1) {
        allHits.push({
            id: `${i}`,
            displayName: `${i}`
        });
    }
    //log.info(toStr({allHits}));

    let filteredHits = [];
    if (req.params.query) {
        allHits.forEach((hit) => {
            if (`${hit.displayName}`.startsWith(req.params.query) || `${hit.displayName}`.endsWith(req.params.query)) {
                filteredHits.push(hit);
            }
        });
    } else {
        filteredHits = allHits;
    }

    const total = filteredHits.length;
    const count = total;//Math.min(req.params.count, total); // Pagination doesn't work well for this
    const result = {
        total,
        count,
        //hits: filteredHits.slice(req.params.start || 0, count)
        hits: filteredHits // Avoid pagination
    };
    //log.info(toStr({params: req.params, siteConfig, result}));
    return {
        body: result,
        contentType: 'text/json; charset=utf-8'
    };
}
