select * from (select
    a.id as "senderId",
    a.full_name as "senderName",
    a.email,
    a.phone,
    cm.code as "coinType",
    ct.id,
    ct.amount,
    ct.status,
    ct.description,
    ct.title,
    jsonb_array_elements(ct."cbHistories"->'cbHistories')->'body'->>'account_receive' as "accountONUS",
    ct.vndc_json->'data'->'to_account'->>'fullname' as "fullNameONUS",
    ct.vndc_json->'data'->>'transaction_number' as "transactionONUS",
    ct.created_at as "createdAt",
    ct.updated_at as "updatedAt"
from
    cashback_transaction ct
join account a on a.id = ct.sender_id
join currency_master cm on cm.id = ct.currency_id
where ct."type" = 5 and $where
order by ct.created_at desc) as main where main."accountONUS" notnull
