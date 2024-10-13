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
	ct."type" in (7,9,10,11,12,14,15,16) -- Loại giao dịch
	and ct.status = 1
	and (ct.sender_id = $1::uuid or ct.receiver_id = $1::uuid)
order by
	ct.created_at


-- Câu truy vấn này được sử dụng để lấy thông tin về các giao dịch cashback mà người dùng đã tham gia, 
-- bao gồm các giao dịch mà người dùng là người gửi hoặc người nhận

-- REFERRAL = 7,
-- DAILY_REWARD = 8,
-- PARTNER_COMMISSION = 9,
-- NON_REFERRAL = 10,
-- PARTNER_BONUS = 11,
-- ACCOUNT_EVENT = 12,
-- BUY_EGG_EVENT = 13,
-- SELL_GOLDEN_EGG = 14,
-- SELL_EGG = 16,

-- export enum CASHBACK_STATUS {
--    PROCESSING = 1,
--    SUCCESS = 2,
--    FAILURE = 3,
--    REJECTED = 4,
--    APPROVED = 5
-- }

-- Khi mà kycStatus === KYC_STATUS.APPROVED --> await this.processCashbackForAccount(id, account.fullName);