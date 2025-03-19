select
    count(*) as "totalRecords",
    sum(egg."totalHenEggs") "totalHenEggs",
    sum(egg."totalRoosterEggs") "totalRoosterEggs",
    sum(golden_egg."totalGoldenEggs") "totalGoldenEggs",
    sum(chicken_hen.id) "totalHenChickens",
    sum(chicken_rooster.id) "totalRoosterChickens",
    sum(ca.amount) "totalAmount"
from
    account a
    inner join cashback_available ca on ca.account_id = a.id
    left join (
        select
            count(id) as "id",
            owner_id
        from
            chicken_farm_adult
        where
            status = 1
            and time_end > $2
        group by
            owner_id
    ) as chicken_hen on a.id = chicken_hen.owner_id
    left join (
        select
            count(id) as "id",
            owner_id
        from
            chicken_farm_rooster
        where
            status = 1
        group by
            owner_id
    ) as chicken_rooster on a.id = chicken_rooster.owner_id
    left join (
        select
            count(
                type = 1
                or null
            ) as "totalHenEggs",
            count(
                type = 2
                or null
            ) as "totalRoosterEggs",
            owner_id
        from
            chicken_farm_egg
        where
            status = 1
        group by
            owner_id
    ) as "egg" on a.id = egg.owner_id
    left join (
        select
            sum(total) "totalGoldenEggs",
            owner_id
        from
            chicken_farm_egg_harvest
        group by
            owner_id
    ) golden_egg on golden_egg.owner_id = a.id
where
    1 = 1
    and ca.currency_id = $1::uuid
