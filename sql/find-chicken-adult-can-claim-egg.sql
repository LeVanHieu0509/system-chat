select
    coalesce(cfeh_1."level", 1) as "level",
    coalesce(cfeh_2."date", 0) as "numberHarvested",
    coalesce(cfeh_3."totalEggClaimed", 0) as "totalEggClaimed",
    cfa."id",
    cfa."type",
    cfa."status",
    cfa."time_start" as "timeStart",
    cfa."owner_id" as "ownerId",
    cfa."time_end" as "timeEnd",
    cfa."last_harvest" as "lastHarvest",
    cfb."id" as "breedId"
from
    chicken_farm_adult as cfa
left join (select max("level") as "level", chicken_id from chicken_farm_egg_harvest group by chicken_id) as cfeh_1
    on cfeh_1.chicken_id = cfa.id
left join (select count(date) as date, chicken_id, level from chicken_farm_egg_harvest group by chicken_id, level) as cfeh_2
    on cfeh_2.chicken_id = cfa.id and cfeh_2.level = cfeh_1.level
left join (select sum(total) as "totalEggClaimed", chicken_id, level from chicken_farm_egg_harvest group by chicken_id, level) as cfeh_3
    on cfeh_3.chicken_id = cfa.id and cfeh_3.level = cfeh_1.level
left join (select id, hen_id, finished_time from chicken_farm_breed where finished_time <= $2 and is_completed = false or finished_time > $2) as cfb
    on cfb.hen_id = cfa.id
where
    1 = 1
    and cfa."owner_id" = $1::uuid
    and cfa."time_end" >= $2
    and cfa.status = 1;
