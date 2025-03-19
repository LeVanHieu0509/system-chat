select
    $fields
from account a
$tokenJoin
left join account_referral ar2 on ar2.referral_from = a.id
left join account a2 on a2.id = ar2.referral_by
left join account_referral_stats ars on ars.account_id = a.id
where $where
$order
$paging;
