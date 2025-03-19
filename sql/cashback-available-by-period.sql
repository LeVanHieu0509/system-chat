select
    floor(
        sum(
            case
                when x.cah_id is null then x.ca_amount
                else (x.old_balance + x.cah_amount * (case when x."type" = '-' then -1 else 1 end))
            end
        )
    ) total
from
    (
        select
            ca.id ca_id,
            ca.amount ca_amount,
            cah.id cah_id,
            cah.old_balance,
            cah."type",
            cah.amount cah_amount,
            row_number() over (
                partition by ca.id
                order by
                    cah.created_at desc,
                    cah.id desc
            ) rn
        from
            cashback_available ca
            join account a on a.id = ca.account_id
            and a."type" = $1
            join currency_master cm on cm.id = ca.currency_id
            and cm.code = $2
            left join cashback_available_histories cah on cah.ca_id = ca.id
        where
            cah.id is null
            or cah.created_at < $3
    ) x
where
    x.rn = 1