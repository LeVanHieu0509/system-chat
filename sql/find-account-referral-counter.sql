select
	id,
	email,
	status,
	phone,
	ar."totalReferrals",
	full_name as "fullName",
	kyc_status as "kycStatus",
	is_partner as "isPartner",
	created_at as "createdAt"
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
order by
	ar."totalReferrals" desc

