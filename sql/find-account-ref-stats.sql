select
  count(*)
from
    account a
left join (
    select
        count(*) "totalReferrals",
        count(*) filter(where "status" = 2) "totalKyc",
        sum(ct.amount) filter(where "status" != 2) "pendingAmount",
        sum(ct.amount) filter(where "status" = 2) "receivedAmount",
        ct.receiver_id
    from
        cashback_transaction ct
    where
        ct."type" = 7 and ct.status in (1, 2)
        and ct.sender_id not in (select referral_by from account_referral ar where ar.referral_from = ct.receiver_id and ar.referral_by = ct.sender_id)
        and ct.currency_id = (select id from currency_master cm where code = $1)
        and ct.updated_at >= $2
        and ct.updated_at < $3
    group by
        ct.receiver_id) as "ct" on
    ct.receiver_id = a.id
where
    a.type = 'USER' and ct."totalReferrals" > 0
$limit;
