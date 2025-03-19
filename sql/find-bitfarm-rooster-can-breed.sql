select
    count(*)
from
    chicken_farm_rooster cfr
    left join chicken_farm_market cfm on cfm.rooster_id = cfr.id
    and cfm.status = 1
    left join (
        select
            count(id) as "total_breed",
            rooster_id
        from
            chicken_farm_breed
        group by
            rooster_id
    ) as cfb on cfb.rooster_id = cfr.id
where
    cfr.owner_id = $1::uuid
    and cfm.id is null
    and cfr.time_end > $2
    and cfr.type = $3
    and coalesce(cfb.total_breed, 0) < $4
    and cfr.id not in (
        select
            rooster_id
        from
            chicken_farm_breed
        where
            owner_id = cfr.owner_id
            and is_completed = false
    );
