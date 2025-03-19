select
	DATE_TRUNC('day', created_at) as day,
	sum(amount) as amount
from
	partner_transaction pt
where
	type = $1
    and status = 2
	and created_at >= $2
	and created_at < $3
group by day
order by day asc ;
