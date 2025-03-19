select
    coalesce(floor(ca.amount), 0) as "amount",
    cm.id as "currencyId",
    cm.code as "currency",
    coalesce(floor(sum(ct.amount)), 0) as "pending"
from
    currency_master cm
left join cashback_available ca on
    ca.currency_id = cm.id and ca.account_id = $1::uuid
left join (select amount, receiver_id, currency_id from cashback_transaction where status in (1, 5)) as ct
    on ct.currency_id = cm.id and ct.receiver_id = $1::uuid
where cm.status = $2
group by ca.amount, cm.id, cm.code;
