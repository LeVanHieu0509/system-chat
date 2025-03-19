select * from (
    select a.id as "accountId", a.full_name as "accountName", a.avatar as "accountAvatar",
        coalesce(cfa.count, 0) as "totalChicken", coalesce(cfe.count, 0) as "totalEggs", coalesce(cfeh.count, 0) as "totalGoldenEggs"
    from account a
    left join (select count(*) as "count", owner_id
        from chicken_farm_adult cfa where cfa.status = $3
        and created_at >= $1 and created_at <= $2 group by owner_id) as "cfa" on cfa.owner_id = a.id
    left join (select count(*) as "count", owner_id
        from chicken_farm_egg cfe where cfe.status = $3
        and created_at >= $1 and created_at <= $2 group by owner_id) as "cfe" on cfe.owner_id = a.id
    left join (select sum(total) as "count", owner_id
        from chicken_farm_egg_harvest where created_at >= $1 and created_at <= $2 group by owner_id) as "cfeh" on cfeh.owner_id = a.id
    -- where a.kyc_status = $3 BB-146
    ) as "sub"
order by "totalGoldenEggs" desc
limit $4 offset $5;
