select
    cfa.id,
    cfa.chicken_no as "chickenNo",
    cfa."type",
    cfa."level",
    cfa.time_start as "timeStart",
    cfa.time_end as "timeEnd",
    cfa.status,
    cfa.last_harvest as "lastHarvest",
    cfm.id as "marketId",
    cfb.id as "breedId",
    coalesce(breed.total_breed, 0) as "totalBreed",
    (select cast ((floor(extract(epoch from now()) * 1000 - cfa.last_harvest) > 60 * 60 * 1000) as boolean)) as "isHarvestable"
from
    chicken_farm_adult cfa
left join chicken_farm_market cfm on
    cfm.chicken_id = cfa.id and cfm.status = $1
left join chicken_farm_breed cfb on
    cfb.hen_id = cfa.id and cfb.is_completed = false
left join (
    select count(id) as "total_breed", hen_id from chicken_farm_breed group by hen_id
) as breed on breed.hen_id = cfa.id
where
    cfa.status = $1
    and cfa.owner_id = $2::uuid
    and cfa.time_end > $3
    and cfa.type = $4
    and cfa.time_start > 0
    and cfb.id is null
order by
    cfb.id desc, coalesce(cfm.id, '00000000-0000-0000-0000-000000000000') desc, cfa.last_harvest desc
limit $5 offset $6;
