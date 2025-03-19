select
    a.id,
    a.email,
    a.status,
    a.phone,
    a.full_name "fullName",
    a.kyc_status "kycStatus",
    a.is_partner "isPartner",
    a.created_at "createdAt",
    floor(sum(case when cm.code = 'SAT' then ca.amount else 0 end)) "totalAmountSAT",
    floor(sum(case when cm.code = 'VNDC' then ca.amount else 0 end)) "totalAmountVNDC",
    coalesce(ar."totalReferrals", 0) "totalReferrals",
    coalesce(ar."totalKyc", 0) "totalKyc"
from
    account a
    join cashback_available ca on ca.account_id = a.id
    join currency_master cm on cm.id = ca.currency_id
    and cm.code in ('SAT', 'VNDC')
    left join (
        select
            count(*) "totalReferrals",
            count(kyc_status = 2 or null) "totalKyc",
            referral_by
        from
            account_referral ar
            left join account a on a.id = ar.referral_from
        group by
            referral_by
    ) as "ar" on ar.referral_by = a.id
where
    1 = 1
group by
    a.id,
    ar.referral_by,
    ar."totalReferrals",
    ar."totalKyc"