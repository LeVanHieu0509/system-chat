    a.id,
    a.avatar,
    a.full_name "fullName",
    a.email,
    a.phone,
    a.status,
    a.is_partner "isPartner",
    a.kyc_status "kycStatus",
    a.created_at "createdAt",
    coalesce(ars."total_referrals", 0) "totalReferrals",
    coalesce(ars."total_kyc", 0) "totalKyc",
    case
        when a2.id is null then null
        else json_build_object('id', a2.id, 'fullName', a2.full_name, 'isPartner', a2.is_partner)
    end "referralBy",
    $token
