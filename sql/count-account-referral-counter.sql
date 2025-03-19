select
	count (id)
from
	account as a
inner join (
	select
		ar.referral_by,
		count(ar.referral_from) as "totalReferrals"
	from
		account_referral as ar
	where
		ar.created_at >= $1
		and ar.created_at < $2
	group by
		ar.referral_by ) as ar on
	a.id = ar.referral_by
where
	1 = 1
