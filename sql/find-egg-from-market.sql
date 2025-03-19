select
    $select
from chicken_farm_market cfm
join chicken_farm_transaction cft on cft.market_id = cfm.id
join chicken_farm_egg cfe on cfe.id = cfm.egg_id
join account a on a.id = cfm.seller_id
join currency_master cm on cm.id = cfm.currency_id
left join chicken_farm_adult cfa on cfa.egg_id = cfm.egg_id and cfa.type = $2
where cfm.status = 1 and cfm.egg_id notnull and cfe."type" = 1 and cfe.time_end >= $1 and cfa.type = $2
