select
	a."id",
	a."phone",
	a."avatar",
	a."email",
	a."full_name" as "fullName",
	a."is_partner" as "isPartner",
	a."kyc_status" as "kycStatus",
	a."created_at" as "createdAt",
	ct.amount
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
order by
	a.created_at desc
limit $1 offset $2 ;
