select
    count(*)
from
    chicken_farm_adult cfa
    left join chicken_farm_market cfm on cfm.chicken_id = cfa.id
    and cfm.status = 1
    left join (
        select
            count(id) as "total_breed",
            id,
            hen_id
        from
            chicken_farm_breed
        group by
            id,
            hen_id
    ) as cfb on cfb.hen_id = cfa.id
where
    cfa.owner_id = $1::uuid
    and cfm.id is null
    and cfa.time_end > $2
    and cfa.type = $3
    and cfa.level >= $4
    and coalesce(cfb.total_breed, 0) < $5;
