select
    cfm.id,
    cfm.price,
    cfm.fee_total as "feeTotal",
    a.id as "sellerId",
    a.full_name as "sellerName",
    a.device_token as "deviceToken",
    cfe.id as "eggId",
    cfe.histories as "eggHistories",
    cfa.id as "henId",
    cfa.chicken_no as "henNo",
    cfa.type as "henType",
    cfa.level,
    cfa.histories as "henHistories",
    cfr.id as "roosterId",
    cfr.chicken_no as "roosterNo",
    cfr.type as "roosterType",
    cfr.histories as "roosterHistories",
    ca.version
from chicken_farm_market cfm
join account a on a.id = cfm.seller_id
join cashback_available ca on ca.account_id = cfm.seller_id and cfm.currency_id = ca.currency_id
left join chicken_farm_egg cfe on cfe.owner_id = cfm.seller_id and cfe.id = cfm.egg_id and cfe.time_end >= $4
left join chicken_farm_adult cfa on cfa.owner_id = cfm.seller_id and cfa.id = cfm.chicken_id and cfa.time_end >= $5
left join chicken_farm_rooster cfr on cfr.owner_id = cfm.seller_id and cfr.id = cfm.rooster_id
where cfm.id = $1::uuid and seller_id != $2::uuid and cfm.status = $3
limit 1;
