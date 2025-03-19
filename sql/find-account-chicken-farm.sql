select * from (select
	a.id ,
	a.full_name as "fullName",
	a.email ,
	a.phone,
	floor(ca.amount) as "totalAmount",
    coalesce (golden_egg."totalGoldenEggs", 0) "totalGoldenEggs",
	coalesce (chicken."id", 0) as "totalChicken",
	coalesce (egg."id", 0) as "totalEgg"
from
	account a
inner join cashback_available ca on
	ca.account_id = a.id
left join (select count(id) as "id", owner_id from chicken_farm_adult where status = 1 and time_end > $2 group by owner_id) as "chicken" 
	on a.id = chicken.owner_id
left join (select count(id) as "id", owner_id from chicken_farm_egg where status = 1 group by owner_id) as "egg" 
	on a.id = egg.owner_id
left join (select sum(total) "totalGoldenEggs", owner_id from chicken_farm_egg_harvest group by owner_id) "golden_egg"
    on golden_egg.owner_id = a.id
where
	1 = 1
	and ca.currency_id = $1
) as "sub"
$orderBy
