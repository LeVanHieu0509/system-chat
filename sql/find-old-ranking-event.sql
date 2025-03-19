select
	"sub"."id",
	"sub"."value"
from
	(select count(referral_from) as "value", a.id
	from account a
	join account_referral ar on ar.referral_by = a.id and ar.created_at >= $1 and ar.created_at <= $2
	group by referral_by, a.avatar, a.full_name, a.id) as "sub"
order by
	"sub"."value" desc