select
	count(*) 
from
	account a
inner join cashback_available ca on
	ca.account_id = a.id
left join (select count(id) as "id", owner_id from chicken_farm_adult where status = 1 and time_end > $2 group by owner_id) as "chicken" 
	on a.id = chicken.owner_id
left join (select count(id) as "id", owner_id from chicken_farm_egg where status = 1 group by owner_id) as "egg" 
	on a.id = egg.owner_id
where
	1 = 1
	and ca.currency_id = $1