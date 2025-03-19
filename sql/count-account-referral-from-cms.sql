select
	COUNT(a.id)
from
	account_referral ar
join account a on
	a.id = ar.referral_from
join cashback_transaction ct on
    ct.sender_id = ar.referral_from
where
    1 = 1
    and ar.referral_by = $3
	and ct.receiver_id = $3
limit $1 offset $2 ;
