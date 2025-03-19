select cm.id as "currencyId", cm.exchange_wallet_editable as "exchangeWalletEditable", aec.wallet_address as "walletAddress"
from currency_master cm
join cashback_available ca ON ca.currency_id = cm.id
join account a on a.id = ca.account_id
left join account_exchange_currency aec on aec.account_id = a.id and aec.currency_id = cm.id
where code = 'VNDC' and cm.status = $1 and a.id = $2::uuid;
