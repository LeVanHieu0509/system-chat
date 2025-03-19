select
    count(*)
from
    (
    select
        lucky.date,
        sum(lucky."totalSpinnedUsers") "totalUsers",
        json_object_agg(lucky.prize, lucky."totalPrizeReward") "prize",
        sum(lucky."totalSATPrizes") "totalSAT"
    from
        (
        select
            date_trunc('day', adlw.updated_at) as date,
            count(adlw.reward) "totalPrizeReward",
            adlw.reward "prize",
            count(*) "totalSpinnedUsers",
            sum(adlw.reward) "totalSATPrizes"
        from
            (
            select
                adlw.updated_at at time zone 'utc' at time zone 'Asia/Saigon' as updated_at,
                adlw.reward,
                adlw.type,
                adlw.id
            from
                account_daily_lucky_wheel adlw
            where
                status = 2
                and adlw.type = $1
                and adlw.updated_at between $2 and $3) as adlw
        group by
            date_trunc('day', adlw.updated_at), adlw.reward
    ) lucky group by lucky.date
) as main
$order
$limit
