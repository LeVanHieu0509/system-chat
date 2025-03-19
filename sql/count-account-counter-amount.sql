select
	count (id) as "totalRecords"
from
	account as a
inner join (
	select
		account_id,
		amount
	from
		cashback_available as ca
	where
		ca.currency_id = $1
		and ca.amount >= $2
	group by
		ca.account_id,
		ca.amount ) as ca on
	a.id = ca.account_id
where
	1 = 1
