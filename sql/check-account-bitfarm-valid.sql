select
    a.id,
    a.full_name as "fullName",
    floor(ca.amount) as "amount",
    ca.currency_id as "currencyId",
    ca.version,
    coalesce(cfe.total_egg, 0) as "totalEgg",
    coalesce(cfa.total_hens + cfr.total_roosters, 0) as "totalChicken",
    coalesce(cfes.total_slot, 0) as "totalExtraSlot"
from
    account a
    join cashback_available ca on ca.account_id = a.id
    and ca.currency_id = (
        select
            id
        from
            currency_master
        where
            code = $3
    )
    left join (
        select
            count(id) as "total_egg",
            owner_id
        from
            chicken_farm_egg
        where
            owner_id = $1::uuid
            and status = $2
            and time_start > 0
        group by
            owner_id
    ) as cfe on cfe.owner_id = a.id
    left join (
        select
            count(id) as "total_hens",
            owner_id
        from
            chicken_farm_adult
        where
            owner_id = $1::uuid
            and status = $2
            and time_end > $4
        group by
            owner_id
    ) as cfa on cfa.owner_id = a.id
    left join (
        select
            count(cfr.id) as "total_roosters",
            cfr.owner_id
        from
            chicken_farm_rooster cfr
            left join chicken_farm_market cfm on cfm.rooster_id = cfr.id
            and cfm.status = 1
            left join chicken_farm_breed cfb on cfb.rooster_id = cfr.id
            and cfb.is_completed = false
            left join (
                select
                    count(id) as "total_breed",
                    rooster_id
                from
                    chicken_farm_breed
                group by
                    rooster_id
            ) as breed on breed.rooster_id = cfr.id
        where
            cfr.status = 1
            and cfr.owner_id = $1::uuid
            and cfr.time_end > $4
        group by
            cfr.owner_id
    ) as cfr on cfr.owner_id = a.id
    left join (
        select
            sum(quantity) as "total_slot",
            owner_id
        from
            chicken_farm_extra_slot
        where
            owner_id = $1::uuid
        group by
            owner_id
    ) as cfes on cfes.owner_id = a.id
where
    a.id = $1
    and a.status = $2
    -- and a.kyc_status = $3 BB-146
limit 1;
