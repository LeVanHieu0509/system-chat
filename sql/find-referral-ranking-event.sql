select
	"sub"."id",
	"sub"."avatar",
	"sub"."fullName",
	"sub"."value"
from
	(select count(referral_from) as "value", a.id, a.avatar, a.full_name as "fullName", referral_by
	from account a
	join account_referral ar on ar.referral_by = a.id and ar.created_at >= $1 and ar.created_at <= $2
	group by referral_by, a.avatar, a.full_name, a.id) as "sub"
order by
	"sub"."value" desc
limit $3 offset $4;