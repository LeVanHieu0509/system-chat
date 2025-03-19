select
    cfe.id,
    cfe.time_start as "timeStart",
    cfe.time_end as "timeEnd",
    cfe.status,
    cfe.type,
    cfm.id as "marketId",
    (select floor(extract(epoch from now())* 1000)::bigint) as "timeCurrent",
    cfa.chicken_no as "eggNo",
    cfa.type as "eggType"
from
    chicken_farm_egg cfe
left join chicken_farm_adult cfa on
    cfa.egg_id = cfe.id
left join chicken_farm_market cfm on
    cfm.egg_id = cfe.id and cfm.status = $1
where
    cfe.status = $1
    and cfe.time_start > 0
    and cfe.owner_id = $2::uuid
    and cfe.type = $3
    and (cfa.type = $4 or cfa.type is null)
