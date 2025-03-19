with interest_payment_account as (
    select
        *
    from
        interest_payment ip
        join interest_payment_account ipa on ipa.interest_payment_id = ip.id
    where
        1 = 1
),
total_wallet_amount as (
    select
        json_object_agg(x.code, floor(x.sum)) "totalInterestAmount",
        json_object_agg(x.code, floor(x.avg)) "averageInterestAmount"
    from
        (
            select
                cm.code,
                sum(
                    case
                        when interest_payment_account.from_wallet_id = cm.id then interest_payment_account.from_interest_amount
                        when interest_payment_account.to_wallet_id = cm.id then interest_payment_account.to_interest_amount
                    end
                ),
                avg(
                    case
                        when interest_payment_account.from_wallet_id = cm.id then interest_payment_account.from_interest_amount
                        when interest_payment_account.to_wallet_id = cm.id then interest_payment_account.to_interest_amount
                    end
                )
            from
                currency_master cm
                join interest_payment_account on interest_payment_account.from_wallet_id = cm.id
                or interest_payment_account.to_wallet_id = cm.id
            where
                status = $1
            group by
                cm.id
        ) x
)
select
    (select count(distinct interest_payment_account.account_id) from interest_payment_account) "totalAccounts",
    (select total_wallet_amount."averageInterestAmount" from total_wallet_amount) "averageInterestAmount",
    (select total_wallet_amount."totalInterestAmount" from total_wallet_amount) "totalInterestAmount"