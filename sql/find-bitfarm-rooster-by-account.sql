select
    *
from
    (
        select
            cfr.id,
            cfr.chicken_no as "chickenNo",
            cfr."type",
            cfr.status,
            cfr.time_start as "timeStart",
            cfr.time_end as "timeEnd",
            cfr.last_bred as "lastBred",
            cfm.id as "marketId",
            cfb.id as "breedId",
            coalesce (breed.total_breed, 0) as "totalBreed"
        from
            chicken_farm_rooster cfr
            left join chicken_farm_market cfm on cfm.rooster_id = cfr.id
            and cfm.status = $1
            left join chicken_farm_breed cfb on cfb.rooster_id = cfr.id
            and cfb.is_completed = false
            left join (
                select count(id) as "total_breed", rooster_id from chicken_farm_breed group by rooster_id
            ) as breed on breed.rooster_id = cfr.id
        where
            cfr.status = $1
            and cfr.owner_id = $2::uuid
            and cfr.time_end > $3
            and cfr.type = $4
            and cfb.id is null
    ) abc
order by
    case when "totalBreed" = 3 then "totalBreed" end desc,
    case when "totalBreed" between 0 and 2 then "totalBreed"
    end desc
limit
    $5 offset $6;
