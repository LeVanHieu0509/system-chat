select
	ct.id ,
	ct.amount ,
	ct.status,
	ct."type" ,
    ct.description,
	ct.currency_id as "currencyId",
    ct.sender_id as "senderId",
	ct.receiver_id as "receiverId",
    ct.created_at as "createdAt",
    ct."cbHistories",
	a.updated_at as "senderUpdated",
	a.kyc_status as "senderStatus",
	a2.updated_at as "receiverUpdated",
	a2.kyc_status as "receiverStatus",
	a2.device_token as "receiverDeviceToken"
from
	cashback_transaction ct
left join account a on
	a.id = ct.sender_id
left join account a2 on
	a2.id = ct.receiver_id
where
	ct."type" in (7,9,10,11,12,14,15,16)
	and ct.status = 1
	and (ct.sender_id = $1::uuid or ct.receiver_id = $1::uuid)
order by
	ct.created_at
