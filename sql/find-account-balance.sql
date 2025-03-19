select
    a.id,
    a.device_token as "deviceToken",
    ca.version,
    floor(ca.amount) as "amount",
    floor(coalesce(sum_incoming.total_amount, 0)) as "incoming",
    floor(coalesce(sum_outgoing.total_amount, 0)) as "outgoing",
    floor(sum(coalesce (sum_incoming.total_amount, 0) - coalesce (sum_outgoing.total_amount, 0))) as "balance"
from
    account a
inner join cashback_available ca on
    ca.account_id = a.id
left join (
    select
        ct.receiver_id,
        sum(ct.amount) as total_amount
    from
        cashback_transaction ct
    where
        ct.status = 2
        and ct.action_type = 1
        and ct.receiver_id = $1::uuid and ct.currency_id = $2::uuid
        group by ct.receiver_id) as sum_incoming on
        a.id = sum_incoming.receiver_id
left join (
    select
        ct2.sender_id,
        sum(ct2.amount + ct2.fee) as total_amount
    from
        cashback_transaction ct2
    where
        ct2.status = 2
        and ct2.action_type = -1
        and ct2.sender_id = $1::uuid and ct2.currency_id = $2::uuid
        group by ct2.sender_id) as sum_outgoing on
        a.id = sum_outgoing.sender_id
where a.id = $1 and a.status = 1 and ca.currency_id = $2::uuid
group by
    a.id,
    ca.amount,
    ca.currency_id,
    ca.version,
    sum_incoming.total_amount,
    sum_outgoing.total_amount
